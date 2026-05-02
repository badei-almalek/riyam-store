'use client';

import { Crown, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HERO, ARIA } from '@/lib/text';

interface HeroSectionProps {
  onShopNow: () => void;
  onNewCollection: () => void;
}

export function HeroSection({ onShopNow, onNewCollection }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-deep-accent min-h-[520px] sm:min-h-[620px] flex items-center" aria-label={ARIA.heroSection}>
      <div className="absolute inset-0">
        <img src="/hero-banner.png" alt={HERO.heroAlt} className="w-full h-full object-cover opacity-30" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-l from-deep-accent/95 via-deep-accent/80 to-deep-accent/60" />
      </div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 border border-sage/6 rounded-full" />
        <div className="absolute top-16 right-16 w-20 h-20 border border-sage/4 rounded-full" />
        <div className="absolute bottom-12 left-12 w-44 h-44 border border-sage/3 rounded-full" />
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-sage/20 rounded-full float-animation" />
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-sage/15 rounded-full float-animation" style={{ animationDelay: '2s' }} />
      </div>
      <div className="container mx-auto px-4 sm:px-8 relative z-10">
        <div className="max-w-2xl space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 glass-sage px-5 py-2 rounded-full text-sm font-medium">
            <Crown className="w-3.5 h-3.5 text-sage" />
            <span className="text-sage text-xs font-semibold tracking-wide">{HERO.badge}</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[1.05] text-white">
            <span className="sage-shimmer-text">{HERO.title}</span>
          </h1>
          <p className="text-white/50 text-base sm:text-lg leading-loose max-w-lg font-light tracking-wide">
            {HERO.subtitle}
            <br />
            <span className="text-white/35 text-sm">{HERO.subtitleExtra}</span>
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button size="lg" className="rounded-sm px-10 text-sm h-12 bg-terracotta hover:bg-terracotta-dark text-white font-bold tracking-wider shine-btn transition-all duration-300 shadow-lg shadow-terracotta/15" onClick={onShopNow}>
              {HERO.shopNow}
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-sm px-6 text-sm h-12 border-sage/15 text-sage hover:bg-sage/8 hover:border-sage/30 transition-all duration-300" onClick={onNewCollection}>
              <Sparkles className="w-3.5 h-3.5 ml-1.5" />
              {HERO.newCollection}
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-sage/25 to-transparent" />
    </section>
  );
}
