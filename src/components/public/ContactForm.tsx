'use client'

/**
 * ContactForm Component
 *
 * @ticket SP-287, SP-289
 * @description Formulaire de contact avec React Hook Form + Zod + états animés
 *
 * Features:
 * - Validation côté client avec messages d'erreur en français
 * - Machine d'état (idle, submitting, success, error)
 * - Animations Framer Motion avec AnimatePresence
 * - État de succès avec checkmark animé
 * - État d'erreur avec shake effect
 * - Conservation des données en cas d'erreur
 * - Design responsive (mobile-first)
 * - Accessibilité complète (labels, aria, focus)
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Send, Loader2, User, Mail, FileText } from 'lucide-react'

import {
  contactSchema,
  contactDefaultValues,
  type ContactFormData,
} from '@/lib/validations/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  useContactForm,
  type ContactApiResponse,
} from '@/hooks/use-contact-form'
import { ContactSuccessState } from './ContactSuccessState'
import { ContactErrorState } from './ContactErrorState'
import { formContainerVariants } from '@/lib/animations/contact'

// Animation variants pour le formulaire
const formVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const inputVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

export interface ContactFormProps {
  /** Callback appelé lors de la soumission. Par défaut, POST vers /api/contact */
  onSubmit?: (data: ContactFormData) => Promise<ContactApiResponse>
  /** Classes CSS additionnelles */
  className?: string
}

/**
 * Envoi par défaut vers la route POST /api/contact.
 *
 * Sans cet envoi, le formulaire retombait sur le mode démo du hook et
 * affichait un succès sans qu'aucun email ne parte.
 */
async function postContactMessage(
  data: ContactFormData
): Promise<ContactApiResponse> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const payload = (await response.json().catch(() => null)) as
    | ContactApiResponse
    | { success: boolean; message?: string }
    | null

  if (!response.ok || !payload?.success) {
    return {
      success: false,
      error:
        payload?.message ||
        "L'envoi a échoué. Vous pouvez nous écrire directement à contact@smartplanning.fr",
    }
  }

  return { success: true, message: payload.message }
}

