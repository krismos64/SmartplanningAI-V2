/**
 * Création d'employé lancée depuis une équipe
 *
 * @ticket SP-613
 * @description Les deux dirigeants inscrits en octobre 2026 ont créé une
 * équipe, ouvert « Ajouter un membre » et trouvé une liste vide, faute
 * d'employé. Le bouton « Créer un employé » de cette liste ouvre le
 * formulaire avec l'équipe choisie, puis ramène à l'équipe.
 *
 * L'équipe n'est retenue que si elle figure dans la liste déjà filtrée par
 * les droits de l'utilisateur, et le chemin de retour est construit ici :
 * aucune URL venue du navigateur n'est suivie telle quelle.
 */

export interface TeamPrefill {
  teamId: string
  returnTo: string
}

export function resolveTeamPrefill(
  teamIdParam: string | string[] | undefined,
  allowedTeams: { id: string }[]
): TeamPrefill | null {
  if (typeof teamIdParam !== 'string') return null
  if (!allowedTeams.some((t) => t.id === teamIdParam)) return null
  return {
    teamId: teamIdParam,
    returnTo: `/app/director/teams/${encodeURIComponent(teamIdParam)}/members`,
  }
}
