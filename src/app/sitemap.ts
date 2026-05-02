import { db } from '@/lib/db';
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://riyamfashion.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all categories and products from database
  const [categories, products] = await Promise.all([
    db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: { order: 'asc' },
    }),
    db.product.findMany({
      select: {
        id: true,
        name: true,
        updatedAt: true,
        inStock: true,
      },
      orderBy: { order: 'asc' },
    }),
  ]);

  // Homepage entry
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: SITE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  };

  // Category entries
  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${SITE_URL}/?category=${category.id}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Product entries
  const productEntries: MetadataRoute.Sitemap = products
    .filter((product) => product.inStock)
    .map((product) => ({
      url: `${SITE_URL}/?product=${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

  return [homeEntry, ...categoryEntries, ...productEntries];
}
