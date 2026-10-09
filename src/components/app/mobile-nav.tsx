'use client';

import Link from 'next/link';
import { PRODUCTS, productHref } from '@/config/nav';
import { cn } from '@/lib/utils';

export function MobileNav({ activeKey }: { activeKey: string | null }) {
  return (
    <nav aria-label="Business apps" className="mobile-bottom-nav grid shrink-0 grid-cols-6 border-t bg-background md:hidden">
      {PRODUCTS.map((product) => {
        const Icon = product.icon;
        const active = activeKey === product.key;
        return (
          <Link key={product.key} href={productHref(product)} aria-current={active ? 'page' : undefined}
            className={cn('flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-medium text-muted-foreground', active && 'text-primary')}>
            <Icon className={cn('size-5', active && 'stroke-[2.5]')} aria-hidden="true" />
            <span>{product.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
