/**
 * Page d'export des données personnelles
 *
 * Server Component avec vérification d'authentification.
 * Permet à l'utilisateur d'exercer son droit à la portabilité (RGPD Article 20).
 *
 * @ticket SP-278
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ArrowLeft, FileJson, Shield, Info } from 'lucide-react'
import Link from 'next/link'

import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ExportDataButton } from '../_components'

export const metadata: Metadata = {
  title: 'Exporter mes données | SmartPlanning',
  description:
    'Téléchargez toutes vos données personnelles au format JSON (RGPD Article 20)',
}

export default async function ExportDataPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/connexion')
  }

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      {/* Navigation retour */}
      <Button variant="ghost" size="sm" asChild data-testid="back-to-profile">
        <Link href="/app/profile" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour au profil
        </Link>
      </Button>

      {/* Titre */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Exporter mes données
        </h1>
        <p className="text-muted-foreground">
          Exercez votre droit à la portabilité conformément au RGPD (Article 20)
        </p>
      </div>

      {/* Carte d'information RGPD */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>RGPD Article 20 - Droit à la portabilité</AlertTitle>
        <AlertDescription>
          Vous avez le droit de recevoir vos données personnelles dans un format
          structuré, couramment utilisé et lisible par machine.
        </AlertDescription>
      </Alert>

      {/* Carte principale */}
      <Card className="glass" data-testid="export-data-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-primary" />
            Export de données
          </CardTitle>
          <CardDescription>
            Téléchargez toutes vos données personnelles au format JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Liste des données incluses */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Données incluses :</h3>
            <ul className="grid gap-1.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Informations de votre compte
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Profil employé et compétences
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Historique des plannings
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Demandes de congés et soldes
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Disponibilités déclarées
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Notes personnelles
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Notifications reçues
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Notes d&apos;incident rédigées
              </li>
            </ul>
          </div>

          {/* Note sur les données exclues */}
          <Alert variant="default" className="bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Pour des raisons de sécurité, les mots de passe et tokens
              d&apos;authentification ne sont jamais inclus dans l&apos;export.
            </AlertDescription>
          </Alert>

          {/* Bouton d'export */}
          <div className="flex justify-end pt-4">
            <ExportDataButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
