'use client'

import { SessionProvider } from 'next-auth/react'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 bg-muted/20">{children}</main>
        </div>
      </div>
    </SessionProvider>
  )
}
