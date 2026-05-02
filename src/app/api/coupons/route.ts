import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const data = await request.json();
    
    // Check if code exists
    const existing = await db.coupon.findUnique({
      where: { code: data.code }
    });
    
    if (existing) {
      return NextResponse.json({ error: 'رمز الكوبون مستخدم بالفعل' }, { status: 400 });
    }

    const coupon = await db.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount || 0,
        maxUses: data.maxUses || null,
        isActive: data.isActive ?? true,
        allProducts: data.allProducts ?? true,
        productIds: data.productIds || "[]",
        categoryIds: data.categoryIds || "[]",
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ error: 'حدث خطأ في إنشاء الكوبون' }, { status: 500 });
  }
}
