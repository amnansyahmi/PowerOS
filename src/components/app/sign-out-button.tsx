import { LogOut } from 'lucide-react';
import { signOutAction } from '@/app/(auth)/actions';

export function SignOutButton({ className }: { className?: string }) {
  return <form action={signOutAction}><button type="submit" aria-label="Sign out" className={className}><LogOut className="size-4" /></button></form>;
}
