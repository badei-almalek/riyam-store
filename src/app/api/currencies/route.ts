import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET() {
  try {
    const currencies = await db.currencyRate.findMany({
      orderBy: { code: 'asc' },
    });

    return NextResponse.json({ currencies });
  } catch (error) {
    console.error('Get currencies error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب أسعار العملات' },
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
    const { code, name, rateToYER, symbol } = body;

    if (!code || !name || rateToYER === undefined || !symbol) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة: الرمز، الاسم، السعر، الرمز' },
        { status: 400 }
      );
    }

    // Check if currency code already exists
    const existing = await db.currencyRate.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: 'رمز العملة موجود بالفعل' },
        { status: 409 }
      );
    }

    const currency = await db.currencyRate.create({
      data: {
        code: code.toUpperCase(),
        name,
        rateToYER: Number(rateToYER),
        symbol,
      },
    });

    return NextResponse.json({ currency }, { status: 201 });
  } catch (error) {
    console.error('Create currency error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء العملة' },
      { status: 500 }
    );
  }
}
