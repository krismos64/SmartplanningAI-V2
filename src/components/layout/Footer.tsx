import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

interface FooterProps {
  variant?: 'dashboard' | 'public'
}

export function Footer({ variant = 'dashboard' }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const version = '2.0.0'

  if (variant === 'dashboard') {
    // Version minimaliste pour le dashboard
    return (
      <footer className="border-t bg-background">
        <div className="container flex h-14 items-center justify-between px-6">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SmartPlanning · v{version}
          </p>
          <div className="flex items-center gap-4">
            <Button variant="link" size="sm" asChild>
              <Link href="/legal/cgu">CGU</Link>
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/legal/confidentialite">Confidentialité</Link>
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </footer>
    )
  }

  // Version complète pour les pages publiques (landing, login, etc.)
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo & Tagline */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">SmartPlanning</h3>
            <p className="text-sm text-muted-foreground">
              Plateforme SaaS de gestion intelligente des plannings
            </p>
            <p className="text-xs text-muted-foreground">Version {version}</p>
          </div>

          {/* Navigation links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Liens utiles</h4>
            <nav className="flex flex-col space-y-2">
              <Button variant="link" size="sm" asChild className="justify-start">
                <Link href="/legal/cgu">Conditions générales</Link>
              </Button>
              <Button
                variant="link"
                size="sm"
                asChild
                className="justify-start"
              >
                <Link href="/legal/confidentialite">
                  Politique de confidentialité
                </Link>
              </Button>
              <Button variant="link" size="sm" asChild className="justify-start">
                <Link href="/contact">Nous contacter</Link>
              </Button>
              <Button variant="link" size="sm" asChild className="justify-start">
                <Link href="/docs">Documentation</Link>
              </Button>
            </nav>
          </div>

          {/* Social & Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Restez connecté</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" asChild>
                <a
                  href="https://github.com/krismos64"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href="https://christophe-dev-freelance.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Site web"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                </a>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} SmartPlanning. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Développé par{' '}
            <a
              href="https://christophe-dev-freelance.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4 hover:text-primary"
            >
              Christophe Mostefaoui
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
