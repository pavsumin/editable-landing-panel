export type Palette = { light: string; dark: string }
export const SITE_PALETTE: Palette
export const EDITOR_PALETTE: Palette
export const THEME_EVENT: string
export function paintDocumentTheme(dark: boolean, palette: Palette): void
export function savedTheme(): boolean
export function syncDocumentTheme(): void
export function themeBootstrapScript(): string
export function watchThemeChrome(refresh: () => void): () => void
export function captureThemeChrome(): () => void
