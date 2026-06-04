'use client'

import Link from 'next/link'
import { SessionProvider } from 'next-auth/react'
import { ShoppingCart } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between">
            <Link href="/menu" className="flex items-center gap-2">
              <span className="text-xl">🍽️</span>
              <span className="font-bold text-lg">家用菜单</span>
            </Link>
            <Link href="/cart" className={buttonVariants({ variant: 'ghost', size: 'icon' })}>
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </div>
        </header>
        <main className="container py-4">{children}</main>
      </div>
    </SessionProvider>
  )
}
