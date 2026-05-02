/**
 * Centralized text constants for the Riyam Fashion store.
 * Edit all customer-facing Arabic text here for easy maintenance.
 */

// ─── Brand ───────────────────────────────────────────────────────────────────
export const BRAND = {
  nameAr: 'ريام فاشن',
  nameEn: 'Riyam Fashion',
  tagline: 'حيث تلتقي الأناقة بالفخامة',
  description: 'متجر ريام فاشن - وجهتك الأولى للموضة والأناقة في اليمن',
  seoDescription: 'متجر ريام فاشن - وجهتك الأولى للموضة والأناقة في اليمن. ملابس نسائية، عبايات، حجابات، حقائب، وإكسسوارات بأفضل الأسعار. تسوقي الآن مع توصيل لجميع المحافظات!',
  phone: '+967 785 050 114',
  whatsappNumber: '967785050114',
  whatsappUrl: 'https://wa.me/967785050114',
  country: 'اليمن',
  year: new Date().getFullYear(),
  logoAlt: 'ريام فاشن',
  logoAltFull: 'ريام فاشن - Riyam Fashion',
  storeLabel: 'متجر',
  url: 'https://riyamfashion.com',
  instagramUrl: 'https://instagram.com/riyamfashion',
  facebookUrl: 'https://facebook.com/riyamfashion',
} as const;

// ─── Navigation ──────────────────────────────────────────────────────────────
export const NAV = {
  home: 'الرئيسية',
  favorites: 'المفضلة',
  orders: 'الطلبات',
  cart: 'السلة',
  faq: 'الأسئلة الشائعة',
  search: 'البحث',
  category: 'التصنيفات',
  product: 'المنتج',
  cartFull: 'سلة التسوق',
} as const;

// ─── Search ──────────────────────────────────────────────────────────────────
export const SEARCH = {
  placeholder: 'ابحثي عن منتج...',
  closeSearch: 'إغلاق البحث',
  noResults: 'لا توجد نتائج',
  noResultsDesc: 'لم نتمكن من العثور على منتجات تطابق',
  tryDifferent: 'جربي البحث بكلمات مختلفة.',
  resultsFound: 'تم العثور على',
  resultFor: 'نتيجة لـ',
  searchProducts: 'ابحثي عن منتجات',
  searchDiscovery: 'اكتشفي فساتين، عبايات، حجابات والمزيد',
  popularSearches: 'عمليات بحث شائعة',
  popularSearchTerms: ['فساتين', 'عبايات', 'حجابات', 'سهرة', 'إكسسوارات', 'حقائب'],
  backToHome: 'العودة للرئيسية',
} as const;

// ─── Hero Section ────────────────────────────────────────────────────────────
export const HERO = {
  badge: 'مجموعة 2025 الحصرية',
  title: 'ريام فاشن',
  subtitle: 'حيث تلتقي الأناقة بالفخامة',
  subtitleExtra: 'اكتشفي أرقى تشكيلات الموضة النسائية المصممة خصيصاً لكِ',
  shopNow: 'تسوقي الآن',
  newCollection: 'المجموعة الجديدة',
  heroAlt: 'Riyam Fashion - متجر ريام فاشن للأزياء النسائية',
} as const;

// ─── Trust Badges ────────────────────────────────────────────────────────────
export const TRUST_BADGES = [
  { label: 'توصيل سريع', sub: 'لجميع المحافظات' },
  { label: 'ضمان الجودة', sub: 'منتجات أصلية' },
  { label: 'استبدال سهل', sub: 'خلال 48 ساعة' },
  { label: 'خدمة مميزة', sub: 'دعم متواصل' },
] as const;

// ─── Categories ──────────────────────────────────────────────────────────────
export const CATEGORIES = {
  sectionTitle: 'تصفحي الفئات',
  sectionLabel: 'COLLECTIONS',
  productCount: 'منتج',
  explore: 'استكشفي',
} as const;

// ─── New Arrivals ────────────────────────────────────────────────────────────
export const NEW_ARRIVALS = {
  title: 'وصل حديثاً',
} as const;

// ─── Featured Products ───────────────────────────────────────────────────────
export const FEATURED = {
  sectionLabel: 'CURATED',
  sectionTitle: 'منتجات مميزة',
  sectionDesc: 'مختارة بعناية لذوقك الرفيع',
  viewAll: 'عرض الكل',
  empty: 'لا توجد منتجات مميزة حالياً',
} as const;

// ─── Why Riyam Section ───────────────────────────────────────────────────────
export const WHY_RIYAM = {
  sectionLabel: 'WHY RIYAM',
  sectionTitle: 'لماذا ريام فاشن؟',
  description:
    'في متجر ريام فاشن، نؤمن بأن كل امرأة تستحق أن تبدو بأفضل إطلالة. نقدم لك تشكيلة حصرية من الأزياء النسائية الفاخرة المصممة بأجود الخامات.',
  stats: [
    { value: '+500', label: 'عميلة سعيدة' },
    { value: '+100', label: 'منتج حصري' },
    { value: '24/7', label: 'خدمة متواصلة' },
  ],
} as const;

