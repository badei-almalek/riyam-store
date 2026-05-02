'use client';

import { Heart, MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
import { LogoOnDark } from '@/components/store/logo';
import { NAV, FOOTER, BRAND, WHATSAPP_CTA } from '@/lib/text';

interface StoreFooterProps {
  socialLinks: { instagram: string; facebook: string };
  onNavigate: (view: string) => void;
}

export function StoreFooter({ socialLinks, onNavigate }: StoreFooterProps) {
  const quickLinks = [
    { label: NAV.home, view: 'home' as const },
    { label: NAV.favorites, view: 'favorites' as const },
    { label: NAV.cartFull, view: 'cart' as const },
    { label: FOOTER.myOrders, view: 'orders' as const },
    { label: NAV.faq, view: 'faq' as const },
  ];

  return (
    <footer className="bg-deep-accent text-white mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <LogoOnDark variant="footer" />
            <p className="text-white/30 text-xs leading-relaxed font-light">{FOOTER.brandDesc}</p>
            <div className="flex items-center gap-2">
              <a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-green-600/15 border border-green-600/20 flex items-center justify-center hover:bg-green-600/25 transition-colors" aria-label={FOOTER.whatsapp}>
                <MessageCircle className="w-3.5 h-3.5 text-green-500" />
              </a>
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-pink-600/15 border border-pink-600/20 flex items-center justify-center hover:bg-pink-600/25 transition-colors" aria-label={FOOTER.instagram}>
                <svg className="w-3.5 h-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-600/15 border border-blue-600/20 flex items-center justify-center hover:bg-blue-600/25 transition-colors" aria-label={FOOTER.facebook}>
                <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-sage text-xs tracking-wide uppercase">{FOOTER.quickLinks}</h4>
            <ul className="space-y-2.5" role="navigation" aria-label={FOOTER.quickLinks}>
              {quickLinks.map((link) => (
                <li key={link.view}><button onClick={() => onNavigate(link.view)} className="text-white/30 text-xs hover:text-sage transition-colors font-light">{link.label}</button></li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-bold text-sage text-xs tracking-wide uppercase">{FOOTER.contactUs}</h4>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-white/30 text-xs"><Phone className="h-3.5 w-3.5 text-sage/50 shrink-0" /><span dir="ltr">{BRAND.phone}</span></li>
              <li><a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/30 text-xs hover:text-sage transition-colors"><MessageCircle className="h-3.5 w-3.5 text-green-500/50 shrink-0" /><span>{FOOTER.whatsapp}</span></a></li>
              <li><a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/30 text-xs hover:text-sage transition-colors"><svg className="h-3.5 w-3.5 text-pink-500/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg><span>{FOOTER.instagram}</span></a></li>
              <li><a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/30 text-xs hover:text-sage transition-colors"><svg className="h-3.5 w-3.5 text-blue-500/50 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg><span>{FOOTER.facebook}</span></a></li>
              <li className="flex items-center gap-2 text-white/30 text-xs"><MapPin className="h-3.5 w-3.5 text-sage/50 shrink-0" /><span>{BRAND.country}</span></li>
              <li className="flex items-center gap-2 text-white/30 text-xs"><Clock className="h-3.5 w-3.5 text-sage/50 shrink-0" /><span>{FOOTER.available247}</span></li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="font-bold text-sage text-xs tracking-wide uppercase">{FOOTER.aboutStore}</h4>
            <p className="text-white/30 text-xs leading-relaxed font-light">{FOOTER.aboutDesc}</p>
          </div>
        </div>

        <div className="sage-line-wide my-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/25">
          <p className="font-light">© {BRAND.year} {FOOTER.copyright}</p>
          <p className="flex items-center gap-1 font-light">{FOOTER.madeInPrefix}<Heart className="h-3 w-3 fill-sage text-sage" />{BRAND.country}</p>
        </div>
      </div>
      <div className="h-14 sm:hidden" />
    </footer>
  );
}
