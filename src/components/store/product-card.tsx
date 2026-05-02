'use client';

import { Heart, ShoppingCart, Plus, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/store/use-store';
import { trackAddToCart, trackAddToWishlist } from '@/components/seo/meta-pixel';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { PRODUCT_CARD, BRAND } from '@/lib/text';
import type { Product } from '@/types';

const NO_IMAGE_GRADIENT = 'from-deep-accent via-[#3A3A34] to-deep-accent';

export function ProductCard({ product }: { product: Product }) {
  const { toggleFavorite, isFavorite, addToCart, formatPrice, selectProduct, setView } = useStore();
  const { toast } = useToast();
  const favorited = isFavorite(product.id);
  const hasImage = product.images && product.images.length > 0;
  const isNew = new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => { selectProduct(product.id); };
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    trackAddToCart({ contentIds: [product.id], contentName: product.name, value: product.priceYER, currency: 'YER' });
    toast({
      title: "✅ تمت الإضافة للسلة",
      description: product.name,
      action: (
        <ToastAction altText="عرض السلة" onClick={(e) => { e.stopPropagation(); setView('cart'); }}>
          إتمام الطلب
        </ToastAction>
      ),
    });
  };
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wasFavorite = isFavorite(product.id);
    toggleFavorite(product.id);
    if (!wasFavorite) trackAddToWishlist({ contentIds: [product.id], contentName: product.name, value: product.priceYER, currency: 'YER' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="product-card sage-shimmer-border group cursor-pointer rounded-lg border border-sage/6 bg-card overflow-hidden"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        {hasImage ? (
          <img src={product.images[0]} alt={`${product.name} - ${BRAND.storeLabel} ${BRAND.nameAr}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${NO_IMAGE_GRADIENT} flex items-center justify-center relative`}>
            <div className="absolute inset-0 opacity-[0.06]">
              <div className="absolute top-4 right-4 w-14 h-14 border border-white/15 rounded-full" />
              <div className="absolute bottom-4 left-4 w-10 h-10 border border-white/10 rounded-full" />
            </div>
            <span className="text-white/20 text-6xl font-bold select-none drop-shadow-lg">{product.name.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center quick-view-indicator">
            <div className="glass-dark px-4 py-2 rounded-sm flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-white/80" />
              <span className="text-white/80 text-xs font-medium">{PRODUCT_CARD.quickView}</span>
            </div>
          </div>
        )}
        <button onClick={handleToggleFavorite} className="absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-black/40 hover:scale-110 border border-white/8" aria-label={favorited ? PRODUCT_CARD.removeFavorite : PRODUCT_CARD.addFavorite}>
          <Heart className={`w-4 h-4 transition-colors ${favorited ? 'fill-terracotta text-terracotta' : 'text-white/70'}`} />
        </button>
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1">
          {isNew && <Badge className="bg-terracotta text-white border-0 text-[9px] px-2 font-bold rounded-sm shadow-sm">{PRODUCT_CARD.newBadge}</Badge>}
          {!product.inStock && <Badge className="bg-deep-accent/75 text-white/70 border-0 text-[9px] px-2 rounded-sm">{PRODUCT_CARD.outOfStock}</Badge>}
          {product.featured && product.inStock && !isNew && <Badge className="bg-deep-accent/75 text-sage border border-sage/20 text-[9px] px-2 font-bold rounded-sm">{PRODUCT_CARD.featuredBadge}</Badge>}
        </div>
        {product.inStock && (
          <div className="absolute bottom-0 inset-x-0 p-2.5 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1.5 group-hover:translate-y-0">
            <Button onClick={handleAddToCart} size="sm" className="w-full bg-terracotta/90 text-white hover:bg-terracotta font-bold rounded-sm text-[11px] gap-1 h-8 backdrop-blur-sm shine-btn">
              <ShoppingCart className="w-3 h-3" />
              {PRODUCT_CARD.addToCart}
            </Button>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-semibold text-xs line-clamp-2 text-foreground leading-relaxed min-h-[2.2rem] group-hover:text-sage transition-colors duration-300">{product.name}</h3>
        {Array.isArray(product.tags) && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="soft-tag text-[9px] px-1.5 py-0.5">{tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-sage font-bold text-sm price-premium">{formatPrice(product.priceYER)}</span>
          {product.inStock && (
            <Button variant="ghost" size="icon" onClick={handleAddToCart} className="h-7 w-7 rounded-full hover:bg-sage hover:text-white transition-colors duration-300" aria-label={PRODUCT_CARD.addToCart}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
