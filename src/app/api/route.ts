import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Combined data endpoint to reduce API compilations
export async function GET() {
  try {
    const [categories, featuredProducts, currencies] = await Promise.all([
      db.category.findMany({
        orderBy: { order: 'asc' },
        include: {
          _count: { select: { products: true } },
        },
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
      categoryMap.set(cat.id, {
        ...cat,
        productCount: cat._count.products,
        children: [],
        _count: undefined,
      });
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

    // Parse images for products
    const parsedProducts = featuredProducts.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
    }));

    return NextResponse.json({
      categories: roots,
      featuredProducts: parsedProducts,
      currencies,
    });
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
