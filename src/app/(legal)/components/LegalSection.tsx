/**
 * LegalSection Component
 * Composant pour les sections dans les pages légales
 *
 * @description Section stylisée avec ancre pour la navigation
 */

import { cn } from '@/lib/utils'

interface LegalSectionProps {
  /** ID pour l'ancre de navigation */
  id: string
  /** Titre de la section */
  title: string
  /** Numéro de la section (optionnel) */
  number?: string
  /** Niveau de titre (1, 2 ou 3) */
  level?: 1 | 2 | 3
  /** Contenu de la section */
  children: React.ReactNode
  /** Classes additionnelles */
  className?: string
}

export function LegalSection({
  id,
  title,
  number,
  level = 1,
  children,
  className,
}: LegalSectionProps) {
  const HeadingTag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4'

  return (
    <section id={id} className={cn('scroll-mt-32', className)}>
      <HeadingTag
        className={cn(
          'mb-6 font-bold',
          level === 1 && 'text-2xl text-public-content sm:text-3xl',
          level === 2 && 'text-xl text-public-content/90 sm:text-2xl',
          level === 3 && 'text-lg text-public-content/80'
        )}
      >
        {number && (
          <span className="mr-3 text-public-accent">
            {number}
          </span>
        )}
        {title}
      </HeadingTag>
      <div className="space-y-4 text-public-content-muted">{children}</div>
    </section>
  )
}

/**
 * LegalParagraph Component
 * Paragraphe stylisé pour le contenu légal
 */
export function LegalParagraph({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('leading-relaxed text-public-content-muted', className)}>
      {children}
    </p>
  )
}

/**
 * LegalList Component
 * Liste stylisée pour les énumérations légales
 */
export function LegalList({
  items,
  ordered = false,
  className,
}: {
  items: (string | React.ReactNode)[]
  ordered?: boolean
  className?: string
}) {
  const ListTag = ordered ? 'ol' : 'ul'

  return (
    <ListTag
      className={cn(
        'space-y-2 pl-6',
        ordered ? 'list-decimal' : 'list-disc',
        className
      )}
    >
      {items.map((item, index) => (
        <li key={index} className="text-public-content-muted">
          {item}
        </li>
      ))}
    </ListTag>
  )
}

/**
 * LegalHighlight Component
 * Bloc mis en évidence pour les informations importantes
 */
export function LegalHighlight({
  children,
  type = 'info',
  className,
}: {
  children: React.ReactNode
  type?: 'info' | 'warning' | 'important'
  className?: string
}) {
  return (
    <div
      className={cn(
        // Filet colore a gauche plutot que fond teinte : le texte se pose
        // sur la surface courante, ou sa lisibilite est acquise. Les
        // variantes precedentes tombaient a 1.52:1 et 2.21:1 (SP-571).
        'border-l-2 bg-public-surface-subtle p-4',
        type === 'info' && 'border-public-brand-on-light',
        type === 'warning' && 'border-public-accent',
        type === 'important' && 'border-public-accent',
        className
      )}
    >
      <div className="font-geist text-sm text-public-content">{children}</div>
    </div>
  )
}

/**
 * LegalDivider Component
 * Séparateur visuel entre les sections
 */
export function LegalDivider({ className }: { className?: string }) {
  return <hr className={cn('my-12 border-t border-public-border', className)} />
}

/**
 * LegalContact Component
 * Bloc de contact stylisé
 */
export function LegalContact({
  title,
  email,
  address,
  phone,
  className,
}: {
  title?: string
  email?: string
  address?: string
  phone?: string
  className?: string
}) {
  return (
    <div
      className={cn('rounded-lg border border-public-border bg-card p-6', className)}
    >
      {title && <h4 className="mb-4 font-semibold text-public-content">{title}</h4>}
      <div className="space-y-2 text-sm text-public-content-muted">
        {email && (
          <p>
            <span className="text-public-content-muted/70">Email : </span>
            <a
              href={`mailto:${email}`}
              className="text-public-accent hover:underline"
            >
              {email}
            </a>
          </p>
        )}
        {address && (
          <p>
            <span className="text-public-content-muted/70">Adresse : </span>
            {address}
          </p>
        )}
        {phone && (
          <p>
            <span className="text-public-content-muted/70">Téléphone : </span>
            <a
              href={`tel:${phone}`}
              className="text-public-accent hover:underline"
            >
              {phone}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * LegalTable Component
 * Tableau stylisé pour les pages légales avec support light/dark mode
 */
export interface LegalTableColumn {
  header: string
  key: string
  /** Rend le contenu en monospace avec couleur cyan (pour les noms de cookies par ex.) */
  mono?: boolean
}

export interface LegalTableRow {
  [key: string]: React.ReactNode
}

export function LegalTable({
  columns,
  rows,
  className,
}: {
  columns: LegalTableColumn[]
  rows: LegalTableRow[]
  className?: string
}) {
  return (
    <div className={cn('my-6 overflow-x-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-public-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-semibold text-public-content"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-public-content-muted">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-public-border">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3',
                    col.mono && 'font-mono text-public-accent'
                  )}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * LegalAcceptanceBox Component
 * Bloc d'acceptation en fin de document légal
 */
export function LegalAcceptanceBox({
  message,
  lastUpdated,
  version,
  className,
}: {
  message: string
  lastUpdated: string
  version: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'mt-12 rounded-lg border border-public-border bg-card p-6',
        className
      )}
    >
      <p className="text-center text-sm text-public-content-muted">{message}</p>
      <p className="mt-4 text-center text-xs text-public-content-muted/70">
        Dernière mise à jour : {lastUpdated} | Version {version}
      </p>
    </div>
  )
}

/**
 * LegalLink Component
 * Lien stylisé pour les pages légales avec support light/dark mode
 */
export function LegalLink({
  href,
  children,
  external = false,
  className,
}: {
  href: string
  children: React.ReactNode
  external?: boolean
  className?: string
}) {
  const externalProps = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a
      href={href}
      className={cn(
        'text-public-accent hover:underline',
        className
      )}
      {...externalProps}
    >
      {children}
    </a>
  )
}
