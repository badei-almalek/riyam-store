'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Coins,
  HelpCircle,
  Settings,
  LogOut,
  Crown,
  X,
  Menu,
  Ticket,
} from 'lucide-react'

export type AdminSection = 'dashboard' | 'products' | 'categories' | 'orders' | 'currencies' | 'faqs' | 'settings' | 'coupons'

interface AdminSidebarProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  onLogout: () => void
  mobileOpen: boolean
  onMobileClose: () => void
  onMobileToggle: () => void
}

const navItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'orders', label: 'الطلبات', icon: ClipboardList },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'categories', label: 'الفئات', icon: FolderTree },
  { id: 'coupons', label: 'الكوبونات', icon: Ticket },
  { id: 'currencies', label: 'العملات', icon: Coins },
  { id: 'faqs', label: 'الأسئلة الشائعة', icon: HelpCircle },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
]

export function AdminSidebar({
  activeSection,
  onSectionChange,
  onLogout,
  mobileOpen,
  onMobileClose,
  onMobileToggle,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={onMobileToggle}
        className="lg:hidden fixed top-4 right-4 z-50 bg-deep text-white p-2.5 rounded-lg border border-sage/20 shadow-lg"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onMobileClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-64 bg-deep text-white z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
          border-l border-sage/10
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sage/10 border border-sage/20 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-sage" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight sage-text">ريام فاشن</h1>
                <p className="text-white/40 text-xs font-light">لوحة التحكم</p>
              </div>
            </div>
          </div>

          <div className="sage-line-wide" />

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSectionChange(item.id); onMobileClose() }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-none text-sm font-medium
                      transition-all duration-200
                      ${isActive
                        ? 'bg-sage/10 text-sage border-r-2 border-sage'
                        : 'text-white/50 hover:bg-sage/5 hover:text-white/80'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </ScrollArea>

          <div className="sage-line-wide" />

          {/* Logout */}
          <div className="p-3">
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-white/40 hover:text-white hover:bg-sage/5 px-4 py-3 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
