'use client';

import { Sparkles } from 'lucide-react';
import { useStore } from '@/store/use-store';
import { ProductCard } from '@/components/store/product-card';
import { NEW_ARRIVALS } from '@/lib/text';

interface NewArrivalsGridProps {
  products: any[];
}

export function NewArrivalsGrid({ products }: NewArrivalsGridProps) {
  const { selectProduct } = useStore();
  if (!products?.length) return null;

  return (
    <section id="new-arrivals-section" className="py-10 sm:py-14">
      <div className="container mx-auto px-4 sm:px-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-sage/8 border border-sage/15 text-sage px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-bold tracking-wide">{NEW_ARRIVALS.title}</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-sage/15 to-transparent" />
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {products.map((product: any) => (
            <div key={product.id} className="cursor-pointer" onClick={() => selectProduct(product.id)}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