// ─── WhatsApp CTA ────────────────────────────────────────────────────────────
export const WHATSAPP_CTA = {
  title: 'تواصلي معنا عبر واتساب',
  description: 'لاستفساراتكم وطلباتكم الخاصة، فريقنا جاهز لخدمتكم على مدار الساعة',
  button: 'تواصلي الآن',
  sidebarButton: 'تواصلي عبر واتساب',
  floatingLabel: 'تواصلي عبر واتساب',
} as const;

// ─── Product Card ────────────────────────────────────────────────────────────
export const PRODUCT_CARD = {
  newBadge: 'جديد',
  outOfStock: 'نفذ',
  featuredBadge: 'مميز',
  addToCart: 'أضف للسلة',
  quickView: 'عرض سريع',
  addFavorite: 'إضافة للمفضلة',
  removeFavorite: 'إزالة من المفضلة',
} as const;

// ─── Product View ────────────────────────────────────────────────────────────
export const PRODUCT_VIEW = {
  notAvailable: 'غير متوفر',
  description: 'وصف المنتج',
  quantity: 'الكمية:',
  addToCart: 'أضف للسلة',
  addedToCart: 'تمت الإضافة ✓',
  notInStock: 'هذا المنتج غير متوفر حالياً',
  share: 'مشاركة المنتج',
  estimatedDelivery: 'التوصيل المتوقع:',
  deliveryTime: '2-5 أيام عمل',
  relatedSection: 'قد يعجبك أيضاً',
  relatedLabel: 'YOU MAY ALSO LIKE',
  relatedDesc: 'تشكيلات مختارة تناسب ذوقك الرفيع',
  productNotFound: 'المنتج غير موجود',
  backToHome: 'العودة للرئيسية',
  fastDelivery: 'توصيل سريع',
  qualityGuarantee: 'ضمان الجودة',
  easyReturn: 'استبدال سهل',
  imageLabel: 'صورة',
} as const;

// ─── Cart ────────────────────────────────────────────────────────────────────
export const CART = {
  title: 'سلة التسوق',
  sectionLabel: 'SHOPPING BAG',
  itemCount: 'منتج في السلة',
  piecesCount: 'قطعة',
  productsAndItems: 'منتج',
  confirmOrder: 'تأكيد الطلب',
  orderViaWhatsApp: 'طلب عبر واتساب',
  orderSuccess: 'تم تأكيد طلبك بنجاح! ✓',
  emptyTitle: 'سلة التسوق فارغة',
  emptyDesc: 'لم تقومي بإضافة أي منتجات بعد',
  clearCart: 'تفريغ السلة',
  browseProducts: 'تصفحي المنتجات',
  orderSummary: 'ملخص الطلب',
  productsCount: 'عدد المنتجات',
  currency: 'العملة',
  total: 'الإجمالي',
  customerInfo: 'بيانات الطلب',
  fullName: 'الاسم الكامل *',
  phone: 'رقم الهاتف *',
  city: 'المدينة (اختياري)',
  notes: 'ملاحظات إضافية (اختياري)',
  nameRequired: 'الاسم مطلوب',
  phoneRequired: 'رقم الهاتف مطلوب',
  submitOrder: 'إرسال الطلب عبر واتساب',
  submitting: 'جاري الإرسال...',
  redirectNote: 'سيتم تحويلك إلى واتساب لإكمال الطلب',
  popularPicks: 'قد يعجبك أيضاً',
  popularPicksLabel: 'POPULAR PICKS',
  popularPicksDesc: 'منتجات مميزة اختارتها عملاؤنا',
  deleteItem: 'حذف',
} as const;

// ─── Favorites ───────────────────────────────────────────────────────────────
export const FAVORITES = {
  title: 'المفضلة',
  sectionLabel: 'WISHLIST',
  itemCount: 'منتج مفضل',
  emptyTitle: 'لا توجد منتجات مفضلة',
  emptyDesc: 'لم تقومي بإضافة أي منتجات للمفضلة بعد',
  browseProducts: 'تصفحي المنتجات',
} as const;

