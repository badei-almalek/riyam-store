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

    // Check currency exists
    const existing = await db.currencyRate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'العملة غير موجودة' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    if (body.code !== undefined) updateData.code = body.code.toUpperCase();
    if (body.name !== undefined) updateData.name = body.name;
    if (body.rateToYER !== undefined) updateData.rateToYER = Number(body.rateToYER);
    if (body.symbol !== undefined) updateData.symbol = body.symbol;

    // Check code uniqueness if changing
    if (body.code && body.code.toUpperCase() !== existing.code) {
      const codeExists = await db.currencyRate.findFirst({
        where: { code: body.code.toUpperCase(), id: { not: id } },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: 'رمز العملة موجود بالفعل' },
          { status: 409 }
        );
      }
    }

    const currency = await db.currencyRate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ currency });
  } catch (error) {
    console.error('Update currency error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تحديث العملة' },
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

    // Check currency exists
    const existing = await db.currencyRate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'العملة غير موجودة' },
        { status: 404 }
      );
    }

    await db.currencyRate.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete currency error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حذف العملة' },
      { status: 500 }
    );
  }
}
