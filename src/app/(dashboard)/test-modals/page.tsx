'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ConfirmDialog, FormDialog } from '@/components/modals'
import {
  Skeleton,
  SkeletonProvider,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  Spinner,
  SpinnerDots,
  LoadingOverlay,
  InlineLoadingOverlay,
} from '@/components/loading'
import { FormInput } from '@/components/forms'

/**
 * Page de test des composants Modals & Loading States
 * Accessible uniquement en développement (NODE_ENV === 'development')
 */

export default function TestModalsPage() {
  // Guard : dev only
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            404 - Page non trouvée
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cette page n&apos;existe pas en production.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Modals & Loading States - Tests
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Page de test des composants modaux et loading (dev only)
          </p>
          <p className="mt-1 text-sm font-medium text-amber-600 dark:text-amber-400">
            ⚠️ Cette page est uniquement visible en développement
          </p>
        </div>

        {/* ConfirmDialog Tests */}
        <ConfirmDialogTests />

        {/* FormDialog Tests */}
        <FormDialogTests />

        {/* Spinner Tests */}
        <SpinnerTests />

        {/* LoadingOverlay Tests */}
        <LoadingOverlayTests />

        {/* Skeleton Tests */}
        <SkeletonTests />
      </div>
    </div>
  )
}

// ============================================
// CONFIRM DIALOG TESTS
// ============================================
function ConfirmDialogTests() {
  const [dangerOpen, setDangerOpen] = React.useState(false)
  const [warningOpen, setWarningOpen] = React.useState(false)
  const [infoOpen, setInfoOpen] = React.useState(false)

  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        1️⃣ ConfirmDialog - 3 Variants
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Danger */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Danger (Suppression)
          </h3>
          <button
            onClick={() => setDangerOpen(true)}
            className="w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700"
          >
            Ouvrir Dialog Danger
          </button>

          <ConfirmDialog
            open={dangerOpen}
            onOpenChange={setDangerOpen}
            variant="danger"
            title="Supprimer l'employé ?"
            message="Cette action est irréversible. L'employé sera définitivement supprimé de la base de données."
            confirmLabel="Supprimer"
            cancelLabel="Annuler"
            onConfirm={() => {
              alert('Supprimé !')
              setDangerOpen(false)
            }}
            onCancel={() => setDangerOpen(false)}
          />
        </div>

        {/* Warning */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Warning (Avertissement)
          </h3>
          <button
            onClick={() => setWarningOpen(true)}
            className="w-full rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
          >
            Ouvrir Dialog Warning
          </button>

          <ConfirmDialog
            open={warningOpen}
            onOpenChange={setWarningOpen}
            variant="warning"
            title="Continuer sans sauvegarder ?"
            message="Vous avez des modifications non sauvegardées. Voulez-vous vraiment continuer ?"
            confirmLabel="Continuer"
            cancelLabel="Rester ici"
            onConfirm={() => {
              alert('Continué sans sauvegarder !')
              setWarningOpen(false)
            }}
            onCancel={() => setWarningOpen(false)}
          />
        </div>

        {/* Info */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Info (Confirmation)
          </h3>
          <button
            onClick={() => setInfoOpen(true)}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Ouvrir Dialog Info
          </button>

          <ConfirmDialog
            open={infoOpen}
            onOpenChange={setInfoOpen}
            variant="info"
            title="Envoyer l'invitation ?"
            message="Un email sera envoyé à l'employé avec ses identifiants de connexion."
            confirmLabel="Envoyer"
            cancelLabel="Annuler"
            onConfirm={() => {
              alert('Invitation envoyée !')
              setInfoOpen(false)
            }}
            onCancel={() => setInfoOpen(false)}
          />
        </div>
      </div>
    </section>
  )
}

// ============================================
// FORM DIALOG TESTS
// ============================================
function FormDialogTests() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const formSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: { name: string; email: string }) => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    alert(`Formulaire soumis !\nNom: ${data.name}\nEmail: ${data.email}`)
    setIsSubmitting(false)
    setIsOpen(false)
    reset()
  }

  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        2️⃣ FormDialog - Formulaire dans Modal
      </h2>

      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Ouvrir FormDialog
      </button>

      <FormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Créer un utilisateur"
        description="Remplissez le formulaire ci-dessous pour créer un nouvel utilisateur."
        submitLabel="Créer"
        cancelLabel="Annuler"
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        isSubmitting={isSubmitting}
        size="md"
      >
        <FormInput
          label="Nom"
          placeholder="Jean Dupont"
          required
          error={errors.name?.message}
          {...register('name')}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="jean.dupont@example.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
      </FormDialog>
    </section>
  )
}

