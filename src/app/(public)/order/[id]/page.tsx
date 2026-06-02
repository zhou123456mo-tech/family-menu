'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface Order {
  id: string
  tableNo: string | null
  totalAmount: number
  remark: string | null
  status: string
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    remark: string | null
    dish: {
      name: string
    }
    method: {
      name: string
    } | null
  }[]
}

export default function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (res.ok) {
        setOrder(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch order:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    PENDING: { label: '待确认', color: 'bg-yellow-500' },
    CONFIRMED: { label: '已确认', color: 'bg-blue-500' },
    PREPARING: { label: '制作中', color: 'bg-orange-500' },
    SERVED: { label: '已上菜', color: 'bg-green-500' },
    COMPLETED: { label: '已完成', color: 'bg-gray-500' },
    CANCELLED: { label: '已取消', color: 'bg-red-500' }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">加载中...</div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        订单不存在
        <Link href="/menu" className={buttonVariants({ className: 'mt-4' })}>
          返回菜单
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 成功提示 */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
          <h1 className="text-xl font-bold text-green-700">下单成功</h1>
          <p className="text-green-600 text-sm mt-1">
            订单号：#{order.id.slice(-6).toUpperCase()}
          </p>
        </CardContent>
      </Card>

      {/* 订单状态 */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">订单状态</span>
            <Badge
              className={`${statusMap[order.status]?.color || 'bg-gray-500'} text-white`}
            >
              {statusMap[order.status]?.label || order.status}
            </Badge>
          </div>
          {order.tableNo && (
            <p className="text-sm text-muted-foreground mt-2">
              桌号：{order.tableNo}
            </p>
          )}
        </CardContent>
      </Card>

      {/* 订单项 */}
      <Card>
        <CardContent className="py-4">
          <h3 className="font-medium mb-3">订单详情</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span>{item.dish.name}</span>
                  {item.method && (
                    <span className="text-muted-foreground">
                      {' '}
                      ({item.method.name})
                    </span>
                  )}
                  <span className="text-muted-foreground"> x{item.quantity}</span>
                </div>
                <span className="font-medium">¥{item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t mt-3 pt-3 flex justify-between font-bold">
            <span>合计</span>
            <span className="text-primary">¥{order.totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 备注 */}
      {order.remark && (
        <Card>
          <CardContent className="py-4">
            <span className="text-muted-foreground text-sm">备注：</span>
            <span className="text-sm">{order.remark}</span>
          </CardContent>
        </Card>
      )}

      <Link href="/menu" className={buttonVariants({ className: 'w-full' })}>
        继续点菜
      </Link>
    </div>
  )
}
