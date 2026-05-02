import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);

    const faqs = await db.fAQ.findMany({
      where: admin ? {} : { active: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Get FAQs error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الأسئلة الشائعة' },
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
    const { question, answer, order, active } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'السؤال والجواب مطلوبان' },
        { status: 400 }
      );
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء السؤال الشائع' },
      { status: 500 }
    );
  }
}
