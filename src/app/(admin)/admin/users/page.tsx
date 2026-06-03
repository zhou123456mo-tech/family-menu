'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Users, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  phone: string | null
  role: 'ADMIN' | 'USER'
  createdAt: string
  _count?: { orders: number }
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/menu')
    } else if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status, session, router])

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        setUsers(await res.json())
      } else {
        toast.error('获取用户列表失败')
      }
    } catch (error) {
      console.error('Fetch users error:', error)
      toast.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  async function updateRole(userId: string, role: 'ADMIN' | 'USER') {
    setUpdatingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      if (res.ok) {
        const updatedUser = await res.json()
        setUsers(users.map(u => u.id === userId ? updatedUser : u))
        toast.success('角色更新成功')
      } else {
        const data = await res.json()
        toast.error(data.error || '更新失败')
      }
    } catch (error) {
      console.error('Update role error:', error)
      toast.error('更新失败')
    } finally {
      setUpdatingId(null)
    }
  }

  async function deleteUser() {
    if (!deleteUserId) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        setUsers(users.filter(u => u.id !== deleteUserId))
        toast.success('用户已删除')
      } else {
        const data = await res.json()
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      toast.error('删除失败')
    } finally {
      setDeleting(false)
      setDeleteUserId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">用户管理</h1>
        <p className="text-muted-foreground">管理系统用户和权限</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            用户列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">姓名</th>
                  <th className="text-left py-3 px-4 font-medium">手机号</th>
                  <th className="text-left py-3 px-4 font-medium">角色</th>
                  <th className="text-left py-3 px-4 font-medium">订单数</th>
                  <th className="text-left py-3 px-4 font-medium">注册时间</th>
                  <th className="text-right py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <span className="font-medium">{user.name}</span>
                      {user.id === session?.user?.id && (
                        <Badge variant="secondary" className="ml-2">当前</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user.phone || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {user.id === session?.user?.id ? (
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {user.role === 'ADMIN' ? '管理员' : '普通用户'}
                        </Badge>
                      ) : (
                        <Select
                          value={user.role}
                          onValueChange={(value) => updateRole(user.id, value as 'ADMIN' | 'USER')}
                          disabled={updatingId === user.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">
                              <Badge variant="default" className="mr-1">管理员</Badge>
                            </SelectItem>
                            <SelectItem value="USER">
                              <Badge variant="secondary" className="mr-1">普通用户</Badge>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {user._count?.orders || 0}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-sm">
                      {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.id !== session?.user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteUserId(user.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      暂无用户
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除该用户吗？此操作不可撤销，用户的所有订单也将被删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