// ─── Orders ──────────────────────────────────────────────────────────────────
export const ORDERS = {
  title: 'طلباتي',
  sectionLabel: 'ORDERS',
  itemCount: 'طلب',
  piecesCount: 'قطعة',
  emptyTitle: 'لا توجد طلبات سابقة',
  emptyDesc: 'لم تقومي بأي طلبات بعد. تصفحي المنتجات وابدئي التسوق!',
  browseProducts: 'تصفحي المنتجات',
  orderNumber: 'طلب',
  productCount: 'منتج',
  status: {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    shipped: 'قيد الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  },
} as const;

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const FAQ = {
  title: 'الأسئلة الشائعة',
  sectionLabel: 'FAQ',
  description: 'إجابات على الأسئلة الأكثر شيوعاً حول متجر ريام فاشن وخدماتنا',
  emptyTitle: 'لا توجد أسئلة شائعة',
  emptyDesc: 'لم يتم إضافة أسئلة شائعة بعد. تواصلي معنا مباشرة لأي استفسار.',
  stillHaveQuestion: 'لم تجدي إجابة لسؤالك؟',
  contactWhatsApp: 'تواصلي معنا عبر واتساب',
} as const;

// ─── Footer ──────────────────────────────────────────────────────────────────
export const FOOTER = {
  brandDesc: 'وجهتك الأولى للأناقة والفخامة. نقدم لك أرقى المنتجات النسائية المصممة بأجود الخامات وأحدث الصيحات.',
  quickLinks: 'روابط سريعة',
  contactUs: 'تواصل معنا',
  aboutStore: 'عن المتجر',
  aboutDesc: 'متجر ريام فاشن متخصص في تقديم أرقى الملابس النسائية والعبايات والحجابات والإكسسوارات. نوفر منتجات فاخرة بأسعار تنافسية مع خدمة توصيل مميزة.',
  myOrders: 'طلباتي',
  copyright: 'متجر ريام فاشن. جميع الحقوق محفوظة.',
  madeInPrefix: 'صُنع بـ',
  available247: 'متاح 24/7',
  whatsapp: 'واتساب',
  instagram: 'إنستغرام',
  facebook: 'فيسبوك',
} as const;

// ─── Dark Mode ───────────────────────────────────────────────────────────────
export const THEME = {
  lightMode: 'الوضع الفاتح',
  darkMode: 'الوضع الداكن',
} as const;

// ─── Currency Labels ─────────────────────────────────────────────────────────
export const CURRENCY = {
  YER: 'ر.ي يمني',
  SAR: 'ر.س سعودي',
  USD: '$ دولار',
} as const;

// ─── Short Currency Labels (for WhatsApp messages etc.) ────────────────────────
export const CURRENCY_SHORT = {
  YER: 'ر.ي',
  SAR: 'ر.س',
  USD: '$',
} as const;

// ─── Aria Labels ─────────────────────────────────────────────────────────────
export const ARIA = {
  homeButton: 'الرئيسية - ريام فاشن',
  searchInput: 'البحث عن منتج',
  searchButton: 'البحث',
  currencySelect: 'اختيار العملة',
  cartButton: 'السلة',
  favoritesButton: 'المفضلة',
  ordersButton: 'الطلبات',
  faqButton: 'الأسئلة الشائعة',
  menuButton: 'القائمة',
  backToTop: 'العودة للأعلى',
  heroSection: 'القسم الرئيسي',
  trustBadges: 'مميزات المتجر',
  categoriesSection: 'تصفحي الفئات',
  featuredSection: 'منتجات مميزة',
  whyRiyam: 'لماذا ريام فاشن',
  whatsappSection: 'تواصلي معنا',
  mainNav: 'التنقل الرئيسي',
} as const;

// ─── Category View ───────────────────────────────────────────────────────────
export const CATEGORY_VIEW = {
  collectionLabel: 'COLLECTION',
  allProducts: 'الكل',
  noProducts: 'لا توجد منتجات',
  noProductsDesc: 'لم يتم إضافة منتجات في هذه الفئة بعد',
  categoryFallback: 'الفئة',
  productsFallback: 'المنتجات',
} as const;

// ─── Cart Order Message ──────────────────────────────────────────────────────
export const CART_MESSAGE = {
  newOrder: 'طلب جديد',
  name: 'الاسم',
  phone: 'الهاتف',
  city: 'المدينة',
  products: 'المنتجات',
  notes: 'ملاحظات',
  orderError: 'حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.',
} as const;

// ─── Product View Lightbox ───────────────────────────────────────────────────
export const LIGHTBOX = {
  close: 'إغلاق',
  nextImage: 'الصورة التالية',
  prevImage: 'الصورة السابقة',
  viewPhotos: 'عرض صور المنتج بشكل مكبر',
} as const;

// ─── Quantity Controls ───────────────────────────────────────────────────────
export const QUANTITY = {
  decrease: 'تقليل',
  increase: 'زيادة',
} as const;

// ─── SEO Structured Data ─────────────────────────────────────────────────────
export const SEO = {
  offerCatalogName: 'تشكيلة الملابس النسائية',
  dressesCatalog: 'فساتين',
  dressesDesc: 'تشكيلة فساتين نسائية راقية',
  abayasCatalog: 'عبايات',
  abayasDesc: 'عبايات مطرزة وأنيقة',
  hijabsCatalog: 'حجابات',
  hijabsDesc: 'حجابات وطرحات أنيقة',
  womenFashion: 'ملابس نسائية',
  luxuryFashion: 'أزياء نسائية فاخرة',
  storeFullName: 'متجر ريام فاشن',
  fashionStoreYemen: 'متجر الأزياء النسائية في اليمن',
} as const;
