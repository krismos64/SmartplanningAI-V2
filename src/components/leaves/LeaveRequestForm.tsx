'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect, useCallback } from 'react'
import { LeaveType } from '@prisma/client'
import {
  createLeaveRequestSchema,
  leaveTypeOptions,
} from '@/lib/validations/leave'
import type { z } from 'zod'

type FormValues = z.input<typeof createLeaveRequestSchema>
import { calculateWorkingDays } from '@/lib/leave-utils'
import {
  createLeaveRequest,
  updateLeaveRequest,
  checkLeaveConflicts,
} from '@/lib/actions/leaves'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { LeaveConflictWarning } from './LeaveConflictWarning'
import type { DateRange } from 'react-day-picker'

interface LeaveRequestFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<FormValues>
  requestId?: string
  employeeId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function LeaveRequestForm({
  mode,
  defaultValues,
  requestId,
  employeeId,
  onSuccess,
  onCancel,
}: LeaveRequestFormProps) {
  const [conflictPercentage, setConflictPercentage] = useState(0)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultValues?.startDate && defaultValues?.endDate
      ? { from: defaultValues.startDate, to: defaultValues.endDate }
      : undefined
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      type: LeaveType.PAID_LEAVE,
      halfDay: false,
      employeeId,
      ...defaultValues,
    },
  })

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

  // Check conflicts when dates change
  useEffect(() => {
    if (!startDate || !endDate) return
    void checkLeaveConflicts(
      employeeId,
      new Date(startDate),
      new Date(endDate)
    ).then((result) => {
      if (result.success) {
        setConflictPercentage(result.data.percentAbsent)
      }
    })
  }, [startDate, endDate, employeeId])

  const createAction = useCallback(
    (data: FormValues) => createLeaveRequest(data),
    []
  )

  const editAction = useCallback(
    (data: FormValues) => {
      if (!requestId) throw new Error('requestId required for edit')
      return updateLeaveRequest(requestId, data)
    },
    [requestId]
  )

  const { mutate, isPending } = useCrudMutation(
    mode === 'create' ? createAction : editAction,
    {
      successMessage:
        mode === 'create'
          ? 'Demande créée avec succès'
          : 'Demande modifiée avec succès',
      onSuccess,
    }
  )

  const onSubmit = (data: FormValues) => {
    void mutate(data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de congé</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
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
                      {format(dateRange.from, 'dd MMM yyyy', { locale: fr })} –{' '}
                      {format(dateRange.to, 'dd MMM yyyy', { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, 'dd MMM yyyy', { locale: fr })
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
                  if (range?.from) form.setValue('startDate', range.from)
                  if (range?.to) form.setValue('endDate', range.to)
                }}
                disabled={[{ before: new Date() }]}
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

        <LeaveConflictWarning conflictPercentage={conflictPercentage} />

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
              <FormLabel>Motif (optionnel)</FormLabel>
              <FormControl>
                <Textarea placeholder="Raison de la demande..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending
              ? 'Envoi...'
              : mode === 'create'
                ? 'Créer la demande'
                : 'Modifier la demande'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
