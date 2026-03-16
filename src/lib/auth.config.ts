/**
 * Configuration NextAuth Edge-compatible
 *
 * J'ai séparé la config NextAuth en deux fichiers :
 * - auth.config.ts (ce fichier) : config partagée, compatible Edge Runtime
 * - auth.ts : config complète avec Prisma adapter et providers
 *
 * Pourquoi cette séparation ?
 * Le middleware Next.js s'exécute en Edge Runtime (un environnement léger
 * proche du navigateur), où Prisma (qui dépend de Node.js natif) n'est
 * pas disponible. J'ai donc isolé ici tout ce qui peut tourner en Edge :
 * les pages custom, la stratégie JWT et les callbacks (jwt, session, authorized).
 *
 * Ce fichier est le coeur de ma sécurité applicative : il gère
 * l'authentification, le RBAC, l'isolation multi-tenant, le subscription
 * guard et le mode impersonation, le tout exécuté à chaque requête
 * HTTP via le middleware Next.js.
 *
 * @see https://authjs.dev/guides/edge-compatibility
 * @see https://authjs.dev/guides/role-based-access-control
 * @ticket SP-108, SP-110, SP-440, SP-447
 */

import type { NextAuthConfig } from 'next-auth'
import {
  PUBLIC_ROUTES,
  AUTH_ROUTES,
  AUTH_API_PREFIX,
  MIDDLEWARE_EXCLUDED_ROUTES,
  ACCESS_DENIED_REDIRECT,
  IMPERSONATION_COOKIE_NAME,
} from '@/types/auth'
import {
  hasRequiredRole,
  getRequiredRoleForRoute,
  getDefaultDashboardForRole,
} from '@/lib/permissions'
import { checkSubscriptionAccess } from '@/lib/subscription-guard'

