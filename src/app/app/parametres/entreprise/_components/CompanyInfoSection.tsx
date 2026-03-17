'use client'

/**
 * CompanyInfoSection - Section nom et adresse de l'entreprise
 *
 * @ticket SP-435
 */

import { Building } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  COMPANY_SETTINGS_LABELS,
  COMPANY_SETTINGS_DESCRIPTIONS,
} from '@/lib/validations/company-settings'

interface CompanyInfoSectionProps {
  /** Nom de l'entreprise */
  name: string
  /** Adresse de l'entreprise */
  address: string | null
  /** Callback lors du changement du nom */
  onNameChange: (name: string) => void
  /** Callback lors du changement de l'adresse */
  onAddressChange: (address: string) => void
  /** Désactive les inputs */
  disabled?: boolean
}

export function CompanyInfoSection({
  name,
  address,
  onNameChange,
  onAddressChange,
  disabled = false,
}: CompanyInfoSectionProps) {
  return (
    <Card data-testid="company-info-section">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Building className="h-4 w-4 sm:h-5 sm:w-5" />
          Informations générales
        </CardTitle>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Les informations de base de votre entreprise
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nom */}
        <div className="space-y-2">
          <Label htmlFor="company-name">{COMPANY_SETTINGS_LABELS.name}</Label>
          <Input
            id="company-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nom de l'entreprise"
            disabled={disabled}
            maxLength={100}
            data-testid="company-name-input"
            aria-describedby="company-name-description"
          />
          <p
            id="company-name-description"
            className="text-xs text-muted-foreground"
          >
            {COMPANY_SETTINGS_DESCRIPTIONS.name}
          </p>
        </div>

        {/* Adresse */}
        <div className="space-y-2">
          <Label htmlFor="company-address">
            {COMPANY_SETTINGS_LABELS.address}
          </Label>
          <Textarea
            id="company-address"
            value={address ?? ''}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Adresse complète"
            disabled={disabled}
            maxLength={500}
            rows={3}
            data-testid="company-address-input"
            aria-describedby="company-address-description"
          />
          <p
            id="company-address-description"
            className="text-xs text-muted-foreground"
          >
            {COMPANY_SETTINGS_DESCRIPTIONS.address}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
