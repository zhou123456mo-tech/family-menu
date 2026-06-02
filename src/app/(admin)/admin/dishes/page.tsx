'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, Pencil, Trash2, Power, PowerOff } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string | null
}

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  status: 'AVAILABLE' | 'UNAVAILABLE'
  category: {
    name: string
    icon: string | null
  }
  methods: { id: string; name: string }[]
}

export default function DishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    Promise.all([fetchDishes(), fetchCategories()])
  }, [selectedCategory])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  async function fetchDishes() {
    setLoading(true)
    try {
      const url =
        selectedCategory && selectedCategory !== 'all'
          ? `/api/admin/dishes?categoryId=${selectedCategory}`
          : '/api/admin/dishes'
      const res = await fetch(url)
      if (res.ok) {
        setDishes(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleStatus(dish: Dish) {
    const newStatus = dish.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'
    try {
      const res = await fetch(`/api/admin/dishes/${dish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchDishes()
      }
    } catch (error) {
      console.error('Failed to toggle status:', error)
    }
  }

  async function handleDelete(dish: Dish) {
    if (!confirm(`确定要删除菜品"${dish.name}"吗？`)) return

    try {
      const res = await fetch(`/api/admin/dishes/${dish.id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        fetchDishes()
      } else {
        const error = await res.json()
        alert(error.error || '删除失败')
      }
    } catch (error) {
      console.error('Failed to delete dish:', error)
      alert('删除失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">菜品管理</h2>
          <p className="text-muted-foreground">管理菜单中的菜品</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(value) => value && setSelectedCategory(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon && `${cat.icon} `}
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/admin/dishes/new" className={buttonVariants()}>
            <Plus className="h-4 w-4 mr-2" />
            添加菜品
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : dishes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            暂无菜品，点击上方按钮添加
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((dish) => (
            <Card key={dish.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {dish.image ? (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant={dish.status === 'AVAILABLE' ? 'default' : 'secondary'}
                >
                  {dish.status === 'AVAILABLE' ? '上架中' : '已下架'}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{dish.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {dish.category.icon && `${dish.category.icon} `}
                      {dish.category.name}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    ¥{dish.price}
                  </span>
                </div>
                {dish.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {dish.description}
                  </p>
                )}
                {dish.methods.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dish.methods.map((method) => (
                      <Badge key={method.id} variant="outline" className="text-xs">
                        {method.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(dish)}
                  >
                    {dish.status === 'AVAILABLE' ? (
                      <PowerOff className="h-4 w-4" />
                    ) : (
                      <Power className="h-4 w-4" />
                    )}
                  </Button>
                  <Link
                    href={`/admin/dishes/${dish.id}/edit`}
                    className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(dish)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
