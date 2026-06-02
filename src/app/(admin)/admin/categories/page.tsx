'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string | null
  sort: number
  _count?: {
    dishes: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', icon: '', sort: 0 })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingCategory(null)
    setFormData({ name: '', icon: '', sort: categories.length })
    setDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      icon: category.icon || '',
      sort: category.sort
    })
    setDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          icon: formData.icon || null,
          sort: formData.sort
        })
      })

      if (res.ok) {
        setDialogOpen(false)
        fetchCategories()
      } else {
        const error = await res.json()
        alert(error.error || '操作失败')
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`确定要删除分类"${category.name}"吗？`)) return

    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchCategories()
      } else {
        const error = await res.json()
        alert(error.error || '删除失败')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('删除失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">分类管理</h2>
          <p className="text-muted-foreground">管理菜品分类</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                添加分类
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? '编辑分类' : '添加分类'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="如：热菜、凉菜"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">图标（可选）</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="如：🔥、🥗"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort">排序</Label>
                <Input
                  id="sort"
                  type="number"
                  value={formData.sort}
                  onChange={(e) =>
                    setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <DialogFooter>
                <DialogClose render={<Button type="button" variant="outline">取消</Button>} />
                <Button type="submit" disabled={submitting}>
                  {submitting ? '保存中...' : '保存'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">加载中...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              暂无分类，点击上方按钮添加
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    {category.icon && (
                      <span className="text-xl">{category.icon}</span>
                    )}
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary">
                      {category._count?.dishes || 0} 个菜品
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(category)}
                      disabled={(category._count?.dishes || 0) > 0}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
