'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowRight, Heart, ShoppingCart, Plus, Minus, Share2, Package, Crown, Shield, Truck, RotateCcw,
  X, ChevronLeft, ChevronRight, Clock, ZoomIn, Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useStore } from '@/store/use-store';
import { trackAddToCart, trackViewContent } from '@/components/seo/meta-pixel';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { ProductOgTags } from '@/components/seo/product-og-tags';
import { PRODUCT_VIEW, PRODUCT_CARD, NAV, LIGHTBOX, QUANTITY } from '@/lib/text';
import { ProductCard } from './product-card';
import type { Product } from '@/types';

const NO_IMAGE_GRADIENT = 'from-deep-accent via-[#3A3A34] to-deep-accent';

export function ProductView() {
  const { selectedProductId, selectCategory, addToCart, toggleFavorite, isFavorite, formatPrice, setView } = useStore();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${selectedProductId}`);
        const data = await res.json();
        setProduct(data.product || null);

        if (data.product) {
          trackViewContent({
            contentIds: [data.product.id],
            contentName: data.product.name,
            value: data.product.priceYER,
            currency: 'YER',
          });
        }

        if (data.product?.categoryId) {
          const relRes = await fetch(`/api/products?categoryId=${data.product.categoryId}`);
          const relData = await relRes.json();
          setRelatedProducts((relData.products || []).filter((p: Product) => p.id !== selectedProductId));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    if (selectedProductId) {
      fetchProduct();
      setQuantity(1);
      setAddedToCart(false);
      setSelectedImageIndex(0);
    }
  }, [selectedProductId]);

  const handleAddToCart = useCallback(() => {
    if (product) {
      addToCart(product, quantity);
      trackAddToCart({
        contentIds: [product.id],
        contentName: product.name,
        value: product.priceYER * quantity,
        currency: 'YER',
      });
      setAddedToCart(true);
      toast({
        title: "✅ تمت الإضافة للسلة",
        description: `${quantity} × ${product.name}`,
        action: (
          <ToastAction altText="عرض السلة" onClick={() => setView('cart')}>
            إتمام الطلب
          </ToastAction>
        ),
      });
      setTimeout(() => setAddedToCart(false), 2000);
    }
  }, [product, quantity, addToCart, toast, setView]);

  const handleToggleFavorite = useCallback(() => {
    if (selectedProductId) toggleFavorite(selectedProductId);
  }, [selectedProductId, toggleFavorite]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const lightboxPrev = useCallback(() => {
    if (!product?.images) return;
    setLightboxIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  }, [product?.images]);

  const lightboxNext = useCallback(() => {
    if (!product?.images) return;
    setLightboxIndex((prev) => (prev + 1) % product.images.length);
  }, [product?.images]);

  // Handle Escape key in lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') lightboxPrev(); // RTL: right arrow = previous
      if (e.key === 'ArrowLeft') lightboxNext();  // RTL: left arrow = next
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, lightboxPrev, lightboxNext]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-8 py-6 space-y-5">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-[3/4] rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="text-4xl mb-3">😕</div>
        <h3 className="text-base font-semibold mb-2">{PRODUCT_VIEW.productNotFound}</h3>
        <Button onClick={() => setView('home')} className="rounded-sm bg-terracotta text-white hover:bg-terracotta-dark text-sm">{PRODUCT_VIEW.backToHome}</Button>
      </div>
    );
  }

  const favorited = isFavorite(product.id);
  const hasImage = product.images && product.images.length > 0;
  const isNew = new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  // Deterministic random numbers for scarcity and social proof based on product id
  const scarcityCount = (product.id.charCodeAt(0) % 4) + 2; // 2 to 5
  const viewersCount = (product.id.charCodeAt(product.id.length - 1) % 15) + 6; // 6 to 20

  return (
    <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-6 space-y-8">
      {/* JSON-LD */}
      <ProductJsonLd
        id={product.id} name={product.name} description={product.description || ''}
        image={product.images || []} priceYER={product.priceYER}
        categoryName={product.category?.name || ''}
        categorySlug={product.category?.slug || ''} inStock={product.inStock}
        url={`https://riyamfashion.com/?product=${product.id}`}
      />
      {/* Product Open Graph Tags for Facebook/Instagram */}
      <ProductOgTags
        id={product.id}
        name={product.name}
        description={product.description || ''}
        images={product.images || []}
        priceYER={product.priceYER}
        categoryId={product.categoryId}
        inStock={product.inStock}
      />
      <BreadcrumbJsonLd
        items={[
          { name: NAV.home, url: 'https://riyamfashion.com' },
          ...(product.category ? [{ name: product.category.name, url: `https://riyamfashion.com/category/${product.category.slug || product.categoryId}` }] : []),
          { name: product.name, url: `https://riyamfashion.com/product/${product.id}` },
        ]}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-light">
        <button onClick={() => setView('home')} className="hover:text-sage transition-colors">{NAV.home}</button>
        <ArrowRight className="w-3 h-3" />
        {product.category && (
          <>
            <button onClick={() => selectCategory(product.categoryId)} className="hover:text-sage transition-colors">{product.category.name}</button>
            <ArrowRight className="w-3 h-3" />
          </>
        )}
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </div>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        {/* Image Gallery */}
        <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }} className="space-y-3">
          <div
            className={`relative aspect-[3/4] rounded-lg overflow-hidden border border-sage/8 bg-card ${hasImage ? 'cursor-zoom-in' : ''}`}
            onClick={() => hasImage && openLightbox(selectedImageIndex)}
          >
            {hasImage ? (
              <>
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={`${product.name} - ${PRODUCT_VIEW.imageLabel} ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {/* Zoom icon overlay on hover */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100 pointer-events-none">
                  <div className="bg-black/40 backdrop-blur-sm rounded-full p-3">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
              </>
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${NO_IMAGE_GRADIENT} flex items-center justify-center`}>
                <span className="text-white/20 text-8xl font-bold select-none">{product.name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              {isNew && <Badge className="bg-terracotta text-white border-0 font-bold rounded-sm text-xs">{PRODUCT_CARD.newBadge}</Badge>}
              {!product.inStock && <Badge className="bg-deep-accent/75 text-white/70 border-0 rounded-sm text-xs">{PRODUCT_VIEW.notAvailable}</Badge>}
              {product.featured && product.inStock && !isNew && <Badge className="bg-deep-accent/75 text-sage border border-sage/20 font-bold rounded-sm text-xs">{PRODUCT_CARD.featuredBadge}</Badge>}
            </div>
            {/* Image navigation dots */}
            {hasImage && product.images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === selectedImageIndex ? 'bg-white w-5' : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`${PRODUCT_VIEW.imageLabel} ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Thumbnail strip */}
          {hasImage && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`shrink-0 w-16 h-20 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                    idx === selectedImageIndex ? 'border-sage shadow-sm shadow-sage/20' : 'border-sage/10 opacity-60 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt={`${product.name} - ${PRODUCT_VIEW.imageLabel} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-5">
          {product.category && (
            <span className="text-sage text-xs font-medium tracking-wide uppercase">{product.category.name}</span>
          )}
          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, i) => (
                <span key={i} className="soft-tag text-[10px] px-2 py-0.5">{tag}</span>
              ))}
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-sage">{formatPrice(product.priceYER)}</span>
          </div>

          <div className="sage-line-wide" />

          {/* Social Proof & Scarcity */}
          {product.inStock && (
            <div className="flex flex-col gap-2 py-1">
              <div className="flex items-center gap-2 text-sm text-terracotta font-medium bg-terracotta/5 border border-terracotta/10 px-3 py-2 rounded-md w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
                </span>
                🔥 متبقي {scarcityCount} قطع فقط - اطلبي الآن!
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Eye className="w-3.5 h-3.5" />
                <span>{viewersCount} أشخاص يشاهدون هذا المنتج حالياً</span>
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-1.5 text-sm">
                <Package className="w-3.5 h-3.5 text-sage" />
                {PRODUCT_VIEW.description}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-xs font-light">{product.description}</p>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 py-1">
            {[
              { icon: Truck, label: PRODUCT_VIEW.fastDelivery },
              { icon: Shield, label: PRODUCT_VIEW.qualityGuarantee },
              { icon: RotateCcw, label: PRODUCT_VIEW.easyReturn },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-1 py-1.5">
                <item.icon className="w-3.5 h-3.5 text-sage/50" />
                <span className="text-[10px] text-muted-foreground font-light">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Estimated Delivery */}
          <div className="flex items-center gap-2 py-1.5 px-3 rounded-sm bg-sage/5 border border-sage/8">
            <Clock className="w-3.5 h-3.5 text-sage/60 shrink-0" />
            <span className="text-[11px] text-muted-foreground font-light">{PRODUCT_VIEW.estimatedDelivery} <span className="font-medium text-foreground">{PRODUCT_VIEW.deliveryTime}</span></span>
          </div>

          <div className="sage-line-wide" />

          {product.inStock ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground">{PRODUCT_VIEW.quantity}</span>
                <div className="flex items-center border border-sage/15 rounded-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-sage/5 transition-colors active:bg-sage/10" aria-label={QUANTITY.decrease}>
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-sage/5 transition-colors active:bg-sage/10" aria-label={QUANTITY.increase}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5">
                <Button
                  size="lg"
                  className={`flex-1 rounded-sm text-sm h-12 sm:h-11 gap-1.5 transition-all font-bold shine-btn ${
                    addedToCart ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : 'bg-terracotta hover:bg-terracotta-dark text-white'
                  }`}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {addedToCart ? PRODUCT_VIEW.addedToCart : PRODUCT_VIEW.addToCart}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`rounded-sm h-12 sm:h-11 w-12 sm:w-11 border-sage/15 ${favorited ? 'border-sage bg-sage/8 text-sage' : 'hover:bg-sage/5'}`}
                  onClick={handleToggleFavorite}
                  aria-label={favorited ? PRODUCT_CARD.removeFavorite : PRODUCT_CARD.addFavorite}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'fill-terracotta text-terracotta' : ''}`} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary/40 border border-sage/8 rounded-sm p-4 text-center">
              <p className="text-muted-foreground font-medium text-sm">{PRODUCT_VIEW.notInStock}</p>
            </div>
          )}

          <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5 hover:text-sage text-xs" onClick={() => {
            if (navigator.share) {
              navigator.share({ title: product.name, text: product.description || '', url: window.location.href });
            }
          }}>
            <Share2 className="w-3.5 h-3.5" />
            {PRODUCT_VIEW.share}
          </Button>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-2">
          <div className="sage-line-wide" />
          <div className="text-center">
            <span className="text-sage/50 text-[10px] font-semibold tracking-[0.2em] uppercase">{PRODUCT_VIEW.relatedLabel}</span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1">{PRODUCT_VIEW.relatedSection}</h2>
            <p className="text-muted-foreground text-xs font-light mt-1">{PRODUCT_VIEW.relatedDesc}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.slice(0, 4).map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}

      {/* Image Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="fixed inset-0 z-50 max-w-none w-full h-full bg-black/95 border-0 rounded-none p-0 translate-x-0 translate-y-0 top-0 left-0 sm:max-w-none [&>button]:hidden"
          showCloseButton={false}
          onPointerDownOutside={closeLightbox}
        >
          <DialogTitle className="sr-only">{product.name} - {LIGHTBOX.viewPhotos}</DialogTitle>
          <DialogDescription className="sr-only">{LIGHTBOX.viewPhotos}</DialogDescription>

          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 left-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            aria-label={LIGHTBOX.close}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Image counter */}
          {hasImage && product.images.length > 1 && (
            <div className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/80 text-xs font-medium">
              {lightboxIndex + 1} / {product.images.length}
            </div>
          )}

          {/* Main lightbox image */}
          <div className="w-full h-full flex items-center justify-center p-4 sm:p-8" onClick={closeLightbox}>
            <AnimatePresence mode="wait">
              <motion.img
                key={lightboxIndex}
                src={product.images?.[lightboxIndex] || ''}
                alt={`${product.name} - ${PRODUCT_VIEW.imageLabel} ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </div>

          {/* Navigation arrows */}
          {hasImage && product.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                aria-label={LIGHTBOX.nextImage}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                aria-label={LIGHTBOX.prevImage}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </>
          )}

          {/* Lightbox thumbnails */}
          {hasImage && product.images.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex items-center justify-center gap-2 z-10 px-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2 overflow-x-auto max-w-full py-2 px-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`shrink-0 w-12 h-16 sm:w-14 sm:h-18 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                      idx === lightboxIndex ? 'border-white/80 shadow-sm shadow-white/20' : 'border-white/15 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt={`${product.name} - ${PRODUCT_VIEW.imageLabel} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
