import 'server-only';
import { neon } from '@neondatabase/serverless';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { CurrentOrg } from '@/lib/auth/current-org';

function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
  return neon(process.env.DATABASE_URL);
}

export async function getNeonOrg(subject: string): Promise<CurrentOrg | null> {
  const sql = database();
  const [, rows] = await sql.transaction([
    sql`select set_config('app.user_id', ${subject}, true)`,
    sql`select org_id, role from public.org_members where user_id = ${subject}
        order by created_at, org_id limit 1`,
  ]);
  return rows[0] ? { orgId: rows[0].org_id, role: rows[0].role } : null;
}

// No subject or role is accepted from browser form data.
export async function createNeonWorkspace(client: SupabaseClient, name: string, demo = false) {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new Error('Authentication required.');
  const sql = database();
  const [, rows] = await sql.transaction([
    sql`select set_config('app.user_id', ${user.id}, true)`,
    sql`select poweros_private.create_workspace(${name}, ${user.email ?? null}, ${demo}) as id`,
  ]);
  return rows[0].id as string;
}
