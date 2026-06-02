'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react'

interface CartItem {
  id: string
  quantity: number
  remark: string | null
  dish: {
    id: string
    name: string
    price: number
    image: string | null
  }
  method: {
    id: string
    name: string
    price: number
  } | null
}

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [tableNo, setTableNo] = useState('')
  const [orderRemark, setOrderRemark] = useState('')

  useEffect(() => {
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(itemId: string, delta: number) {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const newQuantity = item.quantity + delta
    if (newQuantity < 1) {
      await removeItem(itemId)
      return
    }

    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      })

      if (res.ok) {
        setItems(
          items.map((i) =>
            i.id === itemId ? { ...i, quantity: newQuantity } : i
          )
        )
      }
    } catch (error) {
      console.error('Failed to update quantity:', error)
    }
  }

  async function removeItem(itemId: string) {
    try {
      await fetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      setItems(items.filter((i) => i.id !== itemId))
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  async function handleSubmitOrder() {
    if (items.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNo: tableNo || null,
          remark: orderRemark || null,
          items: items.map((item) => ({
            dishId: item.dish.id,
            methodId: item.method?.id || null,
            quantity: item.quantity,
            remark: item.remark
          }))
        })
      })

      if (res.ok) {
        const order = await res.json()
        router.push(`/order/${order.id}`)
      } else {
        alert('提交失败，请重试')
      }
    } catch (error) {
      console.error('Failed to submit order:', error)
      alert('提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => {
    const price = item.dish.price + (item.method?.price || 0)
    return sum + price * item.quantity
  }, 0)

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">加载中...</div>
    )
  }

  return (
    <div className="space-y-4 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">购物车</h1>
        <span className="text-muted-foreground">{items.length} 件商品</span>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">购物车是空的</p>
            <Link href="/menu" className={buttonVariants({ className: 'mt-4' })}>
              去点菜
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0">
                      {item.dish.image ? (
                        <img
                          src={item.dish.image}
                          alt={item.dish.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🍽️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{item.dish.name}</h3>
                      {item.method && (
                        <Badge variant="outline" className="mt-1">
                          {item.method.name}
                          {item.method.price > 0 && ` +¥${item.method.price}`}
                        </Badge>
                      )}
                      {item.remark && (
                        <p className="text-sm text-muted-foreground mt-1">
                          备注：{item.remark}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">
                          ¥
                          {(
                            (item.dish.price + (item.method?.price || 0)) *
                            item.quantity
                          ).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 订单信息 */}
          <Card>
            <CardContent className="py-4 space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">桌号（可选）</label>
                <Input
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  placeholder="如：5号桌"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">备注（可选）</label>
                <Input
                  value={orderRemark}
                  onChange={(e) => setOrderRemark(e.target.value)}
                  placeholder="其他需求"
                />
              </div>
            </CardContent>
          </Card>

          {/* 底部操作栏 */}
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4">
            <div className="container flex items-center justify-between">
              <div>
                <span className="text-muted-foreground text-sm">合计</span>
                <span className="text-xl font-bold text-primary ml-2">
                  ¥{totalAmount.toFixed(2)}
                </span>
              </div>
              <Button size="lg" onClick={handleSubmitOrder} disabled={submitting}>
                {submitting ? '提交中...' : '提交订单'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
