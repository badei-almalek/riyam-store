'use client';

import { useEffect, useState } from 'react';
import { Search, X, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/use-store';
import { trackSearch } from '@/components/seo/meta-pixel';
import { SEARCH, NAV } from '@/lib/text';
import { ProductCard } from './product-card';
import type { Product } from '@/types';

export function SearchView() {
  const { searchQuery, setSearchQuery, setView } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    if (!searchQuery.trim()) { setProducts([]); return; }
    async function searchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    }
    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      trackSearch({ searchString: localQuery });
    }
  };

  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    setView('home');
  };

  const handlePopularSearch = (term: string) => {
    setLocalQuery(term);
    setSearchQuery(term);
    trackSearch({ searchString: term });
  };

  return (
    <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Search Bar - This is the ONLY search bar on the page */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sage/50" />
          <Input
            type="search"
            placeholder={SEARCH.placeholder}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="pr-12 pl-12 h-12 rounded-sm text-base bg-secondary/30 border-sage/10 focus-visible:border-sage/30"
            autoFocus
            aria-label={SEARCH.placeholder}
          />
          {localQuery && (
            <button type="button" onClick={handleClear} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={SEARCH.closeSearch}>
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Breadcrumb-style navigation */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light max-w-xl mx-auto">
        <button onClick={() => setView('home')} className="hover:text-sage transition-colors">{NAV.home}</button>
        <ArrowRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{NAV.search}</span>
      </div>

      {searchQuery && !loading && (
        <div className="text-sm text-muted-foreground font-light max-w-xl mx-auto">
          {products.length > 0 ? (
            <span>{SEARCH.resultsFound} <strong className="text-foreground">{products.length}</strong> {SEARCH.resultFor} &quot;{searchQuery}&quot;</span>
          ) : null}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}

      {!loading && searchQuery && products.length === 0 && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary border border-sage/10 flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-sage/30" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">{SEARCH.noResults}</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto font-light">{SEARCH.noResultsDesc} &quot;{searchQuery}&quot;. {SEARCH.tryDifferent}</p>
          <Button variant="outline" onClick={() => setView('home')} className="mt-4 rounded-sm border-sage/20 hover:bg-sage/5">{SEARCH.backToHome}</Button>
        </motion.div>
      )}

      {!searchQuery && (
        <div className="text-center py-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary border border-sage/10 flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-sage/30" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">{SEARCH.searchProducts}</h3>
          <p className="text-muted-foreground text-sm font-light mb-8">{SEARCH.searchDiscovery}</p>

          {/* Popular Searches */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-sage/50" />
              <h4 className="text-sm font-semibold text-foreground">{SEARCH.popularSearches}</h4>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SEARCH.popularSearchTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handlePopularSearch(term)}
                  className="soft-tag text-xs px-3 py-1.5 hover:bg-sage/15 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