// ============================================
// SPINNER TESTS
// ============================================
function SpinnerTests() {
  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        3️⃣ Spinner - Animation CSS Pure
      </h2>

      <div className="space-y-8">
        {/* Spinner Sizes */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Tailles (sm, md, lg, xl)
          </h3>
          <div className="flex flex-wrap items-center gap-8">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </div>
        </div>

        {/* Spinner Variants */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Variants (primary, white, current)
          </h3>
          <div className="flex flex-wrap items-center gap-8">
            <Spinner variant="primary" />
            <div className="rounded bg-blue-600 p-4">
              <Spinner variant="white" />
            </div>
            <div className="text-green-600">
              <Spinner variant="current" />
            </div>
          </div>
        </div>

        {/* Spinner with Label */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Avec label visible
          </h3>
          <Spinner size="md" label="Chargement des données..." showLabel />
        </div>

        {/* SpinnerDots */}
        <div>
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            SpinnerDots - Alternative
          </h3>
          <div className="flex flex-wrap items-center gap-8">
            <SpinnerDots size="sm" />
            <SpinnerDots size="md" />
            <SpinnerDots size="lg" />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// LOADING OVERLAY TESTS
// ============================================
function LoadingOverlayTests() {
  const [fullPageLoading, setFullPageLoading] = React.useState(false)
  const [inlineLoading, setInlineLoading] = React.useState(false)

  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        4️⃣ LoadingOverlay - Overlays de chargement
      </h2>

      <div className="space-y-6">
        {/* Full Page Overlay */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Full Page Overlay
          </h3>
          <button
            onClick={() => {
              setFullPageLoading(true)
              setTimeout(() => setFullPageLoading(false), 3000)
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Afficher LoadingOverlay (3s)
          </button>

          <LoadingOverlay
            isLoading={fullPageLoading}
            message="Chargement des données..."
            blur
          />
        </div>

        {/* Inline Overlay */}
        <div>
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Inline Overlay (relatif au container)
          </h3>
          <div className="relative min-h-[200px] rounded-lg border-2 border-dashed border-gray-300 p-4 dark:border-gray-600">
            <p className="text-gray-600 dark:text-gray-400">
              Contenu de la section...
            </p>

            <button
              onClick={() => {
                setInlineLoading(true)
                setTimeout(() => setInlineLoading(false), 3000)
              }}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Afficher InlineLoadingOverlay (3s)
            </button>

            <InlineLoadingOverlay
              isLoading={inlineLoading}
              message="Chargement..."
              blur
            />
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// SKELETON TESTS
// ============================================
function SkeletonTests() {
  const [showLoading, setShowLoading] = React.useState(true)

  return (
    <section className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-900">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        5️⃣ Skeleton - Loading Placeholders
      </h2>

      <div className="mb-6">
        <button
          onClick={() => setShowLoading(!showLoading)}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showLoading ? 'Masquer Skeletons' : 'Afficher Skeletons'}
        </button>
      </div>

      {showLoading && (
        <SkeletonProvider>
          <div className="space-y-8">
            {/* Skeleton Variants */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Variants de base
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                    Text:
                  </p>
                  <Skeleton variant="text" count={3} />
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                    Title:
                  </p>
                  <Skeleton variant="title" />
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                    Avatar:
                  </p>
                  <Skeleton variant="avatar" />
                </div>
                <div>
                  <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                    Button:
                  </p>
                  <Skeleton variant="button" width={120} />
                </div>
              </div>
            </div>

            {/* SkeletonText */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                SkeletonText (title, paragraph, caption)
              </h3>
              <div className="space-y-4">
                <SkeletonText variant="title" lines={2} />
                <SkeletonText variant="paragraph" lines={4} />
                <SkeletonText variant="caption" lines={2} />
              </div>
            </div>

            {/* SkeletonCard */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                SkeletonCard (vertical & horizontal)
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <SkeletonCard withImage withActions lines={3} />
                <SkeletonCard
                  orientation="horizontal"
                  withImage
                  withActions
                  lines={2}
                />
              </div>
            </div>

            {/* SkeletonTable */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                SkeletonTable
              </h3>
              <SkeletonTable rows={5} columns={4} withActions />
            </div>
          </div>
        </SkeletonProvider>
      )}
    </section>
  )
}