export function ContactForm({ onSubmit, className }: ContactFormProps) {
  const submitHandler = onSubmit ?? postContactMessage
  const {
    state,
    error,
    submittedName,
    submit,
    reset: resetState,
    retry,
  } = useContactForm(submitHandler)

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contactDefaultValues,
    mode: 'onBlur',
  })

  const handleFormSubmit = async (data: ContactFormData) => {
    await submit(data)
  }

  const handleReset = () => {
    resetState()
    resetForm()
  }

  const handleRetry = () => {
    void retry()
  }

  return (
    <div className={cn('relative min-h-[500px]', className)}>
      <AnimatePresence mode="wait">
        {/* État de succès */}
        {state === 'success' && submittedName && (
          <motion.div
            key="success"
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ContactSuccessState name={submittedName} onReset={handleReset} />
          </motion.div>
        )}

        {/* État d'erreur + formulaire */}
        {state !== 'success' && (
          <motion.div
            key="form"
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Message d'erreur */}
            <AnimatePresence>
              {state === 'error' && error && (
                <ContactErrorState message={error} onRetry={handleRetry} />
              )}
            </AnimatePresence>

            {/* Formulaire */}
            {/*
              `animate` et non `whileInView` : l'animation doit jouer au
              montage. Sur la landing le formulaire etait en bas de page, on
              l'atteignait toujours par un scroll qui armait l'observateur.
              Sur la page /contact il est haut dans une page courte, et
              l'observateur ne se declenchait jamais : le formulaire restait
              a `opacity: 0`, present dans le DOM mais invisible.
            */}
            <motion.form
              variants={formVariants}
              initial="hidden"
              animate="visible"
              onSubmit={(e) => {
                e.preventDefault()
                void handleSubmit(handleFormSubmit)(e)
              }}
              className="space-y-6"
              noValidate
              aria-label="Formulaire de contact"
            >
              {/* Nom */}
              <motion.div variants={inputVariants} className="space-y-2">
                <Label
                  htmlFor="contact-name"
                  className="flex items-center gap-2 font-geist text-sm font-medium text-public-content"
                >
                  <User className="h-4 w-4 text-public-accent" />
                  Nom complet
                  <span className="text-public-accent" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="contact-name"
                  type="text"
                  placeholder="Jean Dupont"
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                  disabled={state === 'submitting'}
                  className={cn(
                    'h-12 rounded-none border-public-border bg-public-surface text-public-content placeholder:text-public-content-muted',
                    'focus:border-public-accent focus:ring-public-accent/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.name &&
                      'border-public-accent focus:border-public-accent focus:ring-public-accent/20'
                  )}
                  {...register('name')}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="text-sm font-medium text-public-accent"
                  >
                    {errors.name.message}
                  </p>
                )}
              </motion.div>

              {/* Email */}
              <motion.div variants={inputVariants} className="space-y-2">
                <Label
                  htmlFor="contact-email"
                  className="flex items-center gap-2 font-geist text-sm font-medium text-public-content"
                >
                  <Mail className="h-4 w-4 text-public-accent" />
                  Adresse email
                  <span className="text-public-accent" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="jean.dupont@email.com"
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  disabled={state === 'submitting'}
                  className={cn(
                    'h-12 rounded-none border-public-border bg-public-surface text-public-content placeholder:text-public-content-muted',
                    'focus:border-public-accent focus:ring-public-accent/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.email &&
                      'border-public-accent focus:border-public-accent focus:ring-public-accent/20'
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-sm font-medium text-public-accent"
                  >
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              {/* Sujet */}
              <motion.div variants={inputVariants} className="space-y-2">
                <Label
                  htmlFor="contact-subject"
                  className="flex items-center gap-2 font-geist text-sm font-medium text-public-content"
                >
                  <FileText className="h-4 w-4 text-public-accent" />
                  Sujet
                  <span className="text-public-accent" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="contact-subject"
                  type="text"
                  placeholder="Demande d'information sur SmartPlanning"
                  aria-required="true"
                  aria-invalid={!!errors.subject}
                  aria-describedby={
                    errors.subject ? 'subject-error' : undefined
                  }
                  disabled={state === 'submitting'}
                  className={cn(
                    'h-12 rounded-none border-public-border bg-public-surface text-public-content placeholder:text-public-content-muted',
                    'focus:border-public-accent focus:ring-public-accent/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.subject &&
                      'border-public-accent focus:border-public-accent focus:ring-public-accent/20'
                  )}
                  {...register('subject')}
                />
                {errors.subject && (
                  <p
                    id="subject-error"
                    role="alert"
                    className="text-sm font-medium text-public-accent"
                  >
                    {errors.subject.message}
                  </p>
                )}
              </motion.div>

              {/* Message */}
              <motion.div variants={inputVariants} className="space-y-2">
                <Label
                  htmlFor="contact-message"
                  className="flex items-center gap-2 font-geist text-sm font-medium text-public-content"
                >
                  <Send className="h-4 w-4 text-public-accent" />
                  Message
                  <span className="text-public-accent" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Décrivez votre demande en détail..."
                  rows={5}
                  aria-required="true"
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? 'message-error' : 'message-hint'
                  }
                  disabled={state === 'submitting'}
                  className={cn(
                    'min-h-[140px] resize-none rounded-none border-public-border bg-public-surface text-public-content placeholder:text-public-content-muted',
                    'focus:border-public-accent focus:ring-public-accent/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.message &&
                      'border-public-accent focus:border-public-accent focus:ring-public-accent/20'
                  )}
                  {...register('message')}
                />
                {errors.message ? (
                  <p
                    id="message-error"
                    role="alert"
                    className="text-sm font-medium text-public-accent"
                  >
                    {errors.message.message}
                  </p>
                ) : (
                  <p
                    id="message-hint"
                    className="text-xs text-public-content-muted"
                  >
                    Minimum 20 caractères, maximum 2000 caractères
                  </p>
                )}
              </motion.div>

              {/* Bouton Submit */}
              <motion.div variants={inputVariants}>
                <Button
                  type="submit"
                  disabled={state === 'submitting'}
                  className={cn(
                    // Aplat franc et angles vifs, comme les autres CTA
                    // publics : le degrade bleu-cyan et les coins arrondis
                    // dataient d'avant la refonte SP-565.
                    'h-14 w-full rounded-none text-base font-semibold transition-colors',
                    'bg-public-content text-public-content-on-dark hover:bg-public-accent hover:text-public-content-on-dark',
                    'focus-visible:ring-2 focus-visible:ring-public-accent focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-70'
                  )}
                >
                  {state === 'submitting' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Note confidentialité */}
              <motion.p
                variants={inputVariants}
                className="text-center text-xs text-public-content-muted"
              >
                En soumettant ce formulaire, vous acceptez notre{' '}
                <a
                  href="/confidentialite"
                  className="inline-flex min-h-[2.75rem] items-center text-public-accent underline underline-offset-2 hover:opacity-80"
                >
                  politique de confidentialité
                </a>
                .
              </motion.p>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ContactForm
