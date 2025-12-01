"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ConfirmDialog, FormDialog } from "@/components/modals";
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
} from "@/components/loading";
import { FormInput } from "@/components/forms";

/**
 * Page de test des composants Modals & Loading States
 * Accessible uniquement en développement (NODE_ENV === 'development')
 */

export default function TestModalsPage() {
  // Guard : dev only
  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            404 - Page non trouvée
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cette page n&apos;existe pas en production.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            Modals & Loading States - Tests
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Page de test des composants modaux et loading (dev only)
          </p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400 font-medium">
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
  );
}

// ============================================
// CONFIRM DIALOG TESTS
// ============================================
function ConfirmDialogTests() {
  const [dangerOpen, setDangerOpen] = React.useState(false);
  const [warningOpen, setWarningOpen] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        1️⃣ ConfirmDialog - 3 Variants
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Danger */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Danger (Suppression)
          </h3>
          <button
            onClick={() => setDangerOpen(true)}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
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
              alert("Supprimé !");
              setDangerOpen(false);
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
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
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
              alert("Continué sans sauvegarder !");
              setWarningOpen(false);
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
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
              alert("Invitation envoyée !");
              setInfoOpen(false);
            }}
            onCancel={() => setInfoOpen(false)}
          />
        </div>
      </div>
    </section>
  );
}

// ============================================
// FORM DIALOG TESTS
// ============================================
function FormDialogTests() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert(`Formulaire soumis !\nNom: ${data.name}\nEmail: ${data.email}`);
    setIsSubmitting(false);
    setIsOpen(false);
    reset();
  });

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        2️⃣ FormDialog - Formulaire dans Modal
      </h2>

      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        size="md"
      >
        <FormInput
          label="Nom"
          placeholder="Jean Dupont"
          required
          error={errors.name?.message}
          {...register("name")}
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="jean.dupont@example.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />
      </FormDialog>
    </section>
  );
}

// ============================================
// SPINNER TESTS
// ============================================
function SpinnerTests() {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        3️⃣ Spinner - Animation CSS Pure
      </h2>

      <div className="space-y-8">
        {/* Spinner Sizes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Tailles (sm, md, lg, xl)
          </h3>
          <div className="flex items-center gap-8 flex-wrap">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
            <Spinner size="xl" />
          </div>
        </div>

        {/* Spinner Variants */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Variants (primary, white, current)
          </h3>
          <div className="flex items-center gap-8 flex-wrap">
            <Spinner variant="primary" />
            <div className="p-4 bg-blue-600 rounded">
              <Spinner variant="white" />
            </div>
            <div className="text-green-600">
              <Spinner variant="current" />
            </div>
          </div>
        </div>

        {/* Spinner with Label */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Avec label visible
          </h3>
          <Spinner
            size="md"
            label="Chargement des données..."
            showLabel
          />
        </div>

        {/* SpinnerDots */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            SpinnerDots - Alternative
          </h3>
          <div className="flex items-center gap-8 flex-wrap">
            <SpinnerDots size="sm" />
            <SpinnerDots size="md" />
            <SpinnerDots size="lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// LOADING OVERLAY TESTS
// ============================================
function LoadingOverlayTests() {
  const [fullPageLoading, setFullPageLoading] = React.useState(false);
  const [inlineLoading, setInlineLoading] = React.useState(false);

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        4️⃣ LoadingOverlay - Overlays de chargement
      </h2>

      <div className="space-y-6">
        {/* Full Page Overlay */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Full Page Overlay
          </h3>
          <button
            onClick={() => {
              setFullPageLoading(true);
              setTimeout(() => setFullPageLoading(false), 3000);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Inline Overlay (relatif au container)
          </h3>
          <div className="relative min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400">
              Contenu de la section...
            </p>

            <button
              onClick={() => {
                setInlineLoading(true);
                setTimeout(() => setInlineLoading(false), 3000);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
  );
}

// ============================================
// SKELETON TESTS
// ============================================
function SkeletonTests() {
  const [showLoading, setShowLoading] = React.useState(true);

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        5️⃣ Skeleton - Loading Placeholders
      </h2>

      <div className="mb-6">
        <button
          onClick={() => setShowLoading(!showLoading)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {showLoading ? "Masquer Skeletons" : "Afficher Skeletons"}
        </button>
      </div>

      {showLoading && (
        <SkeletonProvider>
          <div className="space-y-8">
            {/* Skeleton Variants */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Variants de base
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Text:</p>
                  <Skeleton variant="text" count={3} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Title:</p>
                  <Skeleton variant="title" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avatar:</p>
                  <Skeleton variant="avatar" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Button:</p>
                  <Skeleton variant="button" width={120} />
                </div>
              </div>
            </div>

            {/* SkeletonText */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                SkeletonCard (vertical & horizontal)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                SkeletonTable
              </h3>
              <SkeletonTable rows={5} columns={4} withActions />
            </div>
          </div>
        </SkeletonProvider>
      )}
    </section>
  );
}
