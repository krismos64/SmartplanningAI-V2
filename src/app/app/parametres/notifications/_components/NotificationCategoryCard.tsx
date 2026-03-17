'use client'

/**
 * NotificationCategoryCard - Carte de catégorie de notification
 *
 * Affiche une catégorie avec deux switches (Email / In-App)
 *
 * @ticket SP-275
 */

import { Calendar, Palmtree, CheckSquare, Bell, LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { NotificationChannelPreferences } from '@/types/preferences'
import { NOTIFICATION_CHANNEL_LABELS } from '@/lib/validations/preferences'
import {
  NOTIFICATION_CATEGORY_DESCRIPTIONS,
  NOTIFICATION_CATEGORY_COLORS,
} from '@/lib/helpers/notification-categories'

interface NotificationCategoryCardProps {
  /** Catégorie de notification */
  category: keyof NotificationChannelPreferences
  /** État du switch email */
  emailEnabled: boolean
  /** État du switch in-app */
  inAppEnabled: boolean
  /** Callback lors du changement email */
  onEmailChange: (enabled: boolean) => void
  /** Callback lors du changement in-app */
  onInAppChange: (enabled: boolean) => void
  /** Désactive les switches */
  disabled?: boolean
}

/** Mapping des icônes par catégorie */
const CATEGORY_ICONS: Record<keyof NotificationChannelPreferences, LucideIcon> =
  {
    planning: Calendar,
    leaves: Palmtree,
    tasks: CheckSquare,
    system: Bell,
  }

export function NotificationCategoryCard({
  category,
  emailEnabled,
  inAppEnabled,
  onEmailChange,
  onInAppChange,
  disabled = false,
}: NotificationCategoryCardProps) {
  const Icon = CATEGORY_ICONS[category]
  const label = NOTIFICATION_CHANNEL_LABELS[category]
  const description = NOTIFICATION_CATEGORY_DESCRIPTIONS[category]
  const colorClass = NOTIFICATION_CATEGORY_COLORS[category]

  return (
    <Card data-testid={`notification-category-${category}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn('rounded-lg p-2.5', colorClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{label}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          {/* Email toggle */}
          <div className="flex items-center gap-3">
            <Label
              htmlFor={`email-${category}`}
              className="cursor-pointer text-sm font-medium"
            >
              Email
            </Label>
            <Switch
              id={`email-${category}`}
              checked={emailEnabled}
              onCheckedChange={onEmailChange}
              disabled={disabled}
              data-testid={`notification-email-${category}`}
              aria-label={`Activer les notifications email pour ${label}`}
            />
          </div>

          {/* In-App toggle */}
          <div className="flex items-center gap-3">
            <Label
              htmlFor={`inapp-${category}`}
              className="cursor-pointer text-sm font-medium"
            >
              In-App
            </Label>
            <Switch
              id={`inapp-${category}`}
              checked={inAppEnabled}
              onCheckedChange={onInAppChange}
              disabled={disabled}
              data-testid={`notification-inapp-${category}`}
              aria-label={`Activer les notifications in-app pour ${label}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
