'use client'

import { useState, useEffect, useCallback } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, HelpCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export function FAQsManager() {
  const { toast } = useToast()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formOrder, setFormOrder] = useState('0')
  const [formActive, setFormActive] = useState(true)

  const loadFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/faqs')
      const data = await res.json()
      setFaqs(data.faqs || [])
    } catch (error) {
      console.error('Error loading FAQs:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFaqs()
  }, [loadFaqs])

  const openCreateDialog = () => {
    setEditingFaq(null)
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormQuestion(faq.question)
    setFormAnswer(faq.answer)
    setFormOrder(String(faq.order))
    setFormActive(faq.active)
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormQuestion('')
    setFormAnswer('')
    setFormOrder('0')
    setFormActive(true)
  }

  const handleSave = async () => {
    if (!formQuestion || !formAnswer) {
      toast({ title: 'خطأ', description: 'يرجى ملء السؤال والجواب', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const body = {
        question: formQuestion,
        answer: formAnswer,
        order: Number(formOrder) || 0,
        active: formActive,
      }

      if (editingFaq) {
        const res = await fetch(`/api/faqs/${editingFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم التحديث', description: 'تم تحديث السؤال الشائع بنجاح' })
      } else {
        const res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'حدث خطأ')
        }
        toast({ title: 'تم الإضافة', description: 'تم إضافة السؤال الشائع بنجاح' })
      }

      setDialogOpen(false)
      resetForm()
      loadFaqs()
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
    if (!deletingFaq) return
    try {
      const res = await fetch(`/api/faqs/${deletingFaq.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ')
      }
      toast({ title: 'تم الحذف', description: 'تم حذف السؤال الشائع بنجاح' })
      loadFaqs()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingFaq(null)
    }
  }

  const truncateText = (text: string, maxLength: number = 60): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
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
        <h2 className="text-2xl font-bold text-foreground">إدارة الأسئلة الشائعة</h2>
        <Button
          onClick={openCreateDialog}
          className="bg-deep hover:bg-deep/90 text-white"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة سؤال
        </Button>
      </div>

      {/* FAQs Table */}
      <Card className="border-sage/10 shadow-sm">
        <CardContent className="p-0">
          {faqs.length === 0 ? (
            <div className="text-center py-12 text-sage/40">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد أسئلة شائعة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-sage/10 bg-sage/3">
                    <TableHead className="text-muted-foreground">السؤال</TableHead>
                    <TableHead className="text-muted-foreground">الجواب</TableHead>
                    <TableHead className="text-muted-foreground">الترتيب</TableHead>
                    <TableHead className="text-muted-foreground">الحالة</TableHead>
                    <TableHead className="text-muted-foreground">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id} className="border-sage/8">
                      <TableCell className="font-medium text-foreground max-w-[250px]">
                        {faq.question}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px]">
                        {truncateText(faq.answer)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-center">
                        {faq.order}
                      </TableCell>
                      <TableCell>
                        {faq.active ? (
                          <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">نشط</Badge>
                        ) : (
                          <Badge className="bg-sage/10 text-sage/60 hover:bg-sage/10">غير نشط</Badge>
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
                            <DropdownMenuItem onClick={() => openEditDialog(faq)}>
                              <Pencil className="w-4 h-4 ml-2" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setDeletingFaq(faq)
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
              {editingFaq ? 'تعديل السؤال الشائع' : 'إضافة سؤال شائع جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground/80">السؤال *</Label>
              <Input
                value={formQuestion}
                onChange={(e) => setFormQuestion(e.target.value)}
                placeholder="أدخل السؤال"
                className="border-sage/15"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80">الجواب *</Label>
              <Textarea
                value={formAnswer}
                onChange={(e) => setFormAnswer(e.target.value)}
                placeholder="أدخل الجواب"
                className="border-sage/15 min-h-[120px]"
              />
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
              <p className="text-xs text-muted-foreground">الأرقام الأقل تظهر أولاً</p>
            </div>
            <div className="flex items-center justify-between p-3 bg-sage/3 rounded-lg">
              <Label className="text-foreground/80">نشط</Label>
              <Switch checked={formActive} onCheckedChange={setFormActive} />
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
              {editingFaq ? 'تحديث' : 'إضافة'}
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
              هل أنت متأكد من حذف السؤال &quot;{deletingFaq?.question}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
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