export const authConfig: NextAuthConfig = {
  /**
   * Pages personnalisées
   *
   * Je surcharge les pages par défaut de NextAuth pour utiliser mes propres
   * pages d'authentification (/login) avec le design SmartPlanning.
   * La page d'erreur pointe aussi vers /login : en cas d'erreur OAuth
   * ou de session expirée, l'utilisateur est redirigé vers le formulaire
   * de connexion avec un message d'erreur contextuel.
   */
  pages: {
    signIn: '/login',
    error: '/login',
  },

  /**
   * Stratégie de session : JWT
   *
   * J'ai choisi JWT plutôt que les sessions en base de données pour
   * plusieurs raisons :
   * 1. Performance : pas de requête DB à chaque requête HTTP
   * 2. Edge-compatible : le token JWT est lisible dans le middleware
   *    sans accès à la base de données
   * 3. Simplicité de déploiement : pas de table sessions à gérer
   *
   * Le token expire après 30 jours (maxAge) et se rafraîchit
   * automatiquement toutes les 24h (updateAge) pour mettre à jour
   * les données embarquées (rôle, subscription, etc.)
   */
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours en secondes
    updateAge: 24 * 60 * 60, // Rafraîchissement toutes les 24h
  },

  callbacks: {
    /**
     * Callback JWT — enrichissement du token avec les données métier
     *
     * Ce callback est appelé à chaque création ou rafraîchissement du token.
     * C'est ici que j'embarque dans le JWT toutes les données nécessaires
     * au RBAC et à l'isolation multi-tenant :
     * - role : pour le contrôle d'accès aux routes (RBAC)
     * - companyId : pour l'isolation multi-tenant (chaque requête Prisma
     *   filtre par ce companyId, garantissant qu'un client ne voit jamais
     *   les données d'un autre)
     * - subscriptionStatus/trialEndsAt : pour le subscription guard
     *   qui bloque l'accès aux routes si l'abonnement est expiré
     *
     * Ce callback doit impérativement être dans authConfig (et non dans
     * auth.ts) car le middleware Edge a besoin de lire ces données.
     */
    async jwt({ token, user, trigger, session }) {
      // --- Premier login : l'objet user est fourni par le provider ---
      // On copie les données de l'utilisateur dans le token JWT
      // pour qu'elles soient disponibles à chaque requête suivante
      if (user) {
        token.id = user.id
        token.role = user.role
        token.companyId = user.companyId
        token.emailVerified = user.emailVerified
        token.image = user.image
        // Données subscription embarquées dans le JWT pour que le middleware
        // puisse vérifier l'abonnement sans requête DB (SP-440)
        token.subscriptionStatus = user.subscriptionStatus ?? null
        token.trialEndsAt = user.trialEndsAt ?? null
        token.currentPeriodEnd = user.currentPeriodEnd ?? null
        token.subscriptionCheckedAt = Date.now()
      }

      // --- Mise à jour ponctuelle de la session ---
      // Déclenché côté client via session.update({ image: '...' })
      // Cas d'usage : après upload d'avatar sur Cloudinary, on met
      // à jour l'URL de l'image dans le token sans re-login
      if (trigger === 'update' && session?.image !== undefined) {
        token.image = session.image
      }

      // --- Gestion du mode impersonation (SP-447) ---
      // Permet au SYSTEM_ADMIN de "voir l'espace client" d'une entreprise
      // en lecture seule, sans se déconnecter de sa propre session.
      // Déclenché via POST /api/admin/impersonate côté client, qui appelle
      // session.update() avec les données de l'entreprise cible.
      if (trigger === 'update' && session?.isImpersonating !== undefined) {
        if (session.isImpersonating === true) {
          // Démarrage : on sauvegarde l'identité admin originale
          // puis on override le token avec l'identité de l'utilisateur cible
          token.isImpersonating = true
          token.originalAdminId = session.originalAdminId as string
          token.impersonatedUserId = session.impersonatedUserId as string
          token.impersonatedCompanyId = session.impersonatedCompanyId as string
          token.impersonatedUserEmail = session.impersonatedUserEmail as string
          token.impersonatedCompanyName =
            session.impersonatedCompanyName as string
          // L'override du rôle et du companyId permet au RBAC et aux
          // Server Actions de fonctionner transparemment avec les données
          // de l'entreprise impersonnée
          token.role =
            session.impersonatedRole as import('@prisma/client').UserRole
          token.companyId = session.impersonatedCompanyId as string
          token.originalId = token.id
          token.id = session.impersonatedUserId as string
        } else {
          // Arrêt : on restaure l'identité admin originale
          // et on nettoie toutes les données d'impersonation
          token.isImpersonating = undefined
          token.role = 'SYSTEM_ADMIN' as import('@prisma/client').UserRole
          token.companyId = null
          token.id = (token.originalId as string) ?? token.id
          token.originalId = undefined
          token.originalAdminId = undefined
          token.impersonatedUserId = undefined
          token.impersonatedCompanyId = undefined
          token.impersonatedUserEmail = undefined
          token.impersonatedCompanyName = undefined
        }
      }

      // Persistance de l'impersonation : à chaque rafraîchissement du token,
      // on re-applique les overrides pour éviter que le token ne "revienne"
      // aux données de l'admin entre deux refreshes
      if (token.isImpersonating && token.impersonatedCompanyId) {
        token.companyId = token.impersonatedCompanyId as string
        token.id = token.impersonatedUserId as string
      }

      // --- Rafraîchissement périodique des données subscription (SP-440) ---
      // Toutes les 5 minutes, on interroge la base pour mettre à jour
      // le statut d'abonnement dans le JWT. Cela permet de détecter
      // un changement de statut Stripe (paiement échoué, annulation...)
      // sans attendre le prochain login.
      //
      // Conditions pour ne PAS rafraîchir :
      // - Pas de companyId (SYSTEM_ADMIN sans entreprise)
      // - Rôle SYSTEM_ADMIN (pas concerné par les abonnements)
      // - Mode impersonation actif (on garde les données de la company cible)
      const SUBSCRIPTION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
      const checkedAt = token.subscriptionCheckedAt as number | null
      if (
        token.companyId &&
        token.role !== 'SYSTEM_ADMIN' &&
        !token.isImpersonating &&
        (!checkedAt || Date.now() - checkedAt > SUBSCRIPTION_CHECK_INTERVAL)
      ) {
        try {
          // Import dynamique de Prisma : cette technique permet au code
          // de fonctionner dans les deux environnements :
          // - Côté serveur Node.js : l'import réussit, on fetch la DB
          // - En Edge Runtime (middleware) : l'import échoue silencieusement,
          //   le catch conserve les données existantes du token
          const { prisma } = await import('@/lib/prisma')
          const company = await prisma.company.findUnique({
            where: { id: token.companyId as string },
            select: {
              trialEndsAt: true,
              subscription: {
                select: {
                  status: true,
                  currentPeriodEnd: true,
                },
              },
            },
          })
          if (company) {
            token.subscriptionStatus = company.subscription?.status ?? null
            token.trialEndsAt = company.trialEndsAt?.toISOString() ?? null
            token.currentPeriodEnd =
              company.subscription?.currentPeriodEnd?.toISOString() ?? null
            token.subscriptionCheckedAt = Date.now()
          }
        } catch {
          // En Edge Runtime, l'import Prisma échoue — c'est le comportement
          // attendu. Le token conserve ses valeurs existantes jusqu'au
          // prochain passage côté serveur Node.js.
        }
      }

      return token
    },

    /**
     * Callback Session — projection du token vers session.user
     *
     * Ce callback est appelé à chaque fois qu'un composant ou une
     * Server Action accède à la session via auth() ou useSession().
     * Il projette les données custom du token JWT vers l'objet
     * session.user, qui est l'interface publique côté application.
     *
     * Sans ce callback, session.user ne contiendrait que les champs
     * par défaut de NextAuth (name, email, image). Ici j'expose :
     * - Les données RBAC (role, companyId) pour le contrôle d'accès
     * - Les données subscription pour les bannières d'avertissement
     * - Les données impersonation pour la bannière "mode support"
     */
    session({ session, token }) {
      if (session.user && token) {
        // Données d'identité et RBAC
        session.user.id = token.id as string
        session.user.role = token.role as import('@prisma/client').UserRole
        session.user.companyId = token.companyId as string | null
        session.user.emailVerified = token.emailVerified as Date | null
        session.user.image = token.image as string | null
        // Données subscription pour les composants UI
        // (bannières trial, alertes paiement échoué, etc.)
        session.user.subscriptionStatus = token.subscriptionStatus as
          | string
          | null
        session.user.trialEndsAt = token.trialEndsAt as string | null
        session.user.currentPeriodEnd = token.currentPeriodEnd as string | null
        // Données impersonation pour la bannière "Vous consultez l'espace de..."
        session.user.isImpersonating = token.isImpersonating ?? false
        session.user.originalAdminId = token.originalAdminId as
          | string
          | undefined
        session.user.impersonatedUserId = token.impersonatedUserId as
          | string
          | undefined
        session.user.impersonatedCompanyId = token.impersonatedCompanyId as
          | string
          | undefined
        session.user.impersonatedUserEmail = token.impersonatedUserEmail as
          | string
          | undefined
        session.user.impersonatedCompanyName = token.impersonatedCompanyName as
          | string
          | undefined
      }
      return session
    },

    /**
     * Callback authorized — le middleware de sécurité principal
     *
     * C'est la fonction la plus critique de l'application : elle est
     * exécutée par le middleware Next.js à CHAQUE requête HTTP sur
     * les routes /app/*. Elle implémente 8 niveaux de vérification
     * en cascade (early return pattern) :
     *
     * 1. Routes API auth (/api/auth/*) → toujours accessibles (NextAuth)
     * 2. Routes exclues (invitations) → bypass pour les liens email
     * 3. Routes d'auth (login/register) → redirect si déjà connecté
     * 4. Routes publiques (/, /tarifs, CGV...) → accessibles à tous
     * 5. Routes /app/* non authentifié → redirect vers /login
     * 6. RBAC → vérification du rôle requis pour la route
     * 7. Impersonation Guard → bloque admin/billing en mode support
     * 8. Subscription Guard → bloque si abonnement expiré/impayé
     *
     * L'ordre est important : les vérifications les moins coûteuses
     * (string comparison) sont en premier, les plus complexes
     * (parsing de cookie, vérification subscription) en dernier.
     */
    authorized({ auth, request }) {
      const { nextUrl } = request
      const isLoggedIn = !!auth
      const pathname = nextUrl.pathname
      const userRole = auth?.user?.role

      // --- Etape 1 : Routes API auth ---
      // Les endpoints NextAuth (/api/auth/signin, /api/auth/callback...)
      // doivent toujours être accessibles, sinon l'authentification
      // elle-même serait bloquée
      if (pathname.startsWith(AUTH_API_PREFIX)) {
        return true
      }

      // --- Etape 2 : Routes exclues du middleware ---
      // Certaines routes comme /activate-account doivent être accessibles
      // sans auth (liens d'invitation par email avec token temporaire)
      const isExcludedRoute = MIDDLEWARE_EXCLUDED_ROUTES.some((route) =>
        pathname.startsWith(route)
      )
      if (isExcludedRoute) {
        return true
      }

      // --- Etape 3 : Routes d'authentification ---
      // Si un utilisateur déjà connecté accède à /login ou /register,
      // on le redirige vers son dashboard selon son rôle.
      // IMPORTANT : cette vérification est AVANT les routes publiques
      // car /login est dans les deux listes (publique + auth)
      const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
      )
      if (isAuthRoute) {
        if (isLoggedIn) {
          const redirectUrl = getDefaultDashboardForRole(userRole)
          return Response.redirect(new URL(redirectUrl, nextUrl))
        }
        return true
      }

      // --- Etape 4 : Routes publiques ---
      // Landing page, tarifs, CGV, mentions légales...
      // Accessibles à tous, connectés ou non
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      )
      if (isPublicRoute) {
        return true
      }

      // --- Etape 5 : Protection des routes /app/* ---
      // Toute route /app/* nécessite une authentification.
      // Si non connecté, on redirige vers /login en sauvegardant
      // l'URL d'origine dans callbackUrl pour y revenir après login
      const isAppRoute = pathname.startsWith('/app')
      if (isAppRoute && !isLoggedIn) {
        const callbackUrl = encodeURIComponent(pathname + nextUrl.search)
        return Response.redirect(
          new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
        )
      }

      // --- Etape 6 : RBAC (Role-Based Access Control) ---
      // Chaque route /app/* peut exiger un rôle minimum.
      // Exemple : /app/admin/* exige SYSTEM_ADMIN,
      // /app/dashboard/employees exige au moins MANAGER.
      // La fonction getRequiredRoleForRoute() retourne le rôle requis
      // et hasRequiredRole() vérifie la hiérarchie (SYSTEM_ADMIN > DIRECTOR > MANAGER > EMPLOYEE)
      if (isLoggedIn && isAppRoute) {
        const requiredRole = getRequiredRoleForRoute(pathname)

        if (requiredRole && !hasRequiredRole(userRole, requiredRole)) {
          // Redirection silencieuse vers le dashboard par défaut
          // plutôt qu'une page 403, pour une meilleure UX
          return Response.redirect(new URL(ACCESS_DENIED_REDIRECT, nextUrl))
        }
      }

      // --- Etape 7 : Impersonation Guard (SP-453, SP-454) ---
      // Quand un SYSTEM_ADMIN est en mode "voir l'espace client",
      // il ne doit PAS pouvoir accéder au panel admin ni à la
      // facturation de l'entreprise impersonnée (lecture seule).
      // On détecte l'impersonation via un cookie HttpOnly sécurisé
      // plutôt que via la session, car c'est plus fiable en Edge Runtime.
      const isImpersonationBlockedRoute =
        pathname.startsWith('/app/admin') ||
        pathname.startsWith('/app/dashboard/billing')
      if (isLoggedIn && isImpersonationBlockedRoute) {
        try {
          const impersonationCookie = request.cookies.get(
            IMPERSONATION_COOKIE_NAME
          )
          if (impersonationCookie?.value) {
            const parsed: unknown = JSON.parse(impersonationCookie.value)
            if (
              typeof parsed === 'object' &&
              parsed !== null &&
              'originalAdminId' in parsed
            ) {
              // Redirige vers le dashboard de l'entreprise impersonnée
              return Response.redirect(new URL('/app/dashboard', nextUrl))
            }
          }
        } catch {
          // Cookie invalide ou corrompu — on ignore et on laisse passer
          // (le RBAC classique prendra le relais si nécessaire)
        }
      }

      // --- Etape 8 : Subscription Guard (SP-440) ---
      // Vérifie que l'abonnement Stripe de l'entreprise est actif.
      // Si expiré/impayé, redirige vers la page billing avec un motif.
      //
      // La logique est externalisée dans checkSubscriptionAccess(),
      // une fonction pure (sans effets de bord) qui gère les exemptions :
      // - SYSTEM_ADMIN : jamais bloqué (pas d'abonnement)
      // - Routes billing/profile/settings : toujours accessibles
      //   (sinon l'utilisateur ne pourrait pas payer ou se déconnecter)
      //
      // SP-456 : En mode impersonation, on bypass cette vérification
      // car les données subscription du JWT sont celles de l'admin,
      // pas de l'entreprise impersonnée — ça bloquerait à tort
      if (isLoggedIn && isAppRoute) {
        let isImpersonating = false
        try {
          const impCookie = request.cookies.get(IMPERSONATION_COOKIE_NAME)
          if (impCookie?.value) {
            const parsed: unknown = JSON.parse(impCookie.value)
            if (
              typeof parsed === 'object' &&
              parsed !== null &&
              'originalAdminId' in parsed
            ) {
              isImpersonating = true
            }
          }
        } catch {
          // Cookie invalide — on ne bypass PAS par sécurité
        }

        if (!isImpersonating) {
          const subscriptionCheck = checkSubscriptionAccess({
            role: (userRole as string) ?? '',
            subscriptionStatus: auth?.user?.subscriptionStatus ?? null,
            trialEndsAt: auth?.user?.trialEndsAt ?? null,
            currentPeriodEnd: auth?.user?.currentPeriodEnd ?? null,
            pathname,
          })

          if (!subscriptionCheck.allowed) {
            // Redirection vers billing avec le motif (trial_expired,
            // past_due, canceled...) pour afficher le bon message
            const billingUrl = new URL('/app/dashboard/billing', nextUrl)
            if (subscriptionCheck.redirectReason) {
              billingUrl.searchParams.set(
                'reason',
                subscriptionCheck.redirectReason
              )
            }
            return Response.redirect(billingUrl)
          }
        }
      }

      // Routes hors /app/* non couvertes : autorisées par défaut
      if (!isAppRoute) {
        return true
      }

      // Par défaut : autorisé si authentifié sur une route /app/*
      return isLoggedIn
    },
  },

  /**
   * Providers vides
   *
   * Les providers (Credentials avec bcrypt) sont définis dans auth.ts
   * car bcrypt nécessite Node.js natif, incompatible avec Edge Runtime.
   * Ce fichier ne contient que la config partageable entre auth.ts
   * et middleware.ts.
   */
  providers: [],
}
