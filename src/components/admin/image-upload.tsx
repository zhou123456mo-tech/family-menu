'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  // 同步外部 value 变化
  useState(() => {
    if (value && value !== preview) {
      setPreview(value)
    }
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('仅支持 JPG、PNG、WebP、GIF 格式')
      return
    }

    // 验证文件大小
    if (file.size > 5 * 1024 * 1024) {
      toast.error('文件大小不能超过 5MB')
      return
    }

    // 本地预览
    const localPreview = URL.createObjectURL(file)
    setPreview(localPreview)
    setUploading(true)

    // 上传
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        onChange(data.url)
        setPreview(data.url)
        toast.success('图片上传成功')
      } else {
        const error = await res.json()
        toast.error(error.error || '上传失败')
        // 恢复原预览
        setPreview(value || '')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('上传失败')
      setPreview(value || '')
    } finally {
      setUploading(false)
      // 清理 input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  function handleRemove() {
    setPreview('')
    onChange('')
  }

  function handleClick() {
    if (!uploading) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={uploading}
      />

      {preview ? (
        <div className="relative w-32 h-32 rounded-md overflow-hidden border bg-muted">
          <img
            src={preview}
            alt="预览"
            className="w-full h-full object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          {!uploading && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-32 h-32 flex-col gap-2 border-dashed"
          onClick={handleClick}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
          <span className="text-xs text-muted-foreground">
            {uploading ? '上传中...' : '上传图片'}
          </span>
        </Button>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        支持 JPG、PNG、WebP、GIF，最大 5MB
      </p>
    </div>
  )
}
