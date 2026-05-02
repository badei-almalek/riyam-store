'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreState, CartItem, Product, CurrencyCode, Order, CurrencyRate } from '@/types';
import { CURRENCY_SHORT } from '@/lib/text';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentView: 'home',
      selectedCategoryId: null,
      selectedProductId: null,
      searchQuery: '',
      
      // Cart
      cart: [],
      
      // Coupon
      appliedCoupon: null,
      discountAmount: 0,
      
      // Favorites
      favorites: [],
      
      // Currency
      selectedCurrency: 'YER',
      currencyRates: [],
      
      // Orders
      orderHistory: [],
      
      // Navigation actions
      setView: (view) => set({ currentView: view, searchQuery: '' }),
      selectCategory: (id) => set({ selectedCategoryId: id, currentView: 'category' }),
      selectProduct: (id) => set({ selectedProductId: id, currentView: 'product' }),
      setSearchQuery: (query) => set({ searchQuery: query, currentView: query ? 'search' : 'home' }),
      
      // Cart actions
      addToCart: (product: Product, quantity = 1) => {
        const { cart } = get();
        const existing = cart.find(item => item.product.id === product.id);
        if (existing) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ cart: [...cart, { product, quantity }] });
        }
      },
      
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter(item => item.product.id !== productId) });
      },
      
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set({
            cart: get().cart.map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
        }
        // Recalculate discount if a coupon is applied
        const { appliedCoupon } = get();
        if (appliedCoupon) {
          get().applyCoupon(appliedCoupon); // re-trigger discount calculation
        }
      },
      
      clearCart: () => set({ cart: [], appliedCoupon: null, discountAmount: 0 }),
      
      // Coupon actions
      applyCoupon: (coupon) => {
        const { getCartTotal } = get();
        const total = getCartTotal();
        let discount = 0;
        
        if (coupon.type === 'percentage') {
          discount = total * (coupon.value / 100);
        } else {
          discount = coupon.value;
        }
        
        // Ensure discount doesn't exceed total
        if (discount > total) discount = total;
        
        set({ appliedCoupon: coupon, discountAmount: discount });
      },
      
      removeCoupon: () => set({ appliedCoupon: null, discountAmount: 0 }),
      
      // Favorites actions
      toggleFavorite: (productId) => {
        const { favorites } = get();
        if (favorites.includes(productId)) {
          set({ favorites: favorites.filter(id => id !== productId) });
        } else {
          set({ favorites: [...favorites, productId] });
        }
      },
      
      isFavorite: (productId) => get().favorites.includes(productId),
      
      // Currency actions
      setCurrency: (currency) => set({ selectedCurrency: currency }),
      setCurrencyRates: (rates) => set({ currencyRates: rates }),
      
      // Order actions
      addOrder: (order) => set({ orderHistory: [order, ...get().orderHistory] }),
      
      // Convert price from YER to target currency
      convertPrice: (priceYER: number, toCurrency: CurrencyCode): number => {
        if (toCurrency === 'YER') return priceYER;
        const { currencyRates } = get();
        const rate = currencyRates.find(r => r.code === toCurrency);
        if (!rate || rate.rateToYER === 0) return priceYER;
        return priceYER / rate.rateToYER;
      },
      
      // Helpers
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce(
          (total, item) => total + item.product.priceYER * item.quantity,
          0
        );
      },
      
      getDiscountedTotal: () => {
        const { getCartTotal, discountAmount } = get();
        return Math.max(0, getCartTotal() - discountAmount);
      },
      
      getCartItemCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
      
      formatPrice: (priceYER: number): string => {
        const { selectedCurrency, currencyRates } = get();
        if (selectedCurrency === 'YER') {
          return `${priceYER.toLocaleString('ar-YE')} ${CURRENCY_SHORT.YER}`;
        }
        const rate = currencyRates.find(r => r.code === selectedCurrency);
        if (!rate || rate.rateToYER === 0) {
          return `${priceYER.toLocaleString('ar-YE')} ${CURRENCY_SHORT.YER}`;
        }
        const converted = priceYER / rate.rateToYER;
        if (selectedCurrency === 'USD') {
          return `${converted.toFixed(2)} ${CURRENCY_SHORT.USD}`;
        }
        if (selectedCurrency === 'SAR') {
          return `${converted.toFixed(2)} ${CURRENCY_SHORT.SAR}`;
        }
        return `${converted.toFixed(2)} ${rate.symbol}`;
      },
    }),
    {
      name: 'riyam-fashion-store',
      partialize: (state) => ({
        cart: state.cart,
        appliedCoupon: state.appliedCoupon,
        discountAmount: state.discountAmount,
        favorites: state.favorites,
        selectedCurrency: state.selectedCurrency,
        orderHistory: state.orderHistory,
      }),
    }
  )
);
