'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package, FolderTree, ClipboardList, Banknote, HelpCircle, Plus, Database, Loader2, Settings } from 'lucide-react'
import type { AdminSection } from './admin-sidebar'

interface DashboardHomeProps {
  onNavigate: (section: AdminSection) => void
}

interface Stats {
  totalProducts: number
  totalCategories: number
  totalOrders: number
  totalRevenue: number
  totalFaqs: number
}

interface RecentOrder {
  id: string
  customerName: string
  customerPhone: string
  totalYER: number
  currency: string
  status: string
  createdAt: string
  items: Array<{ productId: string; productName: string; quantity: number }>
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

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes, ordersRes, faqsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/orders'),
        fetch('/api/faqs'),
      ])

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()
      const ordersData = await ordersRes.json()
      const faqsData = await faqsRes.json()

      const products = productsData.products || []
      const categories = categoriesData.categories || []
      const orders = ordersData.orders || []
      const faqs = faqsData.faqs || []

      const totalRevenue = orders.reduce((sum: number, order: RecentOrder) => sum + order.totalYER, 0)

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        totalRevenue,
        totalFaqs: faqs.length,
      })

      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeed = async () => {
    if (!confirm('سيتم إضافة بيانات تجريبية. هل أنت متأكد؟')) return
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || 'تم تهيئة البيانات بنجاح')
        loadDashboardData()
      } else {
        alert(data.error || 'حدث خطأ')
      }
    } catch {
      alert('حدث خطأ في الاتصال')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'إجمالي المنتجات',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-sage',
      iconBg: 'bg-sage/12',
    },
    {
      title: 'إجمالي الفئات',
      value: stats?.totalCategories || 0,
      icon: FolderTree,
      color: 'text-terracotta',
      iconBg: 'bg-terracotta/12',
    },
    {
      title: 'إجمالي الطلبات',
      value: stats?.totalOrders || 0,
      icon: ClipboardList,
      color: 'text-sage-dark',
      iconBg: 'bg-sand',
    },
    {
      title: 'إجمالي الإيرادات (ر.ي)',
      value: formatNumber(stats?.totalRevenue || 0),
      icon: Banknote,
      color: 'text-white',
      iconBg: 'bg-deep',
    },
    {
      title: 'الأسئلة الشائعة',
      value: stats?.totalFaqs || 0,
      icon: HelpCircle,
      color: 'text-sage',
      iconBg: 'bg-sage/12',
      onClick: () => onNavigate('faqs'),
    },
    {
      title: 'الإعدادات',
      value: '⚡',
      icon: Settings,
      color: 'text-sage',
      iconBg: 'bg-sage/12',
      onClick: () => onNavigate('settings'),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">لوحة التحكم</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => onNavigate('products')}
            size="sm"
            className="bg-deep hover:bg-deep/90 text-white"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة منتج
          </Button>
          <Button
            onClick={() => onNavigate('faqs')}
            size="sm"
            variant="outline"
            className="border-sage/15 text-foreground/80"
          >
            <HelpCircle className="w-4 h-4 ml-1" />
            الأسئلة الشائعة
          </Button>
          <Button
            onClick={handleSeed}
            size="sm"
            variant="outline"
            className="border-sage/15 text-foreground/80"
            disabled={seeding}
          >
            {seeding ? (
              <Loader2 className="w-4 h-4 ml-1 animate-spin" />
            ) : (
              <Database className="w-4 h-4 ml-1" />
            )}
            بيانات تجريبية
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.title}
              className={`border-sage/10 shadow-sm ${card.onClick ? 'cursor-pointer hover:border-sage/30 transition-colors' : ''}`}
              onClick={card.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                    <Icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <Card className="border-sage/10 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              آخر الطلبات
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground/80"
              onClick={() => onNavigate('orders')}
            >
              عرض الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-sage/40">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد طلبات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-sage/10">
                    <TableHead className="text-muted-foreground">العميل</TableHead>
                    <TableHead className="text-muted-foreground">الهاتف</TableHead>
                    <TableHead className="text-muted-foreground">المبلغ</TableHead>
                    <TableHead className="text-muted-foreground">الحالة</TableHead>
                    <TableHead className="text-muted-foreground">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="border-sage/8">
                      <TableCell className="font-medium text-foreground">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-muted-foreground" dir="ltr">
                        {order.customerPhone}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        {formatNumber(order.totalYER)} ر.ي
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
