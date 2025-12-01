"use client";

import React from "react";
import { useToast, toastWithAction, toastWithDescription, toastPersistent } from "@/components/toast";

/**
 * Page de test du Toast System (Sonner)
 * Accessible uniquement en développement (NODE_ENV === 'development')
 */

export default function TestToastPage() {
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
            Toast System - Tests
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Page de test des notifications toast avec Sonner (dev only)
          </p>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ Cette page est uniquement visible en développement
          </p>
        </div>

        {/* Toast Variants */}
        <ToastVariantsTests />

        {/* Toast with Description */}
        <ToastDescriptionTests />

        {/* Toast with Action */}
        <ToastActionTests />

        {/* Toast Promise */}
        <ToastPromiseTests />

        {/* Toast Custom */}
        <ToastCustomTests />

        {/* Toast Control */}
        <ToastControlTests />
      </div>
    </div>
  );
}

// ============================================
// TOAST VARIANTS TESTS
// ============================================
function ToastVariantsTests() {
  const { success, error, warning, info, loading, message } = useToast();

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        1️⃣ Toast Variants - 6 types
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Success */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
            Success
          </h3>
          <button
            onClick={() => success("Opération réussie !")}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            Afficher Success
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Checkmark vert - Confirmations
          </p>
        </div>

        {/* Error */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Error
          </h3>
          <button
            onClick={() => error("Une erreur est survenue")}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Afficher Error
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Icon rouge - Erreurs, validations
          </p>
        </div>

        {/* Warning */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            Warning
          </h3>
          <button
            onClick={() => warning("Attention : action irréversible")}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            Afficher Warning
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Icon jaune - Avertissements
          </p>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            Info
          </h3>
          <button
            onClick={() => info("Nouvelle fonctionnalité disponible")}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Afficher Info
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Icon bleu - Informations
          </p>
        </div>

        {/* Loading */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Loading
          </h3>
          <button
            onClick={() => {
              loading("Chargement en cours...");
              setTimeout(() => {
                success("Chargement terminé !");
              }, 2000);
            }}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Afficher Loading (2s)
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Spinner - Opérations en cours
          </p>
        </div>

        {/* Default */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Default
          </h3>
          <button
            onClick={() => message("Message par défaut")}
            className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            Afficher Default
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Neutre - Messages génériques
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// TOAST WITH DESCRIPTION TESTS
// ============================================
function ToastDescriptionTests() {
  const { success } = useToast();

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        2️⃣ Toast with Description - Détails supplémentaires
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Méthode 1 : Options object
          </h3>
          <button
            onClick={() =>
              success("Employé créé avec succès", {
                description: "Jean Dupont a été ajouté à l'équipe RH",
              })
            }
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Success avec description
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Méthode 2 : Helper function
          </h3>
          <button
            onClick={() =>
              toastWithDescription(
                "Échec de la sauvegarde",
                "Veuillez vérifier votre connexion internet",
                { duration: 5000 }
              )
            }
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Error avec description
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
          {`success("Titre", { description: "Détails..." })`}
        </p>
      </div>
    </section>
  );
}

// ============================================
// TOAST WITH ACTION TESTS
// ============================================
function ToastActionTests() {
  const { success } = useToast();
  const [deleted, setDeleted] = React.useState(false);

  const handleDelete = () => {
    setDeleted(true);

    toastWithAction(
      "Employé supprimé",
      {
        label: "Annuler",
        onClick: () => {
          setDeleted(false);
          success("Suppression annulée");
        },
      },
      {
        duration: 5000,
      }
    );
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        3️⃣ Toast with Action - Bouton d&apos;action
      </h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <span className="text-gray-900 dark:text-gray-100">
            État : {deleted ? "❌ Supprimé" : "✅ Actif"}
          </span>
          <button
            onClick={handleDelete}
            disabled={deleted}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            Supprimer
          </button>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            💡 <strong>Astuce :</strong> Le bouton "Annuler" apparaît dans le toast.
            Vous avez 5 secondes pour annuler la suppression.
          </p>
        </div>

        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
            {`toastWithAction("Message", { label: "Annuler", onClick: () => {} })`}
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// TOAST PROMISE TESTS
// ============================================
function ToastPromiseTests() {
  const { promise } = useToast();

  const simulateAPICall = (shouldFail: boolean): Promise<{ name: string }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error("Erreur réseau - Impossible de créer l'employé"));
        } else {
          resolve({ name: "Jean Dupont" });
        }
      }, 2000);
    });
  };

  const handleSuccess = () => {
    promise(simulateAPICall(false), {
      loading: "Création de l'employé...",
      success: (data) => `${data.name} créé avec succès !`,
      error: (err) => `Erreur : ${err.message}`,
    });
  };

  const handleError = () => {
    promise(simulateAPICall(true), {
      loading: "Tentative de création...",
      success: "Succès !",
      error: (err) => `${err.message}`,
    });
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        4️⃣ Toast Promise - Gestion automatique loading/success/error
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
            Simulation succès
          </h3>
          <button
            onClick={handleSuccess}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            API Call Success (2s)
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Loading → Success automatique
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Simulation erreur
          </h3>
          <button
            onClick={handleError}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            API Call Error (2s)
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Loading → Error automatique
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-2">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
          {`promise(myPromise, {`}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono ml-4">
          {`loading: "Chargement...",`}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono ml-4">
          {`success: (data) => \`Succès: \${data}\`,`}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono ml-4">
          {`error: (err) => \`Erreur: \${err.message}\``}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
          {`})`}
        </p>
      </div>
    </section>
  );
}

