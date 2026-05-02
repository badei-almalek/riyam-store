'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Loader2, Save, Info, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type SettingsKeys =
  | 'meta_pixel_id'
  | 'google_analytics_id'
  | 'instagram_access_token'
  | 'instagram_account_id'
  | 'instagram_url'
  | 'facebook_url'
  | 'whatsapp_number'
  | 'store_phone'
  | 'store_address'

interface SettingField {
  key: SettingsKeys
  label: string
  description: string
  placeholder: string
  dir?: 'ltr' | 'rtl'
  sensitive?: boolean
  link?: { text: string; href: string }
}

const TRACKING_FIELDS: SettingField[] = [
  {
    key: 'meta_pixel_id',
    label: 'معرف بيكسل ميتا',
    description: 'معرف تتبع فيسبوك بيكسل لتتبع الزيارات والتحويلات في إعلانات ميتا',
    placeholder: 'مثال: 1234567890',
    dir: 'ltr',
    link: { text: 'Events Manager', href: 'https://business.facebook.com/events_manager' },
  },
  {
    key: 'google_analytics_id',
    label: 'معرف جوجل أناليتكس',
    description: 'معرف تتبع Google Analytics لتحليل زيارات الموقع (مثل G-XXXXXXXXXX)',
    placeholder: 'مثال: G-XXXXXXXXXX',
    dir: 'ltr',
    link: { text: 'Google Analytics', href: 'https://analytics.google.com/' },
  },
]

const INSTAGRAM_FIELDS: SettingField[] = [
  {
    key: 'instagram_access_token',
    label: 'رمز الوصول لإنستغرام',
    description: 'رمز وصول طويل الأمد للوصول إلى بيانات حساب إنستغرام بزنس عبر API',
    placeholder: 'IGQVJ...',
    dir: 'ltr',
    sensitive: true,
    link: { text: 'Facebook Developers', href: 'https://developers.facebook.com/' },
  },
  {
    key: 'instagram_account_id',
    label: 'معرف حساب إنستغرام بزنس',
    description: 'المعرف الرقمي لحساب إنستغرام بزنس المرتبط بصفحة فيسبوك',
    placeholder: 'مثال: 17841400123456789',
    dir: 'ltr',
    link: { text: 'Instagram Graph API', href: 'https://developers.facebook.com/docs/instagram-api/getting-started' },
  },
]

const SOCIAL_MEDIA_FIELDS: SettingField[] = [
  {
    key: 'instagram_url',
    label: 'رابط إنستغرام',
    description: 'رابط صفحة المتجر على إنستغرام يظهر في الفوتر',
    placeholder: 'مثال: https://instagram.com/riyamfashion',
    dir: 'ltr',
  },
  {
    key: 'facebook_url',
    label: 'رابط فيسبوك',
    description: 'رابط صفحة المتجر على فيسبوك يظهر في الفوتر',
    placeholder: 'مثال: https://facebook.com/riyamfashion',
    dir: 'ltr',
  },
]

const CONTACT_FIELDS: SettingField[] = [
  {
    key: 'whatsapp_number',
    label: 'رقم واتساب',
    description: 'رقم واتساب للتواصل مع العملاء (مع رمز الدولة)',
    placeholder: 'مثال: +967771234567',
    dir: 'ltr',
  },
  {
    key: 'store_phone',
    label: 'رقم هاتف المتجر',
    description: 'رقم الهاتف الرسمي للمتجر للاتصال المباشر',
    placeholder: 'مثال: +9671234567',
    dir: 'ltr',
  },
  {
    key: 'store_address',
    label: 'عنوان المتجر',
    description: 'العنوان الفعلي للمتجر يظهر للعملاء في الموقع',
    placeholder: 'مثال: صنعاء، شارع الزبيري',
  },
]

