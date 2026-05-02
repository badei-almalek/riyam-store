'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Loader2, ImageIcon, Upload, X, Link } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Product {
  id: string
  name: string
  description: string | null
  priceYER: number
  images: string[]
  tags: string[]
  categoryId: string
  category?: { id: string; name: string; parentId: string | null }
  featured: boolean
  inStock: boolean
  order: number
  createdAt: string
  updatedAt: string
}

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

function formatNumber(num: number): string {
  return num.toLocaleString('ar-YE')
}

export function ProductsManager() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form state
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPriceYER, setFormPriceYER] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formImages, setFormImages] = useState<string[]>([])
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formFeatured, setFormFeatured] = useState(false)
  const [formInStock, setFormInStock] = useState(true)
  const [formTags, setFormTags] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [loadProducts, loadCategories])

  // Flatten categories for select dropdown - only subcategories (leaf nodes)
  const flatSubcategories = categories.reduce<Array<{ id: string; name: string; parentName?: string }>>((acc, cat) => {
    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        acc.push({ id: child.id, name: child.name, parentName: cat.name })
      }
    } else {
      acc.push({ id: cat.id, name: cat.name })
    }
    return acc
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name.includes(search) ||
    product.category?.name?.includes(search)
  )

  const openCreateDialog = () => {
    setEditingProduct(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setFormName(product.name)
    setFormDescription(product.description || '')
    setFormPriceYER(String(product.priceYER))
    setFormCategoryId(product.categoryId)
    setFormImages(Array.isArray(product.images) ? product.images : [])
    setFormFeatured(product.featured)
    setFormInStock(product.inStock)
    setFormTags(Array.isArray(product.tags) ? product.tags.join(', ') : '')
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormName('')
    setFormDescription('')
    setFormPriceYER('')
    setFormCategoryId('')
    setFormImages([])
    setFormImageUrl('')
    setFormFeatured(false)
    setFormInStock(true)
    setFormTags('')
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ في رفع الصورة')
        }

        const data = await res.json()
        setFormImages((prev) => [...prev, data.url])
      }
      toast({ title: 'تم الرفع', description: 'تم رفع الصور بنجاح' })
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ في رفع الصورة',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleAddImageUrl = () => {
    const url = formImageUrl.trim()
    if (!url) return
    setFormImages((prev) => [...prev, url])
    setFormImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!formName || !formCategoryId || !formPriceYER) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const tagsArray = formTags.split(',').map((t) => t.trim()).filter(Boolean)

      const body = {
        name: formName,
        description: formDescription || null,
        priceYER: Number(formPriceYER),
        categoryId: formCategoryId,
        images: formImages,
        tags: tagsArray,
        featured: formFeatured,
        inStock: formInStock,
      }

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم التحديث', description: 'تم تحديث المنتج بنجاح' })
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم الإضافة', description: 'تم إضافة المنتج بنجاح' })
      }

      setDialogOpen(false)
      resetForm()
      loadProducts()
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
    if (!deletingProduct) return
    try {
      const res = await fetch(`/api/products/${deletingProduct.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ')
      }
      toast({ title: 'تم الحذف', description: 'تم حذف المنتج بنجاح' })
      loadProducts()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingProduct(null)
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
        <h2 className="text-2xl font-bold text-foreground">إدارة المنتجات</h2>
        <Button
          onClick={openCreateDialog}
          className="bg-deep hover:bg-deep/90 text-white"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة منتج
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
        <Input
          placeholder="بحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 border-sage/15"
        />
      </div>

      {/* Products Table */}
      <Card className="border-sage/10 shadow-sm">
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-sage/40">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد منتجات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-sage/10 bg-sage/3">
                    <TableHead className="text-muted-foreground">الصورة</TableHead>
                    <TableHead className="text-muted-foreground">الاسم</TableHead>
                    <TableHead className="text-muted-foreground">الفئة</TableHead>
                    <TableHead className="text-muted-foreground">السعر (ر.ي)</TableHead>
                    <TableHead className="text-muted-foreground">الوسوم</TableHead>
                    <TableHead className="text-muted-foreground">مميز</TableHead>
                    <TableHead className="text-muted-foreground">متوفر</TableHead>
                    <TableHead className="text-muted-foreground">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-sage/8">
                      <TableCell>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-sage/5"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-sage/5 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-sage/40" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category?.name || '-'}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatNumber(product.priceYER)}
                      </TableCell>
                      <TableCell>
                        {product.tags && product.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {product.tags.map((tag, i) => (
                              <Badge key={i} className="soft-tag text-[10px] px-1.5 py-0 font-normal">{tag}</Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sage/40">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.featured ? (
                          <Badge className="bg-sage/10 text-sage hover:bg-sage/10">مميز</Badge>
                        ) : (
                          <span className="text-sage/40">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.inStock ? (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">متوفر</Badge>
                        ) : (
                          <Badge className="bg-terracotta/10 text-terracotta hover:bg-terracotta/10">غير متوفر</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => openEditDialog(product)}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingProduct(product)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground/80">اسم المنتج *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="أدخل اسم المنتج"
                className="border-sage/15"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">الوصف</Label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="أدخل وصف المنتج"
                className="border-sage/15 min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">السعر (ر.ي يمني) *</Label>
              <Input
                type="number"
                value={formPriceYER}
                onChange={(e) => setFormPriceYER(e.target.value)}
                placeholder="0"
                className="border-sage/15"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">الفئة *</Label>
              <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                <SelectTrigger className="border-sage/15">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {flatSubcategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.parentName ? `${cat.name} (${cat.parentName})` : cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label className="text-foreground/80">صور المنتج</Label>

              {/* Upload Button */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="border-sage/15 text-foreground/80"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 ml-1" />
                  )}
                  {uploading ? 'جاري الرفع...' : 'رفع صور'}
                </Button>
              </div>

              {/* Manual URL Input */}
              <div className="flex items-center gap-2">
                <Input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="أو ألصق رابط صورة هنا..."
                  className="border-sage/15"
                  dir="ltr"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddImageUrl()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddImageUrl}
                  disabled={!formImageUrl.trim()}
                  className="border-sage/15 text-foreground/80 shrink-0"
                >
                  <Link className="w-4 h-4 ml-1" />
                  إضافة
                </Button>
              </div>

              {/* Image Previews */}
              {formImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {formImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-sage/5 border border-sage/10">
                      <img
                        src={img}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 left-1 w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formImages.length === 0 && (
                <p className="text-xs text-muted-foreground">لم يتم إضافة صور بعد. ارفع صوراً أو أضف روابط.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/80">الوسوم</Label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="أدخل الوسوم مفصولة بفاصلة، مثال: فساتين, سهرة, أنيق"
                className="border-sage/15"
                dir="rtl"
              />
              <p className="text-xs text-muted-foreground">افصلي بين الوسوم بفاصلة (,)</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-sage/3 rounded-lg">
              <Label className="text-foreground/80">منتج مميز</Label>
              <Switch checked={formFeatured} onCheckedChange={setFormFeatured} />
            </div>
            <div className="flex items-center justify-between p-3 bg-sage/3 rounded-lg">
              <Label className="text-foreground/80">متوفر في المخزون</Label>
              <Switch checked={formInStock} onCheckedChange={setFormInStock} />
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
              {editingProduct ? 'تحديث' : 'إضافة'}
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
              هل أنت متأكد من حذف المنتج &quot;{deletingProduct?.name}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
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
