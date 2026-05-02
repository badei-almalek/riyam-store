'use client';

import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { CATEGORIES, ARIA } from '@/lib/text';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getTotalProductCount(category: any): number {
  let count = category.productCount || 0;
  if (category.children?.length > 0) {
    for (const child of category.children) {
      count += child.productCount || 0;
    }
  }
  return count;
}

interface CategoriesSectionProps {
  categories: any[];
  onSelectCategory: (id: string) => void;
}

// ─── Animation variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function CategoriesSection({ categories, onSelectCategory }: CategoriesSectionProps) {
  return (
    <section id="categories-section" className="container mx-auto px-4 sm:px-8 py-10 sm:py-16" aria-label={ARIA.categoriesSection}>
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <span className="text-sage/50 text-[10px] font-semibold tracking-[0.25em] uppercase">{CATEGORIES.sectionLabel}</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{CATEGORIES.sectionTitle}</h2>
        <div className="sage-line mt-4" />
      </div>

      {/* Categories Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category: any) => {
          const count = getTotalProductCount(category);
          const hasImage = category.image;

          return (
            <motion.button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              variants={itemVariants}
              className="group flex flex-col items-center justify-center aspect-square rounded-2xl border border-sage/8 bg-card p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:shadow-sage/8 hover:border-sage/20"
              aria-label={`${category.name} - ${count} ${CATEGORIES.productCount}`}
            >
              {/* Circular Image with Sage Ring */}
              <div className="relative w-20 h-20 sm:w-[100px] sm:h-[100px] mb-3 sm:mb-4">
                {/* Border ring */}
                <div className="absolute inset-0 rounded-full border-2 border-sage/15 group-hover:border-sage/35 transition-colors duration-500" />
                {/* Image container */}
                <div className="absolute inset-1 rounded-full overflow-hidden transition-transform duration-500 group-hover:scale-105">
                  {hasImage ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-sage/5">
                      <FolderOpen className="w-8 h-8 sm:w-9 sm:h-9 text-sage/25" />
                    </div>
                  )}
                </div>
              </div>

              {/* Category Name */}
              <h3 className="font-bold text-sm text-foreground text-center leading-tight">
                {category.name}
              </h3>

              {/* Product Count Badge */}
              {count > 0 && (
                <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-sage/6 text-muted-foreground text-[10px] sm:text-xs font-medium transition-colors duration-300 group-hover:bg-sage/10">
                  {count} {CATEGORIES.productCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
