import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createToken } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // Check if any admin exists, if not create default admin
    let admin = await db.admin.findUnique({ where: { username } });
    
    if (!admin) {
      // Check if this is the default admin credentials and no admin exists yet
      const adminCount = await db.admin.count();
      if (adminCount === 0 && username === 'admin' && password === 'riyam2024') {
        admin = await db.admin.create({
          data: { username: 'admin', password: 'riyam2024' },
        });
      } else {
        return NextResponse.json(
          { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
          { status: 401 }
        );
      }
    }

    // Verify password
    if (admin.password !== password) {
      return NextResponse.json(
        { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // Create token
    const token = createToken(admin.id, admin.username);

    // Set cookie and return response
    const response = NextResponse.json({
      success: true,
      admin: { id: admin.id, username: admin.username },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    );
  }
}
