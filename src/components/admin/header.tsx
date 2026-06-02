'use client'

import { signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { AdminMobileNav } from './sidebar'
import { LogOut, User } from 'lucide-react'

export function AdminHeader() {
  const { data: session } = useSession()

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4">
      <AdminMobileNav />
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{session?.user?.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/login' })}
        >
          <LogOut className="h-4 w-4 mr-1" />
          退出
        </Button>
      </div>
    </header>
  )
}
