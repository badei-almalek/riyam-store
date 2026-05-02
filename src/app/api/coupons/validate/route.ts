import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'رمز الكوبون مطلوب' }, { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: { code }
    });

    if (!coupon) {
      return NextResponse.json({ error: 'رمز الكوبون غير صحيح' }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'هذا الكوبون غير مفعل' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return NextResponse.json({ error: 'لم يبدأ وقت استخدام هذا الكوبون بعد' }, { status: 400 });
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return NextResponse.json({ error: 'انتهت صلاحية هذا الكوبون' }, { status: 400 });
    }

    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: 'تم تجاوز الحد الأقصى لاستخدام الكوبون' }, { status: 400 });
    }

    if (cartTotal < coupon.minOrderAmount) {
      return NextResponse.json({ error: `الحد الأدنى للطلب لاستخدام الكوبون هو ${coupon.minOrderAmount}` }, { status: 400 });
    }

    // In a real app we might also check productIds and categoryIds to ensure the cart has valid items.
    // For now we'll pass the coupon back to let the frontend calculate the discount.

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء التحقق من الكوبون' }, { status: 500 });
  }
}
