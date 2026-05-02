'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, Coins, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CurrencyRate {
  id: string
  code: string
  name: string
  rateToYER: number
  symbol: string
  updatedAt: string
}

export function CurrenciesManager() {
  const { toast } = useToast()
  const [currencies, setCurrencies] = useState<CurrencyRate[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCurrency, setEditingCurrency] = useState<CurrencyRate | null>(null)
  const [deletingCurrency, setDeletingCurrency] = useState<CurrencyRate | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formRateToYER, setFormRateToYER] = useState('')
  const [formSymbol, setFormSymbol] = useState('')

  const loadCurrencies = useCallback(async () => {
    try {
      const res = await fetch('/api/currencies')
      const data = await res.json()
      setCurrencies(data.currencies || [])
    } catch (error) {
      console.error('Error loading currencies:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCurrencies()
  }, [loadCurrencies])

  const openCreateDialog = () => {
    setEditingCurrency(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (currency: CurrencyRate) => {
    setEditingCurrency(currency)
    setFormCode(currency.code)
    setFormName(currency.name)
    setFormRateToYER(String(currency.rateToYER))
    setFormSymbol(currency.symbol)
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormCode('')
    setFormName('')
    setFormRateToYER('')
    setFormSymbol('')
  }

  const handleSave = async () => {
    if (!formCode || !formName || !formRateToYER || !formSymbol) {
      toast({ title: 'خطأ', description: 'يرجى ملء جميع الحقول', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const body = {
        code: formCode.toUpperCase(),
        name: formName,
        rateToYER: Number(formRateToYER),
        symbol: formSymbol,
      }

      if (editingCurrency) {
        const res = await fetch(`/api/currencies/${editingCurrency.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم التحديث', description: 'تم تحديث العملة بنجاح' })
      } else {
        const res = await fetch('/api/currencies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم الإضافة', description: 'تم إضافة العملة بنجاح' })
      }

      setDialogOpen(false)
      resetForm()
      loadCurrencies()
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
    if (!deletingCurrency) return
    try {
      const res = await fetch(`/api/currencies/${deletingCurrency.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ')
      }
      toast({ title: 'تم الحذف', description: 'تم حذف العملة بنجاح' })
      loadCurrencies()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingCurrency(null)
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
        <h2 className="text-2xl font-bold text-foreground">إعدادات العملات</h2>
        <Button
          onClick={openCreateDialog}
          className="bg-deep hover:bg-deep/90 text-white"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة عملة
        </Button>
      </div>

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-sage/5 border border-sage/10 rounded-xl">
        <Info className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sage-dark font-medium text-sm">سعر الصرف</p>
          <p className="text-sage text-sm">
            كم يساوي 1 من هذه العملة بالريال اليمني. مثلاً: 1 دولار أمريكي = 997 ريال يمني
          </p>
        </div>
      </div>

      {/* Currencies Table */}
      <Card className="border-sage/10 shadow-sm">
        <CardContent className="p-0">
          {currencies.length === 0 ? (
            <div className="text-center py-12 text-sage/40">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد عملات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-sage/10 bg-sage/3">
                    <TableHead className="text-muted-foreground">رمز العملة</TableHead>
                    <TableHead className="text-muted-foreground">الاسم</TableHead>
                    <TableHead className="text-muted-foreground">السعر إلى ريال يمني</TableHead>
                    <TableHead className="text-muted-foreground">الرمز</TableHead>
                    <TableHead className="text-muted-foreground">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currencies.map((currency) => (
                    <TableRow key={currency.id} className="border-sage/8">
                      <TableCell className="font-mono font-bold text-foreground">
                        {currency.code}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {currency.name}
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        {currency.rateToYER.toLocaleString('ar-YE')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {currency.symbol}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => openEditDialog(currency)}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingCurrency(currency)
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
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {editingCurrency ? 'تعديل العملة' : 'إضافة عملة جديدة'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground/80">رمز العملة *</Label>
              <Input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="مثال: USD"
                className="border-sage/15"
                dir="ltr"
                disabled={!!editingCurrency}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">اسم العملة *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثال: دولار أمريكي"
                className="border-sage/15"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">السعر إلى ريال يمني *</Label>
              <Input
                type="number"
                value={formRateToYER}
                onChange={(e) => setFormRateToYER(e.target.value)}
                placeholder="مثال: 997"
                className="border-sage/15"
                dir="ltr"
              />
              <p className="text-xs text-sage/40">كم يساوي 1 من هذه العملة بالريال اليمني</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">رمز العملة (للعرض) *</Label>
              <Input
                value={formSymbol}
                onChange={(e) => setFormSymbol(e.target.value)}
                placeholder="مثال: $ أو ر.ي"
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
              {editingCurrency ? 'تحديث' : 'إضافة'}
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
              هل أنت متأكد من حذف العملة &quot;{deletingCurrency?.name}&quot;؟
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
