"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/loading";
import { CardVariant } from "./types";

/**
 * UserCardSkeleton - État de chargement pour UserCard
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * Reproduit la structure exacte de UserCard avec des skeletons
 * pour un loading state cohérent.
 */

export interface UserCardSkeletonProps {
  /** Variant d'affichage (doit correspondre au UserCard) */
  variant?: CardVariant;

  /** Classes CSS additionnelles */
  className?: string;
}

export const UserCardSkeleton: React.FC<UserCardSkeletonProps> = ({
  variant = "compact",
  className,
}) => {
  // Variant COMPACT
  if (variant === "compact") {
    return (
      <Card className={cn("flex items-center gap-3 p-3", className)}>
        {/* Avatar */}
        <Skeleton variant="avatar" width={40} height={40} />

        {/* Infos */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="40%" height={12} />
        </div>

        {/* Badge */}
        <Skeleton variant="custom" width={50} height={22} borderRadius={12} />

        {/* Actions */}
        <Skeleton variant="custom" width={24} height={24} borderRadius={4} />
      </Card>
    );
  }

  // Variant DETAILED
  return (
    <Card className={cn("p-4", className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Skeleton variant="avatar" width={64} height={64} />
        <Skeleton variant="custom" width={24} height={24} borderRadius={4} />
      </div>

      {/* Infos principales */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between gap-2">
          <Skeleton variant="title" width="50%" height={20} />
          <Skeleton variant="custom" width={50} height={22} borderRadius={12} />
        </div>
        <Skeleton variant="text" width="35%" height={14} />
        <Skeleton variant="text" width="45%" height={14} />
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton variant="custom" width={16} height={16} borderRadius={2} />
          <Skeleton variant="text" width="60%" height={14} />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="custom" width={16} height={16} borderRadius={2} />
          <Skeleton variant="text" width="40%" height={14} />
        </div>
      </div>

      {/* Rôle */}
      <div className="mt-4 pt-4 border-t">
        <Skeleton variant="custom" width={70} height={22} borderRadius={12} />
      </div>
    </Card>
  );
};

UserCardSkeleton.displayName = "UserCardSkeleton";
