"use client";

import React from "react";
import ReactSkeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { cn } from "@/lib/utils";

/**
 * Skeleton - Wrapper pour react-loading-skeleton avec theming cohérent
 *
 * Features:
 * - Theming automatique (light/dark mode)
 * - Variants prédéfinis (text, title, avatar, button, input)
 * - Props pass-through vers react-loading-skeleton
 * - Animation shimmer
 *
 * @example
 * ```tsx
 * <Skeleton variant="title" />
 * <Skeleton variant="text" count={3} />
 * <Skeleton variant="avatar" circle />
 * <Skeleton width={200} height={40} />
 * ```
 */

export interface SkeletonProps {
  /** Variant prédéfini */
  variant?: "text" | "title" | "avatar" | "button" | "input" | "custom";

  /** Nombre de lignes */
  count?: number;

  /** Largeur (px ou %) */
  width?: string | number;

  /** Hauteur (px ou %) */
  height?: string | number;

  /** Border radius */
  borderRadius?: string | number;

  /** Skeleton circulaire */
  circle?: boolean;

  /** Classes CSS additionnelles */
  className?: string;

  /** Inline (pas de line break après) */
  inline?: boolean;

  /** Container className pour wrapper */
  containerClassName?: string;

  /** Durée de l'animation (secondes) */
  duration?: number;

  /** Activer/désactiver l'animation */
  enableAnimation?: boolean;
}

const variantConfig = {
  text: {
    height: 16,
    borderRadius: 4,
  },
  title: {
    height: 28,
    borderRadius: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    circle: true,
  },
  button: {
    height: 40,
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderRadius: 6,
  },
  custom: {},
};

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  (
    {
      variant = "text",
      count,
      width,
      height,
      borderRadius,
      circle,
      className,
      inline,
      containerClassName,
      duration = 1.5,
      enableAnimation = true,
    },
    ref
  ) => {
    const config = variantConfig[variant];

    // Merge variant config with explicit props (explicit props take priority)
    const finalWidth = width ?? config.width;
    const finalHeight = height ?? config.height;
    const finalBorderRadius = borderRadius ?? config.borderRadius;
    const finalCircle = circle ?? config.circle ?? false;

    return (
      <span ref={ref}>
        <ReactSkeleton
          count={count}
          width={finalWidth}
          height={finalHeight}
          borderRadius={finalBorderRadius}
          circle={finalCircle}
          inline={inline}
          containerClassName={cn(containerClassName, className)}
          duration={duration}
          enableAnimation={enableAnimation}
        />
      </span>
    );
  }
);

Skeleton.displayName = "Skeleton";

/**
 * SkeletonProvider - Provider pour theming global des skeletons
 *
 * @example
 * ```tsx
 * <SkeletonProvider>
 *   <Skeleton variant="text" count={5} />
 * </SkeletonProvider>
 * ```
 */

export interface SkeletonProviderProps {
  children: React.ReactNode;
  baseColor?: string;
  highlightColor?: string;
}

export const SkeletonProvider: React.FC<SkeletonProviderProps> = ({
  children,
  baseColor,
  highlightColor,
}) => {
  // Couleurs par défaut (light/dark mode)
  // Ces valeurs fonctionnent bien avec Tailwind
  const defaultBaseColor = baseColor || undefined; // Utilise les valeurs par défaut de react-loading-skeleton
  const defaultHighlightColor = highlightColor || undefined;

  return (
    <SkeletonTheme
      baseColor={defaultBaseColor}
      highlightColor={defaultHighlightColor}
    >
      {children}
    </SkeletonTheme>
  );
};
