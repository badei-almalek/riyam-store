import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  StoreJsonLd,
  ProductJsonLd,
  BreadcrumbJsonLd,
} from './json-ld';
import { NAV, BRAND } from '@/lib/text';

type SeoPageType = 'home' | 'category' | 'product' | 'search' | 'cart' | 'favorites' | 'orders' | 'faq';

interface ProductSeoData {
  id: string;
  name: string;
  description: string;
  images: string[];
  priceYER: number;
  categoryName: string;
  categorySlug: string;
  inStock: boolean;
}

interface CategorySeoData {
  name: string;
  slug: string;
}

interface SeoHeadProps {
  pageType: SeoPageType;
  product?: ProductSeoData;
  category?: CategorySeoData;
  searchQuery?: string;
}

/**
 * Reusable SEO head component for structured data.
 * Note: Currently not used — each view handles its own JSON-LD directly.
 * This component is kept as a convenience wrapper for future use.
 */
export function SeoHead({ pageType, product, category }: SeoHeadProps) {
  return (
    <>
      {/* Always include base schemas on every page */}
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      {/* Page-specific structured data */}
      {pageType === 'home' && <StoreJsonLd />}

      {pageType === 'product' && product && (
        <>
          <StoreJsonLd />
          <ProductJsonLd
            id={product.id}
            name={product.name}
            description={product.description}
            image={product.images}
            priceYER={product.priceYER}
            categoryName={product.categoryName}
            categorySlug={product.categorySlug}
            inStock={product.inStock}
          />
          <BreadcrumbJsonLd
            items={[
              { name: NAV.home, url: BRAND.url },
              {
                name: product.categoryName,
                url: `${BRAND.url}/?category=${product.categorySlug}`,
              },
              { name: product.name, url: `${BRAND.url}/?product=${product.id}` },
            ]}
          />
        </>
      )}

      {pageType === 'category' && category && (
        <>
          <StoreJsonLd />
          <BreadcrumbJsonLd
            items={[
              { name: NAV.home, url: BRAND.url },
              {
                name: category.name,
                url: `${BRAND.url}/?category=${category.slug}`,
              },
            ]}
          />
        </>
      )}
    </>
  );
}
