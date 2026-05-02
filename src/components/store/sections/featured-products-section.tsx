'use client';

import { Gem, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/store/product-card';
import { FEATURED, ARIA } from '@/lib/text';

interface FeaturedProductsSectionProps {
  products: any[];
  onViewAll: () => void;
}

export function FeaturedProductsSection({ products, onViewAll }: FeaturedProductsSectionProps) {
  return (
    <section className="container mx-auto px-4 sm:px-8 py-10 sm:py-16" aria-label={ARIA.featuredSection}>
      <div className="flex items-end justify-between mb-8 sm:mb-12">
        <div>
          <span className="text-sage/50 text-[10px] font-semibold tracking-[0.25em] uppercase">{FEATURED.sectionLabel}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{FEATURED.sectionTitle}</h2>
          <p className="text-muted-foreground mt-1 text-xs font-light">{FEATURED.sectionDesc}</p>
          <div className="sage-line mt-3 !mx-0" />
        </div>
        <Button variant="ghost" className="text-sage hover:text-sage-dark gap-1 text-xs font-medium hidden sm:flex" onClick={onViewAll}>
          {FEATURED.viewAll}
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product: any, index: number) => (
            <div key={product.id} className="luxury-entrance" style={{ animationDelay: `${index * 0.08}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Gem className="w-10 h-10 mx-auto mb-3 text-sage/20" />
          <p className="font-light text-sm">{FEATURED.empty}</p>
        </div>
      )}
    </section>
  );
}
