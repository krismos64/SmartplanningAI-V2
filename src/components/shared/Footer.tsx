/**
 * Footer Component - Footer réutilisable
 *
 * ✅ Source : Component patterns Next.js 15
 *
 * OBJECTIF (CDA) :
 * Footer standalone réutilisable pour les pages publiques.
 * Version actuelle : placeholder pour Phase 3.
 *
 * FONCTIONNALITÉS PRÉVUES (Phase 4) :
 * - Liens navigation footer
 * - Social links
 * - Copyright dynamique
 * - Newsletter signup
 *
 * Note : Pour l'instant, le footer est intégré directement
 * dans les layouts. Ce composant sera utilisé en Phase 4+.
 */

export function Footer() {
  return (
    <footer className="border-t bg-white py-8">
      <div className="container-custom text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SmartPlanning. Tous droits réservés.</p>
        <p className="mt-2">Footer Component - Placeholder Phase 4</p>
      </div>
    </footer>
  )
}
