'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/use-store';
import { FAVORITES } from '@/lib/text';
import { ProductCard } from './product-card';
import type { Product } from '@/types';

export function FavoritesView() {
  const { favorites, setView } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (favorites.length === 0) { setProducts([]); setLoading(false); return; }
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        const allProducts = data.products || [];
        const favProducts = allProducts.filter((p: Product) => favorites.includes(p.id));
        setProducts(favProducts);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [favorites]);

  if (!loading && products.length === 0) {
    return (
      <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-16 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="max-w-xs mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary border border-sage/8 flex items-center justify-center">
            <Heart className="w-10 h-10 text-sage/25" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{FAVORITES.emptyTitle}</h2>
          <p className="text-muted-foreground text-xs font-light">{FAVORITES.emptyDesc}</p>
          <Button onClick={() => setView('home')} className="rounded-sm px-6 bg-terracotta text-white hover:bg-terracotta-dark font-bold text-sm shine-btn">{FAVORITES.browseProducts}</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-6 space-y-6">
      <div>
        <span className="text-sage/50 text-[10px] font-semibold tracking-[0.2em] uppercase">{FAVORITES.sectionLabel}</span>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{FAVORITES.title}</h1>
        <p className="text-muted-foreground text-xs mt-0.5 font-light">{products.length} {FAVORITES.itemCount}</p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
