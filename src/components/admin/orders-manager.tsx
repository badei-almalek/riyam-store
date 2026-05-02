'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Loader2, ClipboardList, MoreHorizontal, Eye, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OrderItem {
  productId: string
  productName: string
  quantity: number
  priceYER: number
  image: string
}

interface Order {
  id: string
  items: OrderItem[]
  totalYER: number
  discountYER: number
  couponId: string | null
  coupon?: { code: string }
  currency: string
  customerName: string
  customerPhone: string
  customerCity: string | null
  customerNotes: string | null
  status: string
  createdAt: string
  updatedAt: string
}

const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
}

const statusColors: Record<string, string> = {
  pending: 'bg-sand text-sage-dark hover:bg-sand',
  confirmed: 'bg-sage/10 text-sage hover:bg-sage/10',
  shipped: 'bg-sage/15 text-sage-dark hover:bg-sage/15',
  delivered: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50',
  cancelled: 'bg-terracotta/10 text-terracotta hover:bg-terracotta/10',
}

const nextStatusMap: Record<string, string> = {
  pending: 'confirmed',
  confirmed: 'shipped',
  shipped: 'delivered',
}

function formatNumber(num: number): string {
  return num.toLocaleString('ar-YE')
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('ar-YE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function OrdersManager() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ')
      }
      toast({ title: 'تم التحديث', description: 'تم تحديث حالة الطلب بنجاح' })
      loadOrders()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ',
        variant: 'destructive',
      })
    }
  }

  const openDetail = (order: Order) => {
    setDetailOrder(order)
    setDetailDialogOpen(true)
  }

  const filteredOrders = orders.filter(
    (order) => statusFilter === 'all' || order.status === statusFilter
  )

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
        <h2 className="text-2xl font-bold text-foreground">إدارة الطلبات</h2>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 border-sage/15">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="confirmed">مؤكد</SelectItem>
              <SelectItem value="shipped">تم الشحن</SelectItem>
              <SelectItem value="delivered">تم التسليم</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => { setLoading(true); loadOrders() }}
            variant="outline"
            size="sm"
            className="border-sage/15 text-foreground/80"
          >
            <RefreshCw className="w-4 h-4 ml-1" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card className="border-sage/10 shadow-sm">
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-sage/40">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد طلبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-sage/10 bg-sage/3">
                    <TableHead className="text-muted-foreground">المعرف</TableHead>
                    <TableHead className="text-muted-foreground">العميل</TableHead>
                    <TableHead className="text-muted-foreground">الهاتف</TableHead>
                    <TableHead className="text-muted-foreground">عدد العناصر</TableHead>
                    <TableHead className="text-muted-foreground">العملة المفضلة</TableHead>
                    <TableHead className="text-muted-foreground">المبلغ (ر.ي)</TableHead>
                    <TableHead className="text-muted-foreground">الحالة</TableHead>
                    <TableHead className="text-muted-foreground">التاريخ</TableHead>
                    <TableHead className="text-muted-foreground">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-sage/8">
                      <TableCell className="text-muted-foreground text-xs font-mono">
                        ...{order.id.slice(-6)}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-muted-foreground" dir="ltr">
                        {order.customerPhone}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {order.items?.length || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-medium">
                        {order.currency}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatNumber(order.totalYER)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[order.status] || 'bg-sage/10 text-sage'}
                        >
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => openDetail(order)}>
                              <Eye className="w-4 h-4 ml-2" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            {nextStatusMap[order.status] && (
                              <DropdownMenuItem
                                onClick={() => updateOrderStatus(order.id, nextStatusMap[order.status])}
                              >
                                <RefreshCw className="w-4 h-4 ml-2" />
                                {statusLabels[nextStatusMap[order.status]]}
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'cancelled' && order.status !== 'delivered' && (
                              <DropdownMenuItem
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                className="text-red-600 focus:text-red-600"
                              >
                                إلغاء الطلب
                              </DropdownMenuItem>
                            )}
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

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              تفاصيل الطلب #{detailOrder?.id?.slice(-6)}
            </DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-6 py-2">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-sage/3 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">اسم العميل</p>
                  <p className="font-semibold text-foreground">{detailOrder.customerName}</p>
                </div>
                <div className="bg-sage/3 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
                  <p className="font-semibold text-foreground" dir="ltr">{detailOrder.customerPhone}</p>
                </div>
                <div className="bg-sage/3 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">العملة المفضلة للعميل</p>
                  <p className="font-semibold text-foreground">{detailOrder.currency}</p>
                </div>
                {detailOrder.customerCity && (
                  <div className="bg-sage/3 p-4 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">المدينة</p>
                    <p className="font-semibold text-foreground">{detailOrder.customerCity}</p>
                  </div>
                )}
                <div className="bg-sage/3 p-4 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">الحالة</p>
                  <Badge
                    variant="secondary"
                    className={statusColors[detailOrder.status] || 'bg-sage/10 text-sage'}
                  >
                    {statusLabels[detailOrder.status] || detailOrder.status}
                  </Badge>
                </div>
              </div>

              {detailOrder.customerNotes && (
                <div className="bg-sage/5 p-4 rounded-xl border border-sage/10">
                  <p className="text-sm text-sage-dark mb-1">ملاحظات العميل</p>
                  <p className="text-foreground">{detailOrder.customerNotes}</p>
                </div>
              )}

              {/* Items */}
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-base font-semibold text-foreground">
                  عناصر الطلب
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {detailOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-sage/3 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-sage/10 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sage/40 text-xs">
                          لا صورة
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{formatNumber(item.priceYER)} ر.ي</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="bg-deep text-white p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm text-white/70">
                  <span>المجموع الفرعي</span>
                  <span>{formatNumber(detailOrder.totalYER + (detailOrder.discountYER || 0))} ر.ي</span>
                </div>
                {detailOrder.discountYER > 0 && (
                  <div className="flex justify-between items-center text-sm text-sage">
                    <span>خصم الكوبون {detailOrder.coupon ? `(${detailOrder.coupon.code})` : ''}</span>
                    <span>-{formatNumber(detailOrder.discountYER)} ر.ي</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                  <span className="text-white/90">الإجمالي النهائي</span>
                  <span className="text-xl font-bold text-white">{formatNumber(detailOrder.totalYER)} ر.ي</span>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center gap-3 p-4 bg-sage/3 rounded-xl">
                <Label className="text-foreground/80 font-medium">تحديث الحالة:</Label>
                <Select
                  value={detailOrder.status}
                  onValueChange={async (value) => {
                    try {
                      const res = await fetch(`/api/orders/${detailOrder.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: value }),
                      })
                      if (!res.ok) {
                        const data = await res.json()
                        throw new Error(data.error || 'حدث خطأ')
                      }
                      setDetailOrder({ ...detailOrder, status: value })
                      toast({ title: 'تم التحديث', description: 'تم تحديث حالة الطلب بنجاح' })
                      loadOrders()
                    } catch (error) {
                      toast({
                        title: 'خطأ',
                        description: error instanceof Error ? error.message : 'حدث خطأ',
                        variant: 'destructive',
                      })
                    }
                  }}
                >
                  <SelectTrigger className="w-44 border-sage/15">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="confirmed">مؤكد</SelectItem>
                    <SelectItem value="shipped">تم الشحن</SelectItem>
                    <SelectItem value="delivered">تم التسليم</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-sage/40">
                تاريخ الطلب: {formatDate(detailOrder.createdAt)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
