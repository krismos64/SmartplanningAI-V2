'use client'

/**
 * CompanySettingsPageContent - Contenu principal de la page Paramètres Entreprise
 *
 * Client Component orchestrateur avec :
 * - Informations générales (nom, adresse)
 * - Jours travaillés (7 checkboxes + presets)
 * - Horaires de travail + pause déjeuner
 * - Optimistic UI avec rollback en cas d'erreur
 * - Bouton de réinitialisation
 *
 * @ticket SP-435
 */

import { useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'
import { useToast } from '@/hooks'
import {
  updateCompanySettings,
  resetCompanySettings,
} from '@/lib/actions/company-settings'
import type {
  CompanySettings,
  DayOfWeek,
  LunchBreakSettings,
} from '@/types/company'
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company'

import { CompanyInfoSection } from './CompanyInfoSection'
import { WorkingDaysSelector } from './WorkingDaysSelector'
import { WorkingHoursSection } from './WorkingHoursSection'

interface CompanySettingsPageContentProps {
  /** Paramètres initiaux chargés côté serveur */
  initialSettings: CompanySettings
}

export function CompanySettingsPageContent({
  initialSettings,
}: CompanySettingsPageContentProps) {
  // État local pour les paramètres (optimistic UI)
  const [settings, setSettings] = useState<CompanySettings>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const { success: toastSuccess, error: toastError } = useToast()

  /**
   * Sauvegarde un changement avec optimistic update
   */
  const saveChange = useCallback(
    <K extends keyof CompanySettings>(
      key: K,
      value: CompanySettings[K],
      previousSettings: CompanySettings
    ) => {
      startTransition(async () => {
        const result = await updateCompanySettings({ [key]: value })

        if (!result.success) {
          // Rollback
          setSettings(previousSettings)
          toastError(result.error || 'Erreur lors de la sauvegarde')
        } else {
          toastSuccess('Paramètres enregistrés')
        }
      })
    },
    [toastError, toastSuccess]
  )

  /**
   * Change le nom de l'entreprise
   */
  const handleNameChange = (name: string) => {
    const previousSettings = { ...settings }
    setSettings((prev) => ({ ...prev, name }))

    // Debounce implicite via startTransition
    saveChange('name', name, previousSettings)
  }

  /**
   * Change l'adresse de l'entreprise
   */
  const handleAddressChange = (address: string) => {
    const previousSettings = { ...settings }
    setSettings((prev) => ({ ...prev, address: address || null }))

    saveChange('address', address || null, previousSettings)
  }

  /**
   * Change les jours travaillés
   */
  const handleWorkingDaysChange = (workingDays: DayOfWeek[]) => {
    const previousSettings = { ...settings }
    setSettings((prev) => ({ ...prev, workingDays }))

    saveChange('workingDays', workingDays, previousSettings)
  }

  /**
   * Change l'heure d'ouverture
   */
  const handleWorkingHoursStartChange = (workingHoursStart: string) => {
    const previousSettings = { ...settings }
    setSettings((prev) => ({ ...prev, workingHoursStart }))

    saveChange('workingHoursStart', workingHoursStart, previousSettings)
  }

  /**
   * Change l'heure de fermeture
   */
  const handleWorkingHoursEndChange = (workingHoursEnd: string) => {
    const previousSettings = { ...settings }
    setSettings((prev) => ({ ...prev, workingHoursEnd }))

    saveChange('workingHoursEnd', workingHoursEnd, previousSettings)
  }

  /**
   * Change la pause déjeuner
   */
  const handleLunchBreakChange = (lunchBreak: LunchBreakSettings) => {
    const previousSettings = { ...settings }
    setSettings((prev) => ({ ...prev, lunchBreak }))

    saveChange('lunchBreak', lunchBreak, previousSettings)
  }

  /**
   * Réinitialise tous les paramètres (sauf le nom)
   */
  const handleReset = () => {
    // Sauvegarde pour rollback
    const previousSettings = { ...settings }

    // Optimistic update (garde le nom)
    setSettings({
      ...DEFAULT_COMPANY_SETTINGS,
      name: settings.name,
    })

    startTransition(async () => {
      const result = await resetCompanySettings()

      if (!result.success) {
        // Rollback
        setSettings(previousSettings)
        toastError(result.error || 'Erreur lors de la réinitialisation')
      } else {
        toastSuccess('Paramètres réinitialisés')
      }
    })
  }

  return (
    <div className="space-y-6" data-testid="company-settings-page">
      {/* Header avec bouton retour */}
      <AnimatedContainer animation="fadeInDown">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/app/settings" aria-label="Retour aux paramètres">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Paramètres Entreprise
            </h1>
            <p className="text-muted-foreground">
              Configurez les informations et horaires de votre entreprise
            </p>
          </div>
        </div>
      </AnimatedContainer>

      {/* Sections avec animation stagger */}
      <AnimatedContainer stagger staggerSpeed="normal">
        {/* Informations générales */}
        <AnimatedItem>
          <CompanyInfoSection
            name={settings.name}
            address={settings.address}
            onNameChange={handleNameChange}
            onAddressChange={handleAddressChange}
            disabled={isPending}
          />
        </AnimatedItem>

        {/* Jours travaillés */}
        <AnimatedItem>
          <WorkingDaysSelector
            workingDays={settings.workingDays}
            onWorkingDaysChange={handleWorkingDaysChange}
            disabled={isPending}
          />
        </AnimatedItem>

        {/* Horaires de travail */}
        <AnimatedItem>
          <WorkingHoursSection
            workingHoursStart={settings.workingHoursStart}
            workingHoursEnd={settings.workingHoursEnd}
            lunchBreak={settings.lunchBreak}
            onWorkingHoursStartChange={handleWorkingHoursStartChange}
            onWorkingHoursEndChange={handleWorkingHoursEndChange}
            onLunchBreakChange={handleLunchBreakChange}
            disabled={isPending}
          />
        </AnimatedItem>
      </AnimatedContainer>

      {/* Bouton de réinitialisation */}
      <AnimatedContainer animation="fadeInUp">
        <div className="flex justify-end border-t pt-4">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isPending}
            data-testid="reset-button"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser par défaut
          </Button>
        </div>
      </AnimatedContainer>
    </div>
  )
}
