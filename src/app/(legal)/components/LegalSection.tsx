'use client'

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
          level === 1 && 'text-2xl text-white sm:text-3xl',
          level === 2 && 'text-xl text-white/90 sm:text-2xl',
          level === 3 && 'text-lg text-white/80'
        )}
      >
        {number && <span className="mr-3 text-cyan-400">{number}</span>}
        {title}
      </HeadingTag>
      <div className="space-y-4 text-white/70">{children}</div>
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
    <p className={cn('leading-relaxed text-white/70', className)}>{children}</p>
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
        <li key={index} className="text-white/70">
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
        'rounded-lg border p-4',
        type === 'info' && 'border-blue-500/20 bg-blue-500/10',
        type === 'warning' && 'border-amber-500/20 bg-amber-500/10',
        type === 'important' && 'border-cyan-500/20 bg-cyan-500/10',
        className
      )}
    >
      <div
        className={cn(
          'text-sm',
          type === 'info' && 'text-blue-300',
          type === 'warning' && 'text-amber-300',
          type === 'important' && 'text-cyan-300'
        )}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * LegalDivider Component
 * Séparateur visuel entre les sections
 */
export function LegalDivider({ className }: { className?: string }) {
  return <hr className={cn('my-12 border-t border-white/10', className)} />
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
      className={cn(
        'rounded-lg border border-white/10 bg-white/5 p-6',
        className
      )}
    >
      {title && <h4 className="mb-4 font-semibold text-white">{title}</h4>}
      <div className="space-y-2 text-sm text-white/70">
        {email && (
          <p>
            <span className="text-white/50">Email : </span>
            <a
              href={`mailto:${email}`}
              className="text-cyan-400 hover:underline"
            >
              {email}
            </a>
          </p>
        )}
        {address && (
          <p>
            <span className="text-white/50">Adresse : </span>
            {address}
          </p>
        )}
        {phone && (
          <p>
            <span className="text-white/50">Téléphone : </span>
            <a href={`tel:${phone}`} className="text-cyan-400 hover:underline">
              {phone}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
