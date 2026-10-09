import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { describe, expect, test } from 'vitest';

config({ path: '.env.neon-test.local', quiet: true });
const url = process.env.NEON_TEST_DATABASE_URL;
describe.skipIf(!url)('Neon runtime tenant isolation (development branch only)', () => {
  const sql = url ? neon(url) : null;
  const prefix = `test-${crypto.randomUUID()}`;

  test('runtime has no administrative privileges and cannot read without identity', async () => {
    const roles = await sql!`select rolbypassrls, rolcreatedb, rolcreaterole from pg_roles where rolname=current_user`;
    expect(roles[0]).toEqual({ rolbypassrls: false, rolcreatedb: false, rolcreaterole: false });
    expect(await sql!`select id from public.orgs`).toEqual([]);
  });

  test('each user sees their own workspace, and context expires after the transaction', async () => {
    const [, alice] = await sql!.transaction([
      sql!`select set_config('app.user_id', ${prefix + '-alice'}, true)`,
      sql!`select poweros_private.create_workspace('Alice workspace', null, false) as id`,
    ]);
    const [, , visible, altered] = await sql!.transaction([
      sql!`select set_config('app.user_id', ${prefix + '-bob'}, true)`,
      sql!`select poweros_private.create_workspace('Bob workspace', null, false)`,
      sql!`select id from public.orgs`,
      sql!`update public.orgs set name='Cross-tenant edit' where id=${alice[0].id} returning id`,
    ]);
    expect(visible).toHaveLength(1);
    expect(visible[0].id).not.toBe(alice[0].id);
    expect(altered).toEqual([]);
    expect(await sql!`select id from public.orgs`).toEqual([]);
  });

  test('viewer cannot edit workspace, and runtime cannot escalate membership', async () => {
    const [, , updates] = await sql!.transaction([
      sql!`select set_config('app.user_id', ${prefix + '-viewer'}, true)`,
      sql!`select poweros_private.create_workspace('Viewer demo', null, true)`,
      sql!`update public.orgs set name='Viewer edit' returning id`,
    ]);
    expect(updates).toEqual([]);
    await expect(sql!`update public.org_members set role='owner'`).rejects.toThrow(/permission denied/);
  });
});
