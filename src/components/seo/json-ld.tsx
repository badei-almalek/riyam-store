import { BRAND, NAV, SEO } from '@/lib/text';

const STORE_URL = BRAND.url;
const STORE_LOGO = `${STORE_URL}/full-logo.png`;

interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${STORE_URL}/#organization`,
    name: SEO.storeFullName,
    alternateName: [BRAND.nameEn, 'Riyam Fashion Store'],
    url: STORE_URL,
    logo: {
      '@type': 'ImageObject',
      url: STORE_LOGO,
      width: 572,
      height: 251,
    },
    description: BRAND.seoDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: BRAND.whatsappNumber,
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
      areaServed: {
        '@type': 'Country',
        name: 'Yemen',
      },
    },
    sameAs: [
      BRAND.whatsappUrl,
      BRAND.instagramUrl,
      BRAND.facebookUrl,
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'YE',
      addressLocality: 'Yemen',
    },
    foundingDate: '2024',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 10,
    },
  };

  return <JsonLdScript data={data} />;
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${STORE_URL}/#website`,
    name: SEO.storeFullName,
    alternateName: BRAND.nameEn,
    url: STORE_URL,
    description: BRAND.seoDescription,
    inLanguage: 'ar-YE',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${STORE_URL}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@id': `${STORE_URL}/#organization`,
    },
  };

  return <JsonLdScript data={data} />;
}

export function StoreJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ClothingStore'],
    '@id': `${STORE_URL}/#store`,
    name: SEO.storeFullName,
    alternateName: BRAND.nameEn,
    description: BRAND.seoDescription,
    url: STORE_URL,
    logo: STORE_LOGO,
    image: `${STORE_URL}/hero-banner.png`,
    telephone: BRAND.whatsappNumber,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'YE',
      addressLocality: 'Yemen',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    priceRange: '$$',
    currenciesAccepted: 'YER SAR USD',
    paymentAccepted: 'Cash',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: SEO.offerCatalogName,
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: SEO.dressesCatalog,
          description: SEO.dressesDesc,
        },
        {
          '@type': 'OfferCatalog',
          name: SEO.abayasCatalog,
          description: SEO.abayasDesc,
        },
        {
          '@type': 'OfferCatalog',
          name: SEO.hijabsCatalog,
          description: SEO.hijabsDesc,
        },
      ],
    },
    sameAs: [
      BRAND.whatsappUrl,
      BRAND.instagramUrl,
      BRAND.facebookUrl,
    ],
  };

  return <JsonLdScript data={data} />;
}

interface ProductJsonLdProps {
  id: string;
  name: string;
  description: string;
  image: string[];
  priceYER: number;
  categoryName: string;
  categorySlug: string;
  inStock: boolean;
  url?: string;
  tags?: string[];
}

export function ProductJsonLd({
  id,
  name,
  description,
  image,
  priceYER,
  categoryName,
  inStock,
  url,
  tags,
}: ProductJsonLdProps) {
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  // Ensure image URLs are fully qualified
  const fullImageUrls = (image.length > 0 ? image : [`${STORE_URL}/hero-banner.png`]).map(
    (img) => (img.startsWith('http') ? img : `${STORE_URL}${img.startsWith('/') ? '' : '/'}${img}`)
  );

  const enhancedDescription = description || `${name} - ${BRAND.seoDescription}`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${STORE_URL}/product/${id}`,
    name,
    description: enhancedDescription,
    image: fullImageUrls,
    sku: id,
    url: url || `${STORE_URL}/?product=${id}`,
    brand: {
      '@type': 'Brand',
      name: SEO.storeFullName,
    },
    category: categoryName,
    keywords: tags?.join(', ') || categoryName,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'YER',
      price: priceYER,
      priceValidUntil: priceValidUntil.toISOString().split('T')[0],
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: url || `${STORE_URL}/?product=${id}`,
      seller: {
        '@type': 'Organization',
        '@id': `${STORE_URL}/#organization`,
        name: SEO.storeFullName,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 2,
        returnMethod: 'https://schema.org/ReturnInStore',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'YE',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 2,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 2,
            maxValue: 5,
            unitCode: 'DAY',
          },
        },
      },
    },
  };

  return <JsonLdScript data={data} />;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLdScript data={data} />;
}

/** FAQ Page structured data for rich snippets */
export function FaqPageJsonLd({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLdScript data={data} />;
}
