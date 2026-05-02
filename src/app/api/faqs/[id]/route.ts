import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

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

    // Check FAQ exists
    const existing = await db.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'السؤال الشائع غير موجود' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (body.question !== undefined) updateData.question = body.question;
    if (body.answer !== undefined) updateData.answer = body.answer;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.active !== undefined) updateData.active = body.active;

    const faq = await db.fAQ.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ faq });
  } catch (error) {
    console.error('Update FAQ error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث السؤال الشائع' },
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

    // Check FAQ exists
    const existing = await db.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'السؤال الشائع غير موجود' },
        { status: 404 }
      );
    }

    await db.fAQ.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف السؤال الشائع' },
      { status: 500 }
    );
  }
}
