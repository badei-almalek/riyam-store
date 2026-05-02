'use client';

import { useEffect, useState } from 'react';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useStore } from '@/store/use-store';
import { FAQ as FAQ_TEXT, BRAND } from '@/lib/text';
import type { FAQ } from '@/types';

export function FaqView() {
  const { setView } = useStore();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/faqs');
        const data = await res.json();
        setFaqs(data.faqs || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-8 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
        <div className="space-y-4 max-w-2xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-secondary/40 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Generate FAQ JSON-LD structured data
  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* FAQ Schema */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto rounded-full bg-sage/8 border border-sage/15 flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-sage" />
        </div>
        <div>
          <span className="text-sage/50 text-[10px] font-semibold tracking-[0.25em] uppercase">{FAQ_TEXT.sectionLabel}</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">{FAQ_TEXT.title}</h1>
          <p className="text-muted-foreground text-sm font-light mt-2 max-w-md mx-auto">{FAQ_TEXT.description}</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      {faqs.length > 0 ? (
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border border-sage/8 rounded-lg bg-card px-4 overflow-hidden data-[state=open]:border-sage/20 transition-colors"
              >
                <AccordionTrigger className="text-right text-sm font-semibold text-foreground hover:text-sage hover:no-underline py-4">
                  <span className="flex items-center gap-2 text-right">
                    <span className="w-6 h-6 rounded-full bg-sage/8 text-sage text-[10px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-xs leading-relaxed font-light pb-4 pr-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="text-center py-16">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-sm mx-auto space-y-4"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary border border-sage/10 flex items-center justify-center">
              <HelpCircle className="w-10 h-10 text-sage/30" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{FAQ_TEXT.emptyTitle}</h3>
            <p className="text-muted-foreground text-xs font-light">{FAQ_TEXT.emptyDesc}</p>
          </motion.div>
        </div>
      )}

      {/* Contact CTA */}
      <div className="max-w-md mx-auto text-center space-y-3 pt-4">
        <div className="sage-line-wide" />
        <p className="text-muted-foreground text-xs font-light pt-2">{FAQ_TEXT.stillHaveQuestion}</p>
        <a
          href={BRAND.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 shadow-lg shadow-green-600/15 hover:-translate-y-0.5"
        >
          <MessageCircle className="w-4 h-4" />
          {FAQ_TEXT.contactWhatsApp}
        </a>
      </div>
    </div>
  );
}
