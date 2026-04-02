/**
 * Page d'import de donnees CSV/Excel
 *
 * @description Permet aux DIRECTOR et SYSTEM_ADMIN d'importer
 * des employes depuis un fichier CSV ou Excel.
 * Flow : upload → preview → import → resultats
 *
 * @route /app/dashboard/import
 * @ticket SP-496, SP-497
 */

'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  CreditCard,
  Users,
  ShieldCheck,
  ListChecks,
  Info,
} from 'lucide-react'
import { useCsvImport } from '@/hooks/use-csv-import'
import { CsvPreviewTable } from '@/components/import/CsvPreviewTable'
import { CsvImportResults } from '@/components/import/CsvImportResults'
import { ProgressBar } from '@/components/ui/progress-bar'

export default function ImportPage() {
  const {
    step,
    error,
    preview,
    results,
    isLoading,
    validationResults,
    validRowsCount,
    invalidRowsCount,
    processFile,
    startImport,
    reset,
  } = useCsvImport()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Options d'import
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [autoCreateTeams, setAutoCreateTeams] = useState(true)

  // Gestion du drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) void processFile(file)
    },
    [processFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) void processFile(file)
      // Reset input pour permettre de re-selectionner le meme fichier
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [processFile]
  )

  const handleStartImport = useCallback(() => {
    void startImport({ skipDuplicates, autoCreateTeams })
  }, [startImport, skipDuplicates, autoCreateTeams])

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Import de collaborateurs
        </h1>
        <p className="text-muted-foreground">
          Ajoutez rapidement vos collaborateurs depuis un fichier CSV ou Excel
        </p>
      </div>

      {/* Erreur globale */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Erreur</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ETAPE 1 : Upload */}
      {step === 'upload' && (
        <>
          {/* Guide explicatif */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Comment ça fonctionne ?
              </CardTitle>
              <CardDescription>
                En 3 étapes, importez tous vos collaborateurs depuis un simple
                fichier Excel ou CSV.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Préparez votre fichier
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Téléchargez notre modèle, remplissez-le avec vos données.
                      Seuls le prénom et le nom sont obligatoires.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Vérifiez l&apos;aperçu
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Déposez votre fichier ici. Vous verrez un aperçu de vos
                      données avant de lancer l&apos;import.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lancez l&apos;import</p>
                    <p className="text-xs text-muted-foreground">
                      Confirmez et vos collaborateurs sont créés instantanément.
                      Un rapport détaillé s&apos;affiche à la fin.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Infos pratiques */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Facturation automatique</p>
                  <p className="text-xs text-muted-foreground">
                    Votre abonnement est mis à jour automatiquement. Chaque
                    collaborateur importé est comptabilisé dans votre forfait
                    (2,90 &euro; HT/mois par collaborateur actif).
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Détection des doublons</p>
                  <p className="text-xs text-muted-foreground">
                    Si un collaborateur existe déjà (même email ou même nom), il
                    est automatiquement ignoré. Pas de risque de doublon.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Création des équipes</p>
                  <p className="text-xs text-muted-foreground">
                    Les équipes mentionnées dans votre fichier sont créées
                    automatiquement si elles n&apos;existent pas encore.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-4">
                <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Rapport détaillé</p>
                  <p className="text-xs text-muted-foreground">
                    À la fin de l&apos;import, un rapport vous indique
                    exactement combien de collaborateurs ont été créés, ignorés
                    ou en erreur.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload + Template */}
          <Card>
            <CardHeader>
              <CardTitle>Déposez votre fichier</CardTitle>
              <CardDescription>
                Formats acceptés : .csv, .xlsx, .xls — jusqu&apos;à 1 000
                collaborateurs par import
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Zone drag & drop */}
              <div
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                  isDragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click()
                  }
                }}
              >
                {isLoading ? (
                  <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
                ) : (
                  <FileSpreadsheet className="mb-4 h-10 w-10 text-muted-foreground" />
                )}
                <p className="mb-1 text-sm font-medium">
                  {isLoading
                    ? 'Analyse du fichier...'
                    : 'Glissez votre fichier ici ou cliquez pour parcourir'}
                </p>
                <p className="text-xs text-muted-foreground">
                  CSV, XLSX ou XLS
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Sélectionner un fichier CSV ou Excel"
                />
              </div>

              {/* Template */}
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="text-sm font-medium">Modèle à télécharger</p>
                  <p className="text-xs text-muted-foreground">
                    Pas encore de fichier ? Téléchargez notre modèle pré-rempli
                    avec des exemples et remplissez-le avec vos données.
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="/templates/import-employees-template.csv"
                    download="modele-import-collaborateurs.csv"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le modèle
                  </a>
                </Button>
              </div>

              {/* Info colonnes */}
              <div className="rounded-lg border border-muted bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Colonnes du fichier</p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-3">
                  <span>
                    <strong className="text-foreground">Prénom</strong> —
                    obligatoire
                  </span>
                  <span>
                    <strong className="text-foreground">Nom</strong> —
                    obligatoire
                  </span>
                  <span>Email — facultatif</span>
                  <span>Téléphone — facultatif</span>
                  <span>Poste — facultatif</span>
                  <span>Département — facultatif</span>
                  <span>Équipe — facultatif</span>
                  <span>Heures/semaine — défaut 35h</span>
                  <span>Date d&apos;embauche — facultatif</span>
                  <span>Rôle — défaut Employé</span>
                  <span>Compétences — facultatif</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ETAPE 2 : Preview */}
      {step === 'preview' && preview && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Aperçu des données</CardTitle>
                  <CardDescription>
                    Fichier : {preview.fileName} — {preview.totalRows} ligne
                    {preview.totalRows > 1 ? 's' : ''} détectée
                    {preview.totalRows > 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Changer de fichier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CsvPreviewTable
                preview={preview}
                validationResults={validationResults}
                validRowsCount={validRowsCount}
                invalidRowsCount={invalidRowsCount}
              />
            </CardContent>
          </Card>

          {/* Options d'import */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Options d&apos;import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipDuplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) =>
                    setSkipDuplicates(checked === true)
                  }
                />
                <div>
                  <Label htmlFor="skipDuplicates" className="cursor-pointer">
                    Ignorer les doublons
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Les collaborateurs déjà présents (même email ou même nom)
                    seront ignorés
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoCreateTeams"
                  checked={autoCreateTeams}
                  onCheckedChange={(checked) =>
                    setAutoCreateTeams(checked === true)
                  }
                />
                <div>
                  <Label htmlFor="autoCreateTeams" className="cursor-pointer">
                    Créer les équipes automatiquement
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Si une équipe mentionnée dans le fichier n&apos;existe pas,
                    elle sera créée
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info facturation */}
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="flex items-start gap-3 p-4">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium">
                  Impact sur votre abonnement
                </p>
                <p className="text-xs text-muted-foreground">
                  Les {preview.totalRows} collaborateur
                  {preview.totalRows > 1 ? 's' : ''} de ce fichier seront
                  ajoutés à votre effectif. Votre abonnement sera ajusté
                  automatiquement à 2,90 &euro; HT/mois par collaborateur actif.
                  Les doublons ignorés ne sont pas comptabilisés.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bouton lancer */}
          <div className="flex justify-end">
            <Button onClick={handleStartImport} disabled={isLoading} size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isLoading
                ? 'Import en cours...'
                : `Importer ${preview.totalRows} collaborateur${preview.totalRows > 1 ? 's' : ''}`}
            </Button>
          </div>
        </>
      )}

      {/* ETAPE 3 : Import en cours (SP-510) */}
      {step === 'importing' && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-6 p-12">
            <div className="text-center">
              <p className="text-lg font-medium">Import en cours...</p>
              <p className="text-sm text-muted-foreground">
                Traitement de {preview?.totalRows ?? 0} collaborateur
                {(preview?.totalRows ?? 0) > 1 ? 's' : ''} en cours...
              </p>
            </div>
            <div className="w-full max-w-md">
              <ProgressBar
                size="md"
                color="primary"
                aria-label="Import des collaborateurs en cours"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Veuillez ne pas fermer cette page.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ETAPE 4 : Resultats */}
      {step === 'results' && results && (
        <>
          <CsvImportResults results={results} />

          <div className="flex justify-between">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Nouvel import
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/dashboard/employees">Voir les employés</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
