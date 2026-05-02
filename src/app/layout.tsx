import type { Metadata, Viewport } from "next";
import { Cairo, Amiri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import MetaPixel from "@/components/seo/meta-pixel";
import { ThemeProvider } from "@/components/theme-provider";
import { BRAND, SEO } from "@/lib/text";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const SITE_URL = BRAND.url;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#B2AC88" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A18" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SEO.storeFullName} | ${BRAND.nameEn} - ${SEO.luxuryFashion} في ${BRAND.country}`,
    template: `%s | ${SEO.storeFullName}`,
  },
  description: BRAND.seoDescription,
  keywords: [
    // Arabic keywords - high priority for local SEO
    "ريام فاشن",
    "متجر ملابس نسائية",
    "موضة نسائية اليمن",
    "أناقة",
    "ملابس نسائية",
    "عبايات",
    "حجابات",
    "حقائب نسائية",
    "إكسسوارات نسائية",
    "تسوق أونلاين اليمن",
    "اليمن",
    "فساتين",
    "أزياء نسائية",
    "عبايات مطرزة",
    "طرحات",
    "شالات",
    "فساتين سهرة",
    "ملابس نسائية صنعاء",
    "متجر أزياء اليمن",
    "تسوقي اونلاين",
    "عبايات اليمن",
    "حجابات أنيقة",
    // English keywords - for international discovery
    "Riyam Fashion",
    "women fashion Yemen",
    "abayas Yemen",
    "hijab fashion",
    "dresses",
    "designer bags",
    "fashion store Yemen",
    "Arabian fashion",
    "Islamic fashion",
    "modest fashion",
    "women clothing Yemen",
    "online shopping Yemen",
  ],
  authors: [{ name: SEO.storeFullName, url: SITE_URL }],
  creator: SEO.storeFullName,
  publisher: SEO.storeFullName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo-icon.png", type: "image/png", sizes: "248x251" },
      { url: "/full-logo.png", type: "image/png", sizes: "572x251" },
    ],
    apple: "/logo-icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "ar_YE",
    url: SITE_URL,
    siteName: SEO.storeFullName,
    title: `${SEO.storeFullName} | ${BRAND.nameEn} - ${SEO.luxuryFashion} في ${BRAND.country}`,
    description: BRAND.seoDescription,
    images: [
      {
        url: "/hero-banner.png",
        width: 1200,
        height: 630,
        alt: `${SEO.storeFullName} - ${SEO.fashionStoreYemen}`,
      },
    ],
  } as Record<string, unknown>,
  twitter: {
    card: "summary_large_image",
    title: `${SEO.storeFullName} | ${BRAND.nameEn}`,
    description: BRAND.seoDescription,
    images: ["/hero-banner.png"],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ar-YE": SITE_URL,
    },
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": SEO.storeFullName,
    "mobile-web-app-capable": "yes",
    "format-detection": "telephone=no",
    language: "ar",
    direction: "rtl",
    "og:locale": "ar_YE",
    "product:availability": "in stock",
    "product:condition": "new",
    "product:brand": SEO.storeFullName,
    "product:retailer": SEO.storeFullName,
    // Facebook product catalog integration
    "product:price:currency": "YER",
  },
  category: "shopping",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <MetaPixel />
      </head>
      <body className={`${cairo.variable} ${amiri.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
