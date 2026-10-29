// Shared by the website, preview frames and CLI-installed editors. No React/CSS dependencies.
export const SITE_PALETTE = { light: '#ffffff', dark: '#0a0a0a' }
export const EDITOR_PALETTE = { light: '#ffffff', dark: '#171717' }
export const THEME_EVENT = 'edit-theme-change'

export function paintDocumentTheme(dark, palette) {
  const root = document.documentElement
  const background = dark ? palette.dark : palette.light
  const foreground = dark ? '#fafafa' : '#171717'
  root.classList.toggle('dark', dark)
  for (const element of [root, document.body]) {
    if (!element) continue
    element.style.colorScheme = dark ? 'dark' : 'light'
    element.style.backgroundColor = background
    element.style.color = foreground
  }
  let metas = [...document.querySelectorAll('meta[name="theme-color"]')]
  if (!metas.length) {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.appendChild(meta)
    metas = [meta]
  }
  for (const meta of metas) {
    // A manually selected theme must win over the OS media preference in Safari.
    if (meta.hasAttribute('media')) meta.removeAttribute('media')
    if (meta.getAttribute('content') !== background)
      meta.setAttribute('content', background)
  }
}

export function savedTheme() {
  try {
    const value = localStorage.getItem('edit-theme')
    if (value === 'dark' || value === 'light') return value === 'dark'
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function syncDocumentTheme() {
  const root = document.documentElement
  const editor = root.getAttribute('data-elp-editor-theme')
  const preview = root.getAttribute('data-elp-preview-theme')
  const page = root.getAttribute('data-elp-page-theme')
  paintDocumentTheme(
    editor
      ? editor === 'dark'
      : preview
        ? preview === 'dark'
        : page
          ? page === 'dark'
          : savedTheme(),
    editor ? EDITOR_PALETTE : SITE_PALETTE,
  )
}

export function themeBootstrapScript() {
  return `(${paintDocumentTheme.toString()})((${savedTheme.toString()})(),${JSON.stringify(SITE_PALETTE)})`
}

export function watchThemeChrome(refresh) {
  const observer = new MutationObserver((records) => {
    if (
      records.some((record) =>
        record.type === 'attributes'
          ? record.target instanceof HTMLMetaElement &&
            record.target.name === 'theme-color'
          : [...record.addedNodes, ...record.removedNodes].some(
              (node) =>
                node instanceof HTMLMetaElement && node.name === 'theme-color',
            ),
      )
    )
      refresh()
  })
  observer.observe(document.head, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['content', 'media', 'name'],
  })
  return () => observer.disconnect()
}

export function captureThemeChrome() {
  const root = document.documentElement
  const dark = root.classList.contains('dark')
  const editor = root.getAttribute('data-elp-editor-theme')
  const elements = [root, document.body].filter(Boolean).map((element) => ({
    element,
    values: ['background-color', 'color', 'color-scheme'].map((property) => [
      property,
      element.style.getPropertyValue(property),
      element.style.getPropertyPriority(property),
    ]),
  }))
  const metas = [...document.querySelectorAll('meta[name="theme-color"]')].map(
    (meta) => ({
      meta,
      content: meta.getAttribute('content'),
      media: meta.getAttribute('media'),
    }),
  )
  return () => {
    root.classList.toggle('dark', dark)
    if (editor === null) root.removeAttribute('data-elp-editor-theme')
    else root.setAttribute('data-elp-editor-theme', editor)
    for (const { element, values } of elements)
      for (const [property, value, priority] of values) {
        if (value) element.style.setProperty(property, value, priority)
        else element.style.removeProperty(property)
      }
    for (const meta of document.querySelectorAll('meta[name="theme-color"]'))
      if (!metas.some((item) => item.meta === meta)) meta.remove()
    for (const item of metas)
      for (const attribute of ['content', 'media']) {
        if (item[attribute] === null) item.meta.removeAttribute(attribute)
        else item.meta.setAttribute(attribute, item[attribute])
      }
    window.dispatchEvent(new Event(THEME_EVENT))
  }
}
