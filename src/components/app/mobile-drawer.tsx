'use client';

import { Dialog } from 'radix-ui';
import { X } from 'lucide-react';

export function MobileDrawer({ open, onOpenChange, title, children }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
        <Dialog.Content aria-describedby={undefined} className="mobile-drawer fixed inset-y-0 left-0 z-50 max-w-[85vw] bg-background shadow-xl outline-none md:hidden">
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          {children}
          <Dialog.Close aria-label="Close navigation" className="absolute right-2 top-3 grid size-11 place-items-center rounded-lg bg-background text-muted-foreground">
            <X className="size-5" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
