'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  QrCode,
  Settings,
  Menu,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: '控制台', icon: LayoutDashboard },
  { href: '/admin/dishes', label: '菜品管理', icon: UtensilsCrossed },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/orders', label: '订单管理', icon: ClipboardList },
  { href: '/admin/qrcodes', label: '二维码', icon: QrCode },
  { href: '/admin/settings', label: '设置', icon: Settings }
]

function NavLinks({ onClick }: { onClick?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClick}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/30 p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold">家用菜单</h1>
        <p className="text-sm text-muted-foreground">管理后台</p>
      </div>
      <NavLinks />
    </aside>
  )
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-64 p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold">家用菜单</h1>
          <p className="text-sm text-muted-foreground">管理后台</p>
        </div>
        <NavLinks onClick={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
