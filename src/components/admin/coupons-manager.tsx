'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, Ticket } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Coupon } from '@/types'

export function CouponsManager() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formCode, setFormCode] = useState('')
  const [formType, setFormType] = useState<'percentage' | 'fixed'>('percentage')
  const [formValue, setFormValue] = useState('')
  const [formMinOrder, setFormMinOrder] = useState('0')
  const [formMaxUses, setFormMaxUses] = useState('')
  const [formIsActive, setFormIsActive] = useState(true)

  const loadCoupons = useCallback(async () => {
    try {
      const res = await fetch('/api/coupons')
      const data = await res.json()
      setCoupons(data.coupons || [])
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCoupons()
  }, [loadCoupons])

  const openCreateDialog = () => {
    setEditingCoupon(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormCode(coupon.code)
    setFormType(coupon.type)
    setFormValue(String(coupon.value))
    setFormMinOrder(String(coupon.minOrderAmount))
    setFormMaxUses(coupon.maxUses ? String(coupon.maxUses) : '')
    setFormIsActive(coupon.isActive)
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormCode('')
    setFormType('percentage')
    setFormValue('')
    setFormMinOrder('0')
    setFormMaxUses('')
    setFormIsActive(true)
  }

  const handleSave = async () => {
    if (!formCode || !formValue) {
      toast({ title: 'خطأ', description: 'يرجى إدخال الرمز والقيمة', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const body = {
        code: formCode.toUpperCase(),
        type: formType,
        value: parseFloat(formValue),
        minOrderAmount: parseFloat(formMinOrder) || 0,
        maxUses: formMaxUses ? parseInt(formMaxUses) : null,
        isActive: formIsActive,
      }

      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : '/api/coupons'
      const method = editingCoupon ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ')
      }

      toast({ title: editingCoupon ? 'تم التحديث' : 'تم الإضافة', description: 'تم حفظ الكوبون بنجاح' })
      setDialogOpen(false)
      resetForm()
      loadCoupons()
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
    if (!deletingCoupon) return
    try {
      const res = await fetch(`/api/coupons/${deletingCoupon.id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error('حدث خطأ')
      }
      toast({ title: 'تم الحذف', description: 'تم حذف الكوبون بنجاح' })
      loadCoupons()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الحذف',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingCoupon(null)
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
        <h2 className="text-2xl font-bold text-foreground">إدارة الكوبونات</h2>
        <Button onClick={openCreateDialog} className="bg-deep hover:bg-deep/90 text-white">
          <Plus className="w-4 h-4 ml-1" />
          إضافة كوبون
        </Button>
      </div>

      <Card className="border-sage/10 shadow-sm">
        <CardContent className="p-0">
          {coupons.length === 0 ? (
            <div className="text-center py-12 text-sage/40">
              <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد كوبونات مسجلة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-sage/5 border-b border-sage/10 text-sage-dark text-sm font-medium">
                  <tr>
                    <th className="px-6 py-4">الرمز</th>
                    <th className="px-6 py-4">النوع</th>
                    <th className="px-6 py-4">القيمة</th>
                    <th className="px-6 py-4">الاستخدامات</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage/10">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-sage/3 transition-colors text-sm">
                      <td className="px-6 py-4 font-semibold">{coupon.code}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{coupon.type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value}`}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {coupon.usedCount} / {coupon.maxUses ? coupon.maxUses : 'غير محدود'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={coupon.isActive ? 'default' : 'secondary'} className={coupon.isActive ? 'bg-sage text-white' : ''}>
                          {coupon.isActive ? 'نشط' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => openEditDialog(coupon)}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingCoupon(coupon)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>رمز الكوبون *</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="مثال: SUMMER2024"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>النوع</Label>
                <Select value={formType} onValueChange={(v: any) => setFormType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>القيمة *</Label>
                <Input
                  type="number"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  placeholder="مثال: 10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحد الأدنى للطلب</Label>
                <Input
                  type="number"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>أقصى عدد استخدامات (اختياري)</Label>
                <Input
                  type="number"
                  value={formMaxUses}
                  onChange={(e) => setFormMaxUses(e.target.value)}
                  placeholder="بدون حد"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t mt-4">
              <div className="space-y-0.5">
                <Label>حالة الكوبون</Label>
                <p className="text-sm text-muted-foreground">تفعيل أو تعطيل هذا الكوبون</p>
              </div>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-deep hover:bg-deep/90 text-white">
              {saving && <Loader2 className="w-4 h-4 ml-1 animate-spin" />}
              {editingCoupon ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الكوبون &quot;{deletingCoupon?.code}&quot;؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
