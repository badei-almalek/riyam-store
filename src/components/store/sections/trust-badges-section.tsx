'use client';

import { Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { TRUST_BADGES, ARIA } from '@/lib/text';

export function TrustBadgesSection() {
  const icons = [Truck, Shield, RotateCcw, Star];
  return (
    <section className="bg-card border-b border-sage/6" aria-label={ARIA.trustBadges}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-sage/6">
          {TRUST_BADGES.map((item, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="flex items-center gap-3 py-4 px-4 sm:px-6 group hover:bg-sage/3 transition-colors duration-300">
                <div className="w-9 h-9 rounded-full bg-sage/6 flex items-center justify-center shrink-0 group-hover:bg-sage/10 transition-colors duration-300">
                  <Icon className="w-4 h-4 text-sage" />
                </div>
                <div>
                  <p className="font-bold text-xs text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground font-light">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
