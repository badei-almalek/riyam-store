'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import {
  Search, ShoppingCart, Heart, Menu, Home as HomeIcon, History,
  HelpCircle, ArrowUp, X, Sun, Moon, MessageCircle,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStore } from '@/store/use-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/store/logo';
import {
  NAV, THEME, CURRENCY, ARIA, SEARCH, BRAND, WHATSAPP_CTA,
} from '@/lib/text';

interface StoreHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchIconClick: () => void;
  isSearchView: boolean;
  socialLinks: { instagram: string; facebook: string };
}

export function StoreHeader({
  search,
  onSearchChange,
  onSearchSubmit,
  onSearchIconClick,
  isSearchView,
  socialLinks,
}: StoreHeaderProps) {
  const { currentView, setView, selectedCurrency, setCurrency, getCartItemCount, favorites } = useStore();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const cartCount = getCartItemCount();
  const isDark = theme === 'dark';

  // Hydration-safe mount detection
  const mounted = useSyncExternalStore(
    () => () => {}, // subscribe (no-op)
    () => true,     // getSnapshot (client)
    () => false     // getServerSnapshot
  );

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const navItems = [
    { label: NAV.home, icon: HomeIcon, view: 'home' as const, action: () => setView('home') },
    { label: NAV.favorites, icon: Heart, view: 'favorites' as const, action: () => setView('favorites'), badge: favorites.length },
    { label: NAV.orders, icon: History, view: 'orders' as const, action: () => setView('orders') },
    { label: NAV.cart, icon: ShoppingCart, view: 'cart' as const, action: () => setView('cart'), badge: cartCount },
  ];

  return (
    <>
      {/* Top Accent Line */}
      <div className="h-0.5 bg-gradient-to-l from-sage/40 via-sage to-sage/40" />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur-md border-b border-sage/6" role="banner">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <button onClick={() => setView('home')} className="flex items-center shrink-0 group" aria-label={ARIA.homeButton}>
              <Logo variant="header" />
            </button>

            {/* Desktop Search */}
            {!isSearchView ? (
              <form onSubmit={onSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
                <div className="relative w-full">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input type="search" placeholder={SEARCH.placeholder} value={search} onChange={(e) => onSearchChange(e.target.value)} className="pr-10 pl-4 h-10 rounded-sm bg-secondary/40 border-sage/8 focus-visible:border-sage/30 placeholder:text-muted-foreground/50 text-sm transition-colors duration-300" aria-label={ARIA.searchInput} />
                </div>
              </form>
            ) : (
              <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
                <button onClick={() => { onSearchChange(''); setView('home'); }} className="flex items-center gap-2 text-muted-foreground hover:text-sage transition-colors text-sm">
                  <X className="w-4 h-4" />
                  <span>{SEARCH.closeSearch}</span>
                </button>
              </div>
            )}

            {/* Header Actions */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Mobile: search icon or close button */}
              {isSearchView ? (
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-sm hover:bg-sage/5" onClick={() => { onSearchChange(''); setView('home'); }} aria-label={SEARCH.closeSearch}>
                  <X className="h-[16px] w-[16px]" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8 rounded-sm hover:bg-sage/5" onClick={onSearchIconClick} aria-label={ARIA.searchButton}>
                  <Search className="h-[16px] w-[16px]" />
                </Button>
              )}

              <Select value={selectedCurrency} onValueChange={(v) => setCurrency(v as any)}>
                <SelectTrigger className="w-auto border-0 bg-secondary/40 rounded-sm h-8 sm:h-9 px-2 sm:px-2.5 text-[10px] sm:text-[11px] font-semibold gap-1 hover:bg-secondary transition-colors" aria-label={ARIA.currencySelect}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YER">{CURRENCY.YER}</SelectItem>
                  <SelectItem value="SAR">{CURRENCY.SAR}</SelectItem>
                  <SelectItem value="USD">{CURRENCY.USD}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="ghost" size="icon" className="hidden sm:flex relative h-9 w-9 rounded-sm hover:bg-sage/5" onClick={() => setView('favorites')} aria-label={ARIA.favoritesButton}>
                <Heart className="h-[18px] w-[18px]" />
                {mounted && favorites.length > 0 && <Badge className="absolute -top-0.5 -left-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-terracotta text-white border-0 font-bold">{favorites.length}</Badge>}
              </Button>

              <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 rounded-sm hover:bg-sage/5" onClick={() => setView('orders')} aria-label={ARIA.ordersButton}>
                <History className="h-[18px] w-[18px]" />
              </Button>

              <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 rounded-sm hover:bg-sage/5" onClick={() => setView('faq')} aria-label={ARIA.faqButton}>
                <HelpCircle className="h-[18px] w-[18px]" />
              </Button>

              {/* Dark Mode Toggle */}
              {mounted && (
                <Button variant="ghost" size="icon" className="h-8 sm:h-9 w-8 sm:w-9 rounded-sm hover:bg-sage/5" onClick={toggleTheme} aria-label={isDark ? THEME.lightMode : THEME.darkMode}>
                  {isDark ? <Sun className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px]" /> : <Moon className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px]" />}
                </Button>
              )}

              <Button variant="ghost" size="icon" className="relative h-8 sm:h-9 w-8 sm:w-9 rounded-sm hover:bg-sage/5" onClick={() => setView('cart')} aria-label={ARIA.cartButton}>
                <ShoppingCart className="h-[16px] sm:h-[18px] w-[16px] sm:w-[18px]" />
                {mounted && cartCount > 0 && <Badge className="absolute -top-0.5 -left-0.5 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-terracotta text-white border-0 font-bold badge-pulse">{cartCount}</Badge>}
              </Button>

              {/* Mobile Menu Sheet */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8 rounded-sm hover:bg-sage/5" aria-label={ARIA.menuButton}>
                    <Menu className="h-[16px] w-[16px]" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 border-sage/8">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Logo variant="icon" />
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-5 space-y-1">
                    <form onSubmit={(e) => { e.preventDefault(); if (search.trim()) { onSearchChange(search); setMobileOpen(false); } }} className="mb-3">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input type="search" placeholder={SEARCH.placeholder} value={search} onChange={(e) => onSearchChange(e.target.value)} className="pr-9 pl-3 h-9 text-sm" aria-label={ARIA.searchInput} />
                      </div>
                    </form>
                    {navItems.map((item) => (
                      <button key={item.view} onClick={() => { item.action(); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-sm ${currentView === item.view ? 'bg-sage/8 text-sage font-semibold border-r-2 border-sage' : 'hover:bg-secondary text-foreground'}`}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        {mounted && item.badge ? <Badge className="mr-auto bg-terracotta text-white border-0 text-[10px] font-bold">{item.badge}</Badge> : null}
                      </button>
                    ))}
                    <button onClick={() => { setView('faq'); setMobileOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-sm ${currentView === 'faq' ? 'bg-sage/8 text-sage font-semibold border-r-2 border-sage' : 'hover:bg-secondary text-foreground'}`}>
                      <HelpCircle className="h-4 w-4" />
                      <span>{NAV.faq}</span>
                    </button>
                    {mounted && (
                      <button onClick={() => { toggleTheme(); setMobileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-3 text-sm transition-colors rounded-sm hover:bg-secondary text-foreground">
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        <span>{isDark ? THEME.lightMode : THEME.darkMode}</span>
                      </button>
                    )}
                  </div>
                  <div className="absolute bottom-5 left-4 right-4">
                    <a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors w-full">
                      <MessageCircle className="w-4 h-4" />
                      {WHATSAPP_CTA.sidebarButton}
                    </a>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile search bar below header */}
          {!isSearchView && (
            <form onSubmit={onSearchSubmit} className="md:hidden pb-2.5">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                <Input type="search" placeholder={SEARCH.placeholder} value={search} onChange={(e) => onSearchChange(e.target.value)} className="pr-9 pl-3 h-9 rounded-sm bg-secondary/40 border-sage/8 text-sm" aria-label={ARIA.searchInput} />
              </div>
            </form>
          )}
        </div>
      </header>

      {/* ── Mobile Bottom Nav ───────────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-sage/8" aria-label={ARIA.mainNav}>
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => (
            <button key={item.view} onClick={item.action} className={`relative flex flex-col items-center justify-center gap-0.5 h-full w-full transition-colors ${currentView === item.view ? 'text-sage' : 'text-muted-foreground'}`} aria-label={item.label}>
              <item.icon className="h-[16px] w-[16px]" />
              <span className="text-[8px] sm:text-[9px] font-medium">{item.label}</span>
              {currentView === item.view && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-sage rounded-full" />}
              {mounted && item.badge ? <Badge className="absolute top-0.5 left-1/2 h-3.5 min-w-3.5 p-0 flex items-center justify-center text-[8px] bg-terracotta text-white border-0 font-bold">{item.badge}</Badge> : null}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Floating WhatsApp (Desktop) ─────────────────────────────────────── */}
      <a href={BRAND.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hidden sm:flex fixed bottom-8 right-8 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full items-center justify-center shadow-lg shadow-green-500/30 whatsapp-pulse transition-all duration-300 hover:scale-110 hover:shadow-green-500/40" aria-label={WHATSAPP_CTA.floatingLabel}>
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* ── Back to Top ──────────────────────────────────────────────────────── */}
      {showBackToTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-20 sm:bottom-[104px] right-4 sm:right-9 z-50 w-10 h-10 sm:w-12 sm:h-12 bg-sage/90 hover:bg-sage text-white rounded-full items-center justify-center shadow-lg shadow-sage/20 transition-all duration-300 hover:scale-110 hover:shadow-sage/30 flex" aria-label={ARIA.backToTop}>
          <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      )}
    </>
  );
}
