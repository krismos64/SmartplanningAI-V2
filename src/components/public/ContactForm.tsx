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
import { useContactForm, type ContactApiResponse } from '@/hooks/use-contact-form'
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
  /** Callback appelé lors de la soumission (API SP-288) */
  onSubmit?: (data: ContactFormData) => Promise<ContactApiResponse>
  /** Classes CSS additionnelles */
  className?: string
}

export function ContactForm({ onSubmit, className }: ContactFormProps) {
  const {
    state,
    error,
    submittedName,
    submit,
    reset: resetState,
    retry,
  } = useContactForm(onSubmit)

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
            <motion.form
              variants={formVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
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
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <User className="h-4 w-4 text-blue-400" />
                  Nom complet
                  <span className="text-red-400" aria-hidden="true">
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
                    'h-12 border-border bg-background text-foreground placeholder:text-muted-foreground',
                    'focus:border-primary focus:ring-primary/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.name &&
                      'border-destructive focus:border-destructive focus:ring-destructive/20'
                  )}
                  {...register('name')}
                />
                {errors.name && (
                  <p
                    id="name-error"
                    role="alert"
                    className="text-sm text-red-400"
                  >
                    {errors.name.message}
                  </p>
                )}
              </motion.div>

              {/* Email */}
              <motion.div variants={inputVariants} className="space-y-2">
                <Label
                  htmlFor="contact-email"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Mail className="h-4 w-4 text-blue-400" />
                  Adresse email
                  <span className="text-red-400" aria-hidden="true">
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
                    'h-12 border-border bg-background text-foreground placeholder:text-muted-foreground',
                    'focus:border-primary focus:ring-primary/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.email &&
                      'border-destructive focus:border-destructive focus:ring-destructive/20'
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-sm text-red-400"
                  >
                    {errors.email.message}
                  </p>
                )}
              </motion.div>

              {/* Sujet */}
              <motion.div variants={inputVariants} className="space-y-2">
                <Label
                  htmlFor="contact-subject"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <FileText className="h-4 w-4 text-blue-400" />
                  Sujet
                  <span className="text-red-400" aria-hidden="true">
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
                    'h-12 border-border bg-background text-foreground placeholder:text-muted-foreground',
                    'focus:border-primary focus:ring-primary/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.subject &&
                      'border-destructive focus:border-destructive focus:ring-destructive/20'
                  )}
                  {...register('subject')}
                />
                {errors.subject && (
                  <p
                    id="subject-error"
                    role="alert"
                    className="text-sm text-red-400"
                  >
                    {errors.subject.message}
                  </p>
                )}
              </motion.div>

              {/* Message */}
              <motion.div variants={inputVariants} className="space-y-2">
                <Label
                  htmlFor="contact-message"
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Send className="h-4 w-4 text-blue-400" />
                  Message
                  <span className="text-red-400" aria-hidden="true">
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
                    'min-h-[140px] resize-none border-border bg-background text-foreground placeholder:text-muted-foreground',
                    'focus:border-primary focus:ring-primary/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    errors.message &&
                      'border-destructive focus:border-destructive focus:ring-destructive/20'
                  )}
                  {...register('message')}
                />
                {errors.message ? (
                  <p
                    id="message-error"
                    role="alert"
                    className="text-sm text-red-400"
                  >
                    {errors.message.message}
                  </p>
                ) : (
                  <p
                    id="message-hint"
                    className="text-xs text-muted-foreground"
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
                    'h-14 w-full text-base font-semibold transition-all duration-300',
                    'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500',
                    'shadow-lg shadow-blue-500/25',
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
                className="text-center text-xs text-muted-foreground"
              >
                En soumettant ce formulaire, vous acceptez notre{' '}
                <a
                  href="/confidentialite"
                  className="text-primary underline hover:text-primary/80"
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
