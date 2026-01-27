/**
 * API Route - Export PDF du planning
 *
 * @description Genere un PDF du planning pour une periode donnee.
 * RBAC: MANAGER et DIRECTOR uniquement.
 * @ticket SP-403
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma, ScheduleStatus, ScheduleType } from '@prisma/client'
import {
  SchedulePdfDocument,
  type ScheduleForPdf,
} from '@/lib/pdf/SchedulePdfDocument'

export async function GET(request: NextRequest) {
  try {
    // Auth
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { role, companyId } = session.user
    if (!companyId) {
      return NextResponse.json(
        { error: 'Aucune entreprise associée' },
        { status: 403 }
      )
    }

    // RBAC: MANAGER et DIRECTOR uniquement
    if (role !== 'MANAGER' && role !== 'DIRECTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Query params
    const { searchParams } = request.nextUrl
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')
    const teamId = searchParams.get('teamId')
    const employeeId = searchParams.get('employeeId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const view = (searchParams.get('view') as 'week' | 'month') || 'week'

    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'startDate et endDate requis' },
        { status: 400 }
      )
    }

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Dates invalides' }, { status: 400 })
    }

    // Build where clause with tenant isolation
    const where: Prisma.ScheduleWhereInput = {
      companyId,
      endDate: { gte: startDate },
      startDate: { lte: endDate },
    }

    // MANAGER: filter by managed teams
    if (role === 'MANAGER') {
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { managedTeams: { select: { id: true } } },
      })
      const managedTeamIds = employee?.managedTeams.map((t) => t.id) ?? []
      if (managedTeamIds.length === 0) {
        return NextResponse.json(
          { error: 'Aucune équipe gérée' },
          { status: 403 }
        )
      }
      where.OR = [
        { teamId: { in: managedTeamIds } },
        { employee: { teamId: { in: managedTeamIds } } },
      ]
    }

    if (teamId) {
      where.teamId = teamId
    }
    if (employeeId) {
      where.employeeId = employeeId
    }
    if (status) {
      where.status = status as ScheduleStatus
    }
    if (type) {
      where.type = type as ScheduleType
    }
    if (search) {
      where.OR = [
        ...(where.OR ?? []),
        { employee: { firstName: { contains: search, mode: 'insensitive' } } },
        { employee: { lastName: { contains: search, mode: 'insensitive' } } },
        { title: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Fetch schedules
    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            weeklyHours: true,
          },
        },
      },
      orderBy: [{ startDate: 'asc' }, { employee: { lastName: 'asc' } }],
    })

    // Fetch company name
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    })

    const pdfSchedules: ScheduleForPdf[] = schedules.map((s) => ({
      id: s.id,
      startDate: s.startDate,
      endDate: s.endDate,
      startTime: s.startTime,
      endTime: s.endTime,
      type: s.type,
      title: s.title,
      employee: {
        id: s.employee.id,
        firstName: s.employee.firstName,
        lastName: s.employee.lastName,
        weeklyHours: s.employee.weeklyHours,
      },
    }))

    // Render PDF — cast nécessaire pour compatibilité React 19 / @react-pdf
    /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
    const buffer = await renderToBuffer(
      React.createElement(SchedulePdfDocument, {
        schedules: pdfSchedules,
        period: { start: startDate, end: endDate },
        viewMode: view,
        companyName: company?.name ?? 'SmartPlanning',
        generatedAt: new Date(),
      }) as any
    )
    /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */

    // Return PDF
    const filename = `planning-${startDateStr}-${endDateStr}.pdf`
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[Export PDF] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
