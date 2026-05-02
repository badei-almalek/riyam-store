'use client';

import { MessageCircle } from 'lucide-react';
import { WHATSAPP_CTA, BRAND, ARIA } from '@/lib/text';

export function WhatsAppCTASection() {
  return (
    <section className="sand-section py-12 sm:py-16" aria-label={ARIA.whatsappSection}>
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground">{WHATSAPP_CTA.title}</h3>
          <p className="text-muted-foreground font-light text-sm leading-relaxed">{WHATSAPP_CTA.description}</p>
          <a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-green-600/15 hover:shadow-green-600/25 hover:-translate-y-0.5">
            <MessageCircle className="w-4 h-4" />
            {WHATSAPP_CTA.button}
          </a>
        </div>
      </div>
    </section>
  );
}
