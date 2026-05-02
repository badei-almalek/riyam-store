'use client';

import { BRAND, SEO } from '@/lib/text';

interface ProductOgTagsProps {
  id: string;
  name: string;
  description: string;
  images: string[];
  priceYER: number;
  categoryId: string;
  inStock: boolean;
}

/**
 * Product-specific Open Graph and Facebook Product tags.
 * These are essential for Facebook/Instagram product sharing and catalog integration.
 * Facebook uses og:* and product:* meta tags for rich product previews and shops.
 */
export function ProductOgTags({ id, name, description, images, priceYER, categoryId, inStock }: ProductOgTagsProps) {
  const productDescription = description || `${name} - ${SEO.storeFullName} - ${SEO.luxuryFashion}`;
  const mainImage = images.length > 0 ? images[0] : '/hero-banner.png';

  return (
    <>
      {/* Open Graph - Product Type (Facebook/Instagram) */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={name} />
      <meta property="og:description" content={productDescription} />
      <meta property="og:url" content={`${BRAND.url}/?product=${id}`} />
      {images.length > 0 && <meta property="og:image" content={mainImage} />}
      {images.length > 1 && <meta property="og:image" content={images[1]} />}
      {images.length > 2 && <meta property="og:image" content={images[2]} />}
      <meta property="og:site_name" content={SEO.storeFullName} />
      <meta property="og:locale" content="ar_YE" />

      {/* Facebook Product Tags - Required for Facebook Shop & Instagram Shopping */}
      <meta property="product:price:amount" content={priceYER.toString()} />
      <meta property="product:price:currency" content="YER" />
      <meta property="product:availability" content={inStock ? 'instock' : 'oos'} />
      <meta property="product:condition" content="new" />
      <meta property="product:retailer_item_id" content={id} />
      <meta property="product:item_group_id" content={categoryId} />
      <meta property="product:brand" content={BRAND.nameAr} />
      <meta property="product:category" content={SEO.womenFashion} />

      {/* Twitter Card for product sharing */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={name} />
      <meta name="twitter:description" content={productDescription} />
      {images.length > 0 && <meta name="twitter:image" content={mainImage} />}
    </>
  );
}
