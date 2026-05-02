export const dynamic = 'force-dynamic';

import { db } from '@/lib/db';
import StoreClient from '@/components/store/store-client';
import { NAV, BRAND } from '@/lib/text';
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  StoreJsonLd,
  BreadcrumbJsonLd,
} from '@/components/seo/json-ld';

async function getInitialData() {
  try {
    const [categories, featuredProducts, currencies] = await Promise.all([
      db.category.findMany({
        orderBy: { order: 'asc' },
        include: { _count: { select: { products: true } } },
      }),
      db.product.findMany({
        where: { featured: true, inStock: true },
        include: { category: true },
        orderBy: { order: 'asc' },
      }),
      db.currencyRate.findMany(),
    ]);

    // Build category tree
    const categoryMap = new Map<string, any>();
    const roots: any[] = [];
    for (const cat of categories) {
      categoryMap.set(cat.id, { ...cat, productCount: cat._count.products, children: [], _count: undefined });
    }
    for (const cat of categories) {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) parent.children.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    }

    const parsedProducts = featuredProducts.map((p) => ({ ...p, images: JSON.parse(p.images), tags: JSON.parse(p.tags || '[]') }));

    return { categories: roots, featuredProducts: parsedProducts, currencies };
  } catch (error) {
    console.error('Initial data error:', error);
    return { categories: [], featuredProducts: [], currencies: [] };
  }
}

export default async function Home() {
  const initialData = await getInitialData();

  return (
    <>
      {/* Homepage structured data */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <StoreJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: NAV.home, url: BRAND.url },
        ]}
      />

      {/* Semantic main content */}
      <main role="main" itemType="https://schema.org/WebPage" itemScope>
        <StoreClient initialData={initialData} />
      </main>
    </>
  );
}
