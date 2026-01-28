'use client'

import type { LeaveBalance } from '@prisma/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  updateLeaveBalanceSchema,
  type UpdateLeaveBalanceInput,
} from '@/lib/validations/leave'
import { updateLeaveBalance } from '@/lib/actions/leaves'
import { useCrudMutation } from '@/hooks/use-crud-mutation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCallback } from 'react'

interface LeaveBalanceEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance: LeaveBalance
  onSuccess?: () => void
}

export function LeaveBalanceEditDialog({
  open,
  onOpenChange,
  balance,
  onSuccess,
}: LeaveBalanceEditDialogProps) {
  const form = useForm<UpdateLeaveBalanceInput>({
    resolver: zodResolver(updateLeaveBalanceSchema),
    defaultValues: {
      paidLeaveTotal: balance.paidLeaveTotal,
      rttTotal: balance.rttTotal,
    },
  })

  const action = useCallback(
    (data: UpdateLeaveBalanceInput) =>
      updateLeaveBalance(balance.employeeId, balance.year, data),
    [balance.employeeId, balance.year]
  )

  const { mutate, isPending } = useCrudMutation(action, {
    successMessage: 'Soldes mis à jour',
    onSuccess: () => {
      onOpenChange(false)
      onSuccess?.()
    },
  })

  const onSubmit = (data: UpdateLeaveBalanceInput) => {
    void mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier les soldes</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="paidLeaveTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Congés payés (total)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      data-testid="cp-total-input"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-muted-foreground">
              CP utilisés : {balance.paidLeaveUsed} jours
            </div>

            <FormField
              control={form.control}
              name="rttTotal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RTT (total)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      data-testid="rtt-total-input"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-muted-foreground">
              RTT utilisés : {balance.rttUsed} jours
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
