/**
 * MobileMockup - Espace employe sur telephone, en DOM
 *
 * Meme parti pris que `PlanningMockup` : l'illustration est construite en
 * HTML et CSS plutot qu'en image. Aucune requete, rendu net sur tout ecran,
 * et pas le grain « image generee » qui trahissait les anciennes captures.
 *
 * Entierement decoratif : `aria-hidden`, aucune information n'y est unique.
 * Ce que la maquette evoque, planning a jour et conge valide, est porte par
 * le texte de la section, seul lu par les moteurs et les lecteurs d'ecran.
 *
 * Server Component, aucun JavaScript envoye au client.
 *
 * @see SP-574 - Section mobile de la landing
 */

/** Ligne de planning affichee sous le prochain creneau. */
interface MockupDay {
  label: string
  value: string
  /** Un jour de conge se distingue par un aplat vert plutot qu'un filet bleu */
  off?: boolean
}

/**
 * Donnees d'illustration. Prenoms et lieux fictifs : aucune donnee reelle
 * d'entreprise cliente ne figure sur une page publique.
 */
const DAYS: MockupDay[] = [
  { label: "Aujourd'hui", value: '09:30 - 17:30' },
  { label: 'Demain', value: '12:00 - 19:00' },
  { label: 'Jeudi', value: 'Congé validé', off: true },
]

const NAV_ITEMS = ['Planning', 'Congés', 'Messages'] as const

export function MobileMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto flex w-full max-w-[20rem] justify-center lg:max-w-[22rem]"
    >
      {/*
        Etiquettes flottantes. En position absolue pour deborder du cadre,
        elles restent dans le flux visuel sans decaler la maquette.
      */}
      <span className="absolute -right-3 top-24 z-20 border-b-4 border-public-brand-surface bg-public-surface px-3 py-2 font-geist text-xs font-semibold text-public-content shadow-lg sm:-right-10">
        Planning à jour
      </span>
      <span className="absolute -left-3 bottom-24 z-20 border-b-4 border-public-highlight bg-public-surface px-3 py-2 font-geist text-xs font-semibold text-public-content shadow-lg sm:-left-10">
        Congé validé
      </span>

      {/* Aplat bleu decale qui donne l'epaisseur du telephone */}
      <div
        className="absolute inset-y-8 left-10 right-0 translate-x-2 rounded-r-[1.5rem] bg-public-brand-surface"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full rounded-[2.25rem] border-[6px] border-public-content bg-public-content p-1 shadow-2xl">
        {/* Encoche */}
        <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-public-content" />

        <div className="overflow-hidden rounded-[1.75rem] bg-public-surface">
          {/* En-tete */}
          <div className="flex items-start justify-between gap-3 px-4 pb-3 pt-7">
            <div>
              <p className="font-geist text-[0.625rem] uppercase tracking-[0.14em] text-public-content-muted">
                Mardi 11 août
              </p>
              <p className="mt-1 font-geist text-lg font-bold text-public-content">
                Bonjour Chloé
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-public-accent-surface font-geist text-xs font-bold text-public-content-on-vivid">
              CD
            </span>
          </div>

          {/* Prochain creneau, aplat sombre pour porter le regard */}
          <div className="mx-4 border-l-4 border-public-highlight bg-public-surface-dark px-4 py-3">
            <p className="font-geist text-[0.625rem] uppercase tracking-[0.14em] text-public-highlight">
              Prochain créneau
            </p>
            <p className="mt-1 font-geist text-xl font-bold text-public-content-on-dark">
              09:30 - 17:30
            </p>
            <p className="mt-0.5 font-geist text-xs text-public-content-on-dark/75">
              Boutique Pau · Équipe vente
            </p>
          </div>

          {/* Jours suivants */}
          <div className="mt-3 space-y-1.5 px-4">
            {DAYS.map((day) => (
              <div
                key={day.label}
                className={
                  day.off
                    ? 'flex items-center justify-between border-l-4 border-public-highlight bg-public-highlight-surface px-3 py-2.5'
                    : 'flex items-center justify-between border-l-4 border-public-brand-surface bg-public-surface-subtle px-3 py-2.5'
                }
              >
                {/*
                  Sur l'aplat lime, le texte reste bleu nuit franc :
                  `content-muted` (ink 700) y perd trop de contraste.
                */}
                <span className="font-geist text-xs font-semibold text-public-content">
                  {day.label}
                </span>
                <span
                  className={
                    day.off
                      ? 'font-geist text-xs font-medium text-public-content-on-vivid'
                      : 'font-geist text-xs text-public-content-muted'
                  }
                >
                  {day.value}
                </span>
              </div>
            ))}
          </div>

          {/* Message d'equipe */}
          <div className="mx-4 mt-3 flex items-start gap-2.5 bg-public-surface-subtle px-3 py-2.5">
            {/*
              Le creme sur le bleu franc tombe a 4,13:1, mesure par axe-core :
              sous le seuil AA de 4,5. Le bleu nuit sur creme le tient
              largement, et reprend le code des pastilles claires du planning.
            */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-public-border bg-public-surface font-geist text-[0.625rem] font-bold text-public-content">
              LM
            </span>
            <p className="min-w-0 flex-1">
              <span className="block font-geist text-xs font-semibold text-public-content">
                Léa · Manager
              </span>
              <span className="block font-geist text-[0.6875rem] leading-snug text-public-content-muted">
                Le planning de vendredi est publié.
              </span>
            </p>
            <span className="shrink-0 font-geist text-[0.625rem] text-public-content-muted">
              10:24
            </span>
          </div>

          {/* Barre de navigation */}
          <div className="mt-4 flex items-center justify-around border-t border-public-border px-2 py-3">
            {NAV_ITEMS.map((item, index) => (
              <span
                key={item}
                className={
                  index === 0
                    ? 'font-geist text-[0.6875rem] font-bold text-public-accent'
                    : 'font-geist text-[0.6875rem] text-public-content-muted'
                }
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileMockup
