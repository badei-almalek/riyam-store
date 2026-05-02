import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const category = await db.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الفئة' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check category exists
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) {
      updateData.name = body.name;
      // Regenerate slug if name changed
      const newSlug = body.name
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\u0621-\u064Aa-zA-Z0-9-]/g, '')
        .toLowerCase();
      
      // Check slug uniqueness (exclude current category)
      const slugExists = await db.category.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'اسم الفئة موجود بالفعل' },
          { status: 409 }
        );
      }
      updateData.slug = newSlug;
    }
    if (body.image !== undefined) updateData.image = body.image;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.parentId !== undefined) updateData.parentId = body.parentId || null;

    const category = await db.category.update({
      where: { id },
      data: updateData,
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Update category error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث الفئة' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check category exists
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'الفئة غير موجودة' },
        { status: 404 }
      );
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف الفئة' },
      { status: 500 }
    );
  }
}
