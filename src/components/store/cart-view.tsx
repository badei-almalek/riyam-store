'use client';

import { useState, useEffect } from 'react';
import {
  Trash2, Plus, Minus, ShoppingBag, MessageCircle, CheckCircle, User, Phone, MapPin, FileText, Crown, Ticket, Loader2, X, Truck, Shield, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useStore } from '@/store/use-store';
import { trackPurchase, trackInitiateCheckout } from '@/components/seo/meta-pixel';
import { CART, CURRENCY, CURRENCY_SHORT, BRAND, CART_MESSAGE, QUANTITY } from '@/lib/text';
import { ProductCard } from './product-card';
import type { CurrencyCode, OrderItem, Product } from '@/types';

const NO_IMAGE_GRADIENT = 'from-deep-accent via-[#3A3A34] to-deep-accent';

export function CartView() {
  const {
    cart, removeFromCart, updateCartQuantity, clearCart, formatPrice, getCartTotal,
    selectedCurrency, setCurrency, addOrder, selectProduct, setView, convertPrice,
    appliedCoupon, applyCoupon, removeCoupon, discountAmount, getDiscountedTotal
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  
  const [couponCode, setCouponCode] = useState('');
  const [verifyingCoupon, setVerifyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');

  const totalYER = getCartTotal();
  const finalTotalYER = getDiscountedTotal();

  const FREE_SHIPPING_THRESHOLD = 50000;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - finalTotalYER);
  const progressPercentage = Math.min(100, (finalTotalYER / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    if (cart.length > 0) {
      trackInitiateCheckout({
        contentIds: cart.map(item => item.product.id),
        value: totalYER,
        currency: 'YER',
        numItems: cart.reduce((sum, item) => sum + item.quantity, 0),
      });
    }
  }, []);

  // Fetch featured products for empty cart recommendations
  useEffect(() => {
    if (cart.length === 0) {
      async function fetchFeatured() {
        try {
          const res = await fetch('/api/products?featured=true&limit=4');
          const data = await res.json();
          setFeaturedProducts(data.products || []);
        } catch (error) {
          console.error('Error fetching featured products:', error);
        }
      }
      fetchFeatured();
    }
  }, [cart.length]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim()) newErrors.name = CART.nameRequired;
    if (!customerPhone.trim()) newErrors.phone = CART.phoneRequired;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const numberedEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

  const buildWhatsAppMessage = (): string => {
    const currencyLabels: Record<CurrencyCode, string> = CURRENCY_SHORT;
    const currencyLabel = currencyLabels[selectedCurrency];
    let totalPrice = 0;
    const productsList = cart.map((item, index) => {
      const priceInCurrency = convertPrice(item.product.priceYER * item.quantity, selectedCurrency);
      totalPrice += priceInCurrency;
      const emoji = numberedEmojis[index] || `${index + 1}.`;
      return `${emoji} ${item.product.name} × ${item.quantity} - ${priceInCurrency.toLocaleString('ar-YE')} ${currencyLabel}`;
    }).join('\n');

    let totalString = `💰 ${CART.total}: ${formatPrice(totalYER)}`;
    if (appliedCoupon) {
      totalString += `\n🏷️ خصم (${appliedCoupon.code}): -${formatPrice(discountAmount)}\n💎 الإجمالي النهائي: ${formatPrice(finalTotalYER)}`;
    }

    return `🛍️ ${CART_MESSAGE.newOrder} - ${BRAND.storeLabel} ${BRAND.nameAr}
━━━━━━━━━━━━━━━━━━
📋 ${CART_MESSAGE.name}: ${customerName}
📱 ${CART_MESSAGE.phone}: ${customerPhone}
🏙️ ${CART_MESSAGE.city}: ${customerCity || '-'}

📦 ${CART_MESSAGE.products}:
${productsList}

${totalString}
━━━━━━━━━━━━━━━━━━
📝 ${CART_MESSAGE.notes}: ${customerNotes || '-'}`;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setVerifyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), cartTotal: totalYER }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      applyCoupon(data.coupon);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message || 'كوبون غير صالح');
    } finally {
      setVerifyingCoupon(false);
    }
  };

  const submitOrderToAPI = async () => {
    const orderItems: OrderItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      priceYER: item.product.priceYER,
      image: item.product.images?.[0] || '',
    }));

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: orderItems,
        currency: selectedCurrency,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerCity: customerCity.trim() || null,
        customerNotes: customerNotes.trim() || null,
        couponId: appliedCoupon?.id || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || CART_MESSAGE.orderError);
    }

    const data = await res.json();

    addOrder({
      id: data.order?.id || Date.now().toString(),
      items: orderItems,
      totalYER,
      currency: selectedCurrency,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerCity: customerCity.trim() || null,
      customerNotes: customerNotes.trim() || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    trackPurchase({
      contentIds: orderItems.map(item => item.productId),
      value: finalTotalYER,
      currency: 'YER',
      numItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    });

    return data;
  };

  const handleConfirmOrder = async () => {
    if (!validate()) return;
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      await submitOrderToAPI();
      setOrderSuccess(true);
      setTimeout(() => {
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
        setCustomerCity('');
        setCustomerNotes('');
        setErrors({});
        setOrderSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(CART_MESSAGE.orderError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppOrder = async () => {
    if (!validate()) return;
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const message = buildWhatsAppMessage();
      await submitOrderToAPI();
      window.open(`${BRAND.whatsappUrl}?text=${encodeURIComponent(message)}`, '_blank');
      setOrderSuccess(true);
      setTimeout(() => {
        clearCart();
        setCustomerName('');
        setCustomerPhone('');
        setCustomerCity('');
        setCustomerNotes('');
        setErrors({});
        setOrderSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert(CART_MESSAGE.orderError);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-16 space-y-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-xs mx-auto space-y-4 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-secondary border border-sage/8 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-sage/30" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{CART.emptyTitle}</h2>
          <p className="text-muted-foreground text-xs font-light">{CART.emptyDesc}</p>
          <Button onClick={() => setView('home')} className="rounded-sm px-6 bg-terracotta text-white hover:bg-terracotta-dark font-bold text-sm shine-btn">
            {CART.browseProducts}
          </Button>
        </motion.div>

        {/* Featured product recommendations for empty cart */}
        {featuredProducts.length > 0 && (
          <div className="space-y-5">
            <div className="text-center">
              <span className="text-sage/50 text-[10px] font-semibold tracking-[0.2em] uppercase">{CART.popularPicksLabel}</span>
              <h3 className="text-base sm:text-lg font-bold text-foreground mt-1">{CART.popularPicks}</h3>
              <p className="text-muted-foreground text-[11px] font-light mt-0.5">{CART.popularPicksDesc}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in container mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sage text-[10px] font-semibold tracking-[0.2em] uppercase">{CART.sectionLabel}</span>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mt-0.5">{CART.title}</h1>
          <p className="text-muted-foreground text-xs mt-0.5 font-light">{cart.length} {CART.productsAndItems} • {cart.reduce((sum, item) => sum + item.quantity, 0)} {CART.piecesCount}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/5 rounded-sm text-xs" onClick={clearCart}>
          <Trash2 className="w-3.5 h-3.5 ml-1" />
          {CART.clearCart}
        </Button>
      </div>

      {/* Free Shipping Progress Bar */}
      <div className="bg-sage/5 border border-sage/10 rounded-lg p-3 sm:p-4 text-center">
        {amountToFreeShipping > 0 ? (
          <p className="text-sm font-medium text-foreground mb-2">
            أضف بـ <span className="text-terracotta font-bold">{formatPrice(amountToFreeShipping)}</span> إضافية للحصول على <span className="font-bold">شحن مجاني!</span> 🚚
          </p>
        ) : (
          <p className="text-sm font-bold text-emerald-600 mb-2">
            🎉 مبروك! لقد حصلت على شحن مجاني! 🚚
          </p>
        )}
        <div className="w-full bg-sage/10 rounded-full h-2.5 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className={`h-2.5 rounded-full ${amountToFreeShipping > 0 ? 'bg-sage' : 'bg-emerald-500'}`} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {cart.map((item) => {
              const hasImage = item.product.images && item.product.images.length > 0;

              return (
                <motion.div
                  key={item.product.id}
                  layout
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  className="flex gap-3 p-3 rounded-lg border border-sage/6 bg-card hover:border-sage/12 transition-colors"
                >
                  {/* Product Image */}
                  <button onClick={() => selectProduct(item.product.id)} className="shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-lg overflow-hidden border border-sage/4">
                    {hasImage ? (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${NO_IMAGE_GRADIENT} flex items-center justify-center`}>
                        <span className="text-white/50 text-xl font-bold">{item.product.name.charAt(0)}</span>
                      </div>
                    )}
                  </button>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => selectProduct(item.product.id)} className="font-semibold text-xs sm:text-sm text-foreground line-clamp-2 hover:text-sage transition-colors text-right">
                        {item.product.name}
                      </button>
                      <button onClick={() => removeFromCart(item.product.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-0.5" aria-label={CART.deleteItem}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-sage font-bold text-xs sm:text-sm">
                      {formatPrice(item.product.priceYER)}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-sage/10 rounded-sm">
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-sage/5 transition-colors" aria-label={QUANTITY.decrease}>
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-sage/5 transition-colors" aria-label={QUANTITY.increase}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-foreground">
                        {formatPrice(item.product.priceYER * item.quantity)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="rounded-lg border border-sage/8 bg-card p-4 space-y-3">
            <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-sage" />
              {CART.orderSummary}
            </h2>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-light">{CART.productsCount}</span>
                <span className="font-medium">{cart.length} {CART.productsAndItems} • {cart.reduce((sum, item) => sum + item.quantity, 0)} {CART.piecesCount}</span>
              </div>
              <div className="sage-line-wide" />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-light">{CART.currency}</span>
                <Select value={selectedCurrency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                  <SelectTrigger className="w-auto border-0 h-6 text-[11px] gap-1 px-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YER">{CURRENCY.YER}</SelectItem>
                    <SelectItem value="SAR">{CURRENCY.SAR}</SelectItem>
                    <SelectItem value="USD">{CURRENCY.USD}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sage-line-wide" />
              <div className="flex justify-between">
                <span className="font-semibold text-foreground">{CART.total}</span>
                <span className={appliedCoupon ? 'line-through text-muted-foreground' : 'font-bold text-lg text-sage'}>{formatPrice(totalYER)}</span>
              </div>
              
              {appliedCoupon && (
                <>
                  <div className="flex justify-between items-center text-green-600">
                    <span className="font-medium flex items-center gap-1">
                      <Ticket className="w-3 h-3" />
                      خصم الكوبون ({appliedCoupon.code})
                    </span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                  <div className="sage-line-wide" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">الإجمالي النهائي</span>
                    <span className="font-bold text-lg text-sage">{formatPrice(finalTotalYER)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Coupon Input */}
            <div className="pt-2">
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="رمز الكوبون" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-9 text-xs"
                    />
                    <Button 
                      variant="secondary" 
                      className="h-9 text-xs font-semibold px-4"
                      onClick={handleApplyCoupon}
                      disabled={verifyingCoupon || !couponCode.trim()}
                    >
                      {verifyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : 'تطبيق'}
                    </Button>
                  </div>
                  {couponError && <p className="text-destructive text-[10px]">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between bg-sage/5 border border-sage/10 rounded-md p-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-sage" />
                    <span className="text-xs font-semibold text-sage-dark">{appliedCoupon.code}</span>
                  </div>
                  <button onClick={removeCoupon} className="text-muted-foreground hover:text-destructive p-1 rounded-full transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-lg border border-sage/8 bg-card p-4 space-y-3">
            <h2 className="font-bold text-sm text-foreground">{CART.customerInfo}</h2>
            <div className="space-y-2.5">
              <div>
                <div className="relative">
                  <User className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage/40" />
                  <Input
                    placeholder={CART.fullName}
                    value={customerName}
                    onChange={(e) => { setCustomerName(e.target.value); if (errors.name) setErrors({ ...errors, name: '' }); }}
                    className="pr-8 rounded-sm border-sage/8 focus-visible:border-sage/25 text-xs h-9"
                  />
                </div>
                {errors.name && <p className="text-destructive text-[10px] mt-0.5">{errors.name}</p>}
              </div>
              <div>
                <div className="relative">
                  <Phone className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage/40" />
                  <Input
                    type="tel"
                    placeholder={CART.phone}
                    value={customerPhone}
                    onChange={(e) => { setCustomerPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                    className="pr-8 rounded-sm border-sage/8 focus-visible:border-sage/25 text-xs h-9"
                    dir="ltr"
                  />
                </div>
                {errors.phone && <p className="text-destructive text-[10px] mt-0.5">{errors.phone}</p>}
              </div>
              <div className="relative">
                <MapPin className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage/40" />
                <Input placeholder={CART.city} value={customerCity} onChange={(e) => setCustomerCity(e.target.value)} className="pr-8 rounded-sm border-sage/8 focus-visible:border-sage/25 text-xs h-9" />
              </div>
              <div className="relative">
                <FileText className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-sage/40" />
                <Textarea placeholder={CART.notes} value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} className="pr-8 min-h-[70px] rounded-sm border-sage/8 focus-visible:border-sage/25 text-xs" />
              </div>
            </div>

            {orderSuccess ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-sm bg-sage/10 text-sage font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                {CART.orderSuccess}
              </div>
            ) : (
              <div className="space-y-2.5">
                <Button
                  size="lg"
                  className="w-full rounded-sm h-11 text-sm gap-2 bg-sage hover:bg-sage-dark text-white font-bold shine-btn"
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                >
                  <CheckCircle className="w-4 h-4" />
                  {submitting ? CART.submitting : CART.confirmOrder}
                </Button>
                <Button
                  size="lg"
                  className="w-full rounded-sm h-11 text-sm gap-2 bg-green-600 hover:bg-green-700 text-white font-bold shine-btn"
                  onClick={handleWhatsAppOrder}
                  disabled={submitting}
                >
                  <MessageCircle className="w-4 h-4" />
                  {submitting ? CART.submitting : CART.orderViaWhatsApp}
                </Button>
              </div>
            )}

            {/* Trust Signals */}
            <div className="pt-4 mt-2 border-t border-sage/10 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground font-light">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-sage/70" />
                <span>دفع آمن</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-sage/70" />
                <span>توصيل سريع</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-sage/70" />
                <span>إرجاع مجاني</span>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center font-light pt-2">{CART.redirectNote}</p>
          </div>
        </div>
      </div>

      {/* Upselling Section */}
      {featuredProducts.length > 0 && (
        <div className="pt-8 space-y-5">
          <div className="sage-line-wide" />
          <div className="text-center mt-4">
            <h3 className="text-lg font-bold text-foreground">قد يعجبك أيضاً</h3>
            <p className="text-muted-foreground text-xs font-light mt-0.5">أكمل إطلالتك مع هذه القطع المميزة</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
