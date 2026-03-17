/**
 * Page Balances (Soldes congés) - Server Component
 *
 * @description Page de gestion des soldes congés (DIRECTOR only)
 * @ticket SP-414
 */

import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAllLeaveBalances } from '@/lib/actions/leaves'
import { BalancesPageContent } from './_components/BalancesPageContent'
import BalancesLoading from './loading'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Soldes congés | SmartPlanning',
  description: 'Gérez les soldes de congés de vos employés',
}

export default async function BalancesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/connexion')
  }

  // Seuls DIRECTOR et SYSTEM_ADMIN ont accès
  if (!['DIRECTOR', 'SYSTEM_ADMIN'].includes(session.user.role)) {
    redirect('/app/dashboard/leaves')
  }

  const companyId = session.user.companyId
  const currentYear = new Date().getFullYear()

  // Fetch initial data
  const [balancesResult, employees] = await Promise.all([
    getAllLeaveBalances(currentYear, { page: 1, pageSize: 20 }),
    prisma.employee.findMany({
      where: companyId ? { companyId, isActive: true } : { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        teamId: true,
        team: { select: { id: true, name: true } },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    }),
  ])

  const initialBalances = balancesResult.success ? balancesResult.data.data : []
  const initialPagination = balancesResult.success
    ? {
        page: balancesResult.data.page,
        pageSize: balancesResult.data.pageSize,
        total: balancesResult.data.total,
      }
    : { page: 1, pageSize: 20, total: 0 }

  return (
    <Suspense fallback={<BalancesLoading />}>
      <BalancesPageContent
        initialBalances={initialBalances}
        initialPagination={initialPagination}
        employees={employees}
        currentYear={currentYear}
      />
    </Suspense>
  )
}
