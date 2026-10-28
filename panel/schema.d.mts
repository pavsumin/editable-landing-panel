/** @typedef {{key:string,label:string,type:'text'|'textarea'|'image'|'url',default:string,maxLength:number}} Field */
/** @typedef {{id:string,label:string,fields:Field[]}} Section */
/** @typedef {{id:string,label:string,path:string,sections:Section[]}} Page */
/** @typedef {{version:number,pages:Page[]}} Config */
/** @param {unknown} value @returns {asserts value is Config} */
export function validateConfig(value: unknown): asserts value is Config
/** @param {Config} config @param {string=} pageId @returns {Field[]} */
export function fieldsFor(config: Config, pageId?: string | undefined): Field[]
/** @param {Field} field @param {unknown} value @returns {asserts value is string} */
export function validateValue(
  field: Field,
  value: unknown,
): asserts value is string
/** @param {Config} config @param {unknown} input @returns {Record<string,string>} */
export function validateValues(
  config: Config,
  input: unknown,
): Record<string, string>
/** @param {Config} config @param {{key:string,value:unknown}[]} rows @param {string=} pageId */
export function mergeContent(
  config: Config,
  rows: {
    key: string
    value: unknown
  }[],
  pageId?: string | undefined,
): {
  [k: string]: string
}
export type Field = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'url'
  default: string
  maxLength: number
}
export type Section = {
  id: string
  label: string
  fields: Field[]
}
export type Page = {
  id: string
  label: string
  path: string
  sections: Section[]
}
export type Config = {
  version: number
  pages: Page[]
}
