'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Settings } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string | null
  _count?: { dishes: number }
}

interface Dish {
  id: string
  name: string
  description: string | null
  price: number
  image: string | null
  category: {
    id: string
    name: string
    icon: string | null
  }
  methods: { id: string; name: string; price: number }[]
}

export default function MenuPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    Promise.all([fetchCategories(), fetchDishes()])
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        setCategories(await res.json())
      } else {
        console.error('Categories API error:', res.status)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  async function fetchDishes() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dishes')
      if (res.ok) {
        setDishes(await res.json())
      } else {
        setError('加载失败，请刷新重试')
        console.error('Dishes API error:', res.status)
      }
    } catch (error) {
      setError('网络错误，请检查连接')
      console.error('Failed to fetch dishes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDishes =
    activeCategory === 'all'
      ? dishes
      : dishes.filter((dish) => dish.category.id === activeCategory)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">今日菜单</h1>
          <p className="text-muted-foreground">请选择您喜欢的菜品</p>
        </div>
        {isAdmin && (
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              管理后台
            </Button>
          </Link>
        )}
      </div>

      {/* 分类标签 */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
        >
          全部
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon && `${cat.icon} `}
            {cat.name}
          </Button>
        ))}
      </div>

      {/* 菜品列表 */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">{error}</p>
          <Button variant="outline" onClick={() => fetchDishes()}>重试</Button>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">暂无菜品</div>
      ) : (
        <div className="grid gap-4">
          {filteredDishes.map((dish) => (
            <Link key={dish.id} href={`/dish/${dish.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-muted">
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🍽️
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-3 sm:p-4">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="font-semibold text-base sm:text-lg">
                          {dish.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {dish.category.icon && `${dish.category.icon} `}
                            {dish.category.name}
                          </Badge>
                          {dish.methods.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {dish.methods.length} 种做法
                            </Badge>
                          )}
                        </div>
                        {dish.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {dish.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-primary">
                          ¥{dish.price}
                        </span>
                        <Button size="sm" className="gap-1">
                          <Plus className="h-4 w-4" />
                          加入
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
