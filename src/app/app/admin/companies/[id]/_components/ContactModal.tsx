'use client'

/**
 * ContactModal — Dialogue d'envoi d'email admin aux directeurs d'une entreprise
 *
 * @ticket SP-474
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Send, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/toast/use-toast'
import { sendAdminMessageToCompany } from '@/lib/actions/admin-contact'
import type { AdminMessageInput } from '@/lib/actions/admin-contact.schemas'

// ============================================================================
// Types
// ============================================================================

interface ContactModalProps {
  companyId: string
  companyName: string
}

type FormValues = Omit<AdminMessageInput, 'companyId'>

// Schema défini côté client (AdminMessageSchema est un objet Zod non sérialisable depuis 'use server')
const formSchema = z.object({
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(2000),
  category: z.enum(['information', 'facturation', 'technique', 'autre']),
})

const CATEGORY_OPTIONS = [
  { value: 'information', label: 'Information' },
  { value: 'facturation', label: 'Facturation' },
  { value: 'technique', label: 'Technique' },
  { value: 'autre', label: 'Autre' },
] as const

const MESSAGE_MAX = 2000

// ============================================================================
// Component
// ============================================================================

export function ContactModal({ companyId, companyName }: ContactModalProps) {
  const [open, setOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { success, error: toastError } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: '',
      message: '',
      category: 'information',
    },
  })

  const messageValue = watch('message')
  const messageLength = messageValue?.length ?? 0

  const onSubmit = async (data: FormValues) => {
    setIsSending(true)
    try {
      const result = await sendAdminMessageToCompany({
        companyId,
        ...data,
      })

      if (result.success) {
        success(
          `Message envoyé à ${result.sentCount} directeur${result.sentCount > 1 ? 's' : ''}`
        )
        reset()
        setOpen(false)
      } else {
        toastError(result.errors[0] ?? "Erreur lors de l'envoi")
      }
    } catch {
      toastError("Erreur lors de l'envoi du message")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="contact-button">
          <Mail className="mr-2 h-4 w-4" aria-hidden />
          Contacter
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contacter {companyName}</DialogTitle>
          <DialogDescription>
            Envoyer un email à tous les directeurs de cette entreprise.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="space-y-4"
          data-testid="contact-form"
        >
          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              defaultValue="information"
              onValueChange={(v) =>
                setValue('category', v as FormValues['category'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="category" data-testid="contact-category">
                <SelectValue placeholder="Choisir une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sujet */}
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input
              id="subject"
              placeholder="Objet du message (3-150 caractères)"
              {...register('subject')}
              data-testid="contact-subject"
            />
            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message">Message</Label>
              <span
                className={`text-xs ${
                  messageLength > MESSAGE_MAX
                    ? 'text-destructive'
                    : 'text-muted-foreground'
                }`}
              >
                {messageLength}/{MESSAGE_MAX}
              </span>
            </div>
            <Textarea
              id="message"
              placeholder="Votre message (10-2000 caractères)"
              rows={6}
              {...register('message')}
              data-testid="contact-message"
            />
            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSending}
              data-testid="contact-submit"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" aria-hidden />
                  Envoyer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
