'use client'

/**
 * AuthSidePanel - Panneau editorial des pages d'authentification
 *
 * Moitie sombre de l'ecran scinde, reprise du prototype (SP-574) : marque,
 * label numerote, titre a deux registres et trois arguments en filets.
 *
 * Le contenu depend de la page, connexion ou inscription. Il est choisi sur
 * le `pathname` plutot que passe en prop : le layout Next ne peut pas
 * recevoir de props de ses pages, et un contexte pour deux titres serait
 * disproportionne.
 *
 * Masque sous `lg` : sur mobile le formulaire occupe tout l'ecran, le
 * prototype ne montre le panneau qu'a partir du grand ecran. `hidden`
 * suffit, le contenu est decoratif et repris par le texte des pages.
 *
 * @see SP-574
 */

import { usePathname } from 'next/navigation'
import { AuthBrand } from './AuthLayoutClient'

/** Arguments communs aux deux pages, comme sur le prototype. */
const POINTS = [
  'Planning, congés et équipe au même endroit',
  'Accès adapté au rôle de chaque utilisateur',
  'Aucune carte bancaire pendant l’essai',
] as const

interface PanelCopy {
  /** Mot du label, « Revenir » ou « Créer » */
  action: string
  title: string
  /** Seconde ligne, rendue en italique editoriale */
  accent: string
}

const COPY: Record<string, PanelCopy> = {
  '/register': {
    action: 'Créer',
    title: '21 jours pour voir',
    accent: 'ce qui change.',
  },
  '/login': {
    action: 'Revenir',
    title: 'Bon retour',
    accent: 'dans votre équipe.',
  },
}

export function AuthSidePanel() {
  const pathname = usePathname()

  // Les quatre autres pages auth (activation, verification, reinitialisation)
  // s'atteignent par un lien d'email : elles reprennent le registre de la
  // connexion, sans message dedie.
  const copy = COPY[pathname ?? '/login'] ?? COPY['/login']
  if (!copy) return null

  return (
    <div className="hidden bg-public-surface-dark px-8 py-16 lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-24 xl:px-24">
      <AuthBrand />

      <p className="mt-16 flex items-center gap-4 font-geist text-xs uppercase tracking-[0.14em] text-public-content-on-dark/75">
        <span className="border border-public-border-on-dark px-3 py-1.5 text-public-highlight">
          {copy.action}
        </span>
        Espace sécurisé
      </p>

      <h2 className="mt-8 font-geist text-4xl font-bold leading-[0.98] tracking-[-0.03em] text-public-content-on-dark xl:text-5xl">
        {copy.title}
        <span className="mt-1 block font-editorial italic text-public-accent-on-dark">
          {copy.accent}
        </span>
      </h2>

      <ul className="mt-16 border-t border-public-border-on-dark">
        {POINTS.map((point) => (
          <li
            key={point}
            className="border-b border-public-border-on-dark py-5 font-geist text-base text-public-content-on-dark/75"
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}
