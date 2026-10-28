'use client'
/* eslint-disable @next/next/no-img-element -- The editor previews arbitrary validated image URLs without requiring host configuration. */

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Config, Field } from './schema.mjs'
import { mergeContent, validateValues } from './schema.mjs'
import styles from './editor.module.css'

type Values = Record<string, string>
type Props = { config: Config; demo?: boolean }

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/editable-panel/${path}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
  })
  const result = await response
    .json()
    .catch(() => ({ error: 'Server returned an invalid response' }))
  if (!response.ok)
    throw new Error(
      response.status === 401
        ? 'Session expired. Sign in again; your draft is still here.'
        : result.error || 'Request failed',
    )
  return result
}

export default function Editor({ config, demo = false }: Props) {
  const [authenticated, setAuthenticated] = useState(demo)
  const [checking, setChecking] = useState(!demo)
  const [password, setPassword] = useState('')
  const [pageId, setPageId] = useState(config.pages[0].id)
  const [query, setQuery] = useState('')
  const [values, setValues] = useState<Values>(() => mergeContent(config, []))
  const [drafts, setDrafts] = useState<Values>({})
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState(demo)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dark, setDark] = useState(false)
  const [mobileMode, setMobileMode] = useState('edit')
  const [sectionId, setSectionId] = useState(config.pages[0].sections[0].id)
  const iframe = useRef<HTMLIFrameElement>(null)
  const dirty = Object.keys(drafts).length > 0
  const page =
    config.pages.find((item) => item.id === pageId) || config.pages[0]
  const current = { ...values, ...drafts }

  const sync = useCallback(() => {
    iframe.current?.contentWindow?.postMessage(
      {
        channel: 'editable-panel-v1',
        type: 'values',
        values: { ...values, ...drafts },
      },
      window.location.origin,
    )
    iframe.current?.contentWindow?.postMessage(
      { channel: 'editable-panel-v1', type: 'theme', dark },
      window.location.origin,
    )
  }, [values, drafts, dark])

  useEffect(() => {
    if (demo) return
    localStorage.removeItem('admin-auth')
    localStorage.removeItem('admin-password')
    const id = new URLSearchParams(window.location.search).get('page')
    if (config.pages.some((page) => page.id === id)) setPageId(id!)
    request('session')
      .then((data) => setAuthenticated(data.authenticated))
      .catch(() => setError('Unable to check session'))
      .finally(() => setChecking(false))
  }, [config, demo])

  useEffect(() => {
    if (!authenticated || demo) return
    const controller = new AbortController()
    request('content', { signal: controller.signal })
      .then((result) => {
        setValues(result.values)
        setLoaded(true)
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message)
      })
    return () => controller.abort()
  }, [authenticated, demo])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.source === iframe.current?.contentWindow &&
        event.data?.channel === 'editable-panel-v1' &&
        event.data.type === 'ready'
      )
        sync()
    }
    window.addEventListener('message', handler)
    sync()
    return () => window.removeEventListener('message', handler)
  }, [sync, pageId])

  useEffect(() => {
    if (!dirty) return
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [dirty])

  async function login(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await request('session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      setPassword('')
      setAuthenticated(true)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      validateValues(config, drafts)
      if (!demo)
        await request('content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: drafts }),
        })
      setValues((previous) => ({ ...previous, ...drafts }))
      setDrafts({})
      setMessage(
        demo
          ? 'Saved in this demo only. Reload to reset.'
          : 'All changes saved.',
      )
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function edit(key: string, value: string) {
    setDrafts((previous) => {
      const next = { ...previous, [key]: value }
      if (value === values[key]) delete next[key]
      return next
    })
    setMessage('')
  }

  async function reset(field: Field) {
    if (!window.confirm(`Restore “${field.label}” to its default value?`))
      return
    setBusy(true)
    setError('')
    try {
      if (!demo)
        await request('content', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: field.key }),
        })
      setValues((previous) => ({ ...previous, [field.key]: field.default }))
      setDrafts((previous) => {
        const next = { ...previous }
        delete next[field.key]
        return next
      })
      setMessage('Default restored.')
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function upload(field: Field, file?: File) {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Maximum image size is 5 MB')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (demo) {
        if (
          !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(
            file.type,
          )
        )
          throw new Error('Choose a JPEG, PNG, WebP or AVIF image')
        const reader = new FileReader()
        const url = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        // Demo images stay in browser state and are never sent to the database.
        setValues((previous) => ({ ...previous, [field.key]: url }))
        setMessage('Demo image updated locally.')
      } else {
        const body = new FormData()
        body.set('file', file)
        const result = await request('upload', { method: 'POST', body })
        edit(field.key, result.url)
        setMessage('Image uploaded. Save changes to publish it.')
      }
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function switchPage(id: string) {
    if (
      busy ||
      (dirty && !window.confirm('Discard unsaved changes and switch page?'))
    )
      return
    setDrafts({})
    setPageId(id)
    setSectionId(config.pages.find((page) => page.id === id)!.sections[0].id)
    setQuery('')
    if (!demo) {
      const url = new URL(window.location.href)
      url.searchParams.set('page', id)
      window.history.replaceState(null, '', url)
    }
  }

  if (checking)
    return (
      <div className={styles.panel}>
        <p role="status">Checking your session…</p>
      </div>
    )
  if (!authenticated)
    return (
      <div className={styles.panel}>
        <form className={styles.login} onSubmit={login}>
          <span className={styles.eyebrow}>EDITABLE PANEL</span>
          <h1>Welcome back.</h1>
          <p>Sign in to manage your website content.</p>
          <label htmlFor="panel-password">Admin password</label>
          <input
            id="panel-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={busy}
          />
          <button className={styles.primary} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in →'}
          </button>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <Link href="/">← Back to website</Link>
        </form>
      </div>
    )

  return (
    <div className={styles.panel} data-theme={dark ? 'dark' : 'light'}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            {demo ? 'INTERACTIVE SANDBOX' : 'CONTENT WORKSPACE'}
          </span>
          <h1>{demo ? 'Try the editor.' : 'Make it yours.'}</h1>
          <p>
            {demo
              ? 'Same editor. Local changes only; reload to reset.'
              : 'Edit with confidence. Preview before you publish.'}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => setDark(!dark)}
            aria-label="Toggle editor theme"
          >
            {dark ? '☀ Light' : '◐ Dark'}
          </button>
          {!demo && (
            <button
              disabled={busy}
              onClick={async () => {
                if (dirty && !window.confirm('Discard changes and sign out?'))
                  return
                try {
                  await request('session', { method: 'DELETE' })
                  setAuthenticated(false)
                  setDrafts({})
                  setLoaded(false)
                } catch (error) {
                  setError((error as Error).message)
                }
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </header>
      <div className={styles.toolbar}>
        <div className={styles.pagePicker}>
          <label htmlFor={demo ? 'demo-page' : 'panel-page'}>PAGE</label>
          <select
            id={demo ? 'demo-page' : 'panel-page'}
            value={pageId}
            onChange={(event) => switchPage(event.target.value)}
            disabled={busy}
          >
            {config.pages.map((page) => (
              <option value={page.id} key={page.id}>
                {page.label} · {page.id === 'global' ? 'Shared' : page.path}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.actions}>
          <span className={styles.state}>
            {dirty ? `${Object.keys(drafts).length} unsaved` : 'Up to date'}
          </span>
          <button
            disabled={!dirty || busy}
            onClick={() => {
              if (window.confirm('Discard all unsaved changes?')) setDrafts({})
            }}
          >
            Discard
          </button>
          <button
            className={styles.primary}
            disabled={!dirty || busy || !loaded}
            onClick={save}
          >
            {busy ? 'Working…' : 'Save changes'}
          </button>
        </div>
      </div>
      {error && (
        <div role="alert" className={styles.error}>
          {error}{' '}
          {!demo && (
            <button onClick={() => setAuthenticated(false)}>
              Sign in again
            </button>
          )}
        </div>
      )}
      {message && (
        <div role="status" className={styles.notice}>
          {message}
        </div>
      )}
      <div className={styles.mobileToggle}>
        <button
          aria-pressed={mobileMode === 'edit'}
          onClick={() => setMobileMode('edit')}
        >
          Edit
        </button>
        <button
          aria-pressed={mobileMode === 'preview'}
          onClick={() => setMobileMode('preview')}
        >
          Preview
        </button>
      </div>
      <div className={styles.workspace} data-mode={mobileMode}>
        <div className={styles.fields}>
          <label className={styles.search}>
            Find a field
            <input
              type="search"
              value={query}
              placeholder="Search labels or keys…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {!loaded && <p role="status">Loading content…</p>}
          {page.sections.map((section) => {
            const fields = section.fields.filter((field) =>
              `${field.label} ${field.key}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            if (!fields.length) return null
            return (
              <section key={section.id} className={styles.section}>
                <button
                  className={styles.sectionTitle}
                  aria-expanded={sectionId === section.id || !!query}
                  onClick={() => {
                    setSectionId(section.id)
                    iframe.current?.contentWindow?.postMessage(
                      {
                        channel: 'editable-panel-v1',
                        type: 'scroll',
                        id: section.id,
                      },
                      window.location.origin,
                    )
                  }}
                >
                  {section.label}
                  <span>{fields.length} fields ↗</span>
                </button>
                {(sectionId === section.id || query) &&
                  fields.map((field) => (
                    <div className={styles.field} key={field.key}>
                      <div className={styles.fieldHeading}>
                        <label htmlFor={`field-${field.key}`}>
                          {field.label}
                        </label>
                        <button
                          disabled={busy || !loaded}
                          onClick={() => reset(field)}
                          aria-label={`Reset ${field.label}`}
                        >
                          Reset
                        </button>
                      </div>
                      {field.type === 'image' ? (
                        <>
                          <div className={styles.image}>
                            {current[field.key] && (
                              <img src={current[field.key]} alt={field.label} />
                            )}
                          </div>
                          <input
                            id={`field-${field.key}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            disabled={busy || !loaded}
                            onChange={(event) => {
                              void upload(field, event.target.files?.[0])
                              event.target.value = ''
                            }}
                          />
                          <p className={styles.hint}>
                            JPEG, PNG, WebP or AVIF · up to 5 MB
                          </p>
                        </>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          id={`field-${field.key}`}
                          rows={3}
                          value={current[field.key] || ''}
                          maxLength={field.maxLength}
                          disabled={busy || !loaded}
                          onChange={(event) =>
                            edit(field.key, event.target.value)
                          }
                        />
                      ) : (
                        <input
                          id={`field-${field.key}`}
                          type="text"
                          value={current[field.key] || ''}
                          maxLength={field.maxLength}
                          disabled={busy || !loaded}
                          onChange={(event) =>
                            edit(field.key, event.target.value)
                          }
                        />
                      )}
                      <code className={styles.hint}>{field.key}</code>
                    </div>
                  ))}
              </section>
            )
          })}
        </div>
        <aside className={styles.preview}>
          <div className={styles.previewBar}>
            <span>● Live preview</span>
            <span>{demo ? 'Sandbox' : page.path}</span>
          </div>
          {demo ? (
            <div className={styles.demoPreview}>
              <span className={styles.eyebrow}>YOUR NEXT IDEA</span>
              <h2>{current['demo.title']}</h2>
              <p>{current['demo.description']}</p>
              {current['demo.image'] && (
                <img src={current['demo.image']} alt="Demo illustration" />
              )}
              <button className={styles.primary}>
                {current['demo.button']}
              </button>
            </div>
          ) : (
            <iframe
              ref={iframe}
              title={`${page.label} preview`}
              src={`${page.path}?preview=true`}
              onLoad={sync}
            />
          )}
        </aside>
      </div>
    </div>
  )
}
