import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Props pour le composant EmptyState
 */
export interface EmptyStateProps {
  /** Icône à afficher (composant React) */
  icon: React.ReactNode
  /** Titre principal */
  title: string
  /** Description explicative */
  description: string
  /** Action principale (bouton CTA avec href OU onClick) */
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  /** Action secondaire optionnelle */
  secondaryAction?: {
    label: string
    href?: string
    onClick?: () => void
  }
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Composant générique pour afficher un état vide
 *
 * Utilisé quand une liste ne contient aucun élément.
 * Affiche une icône, un titre, une description et optionnellement un CTA.
 *
 * @example
 * <EmptyState
 *   icon={<Users className="h-12 w-12" />}
 *   title="Aucun employé"
 *   description="Commencez par ajouter vos premiers collaborateurs."
 *   action={{ label: "Ajouter un employé", href: "/employees/new" }}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center',
        className
      )}
    >
      {/* Icon */}
      <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>

      {/* Description */}
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {action &&
          (action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          ))}
        {secondaryAction &&
          (secondaryAction.href ? (
            <Button variant="outline" asChild>
              <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          ))}
      </div>
    </div>
  )
}