// ============================================
// TOAST CUSTOM TESTS
// ============================================
function ToastCustomTests() {
  const { custom } = useToast();

  const showCustomToast = () => {
    custom(
      <div className="flex items-center gap-3 p-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
          SP
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-gray-100">
            SmartPlanning
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Toast personnalisé avec JSX
          </p>
        </div>
      </div>
    );
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        5️⃣ Toast Custom - JSX personnalisé
      </h2>

      <div className="space-y-4">
        <button
          onClick={showCustomToast}
          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors"
        >
          Afficher Toast Custom
        </button>

        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
          <p className="text-sm text-purple-900 dark:text-purple-100">
            💡 <strong>Astuce :</strong> Vous pouvez passer n&apos;importe quel JSX React
            comme contenu de toast pour des notifications complexes.
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================
// TOAST CONTROL TESTS
// ============================================
function ToastControlTests() {
  const { success, dismiss, dismissAll, getToasts } = useToast();
  const [toastId, setToastId] = React.useState<string | number | undefined>();

  const showPersistent = () => {
    const id = toastPersistent("Ce toast reste affiché (duration: Infinity)");
    setToastId(id);
  };

  const showMultiple = () => {
    success("Toast 1");
    setTimeout(() => success("Toast 2"), 200);
    setTimeout(() => success("Toast 3"), 400);
    setTimeout(() => success("Toast 4"), 600);
    setTimeout(() => success("Toast 5"), 800);
  };

  const showActive = () => {
    const active = getToasts();
    console.log("Toasts actifs :", active);
    success(`${active.length} toast(s) actif(s) (voir console)`);
  };

  return (
    <section className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        6️⃣ Toast Control - Contrôle programmatique
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Persistent */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Toast Persistent
          </h3>
          <button
            onClick={showPersistent}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Afficher Persistent
          </button>
        </div>

        {/* Dismiss specific */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Fermer spécifique
          </h3>
          <button
            onClick={() => dismiss(toastId)}
            disabled={!toastId}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Fermer Persistent
          </button>
        </div>

        {/* Dismiss all */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Fermer tous
          </h3>
          <button
            onClick={dismissAll}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Fermer Tous
          </button>
        </div>

        {/* Multiple toasts */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Multiple toasts
          </h3>
          <button
            onClick={showMultiple}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Afficher 5 toasts
          </button>
        </div>

        {/* Get active */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Toasts actifs
          </h3>
          <button
            onClick={showActive}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Compter actifs
          </button>
        </div>

        {/* Duration custom */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Duration custom
          </h3>
          <button
            onClick={() => success("Toast 10 secondes", { duration: 10000 })}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors text-sm"
          >
            Toast 10s
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-1">
        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
          {`dismiss(id) // Fermer un toast spécifique`}
        </p>
        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
          {`dismissAll() // Fermer tous les toasts`}
        </p>
        <p className="text-xs text-gray-700 dark:text-gray-300 font-mono">
          {`getToasts() // Liste des toasts actifs`}
        </p>
      </div>
    </section>
  );
}
