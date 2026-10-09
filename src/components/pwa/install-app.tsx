'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Dialog } from 'radix-ui';

type InstallEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const check = () => setInstalled(window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const frame = requestAnimationFrame(check);
    const onPrompt = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  if (installed) return null;
  async function install() {
    if (!prompt) { setOpen(true); return; }
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setPrompt(null);
  }
  return <>
    <button type="button" onClick={install} className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"><Download className="size-4" />Install PowerOS</button>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border bg-background p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">PowerOS on your home screen</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm leading-6 text-muted-foreground">On iPhone, open PowerOS in Safari, tap Share, then Add to Home Screen. On Android, choose Install app or Add to Home Screen from your browser menu.</Dialog.Description>
          <Dialog.Close aria-label="Close installation guide" className="absolute right-2 top-2 grid size-9 place-items-center rounded-lg hover:bg-accent"><X className="size-4" /></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>;
}
