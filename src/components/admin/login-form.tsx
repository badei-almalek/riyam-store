'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, User, Crown, Loader2 } from 'lucide-react'

interface LoginFormProps {
  onLogin: () => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        onLogin()
      } else {
        setError(data.error || 'حدث خطأ في تسجيل الدخول')
      }
    } catch {
      setError('حدث خطأ في الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-deep p-4">
      {/* Background decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-40 h-40 border border-sage/5 rounded-full" />
        <div className="absolute bottom-20 left-20 w-56 h-56 border border-sage/5 rounded-full" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-l from-transparent via-sage/20 to-transparent" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-sage/10 bg-card relative z-10">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-deep rounded-sm flex items-center justify-center mb-4 border border-sage/20">
            <Crown className="w-8 h-8 text-sage" />
          </div>
          <CardTitle className="text-2xl font-bold">
            <span className="sage-text">ريام فاشن</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground font-light">
            لوحة تحكم الإدارة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground font-medium text-sm">اسم المستخدم</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="pr-10 rounded-lg border-sage/10 focus:border-sage/30"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage/40" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 rounded-lg border-sage/10 focus:border-sage/30"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-terracotta hover:bg-terracotta-dark text-white font-bold h-11 rounded-lg shine-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
