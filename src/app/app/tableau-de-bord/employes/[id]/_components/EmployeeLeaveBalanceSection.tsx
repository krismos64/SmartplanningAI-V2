'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LeaveBalance } from '@prisma/client'
import { LeaveBalanceCard } from '@/components/leaves/LeaveBalanceCard'
import { LeaveBalanceEditDialog } from '@/components/leaves/LeaveBalanceEditDialog'

interface EmployeeLeaveBalanceSectionProps {
  balance: LeaveBalance
  canEdit: boolean
}

export function EmployeeLeaveBalanceSection({
  balance,
  canEdit,
}: EmployeeLeaveBalanceSectionProps) {
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <LeaveBalanceCard
        balance={balance}
        showEdit={canEdit}
        onEdit={() => setEditOpen(true)}
      />
      {canEdit && (
        <LeaveBalanceEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          balance={balance}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  )
}
