import ts from 'typescript'
import { readFile, readdir, lstat } from 'node:fs/promises'
import { resolve, relative, dirname, sep } from 'node:path'
import { validateConfig, validateValue, fieldsFor } from '../lib/schema.mjs'

export const REVIEW_NOTICE =
  'Review required: the codemod builds a starting point, not a guarantee of complete integration. Check labels, wording, routes, layout, build and preview before publishing. Dynamic text and imported components need manual review. The codemod itself makes no AI or database requests.'
const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 44)
const human = (text) =>
  text.replace(/[-_]/g, ' ').replace(/^./, (c) => c.toUpperCase())
const entities = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  copy: '©',
  reg: '®',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  trade: '™',
}
function decode(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (_, name) => {
    if (name.startsWith('#')) {
      const code =
        name[1].toLowerCase() === 'x'
          ? parseInt(name.slice(2), 16)
          : Number(name.slice(1))
      if (code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff))
        return String.fromCodePoint(code)
    }
    if (Object.hasOwn(entities, name)) return entities[name]
    throw new Error('Unrecognized HTML entity; review manually')
  })
}
function jsxText(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n')
  let last = 0
  lines.forEach((line, index) => {
    if (/\S/.test(line)) last = index
  })
  return lines
    .map((line, index) => {
      let result = line.replace(/\t/g, ' ')
      if (index > 0) result = result.replace(/^ +/, '')
      if (index < lines.length - 1) result = result.replace(/ +$/, '')
      return result && index !== last ? result + ' ' : result
    })
    .join('')
}
function apply(source, edits) {
  return [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (text, edit) =>
        text.slice(0, edit.start) + edit.text + text.slice(edit.end),
      source,
    )
}
function unique(base, used) {
  let value = base,
    count = 2
  while (used.has(value)) value = `${base}-${count++}`
  used.add(value)
  return value
}

