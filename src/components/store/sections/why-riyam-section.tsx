'use client';

import { Crown, Gem, Star } from 'lucide-react';
import { WHY_RIYAM, ARIA } from '@/lib/text';

export function WhyRiyamSection() {
  const statIcons = [Crown, Gem, Star];
  return (
    <section className="relative bg-deep-accent py-16 sm:py-24 overflow-hidden" aria-label={ARIA.whyRiyam}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-sage/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-l from-transparent via-sage/15 to-transparent" />
      </div>
      <div className="container mx-auto px-4 sm:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-sage/40 text-[10px] font-semibold tracking-[0.25em] uppercase">{WHY_RIYAM.sectionLabel}</span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white">{WHY_RIYAM.sectionTitle}</h2>
          <div className="sage-line" />
          <p className="text-white/40 leading-loose font-light text-sm max-w-2xl mx-auto">{WHY_RIYAM.description}</p>
          <div className="grid grid-cols-3 gap-6 pt-8">
            {WHY_RIYAM.stats.map((stat, i) => {
              const Icon = statIcons[i];
              return (
                <div key={stat.label} className="text-center group">
                  <div className="w-14 h-14 mx-auto rounded-full glass-sage flex items-center justify-center mb-3 group-hover:bg-sage/12 transition-all duration-500">
                    <Icon className="w-6 h-6 text-sage" />
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold sage-text">{stat.value}</div>
                  <div className="text-white/30 text-xs mt-1 font-light">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
