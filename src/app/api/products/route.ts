import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const categoryIds = searchParams.get('categoryIds');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    // Support comma-separated categoryIds for fetching products across multiple categories
    if (categoryIds) {
      const ids = categoryIds.split(',').filter(Boolean);
      if (ids.length === 1) {
        where.categoryId = ids[0];
      } else if (ids.length > 1) {
        where.categoryId = { in: ids };
      }
    } else if (categoryId) {
      where.categoryId = categoryId;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    const products = await db.product.findMany({
      where,
      include: { category: true },
      orderBy: { order: 'asc' },
    });

    // Parse images and tags JSON strings for each product
    const parsedProducts = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images),
      tags: JSON.parse(product.tags || '[]'),
    }));

    return NextResponse.json({ products: parsedProducts });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب المنتجات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, priceYER, images, tags, categoryId, featured, inStock, order } = body;

    if (!name || !categoryId || priceYER === undefined) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: الاسم، الفئة، السعر' },
        { status: 400 }
      );
    }

    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : (typeof images === 'string' ? images : '[]');
    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : (typeof tags === 'string' ? tags : '[]');

    const product = await db.product.create({
      data: {
        name,
        description: description || null,
        priceYER: Number(priceYER),
        images: imagesStr,
        tags: tagsStr,
        categoryId,
        featured: featured || false,
        inStock: inStock !== undefined ? inStock : true,
        order: order || 0,
      },
      include: { category: true },
    });

    return NextResponse.json({
      product: {
        ...product,
        images: JSON.parse(product.images),
        tags: JSON.parse(product.tags || '[]'),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء المنتج' },
      { status: 500 }
    );
  }
}
