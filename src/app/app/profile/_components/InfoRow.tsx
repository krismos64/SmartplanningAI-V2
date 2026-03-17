/**
 * InfoRow - Ligne d'information réutilisable
 *
 * Composant partagé pour afficher une ligne avec icône, label et valeur.
 * Utilisé dans PersonalInfoCard, ProfessionalInfoCard, AccountInfoCard.
 *
 * @ticket SP-270
 */

interface InfoRowProps {
  icon?: React.ReactNode
  label: string
  value: string
  testId?: string
}

export function InfoRow({ icon, label, value, testId }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="mt-0.5 text-muted-foreground">{icon}</span>}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium" data-testid={testId}>
          {value}
        </p>
      </div>
    </div>
  )
}
