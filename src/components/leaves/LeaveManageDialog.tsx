'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { LeaveRequest } from '@prisma/client'
import {
  managerEditLeaveSchema,
  leaveTypeOptions,
  type ManagerEditLeaveInput,
  type ManagerEditLeaveFormValues,
  type RevokeLeaveInput,
} from '@/lib/validations/leave'
import {
  managerEditLeaveRequest,
  revokeLeaveRequest,
} from '@/lib/actions/leaves'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import { useIsImpersonating } from '@/hooks'
import { calculateWorkingDays } from '@/lib/leave-utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Calendar } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { LeaveTypeBadge } from './LeaveTypeBadge'
import { CalendarIcon, Pencil, XCircle, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
  }
}

interface LeaveManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: LeaveRequestWithEmployee
  onSuccess?: () => void
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function LeaveManageDialog({
  open,
  onOpenChange,
  request,
  onSuccess,
}: LeaveManageDialogProps) {
  const isImpersonating = useIsImpersonating()
  const [mode, setMode] = useState<'choose' | 'edit' | 'revoke'>('choose')
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [revokeReason, setRevokeReason] = useState('')
  const [revokeError, setRevokeError] = useState('')

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setMode('choose')
      setRevokeReason('')
      setRevokeError('')
    }
  }, [open])

  // Form for edit mode
  const form = useForm<ManagerEditLeaveFormValues>({
    resolver: zodResolver(managerEditLeaveSchema),
    defaultValues: {
      type: request.type,
      startDate: new Date(request.startDate),
      endDate: new Date(request.endDate),
      halfDay: request.halfDay,
      halfDayPeriod: (request.halfDayPeriod as 'AM' | 'PM') ?? undefined,
      reason: request.reason ?? undefined,
      editReason: '',
    },
  })

  // Reset form when request changes
  useEffect(() => {
    form.reset({
      type: request.type,
      startDate: new Date(request.startDate),
      endDate: new Date(request.endDate),
      halfDay: request.halfDay,
      halfDayPeriod: (request.halfDayPeriod as 'AM' | 'PM') ?? undefined,
      reason: request.reason ?? undefined,
      editReason: '',
    })
  }, [request, form])

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(request.startDate),
    to: new Date(request.endDate),
  })

  useEffect(() => {
    setDateRange({
      from: new Date(request.startDate),
      to: new Date(request.endDate),
    })
  }, [request])

  const watchHalfDay = form.watch('halfDay')
  const startDate = form.watch('startDate')
  const endDate = form.watch('endDate')

  const workingDays =
    startDate && endDate
      ? calculateWorkingDays(
          new Date(startDate),
          new Date(endDate),
          watchHalfDay
        )
      : 0

  // Edit mutation
  const editAction = useCallback(
    (data: ManagerEditLeaveInput) => managerEditLeaveRequest(request.id, data),
    [request.id]
  )

  const { mutate: editMutate, isPending: isEditPending } = useCrudMutation(
    editAction,
    {
      successMessage: 'Demande modifiée avec succès',
      onSuccess: () => {
        onOpenChange(false)
        onSuccess?.()
      },
    }
  )

  // Revoke mutation
  const revokeAction = useCallback(
    (data: RevokeLeaveInput) => revokeLeaveRequest(request.id, data),
    [request.id]
  )

  const { mutate: revokeMutate, isPending: isRevokePending } = useCrudMutation(
    revokeAction,
    {
      successMessage: 'Demande révoquée',
      onSuccess: () => {
        onOpenChange(false)
        setConfirmRevoke(false)
        onSuccess?.()
      },
    }
  )

  const handleEditSubmit = (data: ManagerEditLeaveFormValues) => {
    void editMutate(data as ManagerEditLeaveInput)
  }

  const handleRevokeConfirm = () => {
    if (!revokeReason.trim()) {
      setRevokeError('Un motif de révocation est obligatoire')
      return
    }
    setRevokeError('')
    setConfirmRevoke(true)
  }

  const handleRevokeExecute = () => {
    void revokeMutate({ revokeReason })
  }

  const employeeName = `${request.employee.firstName} ${request.employee.lastName}`

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {mode === 'choose' && 'Gérer la demande approuvée'}
              {mode === 'edit' && 'Modifier la demande'}
              {mode === 'revoke' && 'Révoquer la demande'}
            </DialogTitle>
            <DialogDescription>Demande de {employeeName}</DialogDescription>
          </DialogHeader>

          {/* Mode sélection */}
          {mode === 'choose' && (
            <div className="space-y-4">
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{employeeName}</span>
                  <LeaveTypeBadge type={request.type} size="sm" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {dateFormatter.format(new Date(request.startDate))} –{' '}
                  {dateFormatter.format(new Date(request.endDate))} (
                  {request.days} jour{request.days > 1 ? 's' : ''})
                </p>
                {request.reason && (
                  <p className="text-sm text-muted-foreground">
                    Motif : {request.reason}
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 p-4"
                  onClick={() => setMode('edit')}
                  disabled={isImpersonating}
                >
                  <Pencil className="h-5 w-5" />
                  <span className="font-medium">Modifier</span>
                  <span className="text-xs text-muted-foreground">
                    Changer les dates, le type ou la durée
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 border-destructive/50 p-4 text-destructive hover:bg-destructive/5"
                  onClick={() => setMode('revoke')}
                  disabled={isImpersonating}
                >
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Révoquer</span>
                  <span className="text-xs text-muted-foreground/80">
                    Annuler la demande approuvée
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Mode édition */}
          {mode === 'edit' && (
            <Form {...form}>
              <form
                onSubmit={(e) => void form.handleSubmit(handleEditSubmit)(e)}
                className="space-y-4"
              >
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">
                        Modification d&apos;une demande approuvée
                      </p>
                      <p>
                        L&apos;employé sera notifié de cette modification. Les
                        soldes de congés seront automatiquement ajustés.
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de congé</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {leaveTypeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium">Dates</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !dateRange?.from && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, 'dd MMM yyyy', {
                                locale: fr,
                              })}{' '}
                              –{' '}
                              {format(dateRange.to, 'dd MMM yyyy', {
                                locale: fr,
                              })}
                            </>
                          ) : (
                            format(dateRange.from, 'dd MMM yyyy', {
                              locale: fr,
                            })
                          )
                        ) : (
                          'Sélectionner les dates'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range)
                          if (range?.from)
                            form.setValue('startDate', range.from)
                          if (range?.to) form.setValue('endDate', range.to)
                        }}
                        locale={fr}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {workingDays > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {workingDays} jour{workingDays > 1 ? 's' : ''} ouvré
                    {workingDays > 1 ? 's' : ''}
                  </p>
                )}

                <FormField
                  control={form.control}
                  name="halfDay"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Demi-journée</FormLabel>
                    </FormItem>
                  )}
                />

                {watchHalfDay && (
                  <FormField
                    control={form.control}
                    name="halfDayPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Période</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? undefined}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Matin ou après-midi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AM">Matin</SelectItem>
                              <SelectItem value="PM">Après-midi</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif du congé (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Raison de la demande..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="editReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motif de la modification *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Expliquez pourquoi vous modifiez cette demande..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode('choose')}
                  >
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    disabled={isEditPending || isImpersonating}
                  >
                    {isEditPending
                      ? 'Modification...'
                      : 'Confirmer la modification'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {/* Mode révocation */}
          {mode === 'revoke' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
                  <div className="text-sm">
                    <p className="font-medium text-destructive">
                      Attention : action irréversible
                    </p>
                    <p className="text-muted-foreground">
                      La demande de <strong>{employeeName}</strong> sera
                      annulée. L&apos;employé sera notifié et ses soldes de
                      congés seront recrédités automatiquement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <LeaveTypeBadge type={request.type} size="sm" />
                  <span className="text-sm">
                    {dateFormatter.format(new Date(request.startDate))} –{' '}
                    {dateFormatter.format(new Date(request.endDate))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {request.days} jour{request.days > 1 ? 's' : ''}
                </p>
              </div>

              <div>
                <label
                  htmlFor="revoke-reason"
                  className="mb-1 block text-sm font-medium"
                >
                  Motif de la révocation *
                </label>
                <Textarea
                  id="revoke-reason"
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous révoquez cette demande..."
                />
                {revokeError && (
                  <p className="mt-1 text-sm text-destructive">{revokeError}</p>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setMode('choose')}>
                  Retour
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRevokeConfirm}
                  disabled={isRevokePending || isImpersonating}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Révoquer la demande
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation de révocation */}
      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la révocation</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de révoquer la demande de congé de{' '}
              <strong>{employeeName}</strong> ({request.days} jour
              {request.days > 1 ? 's' : ''},{' '}
              {dateFormatter.format(new Date(request.startDate))} –{' '}
              {dateFormatter.format(new Date(request.endDate))}).
              <br />
              <br />
              L&apos;employé sera notifié de cette décision. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeExecute}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRevokePending ? 'Révocation...' : 'Confirmer la révocation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
