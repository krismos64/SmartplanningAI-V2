'use client'

/**
 * ForbiddenPage Component - SP-305
 *
 * Custom 403 error page with friendly messaging and navigation options.
 * Designed with Shadcn/ui components and Framer Motion animations.
 *
 * @see Context7 Documentation:
 * - Next.js 15: forbidden.tsx file convention for 403 pages
 * - Framer Motion: staggerChildren for cascading entry animations
 * - Accessibility: role="main", aria-label, aria-labelledby, aria-describedby
 *
 * @ticket SP-305
 */

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Home, LayoutDashboard, Mail, ShieldAlert } from 'lucide-react'
import {
  motion,
  staggerContainer,
  staggerItem,
  scaleVariants,
  pulseAnimation,
} from '@/lib/animations'

/**
 * Props for ForbiddenPage component
 */
export interface ForbiddenPageProps {
  /** Custom reason for the access denial */
  reason?: string
  /** Role required to access the resource */
  requiredRole?: string
  /** Current user role */
  currentRole?: string
  /** Show the "Contact admin" button (default: true) */
  showContactAdmin?: boolean
}

/**
 * ForbiddenPage - Custom 403 error page component
 *
 * Features:
 * - ShieldAlert icon with pulse animation
 * - Large error code with gradient text (orange/warning)
 * - Empathetic messaging in French
 * - "Dashboard" button → navigation to /dashboard
 * - "Home" button → navigation to /
 * - "Contact admin" link → navigation to /contact
 * - Fully responsive (mobile-first)
 * - Dark mode support via Tailwind/Shadcn
 * - WCAG 2.1 AA accessible
 *
 * @param props - Component props
 * @returns Complete 403 error page UI
 */
export function ForbiddenPage({
  reason,
  requiredRole,
  currentRole,
  showContactAdmin = true,
}: ForbiddenPageProps) {
  const router = useRouter()

  /**
   * Navigate to dashboard
   */
  const handleGoDashboard = () => {
    router.push('/dashboard')
  }

  /**
   * Navigate to home page
   */
  const handleGoHome = () => {
    router.push('/')
  }

  /**
   * Navigate to contact page to reach admin
   */
  const handleContactAdmin = () => {
    router.push('/contact')
  }

  /**
   * Build the description message
   */
  const getDescription = () => {
    if (reason) {
      return reason
    }
    if (requiredRole && currentRole) {
      return `Cette page nécessite le rôle "${requiredRole}". Votre rôle actuel est "${currentRole}".`
    }
    if (requiredRole) {
      return `Cette page nécessite le rôle "${requiredRole}" pour y accéder.`
    }
    return "Vous n'avez pas les permissions nécessaires pour accéder à cette page. Si vous pensez qu'il s'agit d'une erreur, contactez votre administrateur."
  }

  return (
    <motion.main
      role="main"
      aria-label="Accès refusé"
      aria-labelledby="forbidden-title"
      aria-describedby="forbidden-description"
      className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      data-testid="forbidden-page"
    >
      <Card className="w-full max-w-md border-orange-500/20 bg-orange-500/5">
        <CardHeader className="text-center">
          {/* Shield Icon with pulse */}
          <motion.div
            variants={scaleVariants}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10"
          >
            <motion.div
              animate={pulseAnimation.animate}
              transition={pulseAnimation.transition}
            >
              <ShieldAlert
                className="h-10 w-10 text-orange-500"
                aria-hidden="true"
                data-testid="forbidden-icon"
              />
            </motion.div>
          </motion.div>

          {/* Error Code with Gradient */}
          <motion.div variants={staggerItem}>
            <span
              className="bg-gradient-to-r from-orange-500 to-orange-500/60 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl"
              aria-hidden="true"
              data-testid="error-code"
            >
              403
            </span>
          </motion.div>

          {/* Title */}
          <motion.div variants={staggerItem}>
            <CardTitle
              id="forbidden-title"
              className="mt-4 text-xl text-orange-600 dark:text-orange-400 sm:text-2xl"
            >
              Accès non autorisé
            </CardTitle>
          </motion.div>

          {/* Description */}
          <motion.div variants={staggerItem}>
            <CardDescription
              id="forbidden-description"
              className="mt-2 text-muted-foreground"
            >
              {getDescription()}
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          <motion.div variants={staggerItem} className="space-y-3">
            {/* Role info if available */}
            {(requiredRole || currentRole) && !reason && (
              <div
                className="rounded-md bg-orange-500/10 p-3 text-center text-sm text-orange-700 dark:text-orange-300"
                data-testid="role-info"
              >
                {requiredRole && (
                  <p>
                    <strong>Rôle requis :</strong> {requiredRole}
                  </p>
                )}
                {currentRole && (
                  <p>
                    <strong>Votre rôle :</strong> {currentRole}
                  </p>
                )}
              </div>
            )}

            {/* Helpful message */}
            <p className="text-center text-sm text-muted-foreground">
              Vous pouvez retourner à votre tableau de bord ou à l&apos;accueil.
            </p>
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {/* Action Buttons */}
          <motion.div
            variants={staggerItem}
            className="flex w-full flex-col gap-3 sm:flex-row"
          >
            <Button
              onClick={handleGoDashboard}
              variant="default"
              className="w-full bg-orange-500 hover:bg-orange-600 sm:flex-1"
              aria-label="Retourner au tableau de bord"
              data-testid="dashboard-button"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
              Dashboard
            </Button>
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="w-full sm:flex-1"
              aria-label="Retourner à la page d'accueil"
              data-testid="home-button"
            >
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Accueil
            </Button>
          </motion.div>

          {/* Contact Admin Link */}
          {showContactAdmin && (
            <motion.div variants={staggerItem} className="w-full">
              <Button
                onClick={handleContactAdmin}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-orange-500"
                aria-label="Contacter l'administrateur"
                data-testid="contact-admin-button"
              >
                <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                Contacter l&apos;administrateur
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.main>
  )
}
