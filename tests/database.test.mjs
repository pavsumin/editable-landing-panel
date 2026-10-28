import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

test('migration preserves legacy data, denies public mutations and restricts shared throttle RPC', async () => {
  const db = new PGlite()
  try {
    await db.exec(
      `create role anon; create role authenticated; create role service_role bypassrls; create schema storage; create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]); create table public.content(key text primary key,value text); insert into public.content values ('hero_title','Existing client content'); grant usage on schema public to anon, authenticated, service_role;`,
    )
    const migration = await readFile(
      new URL(
        '../supabase/migrations/202610280001_panel_security.sql',
        import.meta.url,
      ),
      'utf8',
    )
    await db.exec('grant all on public.content to public')
    await db.exec(migration)
    await db.exec(migration) // Repeatable installation must preserve content.
    assert.equal(
      (await db.query('select value from public.content')).rows[0].value,
      'Existing client content',
    )
    await db.exec('set role anon')
    assert.equal(
      (await db.query('select value from public.content')).rows.length,
      1,
    )
    for (const sql of [
      "insert into public.content values ('bad','bad')",
      "update public.content set value='bad'",
      'delete from public.content',
      'truncate public.content',
      "select public.elp_consume_login_attempt(repeat('a',64))",
    ])
      await assert.rejects(db.exec(sql), /permission denied/)
    await db.exec('reset role; set role service_role')
    for (let index = 0; index < 10; index++)
      assert.equal(
        (
          await db.query(
            "select public.elp_consume_login_attempt(repeat('a',64)) as allowed",
          )
        ).rows[0].allowed,
        true,
      )
    assert.equal(
      (
        await db.query(
          "select public.elp_consume_login_attempt(repeat('a',64)) as allowed",
        )
      ).rows[0].allowed,
      false,
    )
    await db.exec(
      "update public.elp_login_attempts set window_start=now()-interval '16 minutes'",
    )
    assert.equal(
      (
        await db.query(
          "select public.elp_consume_login_attempt(repeat('a',64)) as allowed",
        )
      ).rows[0].allowed,
      true,
    )
    await db.exec(
      "update public.content set value='New content' where key='hero_title'",
    )
    assert.equal(
      (await db.query('select value from public.content')).rows[0].value,
      'New content',
    )
  } finally {
    await db.close()
  }
})

test('shared AI migration bounds per-client and global budgets without changing content', async () => {
  const db = new PGlite()
  try {
    await db.exec(
      'create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;',
    )
    const sql = await readFile(
      new URL(
        '../supabase/migrations/202610280002_shared_ai.sql',
        import.meta.url,
      ),
      'utf8',
    )
    await db.exec(sql)
    await db.exec(sql)
    await db.exec('set role anon')
    await assert.rejects(
      db.exec("select public.elp_consume_ai_request(repeat('a',64))"),
      /permission denied/,
    )
    await assert.rejects(
      db.exec('select * from public.elp_ai_budget'),
      /permission denied/,
    )
    await db.exec('reset role; set role service_role')
    for (let i = 0; i < 3; i++)
      assert.equal(
        (
          await db.query(
            "select public.elp_consume_ai_request(repeat('a',64)) as allowed",
          )
        ).rows[0].allowed,
        true,
      )
    assert.equal(
      (
        await db.query(
          "select public.elp_consume_ai_request(repeat('a',64)) as allowed",
        )
      ).rows[0].allowed,
      false,
    )
    for (let i = 0; i < 17; i++)
      assert.equal(
        (
          await db.query(
            'select public.elp_consume_ai_request(md5($1)||md5($1)) as allowed',
            [String(i)],
          )
        ).rows[0].allowed,
        true,
      )
    assert.equal(
      (
        await db.query(
          "select public.elp_consume_ai_request(repeat('b',64)) as allowed",
        )
      ).rows[0].allowed,
      false,
    )
    assert.equal(
      (
        await db.query(
          "select requests from public.elp_ai_budget where bucket='global'",
        )
      ).rows[0].requests,
      20,
    )
    await db.exec('update public.elp_ai_budget set day=day-1')
    assert.equal(
      (
        await db.query(
          "select public.elp_consume_ai_request(repeat('a',64)) as allowed",
        )
      ).rows[0].allowed,
      true,
    )
  } finally {
    await db.close()
  }
})
