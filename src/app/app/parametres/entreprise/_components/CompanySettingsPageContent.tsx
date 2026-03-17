'use client'

/**
 * CompanySettingsPageContent - Contenu principal de la page Paramètres Entreprise
 *
 * Client Component orchestrateur avec :
 * - Informations générales (nom, adresse)
 * - Jours travaillés (7 checkboxes + presets)
 * - Horaires de travail + pause déjeuner
 * - Validation explicite via bouton "Enregistrer"
 * - Détection des modifications (dirty state)
 * - Bouton de réinitialisation
 *
 * @ticket SP-435
 */

import { useState, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, RotateCcw, Save, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'
import { useToast, useIsImpersonating } from '@/hooks'
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
  // État local pour les paramètres (draft)
  const [settings, setSettings] = useState<CompanySettings>(initialSettings)
  // État sauvegardé (pour comparaison dirty state)
  const [savedSettings, setSavedSettings] =
    useState<CompanySettings>(initialSettings)
  const [isPending, startTransition] = useTransition()
  const isImpersonating = useIsImpersonating()
  const { success: toastSuccess, error: toastError } = useToast()

  /**
   * Détecte si des modifications ont été faites
   */
  const isDirty = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(savedSettings)
  }, [settings, savedSettings])

  /**
   * Change le nom de l'entreprise (local uniquement)
   */
  const handleNameChange = (name: string) => {
    setSettings((prev) => ({ ...prev, name }))
  }

  /**
   * Change l'adresse de l'entreprise (local uniquement)
   */
  const handleAddressChange = (address: string) => {
    setSettings((prev) => ({ ...prev, address: address || null }))
  }

  /**
   * Change les jours travaillés (local uniquement)
   */
  const handleWorkingDaysChange = (workingDays: DayOfWeek[]) => {
    setSettings((prev) => ({ ...prev, workingDays }))
  }

  /**
   * Change l'heure d'ouverture (local uniquement)
   */
  const handleWorkingHoursStartChange = (workingHoursStart: string) => {
    setSettings((prev) => ({ ...prev, workingHoursStart }))
  }

  /**
   * Change l'heure de fermeture (local uniquement)
   */
  const handleWorkingHoursEndChange = (workingHoursEnd: string) => {
    setSettings((prev) => ({ ...prev, workingHoursEnd }))
  }

  /**
   * Change la pause déjeuner (local uniquement)
   */
  const handleLunchBreakChange = (lunchBreak: LunchBreakSettings) => {
    setSettings((prev) => ({ ...prev, lunchBreak }))
  }

  /**
   * Sauvegarde tous les paramètres modifiés
   */
  const handleSave = () => {
    startTransition(async () => {
      // Extraction explicite pour éviter les problèmes de sérialisation
      const payload = {
        name: settings.name,
        address: settings.address,
        workingDays: [...settings.workingDays],
        workingHoursStart: settings.workingHoursStart,
        workingHoursEnd: settings.workingHoursEnd,
        lunchBreak: {
          enabled: settings.lunchBreak.enabled,
          start: settings.lunchBreak.start,
          end: settings.lunchBreak.end,
        },
      }

      const result = await updateCompanySettings(payload)

      if (!result.success) {
        toastError(result.error || 'Erreur lors de la sauvegarde')
      } else {
        // Met à jour l'état sauvegardé
        setSavedSettings(settings)
        toastSuccess('Paramètres enregistrés')
      }
    })
  }

  /**
   * Annule les modifications et revient à l'état sauvegardé
   */
  const handleCancel = () => {
    setSettings(savedSettings)
  }

  /**
   * Réinitialise tous les paramètres (sauf le nom)
   */
  const handleReset = () => {
    startTransition(async () => {
      const result = await resetCompanySettings()

      if (!result.success) {
        toastError(result.error || 'Erreur lors de la réinitialisation')
      } else {
        // Met à jour les deux états avec les valeurs par défaut
        const resetSettings = {
          ...DEFAULT_COMPANY_SETTINGS,
          name: settings.name,
        }
        setSettings(resetSettings)
        setSavedSettings(resetSettings)
        toastSuccess('Paramètres réinitialisés')
      }
    })
  }

  return (
    <div className="space-y-6" data-testid="company-settings-page">
      {/* Header avec bouton retour */}
      <AnimatedContainer animation="fadeInDown">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1 sm:mt-0">
            <Link href="/app/parametres" aria-label="Retour aux paramètres">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Paramètres Entreprise
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
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

      {/* Barre d'actions */}
      <AnimatedContainer animation="fadeInUp">
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Bouton de réinitialisation */}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isPending || isImpersonating}
            title={
              isImpersonating ? 'Non disponible en mode support' : undefined
            }
            data-testid="reset-button"
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Réinitialiser par défaut
          </Button>

          {/* Boutons Annuler / Enregistrer */}
          <div className="flex w-full gap-2 sm:w-auto">
            {isDirty && (
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isPending}
                data-testid="cancel-button"
                className="flex-1 sm:flex-initial"
              >
                Annuler
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={!isDirty || isPending || isImpersonating}
              title={
                isImpersonating ? 'Non disponible en mode support' : undefined
              }
              data-testid="save-button"
              className="flex-1 sm:flex-initial"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>
      </AnimatedContainer>
    </div>
  )
}
