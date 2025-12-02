'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/loading'
import { CardVariant } from './types'

/**
 * TeamCardSkeleton - État de chargement pour TeamCard
 *
 * SP-123 : Composants métier SmartPlanning
 *
 * Reproduit la structure exacte de TeamCard avec des skeletons
 * pour un loading state cohérent.
 */

export interface TeamCardSkeletonProps {
  /** Variant d'affichage (doit correspondre au TeamCard) */
  variant?: CardVariant

  /** Classes CSS additionnelles */
  className?: string
}

export const TeamCardSkeleton: React.FC<TeamCardSkeletonProps> = ({
  variant = 'compact',
  className,
}) => {
  // Variant COMPACT
  if (variant === 'compact') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <div className="flex border-l-4 border-muted">
          <div className="flex-1 p-3">
            {/* Ligne 1 : Nom + badge + actions */}
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Skeleton variant="text" width={120} height={16} />
                <Skeleton
                  variant="custom"
                  width={70}
                  height={20}
                  borderRadius={12}
                />
              </div>
              <Skeleton
                variant="custom"
                width={24}
                height={24}
                borderRadius={4}
              />
            </div>

            {/* Ligne 2 : Manager */}
            <div className="mb-2 flex items-center gap-1.5">
              <Skeleton
                variant="custom"
                width={14}
                height={14}
                borderRadius={2}
              />
              <Skeleton variant="text" width={140} height={14} />
            </div>

            {/* Ligne 3 : AvatarStack */}
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="avatar"
                  width={32}
                  height={32}
                  className={i > 0 ? '-ml-2' : ''}
                />
              ))}
              <Skeleton
                variant="custom"
                width={32}
                height={32}
                borderRadius={16}
                className="-ml-2"
              />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Variant DETAILED
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex border-l-4 border-muted">
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex-1">
              <Skeleton variant="title" width="60%" height={20} />
              <Skeleton
                variant="text"
                width="80%"
                height={14}
                className="mt-2"
              />
            </div>
            <Skeleton
              variant="custom"
              width={24}
              height={24}
              borderRadius={4}
            />
          </div>

          {/* Manager */}
          <div className="mb-4 flex items-center gap-2">
            <Skeleton variant="avatar" width={32} height={32} />
            <div>
              <Skeleton variant="text" width={50} height={12} />
              <Skeleton
                variant="text"
                width={100}
                height={14}
                className="mt-1"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Skeleton
                variant="custom"
                width={16}
                height={16}
                borderRadius={2}
              />
              <Skeleton variant="text" width={60} height={14} />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton variant="custom" width={8} height={8} circle />
              <Skeleton variant="text" width={50} height={14} />
            </div>
            <div className="flex items-center gap-1.5">
              <Skeleton variant="custom" width={8} height={8} circle />
              <Skeleton variant="text" width={60} height={14} />
            </div>
          </div>

          {/* AvatarStack */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="avatar"
                    width={40}
                    height={40}
                    className={i > 0 ? '-ml-3' : ''}
                  />
                ))}
              </div>
              <Skeleton variant="text" width={70} height={14} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

TeamCardSkeleton.displayName = 'TeamCardSkeleton'
