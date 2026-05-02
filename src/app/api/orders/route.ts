import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    // Verify admin
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { coupon: true },
    });

    // Parse items JSON for each order
    const parsedOrders = orders.map((order) => ({
      ...order,
      items: JSON.parse(order.items),
    }));

    return NextResponse.json({ orders: parsedOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الطلبات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, currency, customerName, customerPhone, customerCity, customerNotes, couponId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'سلة التسوق فارغة' },
        { status: 400 }
      );
    }

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: 'اسم العميل ورقم الهاتف مطلوبان' },
        { status: 400 }
      );
    }

    // Calculate total from product prices (only YER)
    let totalYER = 0;

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `المنتج غير موجود: ${item.productId}` },
          { status: 400 }
        );
      }

      const quantity = item.quantity || 1;
      totalYER += product.priceYER * quantity;
    }

    let discountYER = 0;

    if (couponId) {
      const coupon = await db.coupon.findUnique({ where: { id: couponId } });
      if (coupon && coupon.isActive) {
        if (coupon.type === 'percentage') {
          discountYER = totalYER * (coupon.value / 100);
        } else {
          discountYER = coupon.value;
        }
        if (discountYER > totalYER) discountYER = totalYER;
        
        // Increment used count
        await db.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } }
        });
      }
    }

    const order = await db.order.create({
      data: {
        items: JSON.stringify(items),
        totalYER: totalYER - discountYER,
        discountYER,
        couponId,
        currency: currency || 'YER',
        customerName,
        customerPhone,
        customerCity: customerCity || null,
        customerNotes: customerNotes || null,
        status: 'pending',
      },
    });

    return NextResponse.json({
      order: {
        ...order,
        items: JSON.parse(order.items),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الطلب' },
      { status: 500 }
    );
  }
}
