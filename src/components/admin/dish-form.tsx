'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'
import { ImageUpload } from './image-upload'

interface Category {
  id: string
  name: string
  icon: string | null
}

interface DishMethod {
  id?: string
  name: string
  price: number
}

interface DishFormProps {
  dishId?: string
}

export function DishForm({ dishId }: DishFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
    status: 'AVAILABLE' as 'AVAILABLE' | 'UNAVAILABLE'
  })
  const [methods, setMethods] = useState<DishMethod[]>([])
  const [newMethod, setNewMethod] = useState({ name: '', price: '0' })

  useEffect(() => {
    fetchCategories()
    if (dishId) {
      fetchDish()
    }
  }, [dishId])

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

  async function fetchDish() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/dishes/${dishId}`)
      if (res.ok) {
        const dish = await res.json()
        setFormData({
          name: dish.name,
          description: dish.description || '',
          price: dish.price.toString(),
          image: dish.image || '',
          categoryId: dish.categoryId,
          status: dish.status
        })
        setMethods(dish.methods || [])
      }
    } catch (error) {
      console.error('Failed to fetch dish:', error)
    } finally {
      setLoading(false)
    }
  }

  function addMethod() {
    if (!newMethod.name.trim()) return
    setMethods([
      ...methods,
      { name: newMethod.name, price: parseFloat(newMethod.price) || 0 }
    ])
    setNewMethod({ name: '', price: '0' })
  }

  function removeMethod(index: number) {
    setMethods(methods.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = dishId ? `/api/admin/dishes/${dishId}` : '/api/admin/dishes'
      const method = dishId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          image: formData.image || null,
          categoryId: formData.categoryId,
          status: formData.status
        })
      })

      if (res.ok) {
        const dish = await res.json()

        // 保存做法
        if (methods.length > 0 || dishId) {
          if (dishId) {
            // 删除旧做法
            await fetch(`/api/admin/dishes/${dishId}/methods`, {
              method: 'DELETE'
            })
          }
          // 添加新做法
          for (const method of methods) {
            await fetch(`/api/admin/dishes/${dish.id}/methods`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(method)
            })
          }
        }

        router.push('/admin/dishes')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || '保存失败')
      }
    } catch (error) {
      console.error('Failed to save dish:', error)
      alert('保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">加载中...</div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {dishId ? '编辑菜品' : '添加菜品'}
          </h2>
          <p className="text-muted-foreground">
            {dishId ? '修改菜品信息' : '添加新的菜品到菜单'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">菜品名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="如：红烧肉"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryId">分类 *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  value && setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon && `${cat.icon} `}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">价格 *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="如：38"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  value && setFormData({ ...formData, status: value as 'AVAILABLE' | 'UNAVAILABLE' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">上架</SelectItem>
                  <SelectItem value="UNAVAILABLE">下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">图片与描述</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>菜品图片</Label>
              <ImageUpload
                value={formData.image}
                onChange={(url) => setFormData({ ...formData, image: url })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 text-sm border rounded-md resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="菜品描述，如食材、口味等"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">做法选项</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {methods.map((method, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 py-1 px-2"
                >
                  {method.name}
                  {method.price > 0 && ` (+¥${method.price})`}
                  <button
                    type="button"
                    onClick={() => removeMethod(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMethod.name}
                onChange={(e) =>
                  setNewMethod({ ...newMethod, name: e.target.value })
                }
                placeholder="做法名称，如：少盐、多辣"
                className="flex-1"
              />
              <Input
                type="number"
                step="0.01"
                value={newMethod.price}
                onChange={(e) =>
                  setNewMethod({ ...newMethod, price: e.target.value })
                }
                placeholder="加价"
                className="w-24"
              />
              <Button type="button" variant="outline" onClick={addMethod}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}
