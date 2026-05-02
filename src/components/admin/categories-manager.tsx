'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, FolderTree, ChevronDown, ChevronLeft, ImagePlus, X, Link } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
  image: string | null
  order: number
  parentId: string | null
  children?: Category[]
  productCount?: number
}

export function CategoriesManager() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Form state
  const [formName, setFormName] = useState('')
  const [formParentId, setFormParentId] = useState<string>('_none')
  const [formImage, setFormImage] = useState('')
  const [formOrder, setFormOrder] = useState('0')
  const [uploading, setUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      const cats = data.categories || []
      setCategories(cats)
      // Auto-expand all parent categories
      const parentIds = cats.filter((c: Category) => c.children && c.children.length > 0).map((c: Category) => c.id)
      setExpandedIds(new Set(parentIds))
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Flatten all categories for the parent select
  const allCategoriesFlat = categories.flatMap((cat) => {
    const items = [{ id: cat.id, name: cat.name }]
    if (cat.children) {
      for (const child of cat.children) {
        items.push({ id: child.id, name: `  └ ${child.name}` })
      }
    }
    return items
  })

  // Only parent categories for the parent select dropdown
  const parentCategories = categories.filter((cat) => !cat.parentId)

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const openCreateDialog = () => {
    setEditingCategory(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormName(category.name)
    setFormParentId(category.parentId || '_none')
    setFormImage(category.image || '')
    setFormOrder(String(category.order))
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormName('')
    setFormParentId('_none')
    setFormImage('')
    setFormOrder('0')
    setUploading(false)
    setShowUrlInput(false)
  }

  const handleFileUpload = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'خطأ', description: 'نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, WebP', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'خطأ', description: 'حجم الملف يتجاوز الحد المسموح (5MB)', variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ أثناء رفع الملف')
      }
      const data = await res.json()
      setFormImage(data.url)
      toast({ title: 'تم الرفع', description: 'تم رفع الصورة بنجاح' })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء رفع الملف',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset input so the same file can be selected again
    e.target.value = ''
  }

  const handleSave = async () => {
    if (!formName) {
      toast({ title: 'خطأ', description: 'يرجى إدخال اسم الفئة', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const body = {
        name: formName,
        parentId: formParentId === '_none' ? null : formParentId,
        image: formImage || null,
        order: Number(formOrder) || 0,
      }

      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم التحديث', description: 'تم تحديث الفئة بنجاح' })
      } else {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم الإضافة', description: 'تم إضافة الفئة بنجاح' })
      }

      setDialogOpen(false)
      resetForm()
      loadCategories()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    try {
      const res = await fetch(`/api/categories/${deletingCategory.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ')
      }
      toast({ title: 'تم الحذف', description: 'تم حذف الفئة بنجاح' })
      loadCategories()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingCategory(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">إدارة الفئات</h2>
        <Button
          onClick={openCreateDialog}
          className="bg-deep hover:bg-deep/90 text-white"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة فئة
        </Button>
      </div>

      {/* Categories Tree */}
      <Card className="border-sage/10 shadow-sm">
        <CardContent className="p-6">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-sage/40">
              <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد فئات</p>
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category) => {
                const hasChildren = category.children && category.children.length > 0
                const isExpanded = expandedIds.has(category.id)

                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-2 p-3 rounded-xl hover:bg-sage/3 transition-colors group">
                      <button
                        onClick={() => hasChildren && toggleExpand(category.id)}
                        className="w-6 h-6 flex items-center justify-center text-sage/40 hover:text-muted-foreground"
                      >
                        {hasChildren ? (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronLeft className="w-4 h-4" />
                          )
                        ) : (
                          <span className="w-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-foreground">{category.name}</span>
                          <Badge variant="secondary" className="bg-sage/5 text-sage-dark text-xs">
                            {category.productCount || 0} منتج
                          </Badge>
                          {category.image && (
                            <Badge variant="secondary" className="bg-sage/5 text-sage text-xs">
                              صورة
                            </Badge>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Pencil className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setDeletingCategory(category)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                      <div className="mr-8 border-r-2 border-sage/10">
                        {category.children!.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center gap-2 p-3 pr-4 rounded-xl hover:bg-sage/3 transition-colors group"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-foreground/80">{child.name}</span>
                                <Badge variant="secondary" className="bg-sage/5 text-sage-dark text-xs">
                                  {child.productCount || 0} منتج
                                </Badge>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start">
                                <DropdownMenuItem onClick={() => openEditDialog(child)}>
                                  <Pencil className="w-4 h-4 ml-2" />
                                  تعديل
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDeletingCategory(child)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  حذف
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground/80">اسم الفئة *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="أدخل اسم الفئة"
                className="border-sage/15"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">الفئة الأم</Label>
              <Select value={formParentId} onValueChange={setFormParentId}>
                <SelectTrigger className="border-sage/15">
                  <SelectValue placeholder="بدون فئة أم (فئة رئيسية)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">بدون فئة أم (فئة رئيسية)</SelectItem>
                  {parentCategories
                    .filter((cat) => cat.id !== editingCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">صورة الفئة</Label>

              {/* Image Preview */}
              {formImage && (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-sage/15">
                  <img
                    src={formImage}
                    alt="معاينة الصورة"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFormImage('')}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Area */}
              {!formImage && (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`
                    flex flex-col items-center justify-center gap-2
                    w-full h-40 rounded-xl border-2 border-dashed
                    cursor-pointer transition-colors
                    ${uploading
                      ? 'border-sage/20 bg-sage/5 cursor-wait'
                      : 'border-sage/15 bg-sage/3 hover:border-sage/30 hover:bg-sage/5'
                    }
                  `}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-sage animate-spin" />
                      <p className="text-sm text-sage/60">جاري الرفع...</p>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-sage/40" />
                      <p className="text-sm text-sage/50">اضغط أو اسحب الصورة هنا</p>
                      <p className="text-xs text-sage/30">JPG, PNG, WebP — حتى 5MB</p>
                    </>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* URL fallback toggle */}
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center gap-1 text-xs text-sage/50 hover:text-sage/70 transition-colors mt-1"
              >
                <Link className="w-3 h-3" />
                {showUrlInput ? 'إخفاء رابط الصورة' : 'إدخال رابط صورة يدوياً'}
              </button>

              {/* Collapsible URL input */}
              {showUrlInput && (
                <Input
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://example.com/category-image.jpg"
                  className="border-sage/15"
                  dir="ltr"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">الترتيب</Label>
              <Input
                type="number"
                value={formOrder}
                onChange={(e) => setFormOrder(e.target.value)}
                placeholder="0"
                className="border-sage/15"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-sage/15"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              className="bg-deep hover:bg-deep/90 text-white"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
              ) : null}
              {editingCategory ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingCategory?.productCount && deletingCategory.productCount > 0 ? (
                <>
                  الفئة &quot;{deletingCategory?.name}&quot; تحتوي على {deletingCategory?.productCount} منتج.
                  حذف الفئة سيؤدي إلى حذف جميع المنتجات المرتبطة بها. هل أنت متأكد؟
                </>
              ) : (
                <>
                  هل أنت متأكد من حذف الفئة &quot;{deletingCategory?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
