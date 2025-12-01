"use client";

import React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

/**
 * SkeletonText - Skeleton pour blocs de texte
 *
 * Features:
 * - Largeurs variables pour réalisme
 * - Variants : title, paragraph, caption
 * - Nombre de lignes configurable
 * - Espacement automatique
 *
 * @example
 * ```tsx
 * <SkeletonText variant="title" />
 * <SkeletonText variant="paragraph" lines={3} />
 * <SkeletonText variant="caption" lines={2} />
 * ```
 */

export interface SkeletonTextProps {
  /** Variant de texte */
  variant?: "title" | "paragraph" | "caption";

  /** Nombre de lignes */
  lines?: number;

  /** Classes CSS additionnelles */
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  variant = "paragraph",
  lines = 3,
  className,
}) => {
  // Configuration par variant
  const variantConfig = {
    title: {
      heights: [28, 24],
      widths: ["75%", "60%"],
      spacing: "space-y-2",
    },
    paragraph: {
      heights: [16],
      widths: ["100%", "95%", "90%", "85%", "80%"],
      spacing: "space-y-2",
    },
    caption: {
      heights: [14],
      widths: ["60%", "55%", "50%"],
      spacing: "space-y-1.5",
    },
  };

  const config = variantConfig[variant];

  // Génère les lignes avec largeurs variables
  const renderLines = () => {
    const lineElements = [];
    for (let i = 0; i < lines; i++) {
      const heightIndex = i % config.heights.length;
      const widthIndex = i % config.widths.length;
      const height = config.heights[heightIndex];
      const width = config.widths[widthIndex];

      lineElements.push(
        <Skeleton
          key={i}
          variant="custom"
          height={height}
          width={width}
          borderRadius={4}
        />
      );
    }
    return lineElements;
  };

  return (
    <div className={cn(config.spacing, className)} role="status" aria-label="Chargement...">
      {renderLines()}
    </div>
  );
};

SkeletonText.displayName = "SkeletonText";
