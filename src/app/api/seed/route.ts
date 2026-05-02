import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Clear existing data
    await db.product.deleteMany();
    await db.category.deleteMany();

    // Create categories with subcategories
    const dressesCat = await db.category.create({
      data: { name: 'فساتين', slug: 'فساتين', image: '/products/evening-dress-black.png', order: 1 },
    });
    const abayasCat = await db.category.create({
      data: { name: 'عبايات', slug: 'عبايات', image: '/products/abaya-formal.png', order: 2 },
    });
    const hijabsCat = await db.category.create({
      data: { name: 'حجابات', slug: 'حجابات', image: '/products/hijab-silk.png', order: 3 },
    });
    const bagsCat = await db.category.create({
      data: { name: 'حقائب', slug: 'حقائب', image: '/products/handbag-black.png', order: 4 },
    });
    const accessoriesCat = await db.category.create({
      data: { name: 'إكسسوارات', slug: 'إكسسوارات', image: '/products/necklace-crystal.png', order: 5 },
    });

    // Create subcategories
    await db.category.createMany({
      data: [
        { name: 'فساتين سهرة', slug: 'فساتين-سهرة', parentId: dressesCat.id, order: 1 },
        { name: 'فساتين يومية', slug: 'فساتين-يومية', parentId: dressesCat.id, order: 2 },
        { name: 'فساتين خطوبة', slug: 'فساتين-خطوبة', parentId: dressesCat.id, order: 3 },
        { name: 'عبايات رسمية', slug: 'عبايات-رسمية', parentId: abayasCat.id, order: 1 },
        { name: 'عبايات يومية', slug: 'عبايات-يومية', parentId: abayasCat.id, order: 2 },
        { name: 'عبايات مطرزة', slug: 'عبايات-مطرزة', parentId: abayasCat.id, order: 3 },
        { name: 'طرحات', slug: 'طرحات', parentId: hijabsCat.id, order: 1 },
        { name: 'نيقابات', slug: 'نيقابات', parentId: hijabsCat.id, order: 2 },
        { name: 'شالات', slug: 'شالات', parentId: hijabsCat.id, order: 3 },
        { name: 'حقائب يد', slug: 'حقائب-يد', parentId: bagsCat.id, order: 1 },
        { name: 'حقائب كتف', slug: 'حقائب-كتف', parentId: bagsCat.id, order: 2 },
        { name: 'أساور', slug: 'أساور', parentId: accessoriesCat.id, order: 1 },
        { name: 'خواتم', slug: 'خواتم', parentId: accessoriesCat.id, order: 2 },
        { name: 'قلادات', slug: 'قلادات', parentId: accessoriesCat.id, order: 3 },
      ],
    });

    // Get subcategories for product creation
    const eveningDresses = await db.category.findFirst({ where: { slug: 'فساتين-سهرة' } });
    const dailyDresses = await db.category.findFirst({ where: { slug: 'فساتين-يومية' } });
    const engagementDresses = await db.category.findFirst({ where: { slug: 'فساتين-خطوبة' } });
    const formalAbayas = await db.category.findFirst({ where: { slug: 'عبايات-رسمية' } });
    const dailyAbayas = await db.category.findFirst({ where: { slug: 'عبايات-يومية' } });
    const embroideredAbayas = await db.category.findFirst({ where: { slug: 'عبايات-مطرزة' } });
    const hijabStyles = await db.category.findFirst({ where: { slug: 'طرحات' } });
    const shawls = await db.category.findFirst({ where: { slug: 'شالات' } });
    const handBags = await db.category.findFirst({ where: { slug: 'حقائب-يد' } });
    const shoulderBags = await db.category.findFirst({ where: { slug: 'حقائب-كتف' } });
    const bracelets = await db.category.findFirst({ where: { slug: 'أساور' } });
    const rings = await db.category.findFirst({ where: { slug: 'خواتم' } });
    const necklaces = await db.category.findFirst({ where: { slug: 'قلادات' } });

    // Create sample products with luxury images (multiple images per product)
    // Only priceYER is stored; SAR/USD are converted dynamically via currency rates
    const productsData = [
      {
        name: 'فستان سهرة أسود أنيق',
        description: 'فستان سهرة أنيق باللون الأسود مصمم بأجود الخامات، مناسب للحفلات والمناسبات الرسمية. قماش حرير فاخر مع تطريز يدوي راقي.',
        priceYER: 85000,
        images: JSON.stringify(['/products/evening-dress-black.png', '/products/evening-dress-gold.png']),
        categoryId: eveningDresses!.id,
        featured: true,
        inStock: true,
        order: 1,
      },
      {
        name: 'فستان سهرة ذهبي فاخر',
        description: 'فستان سهرة فاخر باللون الذهبي مع تطريز يدوي راقي. تصميم حصري من ريام فاشن.',
        priceYER: 120000,
        images: JSON.stringify(['/products/evening-dress-gold.png', '/products/engagement-dress.png']),
        categoryId: eveningDresses!.id,
        featured: true,
        inStock: true,
        order: 2,
      },
      {
        name: 'فستان يومي زهري',
        description: 'فستان يومي مريح باللون الزهري مناسب للاستخدام اليومي. قماش قطني فاخر.',
        priceYER: 35000,
        images: JSON.stringify(['/products/daily-dress-pink.png', '/products/daily-dress-blue.png']),
        categoryId: dailyDresses!.id,
        featured: false,
        inStock: true,
        order: 1,
      },
      {
        name: 'فستان يومي سماوي',
        description: 'فستان يومي أنيق باللون السماوي بقماش قطني مريح. تصميم عصري وأنيق.',
        priceYER: 32000,
        images: JSON.stringify(['/products/daily-dress-blue.png', '/products/daily-dress-pink.png']),
        categoryId: dailyDresses!.id,
        featured: false,
        inStock: true,
        order: 2,
      },
      {
        name: 'فستان خطوبة أبيض',
        description: 'فستان خطوبة رائع باللون الأبيض مع تفاصيل كريستالية. تصميم ملكي فاخر.',
        priceYER: 150000,
        images: JSON.stringify(['/products/engagement-dress.png', '/products/evening-dress-gold.png', '/products/evening-dress-black.png']),
        categoryId: engagementDresses!.id,
        featured: true,
        inStock: true,
        order: 1,
      },
      {
        name: 'عباية رسمية سوداء مع تطريز ذهبي',
        description: 'عباية رسمية فاخرة باللون الأسود مع تطريز ذهبي راقي. قماش كريب ياباني فاخر.',
        priceYER: 65000,
        images: JSON.stringify(['/products/abaya-formal.png', '/products/abaya-navy.png']),
        categoryId: formalAbayas!.id,
        featured: true,
        inStock: true,
        order: 1,
      },
      {
        name: 'عباية رسمية كحلي',
        description: 'عباية رسمية أنيقة باللون الكحلي مع لمسات فضية. تصميم راقي ومميز.',
        priceYER: 55000,
        images: JSON.stringify(['/products/abaya-navy.png', '/products/abaya-formal.png']),
        categoryId: formalAbayas!.id,
        featured: false,
        inStock: true,
        order: 2,
      },
      {
        name: 'عباية يومية بيج',
        description: 'عباية يومية مريحة باللون البيج مناسبة للاستخدام اليومي. قماش ناعم وخفيف.',
        priceYER: 25000,
        images: JSON.stringify(['/products/abaya-daily.png', '/products/abaya-embroidered.png']),
        categoryId: dailyAbayas!.id,
        featured: false,
        inStock: true,
        order: 1,
      },
      {
        name: 'عباية مطرزة بالزهور',
        description: 'عباية مطرزة يدوياً بزهور ملونة وتصميم عصري. فنية يدوية فريدة.',
        priceYER: 75000,
        images: JSON.stringify(['/products/abaya-embroidered.png', '/products/abaya-daily.png', '/products/abaya-formal.png']),
        categoryId: embroideredAbayas!.id,
        featured: true,
        inStock: true,
        order: 1,
      },
      {
        name: 'طرحة حرير بيضاء',
        description: 'طرحة من الحرير الطبيعي باللون الأبيض ناعمة وخفيفة. جودة فاخرة.',
        priceYER: 12000,
        images: JSON.stringify(['/products/hijab-silk.png', '/products/hijab-cotton.png']),
        categoryId: hijabStyles!.id,
        featured: false,
        inStock: true,
        order: 1,
      },
      {
        name: 'طرحة قطنية مزخرفة',
        description: 'طرحة قطنية مزخرفة بنقشات عصرية. مريحة وأنيقة.',
        priceYER: 8000,
        images: JSON.stringify(['/products/hijab-cotton.png', '/products/hijab-silk.png', '/products/shawl-wool.png']),
        categoryId: hijabStyles!.id,
        featured: false,
        inStock: true,
        order: 2,
      },
      {
        name: 'شال صوف فاخر',
        description: 'شال من الصوف الفاخر دافئ وأنيق. مثالي للإطلالات الشتوية.',
        priceYER: 18000,
        images: JSON.stringify(['/products/shawl-wool.png', '/products/hijab-cotton.png']),
        categoryId: shawls!.id,
        featured: false,
        inStock: true,
        order: 1,
      },
      {
        name: 'حقيبة يد جلدية سوداء',
        description: 'حقيبة يد أنيقة من الجلد الطبيعي باللون الأسود مع تفاصيل ذهبية.',
        priceYER: 45000,
        images: JSON.stringify(['/products/handbag-black.png', '/products/shoulder-bag.png']),
        categoryId: handBags!.id,
        featured: true,
        inStock: true,
        order: 1,
      },
      {
        name: 'حقيبة كتف بنية',
        description: 'حقيبة كتف عصرية باللون البني مع تفاصيل ذهبية. جلد طبيعي فاخر.',
        priceYER: 38000,
        images: JSON.stringify(['/products/shoulder-bag.png', '/products/handbag-black.png']),
        categoryId: shoulderBags!.id,
        featured: false,
        inStock: true,
        order: 1,
      },
      {
        name: 'أسورة ذهبية أنيقة',
        description: 'أسورة ذهبية أنيقة بتصميم عصري. مطلية بالذهب عيار 18.',
        priceYER: 22000,
        images: JSON.stringify(['/products/bracelet-gold.png', '/products/necklace-crystal.png']),
        categoryId: bracelets!.id,
        featured: false,
        inStock: true,
        order: 1,
      },
      {
        name: 'خاتم ذهب مع حجر كريم',
        description: 'خاتم ذهبي أنيق مع حجر كريم أصلي. تصميم فاخر ومميز.',
        priceYER: 28000,
        images: JSON.stringify(['/products/ring-gold.png', '/products/bracelet-gold.png']),
        categoryId: rings!.id,
        featured: false,
        inStock: true,
        order: 1,
      },
      {
        name: 'قلادة كريستال راقية',
        description: 'قلادة كريستال راقية بتصميم ملكي. قطعة فنية فريدة من ريام فاشن.',
        priceYER: 30000,
        images: JSON.stringify(['/products/necklace-crystal.png', '/products/bracelet-gold.png', '/products/ring-gold.png']),
        categoryId: necklaces!.id,
        featured: true,
        inStock: true,
        order: 1,
      },
    ];

    await db.product.createMany({ data: productsData });

    // Create default currency rates
    await db.currencyRate.upsert({
      where: { code: 'YER' },
      update: { rateToYER: 1, name: 'ريال يمني', symbol: 'ر.ي' },
      create: { code: 'YER', name: 'ريال يمني', rateToYER: 1, symbol: 'ر.ي' },
    });
    await db.currencyRate.upsert({
      where: { code: 'SAR' },
      update: { rateToYER: 265, name: 'ريال سعودي', symbol: 'ر.س' },
      create: { code: 'SAR', name: 'ريال سعودي', rateToYER: 265, symbol: 'ر.س' },
    });
    await db.currencyRate.upsert({
      where: { code: 'USD' },
      update: { rateToYER: 997, name: 'دولار أمريكي', symbol: '$' },
      create: { code: 'USD', name: 'دولار أمريكي', rateToYER: 997, symbol: '$' },
    });

    // Create sample FAQs
    await db.fAQ.createMany({
      data: [
        { question: 'كيف يمكنني طلب منتج؟', answer: 'يمكنك تصفح المنتجات وإضافتها إلى السلة ثم إتمام الطلب عبر ملء بياناتك والتأكيد. سنتواصل معك لتأكيد الطلب.', order: 1, active: true },
        { question: 'ما هي طرق الدفع المتاحة؟', answer: 'نوفر الدفع عند الاستلام في جميع المحافظات اليمنية. كما نوفر خيار التحويل البنكي للطلبات الخاصة.', order: 2, active: true },
        { question: 'كم تستغرق مدة التوصيل؟', answer: 'التوصيل داخل صنعاء يستغرق 1-2 يوم عمل. أما المحافظات الأخرى فتستغرق 3-5 أيام عمل.', order: 3, active: true },
        { question: 'هل يمكنني استبدال أو إرجاع منتج؟', answer: 'نعم، يمكنك استبدال أو إرجاع المنتج خلال 3 أيام من الاستلام بشرط أن يكون بحالته الأصلية. تواصل معنا عبر الواتساب.', order: 4, active: true },
        { question: 'هل المنتجات أصلية؟', answer: 'جميع منتجات ريام فاشن أصلية 100% ومضمونة الجودة. نحرص على اختيار أجود الخامات والتصاميم.', order: 5, active: true },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'تم تهيئة قاعدة البيانات بنجاح',
      stats: { categories: 5, subcategories: 14, products: productsData.length, currencies: 3, faqs: 5 },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في تهيئة قاعدة البيانات', details: String(error) },
      { status: 500 }
    );
  }
}
