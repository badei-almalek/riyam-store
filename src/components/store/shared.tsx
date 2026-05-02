'use client';

// ─── Shared types ────────────────────────────────────────────────────────────
export interface InitialData {
  categories: any[];
  featuredProducts: any[];
  currencies: any[];
}

// ─── Shared components ───────────────────────────────────────────────────────
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-sage border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function SectionDivider() {
  return (
    <div className="luxury-divider" aria-hidden="true">
      <div className="luxury-divider-diamond" />
    </div>
  );
}
