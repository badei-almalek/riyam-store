import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

// Helper to generate slug from Arabic name
function generateSlug(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0621-\u064Aa-zA-Z0-9-]/g, '')
    .toLowerCase();
}

// Helper to build category tree
function buildCategoryTree(categories: Array<Record<string, unknown>>): Array<Record<string, unknown>> {
  const categoryMap = new Map<string, Record<string, unknown>>();
  const roots: Array<Record<string, unknown>> = [];

  // First pass: create map with children arrays
  for (const cat of categories) {
    categoryMap.set(cat.id as string, { ...cat, children: [] });
  }

  // Second pass: build tree
  for (const cat of categories) {
    const node = categoryMap.get(cat.id as string)!;
    if (cat.parentId) {
      const parent = categoryMap.get(cat.parentId as string);
      if (parent) {
        (parent.children as Array<Record<string, unknown>>).push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    // Transform to plain objects and add product count
    const transformed = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      order: cat.order,
      parentId: cat.parentId,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
      productCount: cat._count.products,
    }));

    // Build tree structure
    const tree = buildCategoryTree(transformed);

    return NextResponse.json({ categories: tree });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الفئات' },
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
    const { name, image, order, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'اسم الفئة مطلوب' },
        { status: 400 }
      );
    }

    const slug = generateSlug(name);

    // Check slug uniqueness
    const existing = await db.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'اسم الفئة موجود بالفعل' },
        { status: 409 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        image: image || null,
        order: order || 0,
        parentId: parentId || null,
      },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الفئة' },
      { status: 500 }
    );
  }
}
