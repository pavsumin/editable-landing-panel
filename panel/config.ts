import source from '@/editable-panel.config.json'
import { validateConfig, type Config } from './schema.mjs'

validateConfig(source)
export const panelConfig: Config = source
