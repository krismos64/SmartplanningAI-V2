"use client";

import React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

/**
 * SkeletonCard - Skeleton pour composant Card
 *
 * Features:
 * - Simule : image + title + description + footer
 * - Options : withImage, withActions, lines
 * - Layout responsive
 * - Espacement cohérent
 *
 * @example
 * ```tsx
 * <SkeletonCard />
 * <SkeletonCard withImage={false} lines={2} />
 * <SkeletonCard withActions lines={4} />
 * ```
 */

export interface SkeletonCardProps {
  /** Afficher le skeleton d'image */
  withImage?: boolean;

  /** Afficher le skeleton d'actions (footer) */
  withActions?: boolean;

  /** Nombre de lignes de description */
  lines?: number;

  /** Classes CSS additionnelles */
  className?: string;

  /** Orientation de la card */
  orientation?: "vertical" | "horizontal";
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  withImage = true,
  withActions = false,
  lines = 3,
  orientation = "vertical",
  className,
}) => {
  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          "flex gap-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4",
          "bg-white dark:bg-gray-900",
          className
        )}
        role="status"
        aria-label="Chargement de la carte..."
      >
        {/* Image (gauche) */}
        {withImage && (
          <div className="flex-shrink-0">
            <Skeleton variant="custom" width={120} height={120} borderRadius={8} />
          </div>
        )}

        {/* Contenu (droite) */}
        <div className="flex-1 space-y-3">
          {/* Titre */}
          <Skeleton variant="title" width="60%" />

          {/* Description */}
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
              <Skeleton
                key={i}
                variant="text"
                width={i === lines - 1 ? "80%" : "100%"}
              />
            ))}
          </div>

          {/* Actions (footer) */}
          {withActions && (
            <div className="flex gap-2 pt-2">
              <Skeleton variant="button" width={100} />
              <Skeleton variant="button" width={80} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vertical orientation (défaut)
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden",
        "bg-white dark:bg-gray-900",
        className
      )}
      role="status"
      aria-label="Chargement de la carte..."
    >
      {/* Image */}
      {withImage && (
        <div>
          <Skeleton variant="custom" width="100%" height={200} borderRadius={0} />
        </div>
      )}

      {/* Contenu */}
      <div className="p-4 space-y-3">
        {/* Titre */}
        <Skeleton variant="title" width="70%" />

        {/* Description */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
              key={i}
              variant="text"
              width={i === lines - 1 ? "60%" : "100%"}
            />
          ))}
        </div>

        {/* Actions (footer) */}
        {withActions && (
          <div className="flex gap-2 pt-2">
            <Skeleton variant="button" width={100} />
            <Skeleton variant="button" width={80} />
          </div>
        )}
      </div>
    </div>
  );
};

SkeletonCard.displayName = "SkeletonCard";
