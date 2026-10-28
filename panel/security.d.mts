/** @param {string} left @param {string} right */
export function equalSecret(left: string, right: string): boolean
/** @param {NodeJS.ProcessEnv} env */
export function authSecret(env: NodeJS.ProcessEnv): NonSharedBuffer
/** @param {NodeJS.ProcessEnv} env @param {number=} now */
export function createSession(
  env: NodeJS.ProcessEnv,
  now?: number | undefined,
): string
/** @param {string} token @param {NodeJS.ProcessEnv} env @param {number=} now */
export function validSession(
  token: string,
  env: NodeJS.ProcessEnv,
  now?: number | undefined,
): boolean
/** @param {Request} req @param {NodeJS.ProcessEnv} env */
export function sessionFromRequest(
  req: Request,
  env: NodeJS.ProcessEnv,
): boolean
/** @param {Request} req @param {NodeJS.ProcessEnv} env */
export function assertOrigin(req: Request, env: NodeJS.ProcessEnv): void
/** @param {Request} req @param {number=} maxBytes @returns {Promise<unknown>} */
export function readJson(
  req: Request,
  maxBytes?: number | undefined,
): Promise<unknown>
export const COOKIE_NAME: 'elp-session'
export const SESSION_SECONDS: number
export class HttpError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status: number, message: string)
  status: number
}
