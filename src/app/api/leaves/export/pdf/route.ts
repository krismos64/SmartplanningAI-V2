/**
 * API Route - Export PDF de la liste des congés
 *
 * @description Génère un PDF A4 paysage avec les demandes de congés.
 * Respecte les filtres du tableau (statut, type, employé, équipe, dates).
 * RBAC: SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE.
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma, LeaveRequestStatus, LeaveType } from '@prisma/client'
import {
  LeavesPdfDocument,
  type LeaveForPdf,
} from '@/lib/pdf/LeavesPdfDocument'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Refusé',
  CANCELLED: 'Annulé',
}

const TYPE_LABELS: Record<string, string> = {
  PAID_LEAVE: 'Congés payés',
  RTT: 'RTT',
  SICK_LEAVE: 'Arrêt maladie',
  UNPAID_LEAVE: 'Sans solde',
  FAMILY_EVENT: 'Évén. familial',
  PARENTAL_LEAVE: 'Congé parental',
  OTHER: 'Autre',
}

export async function GET(request: NextRequest) {
  try {
    // Auth
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { role, companyId } = session.user
    const userId = session.user.id

    // Query params (filtres)
    const { searchParams } = request.nextUrl
    const status = searchParams.get('status') as LeaveRequestStatus | null
    const type = searchParams.get('type') as LeaveType | null
    const employeeId = searchParams.get('employeeId')
    const teamId = searchParams.get('teamId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause with RBAC
    const where: Prisma.LeaveRequestWhereInput = {}

    switch (role) {
      case 'SYSTEM_ADMIN':
        break
      case 'DIRECTOR':
        if (!companyId) {
          return NextResponse.json(
            { error: 'Aucune entreprise associée' },
            { status: 403 }
          )
        }
        where.companyId = companyId
        break
      case 'MANAGER': {
        const employee = await prisma.employee.findUnique({
          where: { userId },
          select: { managedTeams: { select: { id: true } } },
        })
        const managedTeamIds = employee?.managedTeams.map((t) => t.id) ?? []
        if (managedTeamIds.length === 0) {
          return NextResponse.json(
            { error: 'Aucune équipe gérée' },
            { status: 403 }
          )
        }
        where.employee = { teamId: { in: managedTeamIds } }
        break
      }
      case 'EMPLOYEE': {
        const employee = await prisma.employee.findUnique({
          where: { userId },
          select: { id: true },
        })
        if (!employee) {
          return NextResponse.json(
            { error: 'Profil employé non trouvé' },
            { status: 403 }
          )
        }
        where.employeeId = employee.id
        break
      }
      default:
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        )
    }

    // Filtres optionnels
    if (status) where.status = status
    if (type) where.type = type
    if (employeeId) where.employeeId = employeeId
    if (teamId) {
      where.employee = {
        ...(where.employee as Prisma.EmployeeWhereInput),
        teamId,
      }
    }
    if (startDate || endDate) {
      where.startDate = {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate && { lte: new Date(endDate) }),
      }
    }

    // Fetch leave requests
    const leaves = await prisma.leaveRequest.findMany({
      where,
      select: {
        startDate: true,
        endDate: true,
        days: true,
        type: true,
        status: true,
        halfDay: true,
        halfDayPeriod: true,
        reason: true,
        employee: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { startDate: 'desc' },
      take: 10000,
    })

    // Company name
    let companyName = 'SmartPlanning'
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true },
      })
      if (company) companyName = company.name
    }

    // Transform data
    const pdfLeaves: LeaveForPdf[] = leaves.map((l) => ({
      employeeName: `${l.employee.lastName} ${l.employee.firstName}`,
      type: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      days: l.days,
      halfDay: l.halfDay,
      halfDayPeriod: l.halfDayPeriod,
      status: l.status,
      reason: l.reason,
    }))

    // Build active filters description
    const filterParts: string[] = []
    if (status) filterParts.push(`Statut : ${STATUS_LABELS[status] ?? status}`)
    if (type) filterParts.push(`Type : ${TYPE_LABELS[type] ?? type}`)
    if (employeeId) {
      const emp = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { firstName: true, lastName: true },
      })
      if (emp) filterParts.push(`Employé : ${emp.lastName} ${emp.firstName}`)
    }
    if (teamId) {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { name: true },
      })
      if (team) filterParts.push(`Équipe : ${team.name}`)
    }
    if (startDate) {
      filterParts.push(
        `Depuis : ${new Date(startDate).toLocaleDateString('fr-FR')}`
      )
    }
    if (endDate) {
      filterParts.push(
        `Jusqu'au : ${new Date(endDate).toLocaleDateString('fr-FR')}`
      )
    }
    const activeFilters =
      filterParts.length > 0 ? filterParts.join(' | ') : undefined

    // Render PDF
    /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
    const buffer = await renderToBuffer(
      React.createElement(LeavesPdfDocument, {
        leaves: pdfLeaves,
        companyName,
        generatedAt: new Date(),
        activeFilters,
      }) as any
    )
    /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */

    // Return PDF
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `conges-${dateStr}.pdf`
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[Export Leaves PDF] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
