'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStore } from '@/store/use-store';
import { trackCustom } from '@/components/seo/meta-pixel';
import { NAV, BRAND } from '@/lib/text';
import { LoadingSpinner } from '@/components/store/shared';
import type { InitialData } from '@/components/store/shared';

// ─── Section components ──────────────────────────────────────────────────────
import { HomeView } from '@/components/store/sections/home-view';
import { StoreHeader } from '@/components/store/sections/store-header';
import { StoreFooter } from '@/components/store/sections/store-footer';

// ─── Dynamic imports (code splitting) ────────────────────────────────────────
const CategoryView = dynamic(() => import('@/components/store/category-view').then(m => ({ default: m.CategoryView })), { ssr: false, loading: () => <LoadingSpinner /> });
const ProductView = dynamic(() => import('@/components/store/product-view').then(m => ({ default: m.ProductView })), { ssr: false, loading: () => <LoadingSpinner /> });
const CartView = dynamic(() => import('@/components/store/cart-view').then(m => ({ default: m.CartView })), { ssr: false, loading: () => <LoadingSpinner /> });
const FavoritesView = dynamic(() => import('@/components/store/favorites-view').then(m => ({ default: m.FavoritesView })), { ssr: false, loading: () => <LoadingSpinner /> });
const OrdersView = dynamic(() => import('@/components/store/orders-view').then(m => ({ default: m.OrdersView })), { ssr: false, loading: () => <LoadingSpinner /> });
const SearchView = dynamic(() => import('@/components/store/search-view').then(m => ({ default: m.SearchView })), { ssr: false, loading: () => <LoadingSpinner /> });
const FaqView = dynamic(() => import('@/components/store/faq-view').then(m => ({ default: m.FaqView })), { ssr: false, loading: () => <LoadingSpinner /> });

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STORE CLIENT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function StoreClient({ initialData }: { initialData: InitialData }) {
  const { currentView, setView, setSearchQuery, searchQuery, setCurrencyRates } = useStore();
  const [search, setSearch] = useState('');
  const [socialLinks, setSocialLinks] = useState({ instagram: BRAND.instagramUrl, facebook: BRAND.facebookUrl });

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { setSearch(searchQuery); }, [searchQuery]);

  useEffect(() => {
    async function loadCurrencyRates() {
      try {
        const res = await fetch('/api/currencies');
        const data = await res.json();
        if (data.currencies) setCurrencyRates(data.currencies);
      } catch (error) { console.error('Error loading currency rates:', error); }
    }
    loadCurrencyRates();
  }, [setCurrencyRates]);

  useEffect(() => {
    async function loadSocialLinks() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          setSocialLinks({
            instagram: data.settings.instagram_url || BRAND.instagramUrl,
            facebook: data.settings.facebook_url || BRAND.facebookUrl,
          });
        }
      } catch (error) { console.error('Error loading social links:', error); }
    }
    loadSocialLinks();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentView]);

  useEffect(() => {
    const viewNames: Record<string, string> = {
      home: NAV.home, category: NAV.category, product: NAV.product,
      cart: NAV.cartFull, favorites: NAV.favorites, orders: NAV.orders,
      search: NAV.search, faq: NAV.faq,
    };
    trackCustom('PageViewSPA', { view: currentView, viewName: viewNames[currentView] || currentView });
  }, [currentView]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setSearchQuery(search);
  };

  const handleSearchIconClick = () => {
    if (currentView !== 'search') { setSearchQuery(''); setView('search'); }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // ── View router ────────────────────────────────────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView initialData={initialData} />;
      case 'category': return <CategoryView />;
      case 'product': return <ProductView />;
      case 'cart': return <CartView />;
      case 'favorites': return <FavoritesView />;
      case 'orders': return <OrdersView />;
      case 'search': return <SearchView />;
      case 'faq': return <FaqView />;
      default: return <HomeView initialData={initialData} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header, Nav, Floating Actions */}
      <StoreHeader
        search={search}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onSearchIconClick={handleSearchIconClick}
        isSearchView={currentView === 'search'}
        socialLinks={socialLinks}
      />

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <main className="flex-1" role="main">{renderView()}</main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <StoreFooter socialLinks={socialLinks} onNavigate={setView} />
    </div>
  );
}
