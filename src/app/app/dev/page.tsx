/**
 * Index des pages de test - Route /app/dev
 *
 * Page d'accueil pour les pages de test des composants.
 * Accessible uniquement en développement.
 *
 * @ticket SP-123
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Guard : accessible uniquement en développement
export default function DevIndexPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound()
  }

  const testPages = [
    {
      title: 'Test Components',
      description: 'UserCard, TeamCard, AvatarStack (SP-123)',
      href: '/app/dev/test-components',
      icon: '🎨',
    },
    {
      title: 'Test Forms',
      description: 'FormInput, FormSelect, FormCheckbox, FormDatePicker',
      href: '/app/dev/test-forms',
      icon: '📝',
    },
    {
      title: 'Test Modals',
      description: 'ConfirmDialog, FormDialog, Spinners, Skeletons',
      href: '/app/dev/test-modals',
      icon: '💬',
    },
    {
      title: 'Test Toast',
      description: 'Toast System avec Sonner',
      href: '/app/dev/test-toast',
      icon: '🔔',
    },
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Pages de Test</h1>
        <p className="mt-2 text-muted-foreground">
          Composants UI et patterns SmartPlanning
        </p>
        <p className="mt-1 text-sm font-medium text-amber-600">
          Accessible uniquement en développement
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {testPages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="h-full transition-colors hover:border-primary hover:bg-accent">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span>{page.icon}</span>
                  {page.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {page.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg bg-muted p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Version: {process.env.npm_package_version || '2.0.0'} | Environment:{' '}
          {process.env.NODE_ENV}
        </p>
      </div>
    </div>
  )
}
