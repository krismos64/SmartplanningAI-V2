/**
 * Ordre des lignes de la grille de plannings
 *
 * @ticket SP-616
 * @description Le 20 octobre 2026, le dirigeant de sarl chouphil a renommé
 * ses cinq employés « A selhia » à « E dab » juste après avoir regardé la
 * grille : rien d'autre ne lui permettait d'en régler l'ordre. Les lignes
 * suivent désormais l'équipe, puis le nom, puis le prénom. Les employés sans
 * équipe ferment la liste.
 */

export interface GridOrderable {
  firstName: string
  lastName: string
  teamName?: string | null
}

const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true })

export function compareGridEmployees(
  a: GridOrderable,
  b: GridOrderable
): number {
  const teamA = a.teamName?.trim() || null
  const teamB = b.teamName?.trim() || null
  if (teamA !== teamB) {
    if (teamA === null) return 1
    if (teamB === null) return -1
    const byTeam = collator.compare(teamA, teamB)
    if (byTeam !== 0) return byTeam
  }
  return (
    collator.compare(a.lastName, b.lastName) ||
    collator.compare(a.firstName, b.firstName)
  )
}
