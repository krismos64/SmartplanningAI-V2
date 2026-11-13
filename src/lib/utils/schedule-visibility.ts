/**
 * Ce qu'un employé voit changer quand un créneau est modifié (SP-618)
 *
 * Un employé ne voit que les créneaux `CONFIRMED`. Le prévenir d'une
 * modification n'a donc de sens que si le créneau lui était visible avant,
 * ou le devient. Avant SP-618, modifier ou supprimer un brouillon lui
 * annonçait « planning modifié » pour un créneau qu'il n'avait jamais vu.
 */
export type ScheduleVisibilityChange =
  /** Brouillon resté brouillon : l'employé ne voit rien, ne rien envoyer */
  | 'none'
  /** Brouillon publié : le créneau apparaît, prévenir comme une création */
  | 'published'
  /** Créneau visible avant et après : prévenir d'une modification */
  | 'updated'
  /** Créneau repassé en brouillon : il disparaît, prévenir comme une suppression */
  | 'withdrawn'

type Status = 'DRAFT' | 'CONFIRMED'

export function scheduleVisibilityChange(
  before: Status,
  after: Status
): ScheduleVisibilityChange {
  if (before === 'CONFIRMED') {
    return after === 'CONFIRMED' ? 'updated' : 'withdrawn'
  }
  return after === 'CONFIRMED' ? 'published' : 'none'
}
