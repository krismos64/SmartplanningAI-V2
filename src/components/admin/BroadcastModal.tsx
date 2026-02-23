'use client'

/**
 * BroadcastModal — Dialogue d'envoi d'email broadcast à toutes les entreprises actives
 *
 * Réutilise le pattern du ContactModal (SP-474) pour envoyer un email
 * à tous les DIRECTOR actifs des entreprises ACTIVE/TRIALING.
 *
 * @ticket SP-477
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Radio, Send, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

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
import {
  sendAdminBroadcast,
  BROADCAST_CATEGORY_LABELS,
  type BroadcastInput,
  type BroadcastResult,
  type BroadcastCategory,
} from '@/lib/actions/admin-contact'

// ============================================================================
// Types
// ============================================================================

type FormValues = BroadcastInput

const formSchema = z.object({
  subject: z.string().min(5, 'Minimum 5 caractères').max(150),
  message: z.string().min(20, 'Minimum 20 caractères').max(5000),
  category: z.enum([
    'maintenance',
    'product_update',
    'important_info',
    'commercial',
  ]),
})

const CATEGORY_OPTIONS = (
  Object.entries(BROADCAST_CATEGORY_LABELS) as [BroadcastCategory, string][]
).map(([value, label]) => ({ value, label }))

const MESSAGE_MAX = 5000

// ============================================================================
// Component
// ============================================================================

export function BroadcastModal() {
  const [open, setOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<BroadcastResult | null>(null)
  const { error: toastError } = useToast()

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
      category: 'important_info',
    },
  })

  const messageValue = watch('message')
  const messageLength = messageValue?.length ?? 0

  const handleClose = () => {
    setOpen(false)
    setSendResult(null)
    reset()
  }

  const onSubmit = async (data: FormValues) => {
    setIsSending(true)
    setSendResult(null)
    try {
      const result = await sendAdminBroadcast(data)
      setSendResult(result)
    } catch {
      toastError("Erreur lors de l'envoi du broadcast")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => (v ? setOpen(true) : handleClose())}
    >
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="broadcast-button">
          <Radio className="mr-2 h-4 w-4" aria-hidden />
          Diffusion générale
        </Button>
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => {
          // Empêcher la fermeture du Dialog quand on clique dans le Select dropdown
          const target = e.target as HTMLElement
          if (target.closest('[data-radix-select-content]')) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Diffusion générale</DialogTitle>
          <DialogDescription>
            Envoyer un email à tous les directeurs des entreprises actives.
          </DialogDescription>
        </DialogHeader>

        {/* Résultat d'envoi */}
        {sendResult ? (
          <div className="space-y-4" data-testid="broadcast-result">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              {sendResult.totalFailed === 0 ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              )}
              <div>
                <p className="font-medium">
                  {sendResult.totalSent} email
                  {sendResult.totalSent > 1 ? 's' : ''} envoyé
                  {sendResult.totalSent > 1 ? 's' : ''}
                  {sendResult.totalFailed > 0 && (
                    <span className="text-destructive">
                      , {sendResult.totalFailed} échec
                      {sendResult.totalFailed > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                {sendResult.totalSent === 0 && sendResult.totalFailed === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Aucun destinataire trouvé (entreprises actives avec
                    abonnement).
                  </p>
                )}
              </div>
            </div>

            {sendResult.failedEmails.length > 0 && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="mb-2 text-sm font-medium text-destructive">
                  Emails en échec :
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {sendResult.failedEmails.map((email) => (
                    <li key={email}>{email}</li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Fermer</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="space-y-4"
            data-testid="broadcast-form"
          >
            {/* Catégorie */}
            <div className="space-y-2">
              <Label htmlFor="broadcast-category">Catégorie</Label>
              <Select
                defaultValue="important_info"
                onValueChange={(v) =>
                  setValue('category', v as FormValues['category'], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="broadcast-category"
                  data-testid="broadcast-category"
                >
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
              <Label htmlFor="broadcast-subject">Sujet</Label>
              <Input
                id="broadcast-subject"
                placeholder="Objet du message (5-150 caractères)"
                {...register('subject')}
                data-testid="broadcast-subject"
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
                <Label htmlFor="broadcast-message">Message</Label>
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
                id="broadcast-message"
                placeholder="Votre message (20-5000 caractères)"
                rows={8}
                {...register('message')}
                data-testid="broadcast-message"
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
                onClick={handleClose}
                disabled={isSending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSending}
                data-testid="broadcast-submit"
              >
                {isSending ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden
                    />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" aria-hidden />
                    Envoyer à tous
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
