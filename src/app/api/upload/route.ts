import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/admin-auth';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'لم يتم العثور على ملف' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Compress and convert to webp using sharp
    const compressedBuffer = await sharp(buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    // Convert to base64 data URI
    const base64Data = compressedBuffer.toString('base64');
    const dataUri = `data:image/webp;base64,${base64Data}`;

    // Return the data URI as the URL
    return NextResponse.json({ url: dataUri });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'حدث خطأ في رفع الصورة' }, { status: 500 });
  }
}
