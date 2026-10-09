'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getProduct } from '@/config/nav';
import { ProductRail } from './product-rail';
import { MobileNav } from './mobile-nav';
import { MobileDrawer } from './mobile-drawer';
import { SecondaryNav } from './secondary-nav';
import { AppTopbar } from './app-topbar';
import { AssistantFab } from './assistant-fab';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const key = pathname.split('/')[1] || null;
  const product = getProduct(key ?? undefined);
  const hasSecondary = !!product && product.sections.length > 0;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close the mobile drawer whenever the route changes.
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileNavOpen(false);
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row">
        <div className="hidden h-full md:block"><ProductRail activeKey={key} /></div>

        {/* Secondary nav — inline from md up (unless collapsed) */}
        {hasSecondary && !collapsed ? (
          <div className="hidden shrink-0 md:flex">
            <SecondaryNav
              product={product!}
              onCollapse={() => setCollapsed(true)}
            />
          </div>
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <AppTopbar
            onExpand={
              hasSecondary && collapsed ? () => setCollapsed(false) : undefined
            }
            onOpenNav={
              hasSecondary ? () => setMobileNavOpen(true) : undefined
            }
          />
          <main className="app-scroll relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/30">
            {children}
          </main>
        </div>

        <MobileNav activeKey={key} />
        {hasSecondary ? (
          <MobileDrawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} title={`${product!.name} navigation`}>
            <SecondaryNav product={product!} onCollapse={() => setMobileNavOpen(false)} />
          </MobileDrawer>
        ) : null}

        <AssistantFab />
      </div>
    </TooltipProvider>
  );
}
