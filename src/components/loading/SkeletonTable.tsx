'use client'

import React from 'react'
import { Skeleton } from './Skeleton'
import { cn } from '@/lib/utils'

/**
 * SkeletonTable - Skeleton pour DataTable
 *
 * Features:
 * - Simule structure de table (header + rows)
 * - Nombre de lignes et colonnes configurable
 * - Option : withHeader, withActions
 * - Layout responsive
 *
 * @example
 * ```tsx
 * <SkeletonTable rows={5} columns={4} />
 * <SkeletonTable rows={10} columns={6} withActions />
 * <SkeletonTable rows={3} columns={3} withHeader={false} />
 * ```
 */

export interface SkeletonTableProps {
  /** Nombre de lignes de données */
  rows?: number

  /** Nombre de colonnes */
  columns?: number

  /** Afficher le header */
  withHeader?: boolean

  /** Afficher la colonne actions */
  withActions?: boolean

  /** Classes CSS additionnelles */
  className?: string
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  withHeader = true,
  withActions = false,
  className,
}) => {
  const totalColumns = withActions ? columns + 1 : columns

  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-900',
        className
      )}
      role="status"
      aria-label="Chargement du tableau..."
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          {withHeader && (
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <tr>
                {Array.from({ length: totalColumns }).map((_, colIndex) => (
                  <th key={colIndex} className="px-4 py-3 text-left">
                    <Skeleton
                      variant="text"
                      width={
                        withActions && colIndex === totalColumns - 1
                          ? 80
                          : colIndex === 0
                            ? '80%'
                            : '70%'
                      }
                      height={14}
                    />
                  </th>
                ))}
              </tr>
            </thead>
          )}

          {/* Body */}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-200 last:border-0 dark:border-gray-700"
              >
                {Array.from({ length: totalColumns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {withActions && colIndex === totalColumns - 1 ? (
                      // Colonne Actions : boutons
                      <div className="flex gap-2">
                        <Skeleton
                          variant="custom"
                          width={32}
                          height={32}
                          circle
                        />
                        <Skeleton
                          variant="custom"
                          width={32}
                          height={32}
                          circle
                        />
                      </div>
                    ) : (
                      // Colonnes normales : texte
                      <Skeleton
                        variant="text"
                        width={
                          colIndex === 0
                            ? '90%'
                            : colIndex === 1
                              ? '70%'
                              : '60%'
                        }
                        height={16}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

SkeletonTable.displayName = 'SkeletonTable'
