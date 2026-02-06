'use client'

/**
 * ComingSoonPage Component
 *
 * Composant réutilisable pour les pages "Coming Soon" (fonctionnalités V2).
 * Cohérent avec le Design System Cyber Glass 3D.
 *
 * @see SP-451 - Pages Placeholder "Coming Soon"
 */

import { type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  motion,
  fadeSlideUpVariants,
  staggerContainer,
  staggerItem,
  useReducedMotion,
} from '@/lib/animations'

export interface ComingSoonFeature {
  label: string
  description: string
}

export interface ComingSoonPageProps {
  title: string
  description: string
  icon: ReactNode
  version?: string
  features?: ComingSoonFeature[]
}

export function ComingSoonPage({
  title,
  description,
  icon,
  version = 'Version 2',
  features,
}: ComingSoonPageProps) {
  const prefersReducedMotion = useReducedMotion()

  const content = (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <Card className="glass-strong w-full max-w-lg border-none">
        <CardContent className="flex flex-col items-center gap-6 pb-10 pt-10">
          {/* Badge version */}
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-700 dark:text-violet-300"
          >
            {version}
          </Badge>

          {/* Icon */}
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-5">
            {icon}
          </div>

          {/* Title & description */}
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="max-w-md text-muted-foreground">{description}</p>
          </div>

          {/* Features list */}
          {features && features.length > 0 && (
            <div className="w-full space-y-3 pt-2">
              <p className="text-center text-sm font-medium text-muted-foreground">
                Fonctionnalités prévues
              </p>
              <div className="grid gap-2">
                {features.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 px-4 py-3"
                  >
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary/60" />
                    <div>
                      <p className="text-sm font-medium">{feature.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status indicator */}
          <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              En cours de développement
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (prefersReducedMotion) {
    return content
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={staggerItem}>
        <motion.div variants={fadeSlideUpVariants}>{content}</motion.div>
      </motion.div>
    </motion.div>
  )
}
