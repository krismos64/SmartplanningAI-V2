/**
 * API Route pour le formulaire de contact
 *
 * @ticket SP-288
 * @description Traite les soumissions du formulaire de contact public
 *
 * ✅ Source : Context7 - Next.js 15 App Router API Routes Best Practices
 *
 * Fonctionnalités :
 * - Validation Zod côté serveur
 * - Rate limiting (5 requêtes/minute par IP)
 * - Persistance du message en base avant tout envoi
 * - Envoi email de confirmation à l'expéditeur
 * - Envoi email de notification au Super Admin
 * - Gestion d'erreurs avec messages appropriés
 */

import { NextResponse } from 'next/server'

import { contactSchema } from '@/lib/validations/contact'
import {
  checkRateLimit,
  getClientIp,
  getRateLimitHeaders,
} from '@/lib/rate-limit'
import { sendContactEmails } from '@/lib/email/templates/contact'
import { prisma } from '@/lib/prisma'
import type { ContactApiResponse } from '@/types/contact'

/**
 * Configuration du rate limiter pour le formulaire de contact
 * 5 requêtes par minute par IP
 */
const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
}

/**
 * POST /api/contact
 *
 * Traite une soumission du formulaire de contact.
 *
 * @body {name, email, subject, message} - Données du formulaire
 * @returns 200 OK si succès, 400/429/500 si erreur
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/contact', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'Jean Dupont',
 *     email: 'jean@example.com',
 *     subject: 'Demande d\'information',
 *     message: 'Bonjour, je souhaite en savoir plus...'
 *   })
 * })
 * ```
 */
export async function POST(
  request: Request
): Promise<NextResponse<ContactApiResponse>> {
  try {
    // 1. Rate limiting
    const clientIp = getClientIp(request)
    const rateLimitResult = await checkRateLimit(clientIp, RATE_LIMIT_CONFIG)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Trop de requêtes. Veuillez réessayer dans quelques instants.',
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // 2. Parser le body de la requête
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'Format de requête invalide. JSON attendu.',
        },
        { status: 400 }
      )
    }

    // 3. Validation Zod
    const validationResult = contactSchema.safeParse(body)

    if (!validationResult.success) {
      // Formater les erreurs Zod en objet lisible
      const errors: Record<string, string[]> = {}
      validationResult.error.errors.forEach((err) => {
        const field = err.path.join('.')
        if (!errors[field]) {
          errors[field] = []
        }
        errors[field].push(err.message)
      })

      return NextResponse.json(
        {
          success: false,
          message: 'Données invalides. Veuillez vérifier le formulaire.',
          errors,
        },
        {
          status: 400,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    const { name, email, subject, message } = validationResult.data

    // 4. Persister le message AVANT toute tentative d'envoi.
    //
    // L'ordre compte : tant que la route ne faisait qu'envoyer des emails, une
    // panne SMTP faisait disparaître la demande sans laisser de trace. La base
    // est désormais la source de vérité, l'email n'est qu'une notification.
    //
    // L'écriture est volontairement bloquante, contrairement aux emails : si
    // elle échoue, on préfère demander au visiteur de réessayer plutôt que de
    // perdre son message en silence.
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        ipAddress: clientIp === 'unknown' ? null : clientIp,
        userAgent: request.headers.get('user-agent'),
      },
      select: { id: true },
    })

    // 5. Envoyer les emails (confirmation + notification)
    const { confirmation, notification } = await sendContactEmails({
      name,
      email,
      subject,
      message,
    })

    // 6. Consigner le sort de la notification sur la ligne créée.
    // Fire-and-forget : le message est déjà en base, cette mise à jour ne
    // conditionne pas la réponse au visiteur.
    prisma.contactMessage
      .update({
        where: { id: contactMessage.id },
        data: {
          emailStatus: notification.success ? 'SENT' : 'FAILED',
          emailError: notification.success ? null : notification.error,
        },
      })
      .catch(console.error)

    // 7. Vérifier les résultats
    // On considère l'opération réussie si au moins la notification admin est envoyée
    // La confirmation à l'expéditeur est secondaire
    if (!notification.success) {
      console.error(
        '[API Contact] Échec notification admin:',
        notification.error,
        '- message conservé en base:',
        contactMessage.id
      )

      // Le message n'est pas perdu pour autant, il est en base avec
      // emailStatus FAILED. On invite quand même le visiteur à écrire
      // directement, sans lui promettre une réponse qui dépendrait d'une
      // notification jamais partie.
      return NextResponse.json(
        {
          success: false,
          message:
            "Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter directement à contact@smartplanning.fr",
        },
        {
          status: 500,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      )
    }

    // Log si la confirmation a échoué (non bloquant)
    if (!confirmation.success) {
      console.warn(
        '[API Contact] Échec confirmation expéditeur:',
        confirmation.error
      )
    }

    // 8. Succès
    return NextResponse.json(
      {
        success: true,
        message:
          'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
      },
      {
        status: 200,
        headers: getRateLimitHeaders(rateLimitResult),
      }
    )
  } catch (error) {
    // Erreur inattendue
    console.error('[API Contact] Erreur inattendue:', error)

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/contact
 *
 * Gère les requêtes CORS preflight pour les clients externes.
 */
export function OPTIONS(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400', // 24 heures
    },
  })
}
