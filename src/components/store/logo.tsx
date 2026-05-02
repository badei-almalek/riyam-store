'use client';

import Image from 'next/image';
import { BRAND } from '@/lib/text';

interface LogoProps {
  /** Size variant */
  variant?: 'icon' | 'header' | 'footer' | 'hero';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const SIZE_MAP = {
  icon: { width: 28, height: 28, className: 'w-7 h-7 sm:w-8 sm:h-8' },
  header: { width: 120, height: 53, className: 'h-8 sm:h-10' },
  footer: { width: 140, height: 61, className: 'h-10 sm:h-12' },
  hero: { width: 260, height: 114, className: 'h-24 sm:h-32' },
} as const;

/**
 * Riyam Fashion logo component.
 * Uses the official logo image with proper sizing.
 * In dark mode, applies CSS filter to make the logo visible on dark backgrounds.
 */
export function Logo({ variant = 'header', className, onClick }: LogoProps) {
  const size = SIZE_MAP[variant];

  // For icon variant, use the small logo icon
  if (variant === 'icon') {
    return (
      <div
        className={`rounded-sm bg-deep-accent flex items-center justify-center border border-sage/20 group-hover:border-sage/40 transition-colors duration-300 ${size.className} ${className || ''}`}
        onClick={onClick}
      >
        <Image
          src="/logo-icon.png"
          alt={BRAND.logoAlt}
          width={size.width}
          height={size.height}
          className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${size.className} ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      {/* Full logo - visible in both light and dark mode */}
      {/* In dark mode, CSS filter inverts colors so logo remains visible */}
      <Image
        src="/full-logo.png"
        alt={BRAND.logoAltFull}
        width={size.width}
        height={size.height}
        className="h-full w-auto object-contain dark:[filter:brightness(0)_invert(1)]"
        priority={variant === 'header' || variant === 'hero'}
      />
    </div>
  );
}

/**
 * Logo for use on dark accent backgrounds (hero, footer, etc.)
 * Always shows the light/inverted version regardless of theme.
 */
export function LogoOnDark({ variant = 'footer', className, onClick }: LogoProps) {
  const size = SIZE_MAP[variant];

  return (
    <div
      className={`relative ${size.className} ${className || ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <Image
        src="/full-logo.png"
        alt={BRAND.logoAltFull}
        width={size.width}
        height={size.height}
        className="h-full w-auto object-contain [filter:brightness(0)_invert(1)]"
        priority
      />
    </div>
  );
}
