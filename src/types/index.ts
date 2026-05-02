export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceYER: number;
  images: string[];
  categoryId: string;
  category?: Category;
  featured: boolean;
  inStock: boolean;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  order: number;
  parentId: string | null;
  parent?: Category;
  children?: Category[];
  products?: Product[];
  productCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalYER: number;
  currency: string;
  customerName: string;
  customerPhone: string;
  customerCity: string | null;
  customerNotes: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  priceYER: number;
  image: string;
}

export interface CurrencyRate {
  id: string;
  code: string;
  name: string;
  rateToYER: number;
  symbol: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CurrencyCode = 'YER' | 'SAR' | 'USD';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  allProducts: boolean;
  productIds: string; // JSON string array
  categoryIds: string; // JSON string array
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type StoreView = 
  | 'home' 
  | 'category' 
  | 'product' 
  | 'cart' 
  | 'favorites' 
  | 'orders'
  | 'search'
  | 'faq';

export interface StoreState {
  // Navigation
  currentView: StoreView;
  selectedCategoryId: string | null;
  selectedProductId: string | null;
  searchQuery: string;
  
  // Cart
  cart: CartItem[];
  
  // Coupon
  appliedCoupon: Coupon | null;
  discountAmount: number;
  
  // Favorites
  favorites: string[]; // product IDs
  
  // Currency
  selectedCurrency: CurrencyCode;
  currencyRates: CurrencyRate[];
  
  // Orders (local history)
  orderHistory: Order[];
  
  // Actions
  setView: (view: StoreView) => void;
  selectCategory: (id: string) => void;
  selectProduct: (id: string) => void;
  setSearchQuery: (query: string) => void;
  
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  
  setCurrency: (currency: CurrencyCode) => void;
  setCurrencyRates: (rates: CurrencyRate[]) => void;
  
  addOrder: (order: Order) => void;
  
  // Helpers
  getCartTotal: () => number;
  getDiscountedTotal: () => number;
  getCartItemCount: () => number;
  formatPrice: (priceYER: number) => string;
  convertPrice: (priceYER: number, toCurrency: CurrencyCode) => number;
}