export function SettingsManager() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<Record<SettingsKeys, string>>({
    meta_pixel_id: '',
    google_analytics_id: '',
    instagram_access_token: '',
    instagram_account_id: '',
    instagram_url: '',
    facebook_url: '',
    whatsapp_number: '',
    store_phone: '',
    store_address: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({
    instagram_access_token: false,
  })

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data.settings) {
        setSettings((prev) => ({
          ...prev,
          ...data.settings,
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: 'خطأ',
        description: 'فشل تحميل الإعدادات',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleFieldChange = (key: SettingsKeys, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSensitive = (key: string) => {
    setShowSensitive((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'حدث خطأ أثناء الحفظ')
      }

      toast({ title: 'تم الحفظ', description: 'تم حفظ الإعدادات بنجاح' })
      loadSettings()
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
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
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-7 h-7 text-sage" />
          <h2 className="text-2xl font-bold text-foreground">إعدادات المتجر</h2>
        </div>
      </div>

      {/* Info Box */}
      <div className="flex items-start gap-3 p-4 bg-sage/5 border border-sage/10 rounded-xl">
        <Info className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sage-dark font-medium text-sm">معلومات الإعدادات</p>
          <p className="text-sage text-sm mt-1">
            هنا يمكنك تكوين إعدادات المتجر مثل أدوات التتبع وحسابات التواصل الاجتماعي ومعلومات الاتصال.
            جميع الإعدادات تُحفظ بشكل آمن وتُفعّل فوراً بعد الحفظ.
          </p>
        </div>
      </div>

      {/* Tracking & Ads Section */}
      <Card className="border-sage/10 shadow-sm">
        <CardHeader className="bg-sage/3 border-b border-sage/10">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-sage" />
            تتبع وإعلانات
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {TRACKING_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-foreground/80 font-medium">{field.label}</Label>
              <Input
                value={settings[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="border-sage/15"
                dir={field.dir || 'rtl'}
              />
              <div className="flex items-center gap-2">
                <p className="text-xs text-sage/50">{field.description}</p>
                {field.link && (
                  <a
                    href={field.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sage hover:text-sage-dark underline inline-flex items-center gap-1"
                  >
                    {field.link.text}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Instagram Section */}
      <Card className="border-sage/10 shadow-sm">
        <CardHeader className="bg-sage/3 border-b border-sage/10">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <svg
              className="w-5 h-5 text-sage"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            إنستغرام
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {INSTAGRAM_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-foreground/80 font-medium">{field.label}</Label>
              <div className="relative">
                <Input
                  value={settings[field.key]}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="border-sage/15"
                  dir={field.dir || 'rtl'}
                  type={field.sensitive && !showSensitive[field.key] ? 'password' : 'text'}
                />
                {field.sensitive && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-sage/50 hover:text-sage"
                    onClick={() => toggleSensitive(field.key)}
                  >
                    {showSensitive[field.key] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-sage/50">{field.description}</p>
                {field.link && (
                  <a
                    href={field.link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sage hover:text-sage-dark underline inline-flex items-center gap-1"
                  >
                    {field.link.text}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Social Media Section */}
      <Card className="border-sage/10 shadow-sm">
        <CardHeader className="bg-sage/3 border-b border-sage/10">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <svg
              className="w-5 h-5 text-sage"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            وسائل التواصل الاجتماعي
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {SOCIAL_MEDIA_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-foreground/80 font-medium">{field.label}</Label>
              <Input
                value={settings[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="border-sage/15"
                dir={field.dir || 'rtl'}
              />
              <p className="text-xs text-sage/50">{field.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact Section */}
      <Card className="border-sage/10 shadow-sm">
        <CardHeader className="bg-sage/3 border-b border-sage/10">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <svg
              className="w-5 h-5 text-sage"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            التواصل
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {CONTACT_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label className="text-foreground/80 font-medium">{field.label}</Label>
              <Input
                value={settings[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="border-sage/15"
                dir={field.dir || 'rtl'}
              />
              <p className="text-xs text-sage/50">{field.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-deep hover:bg-deep/90 text-white min-w-[180px]"
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          حفظ الإعدادات
        </Button>
      </div>
    </div>
  )
}
