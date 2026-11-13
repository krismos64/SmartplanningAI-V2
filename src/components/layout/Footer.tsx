import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Pied de page de l'application connectée.
 *
 * Masqué sous `md` (SP-627) : sur un téléphone il prenait 56 px d'un écran
 * de 660, et le bouton flottant recouvrait son dernier lien. Les mêmes liens
 * restent accessibles depuis le site public.
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden border-t bg-background md:block">
      <div className="container flex h-14 items-center justify-between px-6">
        <p className="text-sm text-muted-foreground">
          {currentYear} SmartPlanning
        </p>
        <div className="flex items-center gap-4">
          <Button variant="link" size="sm" asChild>
            <Link href="/cgu">CGU</Link>
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link href="/confidentialite">Confidentialité</Link>
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </div>
    </footer>
  )
}
