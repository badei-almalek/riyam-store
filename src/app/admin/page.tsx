'use client'

import { useState, useEffect } from 'react'
import { LoginForm } from '@/components/admin/login-form'
import { AdminSidebar, type AdminSection } from '@/components/admin/admin-sidebar'
import { DashboardHome } from '@/components/admin/dashboard-home'
import { ProductsManager } from '@/components/admin/products-manager'
import { CategoriesManager } from '@/components/admin/categories-manager'
import { OrdersManager } from '@/components/admin/orders-manager'
import { CurrenciesManager } from '@/components/admin/currencies-manager'
import { FAQsManager } from '@/components/admin/faqs-manager'
import { SettingsManager } from '@/components/admin/settings-manager'
import { CouponsManager } from '@/components/admin/coupons-manager'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/verify')
        if (res.ok) {
          const data = await res.json()
          if (data.success) setIsAuthenticated(true)
        }
      } catch {
        // Not authenticated
      } finally {
        setVerifying(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogin = () => setIsAuthenticated(true)

  const handleLogout = async () => {
    try {
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    } catch {
      // Ignore errors
    }
    setIsAuthenticated(false)
    setActiveSection('dashboard')
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardHome onNavigate={setActiveSection} />
      case 'products': return <ProductsManager />
      case 'categories': return <CategoriesManager />
      case 'orders': return <OrdersManager />
      case 'coupons': return <CouponsManager />
      case 'currencies': return <CurrenciesManager />
      case 'settings': return <SettingsManager />
      case 'faqs': return <FAQsManager />
      default: return <DashboardHome onNavigate={setActiveSection} />
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-sage" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onMobileToggle={() => setMobileOpen(!mobileOpen)}
      />
      <main className="flex-1 min-h-screen">
        <div className="p-6 lg:p-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
