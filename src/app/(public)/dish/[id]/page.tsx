'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Minus, Plus } from 'lucide-react'

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: {
    name: string
    icon: string | null
  }
  methods: { id: string; name: string; price: number }[]
}

export default function DishDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [dish, setDish] = useState<Dish | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [remark, setRemark] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchDish()
  }, [id])

  async function fetchDish() {
    try {
      const res = await fetch(`/api/dishes/${id}`)
      if (res.ok) {
        setDish(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch dish:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddToCart() {
    if (!dish) return
    setAdding(true)

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishId: dish.id,
          methodId: selectedMethod,
          quantity,
          remark
        })
      })

      if (res.ok) {
        router.push('/cart')
      } else {
        alert('添加失败，请重试')
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('添加失败，请重试')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">加载中...</div>
    )
  }

  if (!dish) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        菜品不存在
        <Link href="/menu" className={buttonVariants({ className: 'mt-4' })}>
          返回菜单
        </Link>
      </div>
    )
  }

  const selectedMethodData = dish.methods.find((m) => m.id === selectedMethod)
  const totalPrice = (dish.price + (selectedMethodData?.price || 0)) * quantity

  return (
    <div className="space-y-4 pb-20">
      {/* 返回按钮 */}
      <Link
        href="/menu"
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        返回菜单
      </Link>

      {/* 菜品图片 */}
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        {dish.image ? (
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍽️
          </div>
        )}
      </div>

      {/* 基本信息 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dish.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">
              {dish.category.icon && `${dish.category.icon} `}
              {dish.category.name}
            </Badge>
          </div>
        </div>
        <span className="text-2xl font-bold text-primary">¥{dish.price}</span>
      </div>

      {/* 描述 */}
      {dish.description && (
        <Card>
          <CardContent className="py-4">
            <p className="text-muted-foreground">{dish.description}</p>
          </CardContent>
        </Card>
      )}

      {/* 做法选择 */}
      {dish.methods.length > 0 && (
        <Card>
          <CardContent className="py-4 space-y-3">
            <Label>选择做法</Label>
            <div className="flex flex-wrap gap-2">
              {dish.methods.map((method) => (
                <Button
                  key={method.id}
                  variant={selectedMethod === method.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMethod(method.id)}
                >
                  {method.name}
                  {method.price > 0 && ` (+¥${method.price})`}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 数量和备注 */}
      <Card>
        <CardContent className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label>数量</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="remark">备注（可选）</Label>
            <Input
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="如：少盐、不要葱"
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
              ¥{totalPrice.toFixed(2)}
            </span>
          </div>
          <Button size="lg" onClick={handleAddToCart} disabled={adding}>
            {adding ? '添加中...' : '加入购物车'}
          </Button>
        </div>
      </div>
    </div>
  )
}
