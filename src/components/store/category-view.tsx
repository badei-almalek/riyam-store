'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStore } from '@/store/use-store';
import { BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { CATEGORY_VIEW, NAV, CATEGORIES } from '@/lib/text';
import { ProductCard } from './product-card';
import type { Product, Category } from '@/types';

export function CategoryView() {
  const { selectedCategoryId, setView } = useStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(null);

  // Build categoryIds for "الكل" - parent + all children
  const buildAllCategoryIds = useCallback((cat: Category): string => {
    const ids = [cat.id];
    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        ids.push(child.id);
      }
    }
    return ids.join(',');
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        const allCats = catData.categories || [];
        setCategories(allCats);

        const findCategory = (cats: Category[]): Category | null => {
          for (const cat of cats) {
            if (cat.id === selectedCategoryId) return cat;
            if (cat.children) {
              const found = findCategory(cat.children);
              if (found) return found;
            }
          }
          return null;
        };

        const found = findCategory(allCats);
        setCategory(found);

        // Fetch products using categoryIds for parent + all children
        if (found) {
          const categoryIds = buildAllCategoryIds(found);
          const prodRes = await fetch(`/api/products?categoryIds=${categoryIds}`);
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        } else {
          // Fallback: just fetch by single categoryId
          const prodRes = await fetch(`/api/products?categoryId=${selectedCategoryId}`);
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }

        setActiveSubcategoryId(null);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    }
    if (selectedCategoryId) fetchData();
  }, [selectedCategoryId, buildAllCategoryIds]);

  const handleSubcategoryClick = useCallback(async (subcategoryId: string | null) => {
    setActiveSubcategoryId(subcategoryId);
    if (subcategoryId) {
      try {
        const res = await fetch(`/api/products?categoryId=${subcategoryId}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching subcategory products:', error);
      }
    } else {
      // "الكل" - fetch all products for parent + children
      if (category) {
        try {
          const categoryIds = buildAllCategoryIds(category);
          const res = await fetch(`/api/products?categoryIds=${categoryIds}`);
          const data = await res.json();
          setProducts(data.products || []);
        } catch (error) {
          console.error('Error fetching all category products:', error);
        }
      }
    }
  }, [category, buildAllCategoryIds]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-8 py-6 space-y-5">
        <Skeleton className="h-6 w-36" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-sm" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[3/4] rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const subcategories = category?.children || [];

  // Generate ItemList JSON-LD for category
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: category?.name || CATEGORY_VIEW.productsFallback,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: product.name,
      url: `https://riyamfashion.com/?product=${product.id}`,
    })),
  };

  return (
    <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* ItemList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {/* Breadcrumb Schema */}
      <BreadcrumbJsonLd
        items={[
          { name: NAV.home, url: 'https://riyamfashion.com' },
          { name: category?.name || CATEGORY_VIEW.categoryFallback, url: `https://riyamfashion.com/?category=${selectedCategoryId}` },
        ]}
      />

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
        <button onClick={() => setView('home')} className="hover:text-sage transition-colors">{NAV.home}</button>
        <ArrowRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{category?.name || CATEGORY_VIEW.categoryFallback}</span>
      </div>
      <div>
        <span className="text-sage/50 text-[10px] font-semibold tracking-[0.2em] uppercase">{CATEGORY_VIEW.collectionLabel}</span>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{category?.name || CATEGORY_VIEW.productsFallback}</h1>
        <p className="text-muted-foreground text-xs mt-0.5 font-light">{products.length} {CATEGORIES.productCount}</p>
      </div>
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <Button variant={activeSubcategoryId === null ? 'default' : 'outline'} size="sm" className={`rounded-sm text-xs h-8 ${activeSubcategoryId === null ? 'bg-sage text-white hover:bg-sage-dark' : 'border-sage/15 hover:bg-sage/5 text-xs'}`} onClick={() => handleSubcategoryClick(null)}>{CATEGORY_VIEW.allProducts}</Button>
          {subcategories.map((sub) => (
            <Button key={sub.id} variant={activeSubcategoryId === sub.id ? 'default' : 'outline'} size="sm" className={`rounded-sm text-xs h-8 ${activeSubcategoryId === sub.id ? 'bg-sage text-white hover:bg-sage-dark' : 'border-sage/15 hover:bg-sage/5 text-xs'}`} onClick={() => handleSubcategoryClick(sub.id)}>{sub.name}</Button>
          ))}
        </div>
      )}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary border border-sage/10 flex items-center justify-center mb-3">
            <ShoppingBag className="w-10 h-10 text-sage/30" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">{CATEGORY_VIEW.noProducts}</h3>
          <p className="text-muted-foreground text-xs font-light">{CATEGORY_VIEW.noProductsDesc}</p>
        </div>
      )}
    </div>
  );
}
