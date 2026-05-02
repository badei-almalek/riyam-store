'use client';

import { useStore } from '@/store/use-store';
import { HeroSection } from './hero-section';
import { TrustBadgesSection } from './trust-badges-section';
import { CategoriesSection } from './categories-section';
import { NewArrivalsGrid } from './new-arrivals-grid';
import { FeaturedProductsSection } from './featured-products-section';
import { WhyRiyamSection } from './why-riyam-section';
import { WhatsAppCTASection } from './whatsapp-cta-section';
import { SectionDivider } from '@/components/store/shared';
import type { InitialData } from '@/components/store/shared';

export function HomeView({ initialData }: { initialData: InitialData }) {
  const { selectCategory } = useStore();
  const { categories, featuredProducts } = initialData;
  const newArrivals = featuredProducts.filter((p: any) =>
    new Date(p.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <HeroSection onShopNow={() => scrollTo('categories-section')} onNewCollection={() => scrollTo('new-arrivals-section')} />

      {/* Trust Badges */}
      <TrustBadgesSection />

      {/* Categories */}
      <CategoriesSection categories={categories} onSelectCategory={selectCategory} />

      {/* وصل حديثاً - Static Grid */}
      {newArrivals.length > 0 && <NewArrivalsGrid products={newArrivals} />}
      <SectionDivider />

      {/* Featured Products */}
      <FeaturedProductsSection products={featuredProducts} onViewAll={() => scrollTo('categories-section')} />

      {/* Why Riyam */}
      <WhyRiyamSection />

      <SectionDivider />

      {/* WhatsApp CTA */}
      <WhatsAppCTASection />
    </div>
  );
}
