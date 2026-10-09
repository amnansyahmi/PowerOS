import { createClient } from '@/lib/supabase/server';
import { requireOrg } from '@/lib/auth/current-org';
import { AppShell } from '@/components/app/app-shell';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    await requireOrg(await createClient());
  }
  return <AppShell>{children}</AppShell>;
}
