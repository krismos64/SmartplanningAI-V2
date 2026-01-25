'use client'

/**
 * ServerErrorPage Component - SP-303
 *
 * Custom 500 error page with friendly messaging and recovery options.
 * Designed with Shadcn/ui components and Framer Motion animations.
 *
 * @see Context7 Documentation:
 * - Next.js 15: Custom error pages for server errors
 * - Framer Motion: staggerChildren for cascading entry animations
 * - Accessibility: role="region", aria-label, aria-labelledby, aria-describedby
 *
 * @ticket SP-303
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
import { Home, RefreshCw, MessageCircle, ServerCrash } from 'lucide-react'
import {
  motion,
  staggerContainer,
  staggerItem,
  scaleVariants,
} from '@/lib/animations'

/**
 * Props for ServerErrorPage component
 */
export interface ServerErrorPageProps {
  /** Custom error code to display (default: 500) */
  errorCode?: number | string
  /** Custom error message */
  errorMessage?: string
  /** Show the "Report problem" button (default: true) */
  showReportButton?: boolean
  /** Error digest for production debugging */
  digest?: string
}

/**
 * ServerErrorPage - Custom 500 error page component
 *
 * Features:
 * - Friendly error icon (ServerCrash)
 * - Large error code with gradient text
 * - Empathetic messaging in French
 * - "Retry" button → window.location.reload()
 * - "Home" button → navigation to /
 * - "Report problem" link → navigation to /contact
 * - Fully responsive (mobile-first)
 * - Dark mode support via Tailwind/Shadcn
 * - WCAG 2.1 AA accessible
 *
 * @param props - Component props
 * @returns Complete 500 error page UI
 */
export function ServerErrorPage({
  errorCode = 500,
  errorMessage,
  showReportButton = true,
  digest,
}: ServerErrorPageProps) {
  const router = useRouter()

  /**
   * Reload the current page to retry
   */
  const handleRetry = () => {
    window.location.reload()
  }

  /**
   * Navigate to home page
   */
  const handleGoHome = () => {
    router.push('/')
  }

  /**
   * Navigate to contact page to report the problem
   */
  const handleReport = () => {
    router.push('/contact')
  }

  return (
    <motion.div
      role="region"
      aria-label="Erreur serveur"
      aria-labelledby="server-error-title"
      aria-describedby="server-error-description"
      className="flex min-h-screen flex-col items-center justify-center bg-background p-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      data-testid="server-error-page"
    >
      <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
        <CardHeader className="text-center">
          {/* Error Icon */}
          <motion.div
            variants={scaleVariants}
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10"
          >
            <ServerCrash
              className="h-10 w-10 text-destructive"
              aria-hidden="true"
              data-testid="server-error-icon"
            />
          </motion.div>

          {/* Error Code with Gradient */}
          <motion.div variants={staggerItem}>
            <span
              className="bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-5xl font-bold text-transparent sm:text-6xl"
              aria-hidden="true"
              data-testid="error-code"
            >
              {errorCode}
            </span>
          </motion.div>

          {/* Title */}
          <motion.div variants={staggerItem}>
            <CardTitle
              id="server-error-title"
              className="mt-4 text-xl text-destructive sm:text-2xl"
            >
              Oups ! Une erreur est survenue
            </CardTitle>
          </motion.div>

          {/* Description */}
          <motion.div variants={staggerItem}>
            <CardDescription
              id="server-error-description"
              className="mt-2 text-muted-foreground"
            >
              {errorMessage ||
                'Notre serveur a rencontré un problème inattendu. Nous travaillons à le résoudre.'}
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent>
          <motion.div variants={staggerItem} className="space-y-3">
            {/* Helpful message */}
            <p className="text-center text-sm text-muted-foreground">
              Vous pouvez réessayer ou retourner à l&apos;accueil.
            </p>

            {/* Error digest for production debugging */}
            {digest && (
              <p
                className="text-center text-xs text-muted-foreground"
                data-testid="error-digest"
              >
                Code erreur : {digest}
              </p>
            )}
          </motion.div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {/* Action Buttons */}
          <motion.div
            variants={staggerItem}
            className="flex w-full flex-col gap-3 sm:flex-row"
          >
            <Button
              onClick={handleRetry}
              variant="default"
              className="w-full sm:flex-1"
              aria-label="Réessayer de charger la page"
              data-testid="retry-button"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Réessayer
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

          {/* Report Problem Link */}
          {showReportButton && (
            <motion.div variants={staggerItem} className="w-full">
              <Button
                onClick={handleReport}
                variant="ghost"
                className="w-full text-muted-foreground hover:text-primary"
                aria-label="Signaler le problème"
                data-testid="report-button"
              >
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Signaler le problème
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}
