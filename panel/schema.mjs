/** @typedef {{key:string,label:string,type:'text'|'textarea'|'image'|'url',default:string,maxLength:number}} Field */
/** @typedef {{id:string,label:string,fields:Field[]}} Section */
/** @typedef {{id:string,label:string,path:string,sections:Section[]}} Page */
/** @typedef {{version:number,pages:Page[]}} Config */

/** @param {unknown} value @returns {asserts value is Config} */
export function validateConfig(value) {
  const config = /** @type {Config} */ (value)
  if (
    config?.version !== 1 ||
    !Array.isArray(config.pages) ||
    !config.pages.length
  )
    throw new Error('Expected config version 1 with pages')
  const pages = new Set(),
    keys = new Set()
  for (const page of config.pages) {
    if (
      !/^[a-z][a-z0-9-]*$/.test(page.id) ||
      pages.has(page.id) ||
      !page.label ||
      !/^\/(?!\/)[^?#\\]*$/.test(page.path)
    )
      throw new Error('Invalid or duplicate page')
    pages.add(page.id)
    if (!Array.isArray(page.sections) || !page.sections.length)
      throw new Error('Page needs sections')
    const sections = new Set()
    for (const section of page.sections) {
      if (
        !/^[a-z][a-z0-9-]*$/.test(section.id) ||
        sections.has(section.id) ||
        !section.label ||
        !Array.isArray(section.fields) ||
        !section.fields.length
      )
        throw new Error('Invalid section')
      sections.add(section.id)
      for (const field of section.fields) {
        if (
          !/^[a-zA-Z][a-zA-Z0-9_.-]{0,119}$/.test(field.key) ||
          keys.has(field.key) ||
          !field.label ||
          !['text', 'textarea', 'image', 'url'].includes(field.type) ||
          typeof field.default !== 'string' ||
          !Number.isInteger(field.maxLength) ||
          field.maxLength < 1 ||
          field.maxLength > 20000
        )
          throw new Error('Invalid or duplicate field')
        keys.add(field.key)
        validateValue(field, field.default)
      }
    }
  }
}

/** @param {Config} config @param {string=} pageId @returns {Field[]} */
export function fieldsFor(config, pageId) {
  if (pageId && !config.pages.some((page) => page.id === pageId))
    throw new Error('Unknown page')
  return config.pages
    .filter((page) => !pageId || page.id === pageId || page.id === 'global')
    .flatMap((page) => page.sections.flatMap((section) => section.fields))
}

/** @param {Field} field @param {unknown} value @returns {asserts value is string} */
export function validateValue(field, value) {
  if (
    typeof value !== 'string' ||
    value.length > field.maxLength ||
    value.includes('\0')
  )
    throw new Error(
      `Invalid value for ${field.key} (maximum ${field.maxLength} characters)`,
    )
  if ((field.type === 'image' || field.type === 'url') && value) {
    const local = /^\/(?!\/)/.test(value) && !/[\\\s]/.test(value)
    let remote = false
    try {
      const url = new URL(value)
      remote = url.protocol === 'https:' && !url.username && !url.password
    } catch {}
    if (!local && !remote)
      throw new Error(`Expected a relative path or HTTPS URL for ${field.key}`)
    if (field.type === 'image' && /\.svg(?:[?#]|$)/i.test(value))
      throw new Error('SVG image URLs are not supported')
  }
}

/** @param {Config} config @param {unknown} input @returns {Record<string,string>} */
export function validateValues(config, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Expected an object of content values')
  const known = new Map(fieldsFor(config).map((field) => [field.key, field]))
  const entries = Object.entries(input)
  if (!entries.length || entries.length > 500)
    throw new Error('Provide between 1 and 500 fields')
  for (const [key, value] of entries) {
    const field = known.get(key)
    if (!field) throw new Error(`Unknown content key: ${key}`)
    validateValue(field, value)
  }
  return /** @type {Record<string,string>} */ (Object.fromEntries(entries))
}

/** @param {Config} config @param {{key:string,value:unknown}[]} rows @param {string=} pageId */
export function mergeContent(config, rows, pageId) {
  const overrides = new Map(rows.map((row) => [row.key, row.value]))
  return Object.fromEntries(
    fieldsFor(config, pageId).map((field) => {
      const value = overrides.get(field.key)
      try {
        validateValue(field, value)
        return [field.key, value]
      } catch {
        return [field.key, field.default]
      }
    }),
  )
}
