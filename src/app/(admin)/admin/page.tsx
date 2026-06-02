'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/db'
import { UtensilsCrossed, ClipboardList, QrCode, TrendingUp } from 'lucide-react'

interface DashboardStats {
  totalDishes: number
  todayOrders: number
  pendingOrders: number
  todayRevenue: number
}

interface Order {
  id: string
  tableNo: string | null
  totalAmount: number
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDishes: 0,
    todayOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/orders?limit=5')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setRecentOrders(ordersData.orders || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    PENDING: { label: '待确认', variant: 'secondary' },
    CONFIRMED: { label: '已确认', variant: 'default' },
    PREPARING: { label: '制作中', variant: 'default' },
    SERVED: { label: '已上菜', variant: 'default' },
    COMPLETED: { label: '已完成', variant: 'outline' },
    CANCELLED: { label: '已取消', variant: 'destructive' }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">控制台</h2>
        <p className="text-muted-foreground">欢迎使用家用菜单管理系统</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              菜品总数
            </CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDishes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日订单
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              待处理
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日收入
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.todayRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">快捷操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/dishes/new" className={buttonVariants()}>
              添加菜品
            </Link>
            <Link
              href="/admin/orders"
              className={buttonVariants({ variant: 'outline' })}
            >
              查看订单
            </Link>
            <Link
              href="/admin/qrcodes"
              className={buttonVariants({ variant: 'outline' })}
            >
              生成二维码
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 最新订单 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">最新订单</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">加载中...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">暂无订单</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">#{order.id.slice(-6)}</span>
                    {order.tableNo && (
                      <span className="text-sm text-muted-foreground">
                        桌号: {order.tableNo}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">¥{order.totalAmount.toFixed(2)}</span>
                    <Badge variant={statusMap[order.status]?.variant || 'default'}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