export async function planCodemod(root, original) {
  validateConfig(original)
  const config = structuredClone(original)
  const app = await lstat(resolve(root, 'src/app')).then(
    () => 'src/app',
    (error) => {
      if (error.code === 'ENOENT') return 'app'
      throw error
    },
  )
  for (
    let directory = resolve(root, app);
    directory !== root;
    directory = dirname(directory)
  ) {
    if ((await lstat(directory)).isSymbolicLink())
      throw new Error('Symlinked App Router root is not supported')
  }
  if (
    app === 'src/app' &&
    (await lstat(resolve(root, 'app')).then(
      () => true,
      () => false,
    ))
  )
    throw new Error('Both app and src/app exist; choose one before migration')
  const changes = [],
    fields = [],
    skipped = []
  const pageIds = new Set(config.pages.map((page) => page.id))
  const keys = new Set(fieldsFor(config).map((field) => field.key))
  const routes = new Set()
  const paths = []
  async function walk(directory) {
    for (const entry of (
      await readdir(resolve(root, directory), { withFileTypes: true })
    ).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = `${directory}/${entry.name}`
      if (entry.isSymbolicLink()) {
        skipped.push({ file, reason: 'Symlink not followed' })
        continue
      }
      if (entry.isDirectory()) {
        if (
          !['admin', 'api', 'panel-example'].includes(entry.name) &&
          !entry.name.startsWith('_') &&
          !entry.name.startsWith('.')
        )
          await walk(file)
      } else if (entry.name === 'page.tsx') paths.push(file)
      else if (/^page\.(jsx?|ts)$/.test(entry.name))
        skipped.push({ file, reason: 'Only TSX page files are supported' })
    }
  }
  await walk(app)
  for (const file of paths) {
    const report = (reason, node) =>
      skipped.push({
        file,
        ...(node
          ? {
              line:
                node
                  .getSourceFile()
                  .getLineAndCharacterOfPosition(node.getStart()).line + 1,
            }
          : {}),
        reason,
      })
    const segments = relative(app, dirname(file)).split(sep).filter(Boolean)
    if (
      segments.some(
        (part) =>
          /[\[\]@]/.test(part) ||
          (part.startsWith('(') && !/^\([^.)][^)]*\)$/.test(part)),
      )
    ) {
      report('Dynamic, parallel or intercepted route: wire manually')
      continue
    }
    const route =
      '/' + segments.filter((part) => !part.startsWith('(')).join('/')
    if (routes.has(route))
      throw new Error(`Ambiguous route ${route}; no codemod changes applied`)
    routes.add(route)
    const before = await readFile(resolve(root, file), 'utf8')
    if (before.length > 512000) {
      report('Page exceeds 512 KB')
      continue
    }
    const sf = ts.createSourceFile(
      file,
      before,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    if (sf.parseDiagnostics.length) {
      report('TSX parse errors')
      continue
    }
    if (
      sf.statements.some(
        (s) =>
          ts.isImportDeclaration(s) &&
          /\/panel\/(server|PreviewBridge)/.test(s.moduleSpecifier.text),
      )
    ) {
      report('Already integrated; left unchanged')
      continue
    }
    const fn = sf.statements.find(
      (s) =>
        ts.isFunctionDeclaration(s) &&
        s.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword),
    )
    if (!fn?.body || fn.asteriskToken || fn.typeParameters?.length) {
      report(
        'Use a default function declaration with a block body, or integrate manually',
      )
      continue
    }
    if (
      fn.body.statements.some(
        (s) =>
          ts.isExpressionStatement(s) &&
          ['use cache', 'use server'].includes(s.expression.text),
      )
    ) {
      report('Cached/action function directives require manual integration')
      continue
    }
    if (
      sf.statements.some(
        (statement) =>
          ts.isVariableStatement(statement) &&
          statement.declarationList.declarations.some(
            (declaration) =>
              ['dynamic', 'fetchCache', 'runtime'].includes(
                declaration.name.getText(sf),
              ) &&
              [
                'force-static',
                'error',
                'force-cache',
                'only-cache',
                'edge',
              ].includes(declaration.initializer?.text),
          ),
      )
    ) {
      report('Static/cache/edge route settings require manual integration')
      continue
    }
    const client = sf.statements.some(
      (s) => ts.isExpressionStatement(s) && s.expression.text === 'use client',
    )
    if (
      client &&
      (fn.parameters.length ||
        fn.type ||
        fn.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ||
        sf.statements.some(
          (s) =>
            s !== fn &&
            (ts.isExportDeclaration(s) ||
              ts.isExportAssignment(s) ||
              s.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)),
        ))
    ) {
      report(
        'Client page with props/exports/async signature needs manual server-wrapper integration',
      )
      continue
    }
    const wrapperView = `${dirname(file)}/page.editable-view.tsx`
    if (
      client &&
      (await lstat(resolve(root, wrapperView)).then(
        () => true,
        (e) => {
          if (e.code === 'ENOENT') return false
          throw e
        },
      ))
    ) {
      report('Client view destination exists')
      continue
    }
    let page = config.pages.find((p) => p.path === route && p.id !== 'global')
    const newPage = !page
    if (!page)
      page = {
        id: unique(
          slug(segments.filter((s) => !s.startsWith('(')).join('-')) || 'home',
          pageIds,
        ),
        label:
          route === '/'
            ? 'Home'
            : human(segments.filter((s) => !s.startsWith('(')).at(-1)),
        path: route,
        sections: [],
      }
    const plannedPage = structuredClone(page)
    const pageFields = [],
      edits = []
    const identifiers = new Set(before.match(/[A-Za-z_$][\w$]*/g) || [])
    function binding(base) {
      let name = base
      while (identifiers.has(name)) name += '_'
      identifiers.add(name)
      return name
    }
    const variable = binding('elpContent'),
      reader = binding('elpReadContent'),
      hook = binding('elpPreview'),
      prop = binding('elpPageContent')
    const tagName = (element) => element.tagName.getText(sf)
    const sectionOf = (node) => {
      for (
        let parent = node.parent;
        parent && parent !== fn;
        parent = parent.parent
      ) {
        if (!ts.isJsxElement(parent)) continue
        const tag = parent.openingElement
        if (tagName(tag) !== 'section') continue
        const id = tag.attributes.properties.find(
          (attr) => ts.isJsxAttribute(attr) && attr.name.getText(sf) === 'id',
        )?.initializer
        if (id && ts.isStringLiteral(id) && /^[a-z][a-z0-9-]*$/.test(id.text))
          return { id: id.text, label: human(id.text) }
      }
      return { id: 'content', label: 'Page content' }
    }
    function add(node, value, role, type, expression) {
      if (!value.trim()) return
      if (value.length > 20000 || value.includes('\0')) {
        report('Text exceeds field limits; left unchanged', node)
        return
      }
      const sectionInfo = sectionOf(node)
      let section = plannedPage.sections.find((s) => s.id === sectionInfo.id)
      if (!section) {
        section = { ...sectionInfo, fields: [] }
        plannedPage.sections.push(section)
      }
      const key = unique(
        `${page.id.slice(0, 36)}.${section.id.slice(0, 36)}.${role}`,
        keys,
      )
      const label = `${human(role)} — ${value.trim().replace(/\s+/g, ' ').slice(0, 65)}`
      const field = {
        key,
        label,
        type:
          type ||
          (value.length > 100 || role === 'description' ? 'textarea' : 'text'),
        default: value,
        maxLength: Math.min(
          20000,
          Math.max(
            type === 'url' || type === 'image' ? 2048 : 1000,
            value.length * 2,
          ),
        ),
      }
      try {
        validateValue(field, value)
      } catch (error) {
        if (!section.fields.length)
          plannedPage.sections = plannedPage.sections.filter(
            (item) => item !== section,
          )
        keys.delete(key)
        report(error.message, node)
        return
      }
      section.fields.push(field)
      pageFields.push({
        ...field,
        file,
        line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        page: page.id,
        section: section.id,
      })
      edits.push({
        start: ts.isJsxText(node) ? node.pos : node.getStart(sf),
        end: node.end,
        text: expression
          ? `${variable}[${JSON.stringify(key)}]`
          : `{${variable}[${JSON.stringify(key)}]}`,
      })
    }
    const roleFor = (node) => {
      const parent = node.parent
      const tag = ts.isJsxElement(parent) ? tagName(parent.openingElement) : ''
      return /^h[1-6]$/.test(tag)
        ? 'heading'
        : tag === 'p'
          ? 'description'
          : tag === 'a'
            ? 'link-text'
            : tag === 'button'
              ? 'button-text'
              : tag === 'label'
                ? 'form-label'
                : 'text'
    }
    function visit(node) {
      if (node !== fn && ts.isFunctionLike(node)) {
        report('Nested function/callback content left unchanged', node)
        return
      }
      if (
        ts.isJsxElement(node) &&
        [
          'script',
          'style',
          'svg',
          'code',
          'pre',
          'textarea',
          'option',
        ].includes(tagName(node.openingElement))
      )
        return
      if (
        ts.isJsxSelfClosingElement(node) &&
        ['script', 'style', 'svg'].includes(tagName(node))
      )
        return
      if (ts.isJsxText(node)) {
        try {
          add(node, decode(jsxText(node.text)), roleFor(node))
        } catch (e) {
          report(e.message, node)
        }
      } else if (ts.isJsxAttribute(node)) {
        const name = node.name.getText(sf)
        const literal =
          node.initializer &&
          (ts.isStringLiteral(node.initializer)
            ? node.initializer
            : ts.isJsxExpression(node.initializer) &&
                node.initializer.expression &&
                ts.isStringLiteral(node.initializer.expression)
              ? node.initializer.expression
              : null)
        if (
          ![
            'alt',
            'title',
            'placeholder',
            'aria-label',
            'href',
            'src',
          ].includes(name)
        )
          return
        if (!literal) {
          report(`Dynamic ${name} attribute preserved; check manually`, node)
          return
        }
        const parent = node.parent.parent
        const tag =
          ts.isJsxOpeningElement(parent) || ts.isJsxSelfClosingElement(parent)
            ? tagName(parent)
            : ''
        if (name === 'src' && !['img', 'Image'].includes(tag)) return
        const type =
          name === 'href' ? 'url' : name === 'src' ? 'image' : undefined
        const value = ts.isStringLiteral(node.initializer)
          ? (() => {
              try {
                return decode(literal.text)
              } catch {
                return null
              }
            })()
          : literal.text
        if (
          ts.isStringLiteral(node.initializer) &&
          /[\r\n]/.test(value || '')
        ) {
          report('Multiline attribute whitespace needs manual review', node)
          return
        }
        if (value === null) {
          report('Unrecognized HTML entity in attribute', node)
          return
        }
        if (
          type &&
          (!/^(https:\/\/|\/(?!\/))/.test(value) ||
            /[\s\\]/.test(value) ||
            (type === 'image' && /\.svg(?:[?#]|$)/i.test(value)))
        ) {
          report(`Unsupported ${name} URL left unchanged`, node)
          return
        }
        add(node.initializer, value, name === 'src' ? 'image' : name, type)
        return
      } else if (ts.isJsxExpression(node) && node.expression) {
        if (
          ts.isStringLiteral(node.expression) ||
          ts.isNoSubstitutionTemplateLiteral(node.expression)
        ) {
          add(
            node.expression,
            node.expression.text,
            roleFor(node),
            undefined,
            true,
          )
          return
        }
        report('Dynamic JSX expression preserved; check manually', node)
      }
      ts.forEachChild(node, visit)
    }
    visit(fn.body)
    if (!pageFields.length) {
      report('No supported static fields in the default page component')
      continue
    }
    for (const statement of sf.statements)
      if (
        ts.isImportDeclaration(statement) &&
        /^(\.|@\/)/.test(statement.moduleSpecifier.text)
      )
        report(
          `Imported component/module ${statement.moduleSpecifier.text} is not rewritten`,
          statement,
        )
    let insertAt = fn.body.getStart(sf) + 1
    for (const statement of fn.body.statements) {
      if (
        ts.isExpressionStatement(statement) &&
        ts.isStringLiteral(statement.expression)
      )
        insertAt = statement.end
      else break
    }
    const importsAt =
      sf.statements
        .filter(
          (s) =>
            ts.isImportDeclaration(s) ||
            (ts.isExpressionStatement(s) && ts.isStringLiteral(s.expression)),
        )
        .at(-1)?.end || 0
    if (client) {
      if (fn.parameters.length === 0) {
        edits.push({
          start: fn.parameters.pos,
          end: fn.parameters.pos,
          text: `{ ${prop} }: { ${prop}: Record<string, string> }`,
        })
      }
      edits.push({
        start: importsAt,
        end: importsAt,
        text: `\nimport { usePreviewContent as ${hook} } from '@/panel/PreviewBridge'\n`,
      })
      edits.push({
        start: insertAt,
        end: insertAt,
        text: `\nconst ${variable} = ${hook}(${prop});\n`,
      })
      changes.push({
        path: wrapperView,
        before: null,
        after: apply(before, edits),
      })
      changes.push({
        path: file,
        before,
        after: `import View from './page.editable-view'\nimport { readContent } from '@/panel/server'\nexport default async function Page() { return <View ${prop}={(await readContent(${JSON.stringify(page.id)})).values} /> }\n`,
      })
    } else {
      edits.push({
        start: importsAt,
        end: importsAt,
        text: `\nimport { readContent as ${reader} } from '@/panel/server'\n`,
      })
      if (!fn.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)) {
        if (fn.type) {
          report('Explicit synchronous return type needs manual integration')
          continue
        }
        const keyword = fn
          .getChildren(sf)
          .find((node) => node.kind === ts.SyntaxKind.FunctionKeyword)
        edits.push({
          start: keyword.getStart(sf),
          end: keyword.getStart(sf),
          text: 'async ',
        })
      }
      edits.push({
        start: insertAt,
        end: insertAt,
        text: `\nconst ${variable} = (await ${reader}(${JSON.stringify(page.id)})).values;\n`,
      })
      changes.push({ path: file, before, after: apply(before, edits) })
      report(
        'Server-rendered values update on requests; unsaved live preview needs a client boundary/preview hook',
      )
    }
    if (newPage) config.pages.unshift(plannedPage)
    else config.pages[config.pages.indexOf(page)] = plannedPage
    fields.push(...pageFields)
  }
  for (const change of changes) {
    const generated = ts.createSourceFile(
      change.path,
      change.after,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    if (generated.parseDiagnostics.length)
      throw new Error(
        `Generated TSX is invalid for ${change.path}; no source changes applied`,
      )
  }
  validateConfig(config)
  return {
    config,
    changes,
    fields,
    skipped,
    reviewRequired: true,
    warning: REVIEW_NOTICE,
  }
}
