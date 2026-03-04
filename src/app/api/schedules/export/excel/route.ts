/**
 * API Route - Export Excel du planning
 *
 * @description Genere un fichier .xlsx du planning pour une periode donnee.
 * RBAC: MANAGER et DIRECTOR uniquement.
 * @ticket SP-404
 */

import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma, ScheduleStatus, ScheduleType } from '@prisma/client'
import { generateScheduleExcel } from '@/lib/excel'

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

    // RBAC: MANAGER, DIRECTOR et EMPLOYEE
    if (role !== 'MANAGER' && role !== 'DIRECTOR' && role !== 'EMPLOYEE') {
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

    // EMPLOYEE: only CONFIRMED schedules from own team
    if (role === 'EMPLOYEE') {
      const employee = await prisma.employee.findUnique({
        where: { userId: session.user.id },
        select: { id: true, teamId: true },
      })
      if (!employee) {
        return NextResponse.json(
          { error: 'Employé non trouvé' },
          { status: 403 }
        )
      }
      where.status = 'CONFIRMED'
      if (employee.teamId) {
        where.OR = [
          { employeeId: employee.id },
          { employee: { teamId: employee.teamId } },
        ]
      } else {
        where.employeeId = employee.id
      }
    }

    if (role !== 'EMPLOYEE') {
      if (teamId) {
        where.teamId = teamId
      }
      if (employeeId) {
        where.employeeId = employeeId
      }
      if (status) {
        where.status = status as ScheduleStatus
      }
    } else {
      if (employeeId) {
        const emp = await prisma.employee.findUnique({
          where: { userId: session.user.id },
          select: { teamId: true },
        })
        if (emp?.teamId) {
          where.OR = [{ employeeId, employee: { teamId: emp.teamId } }]
        }
      }
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
          select: { firstName: true, lastName: true, weeklyHours: true },
        },
        team: {
          select: { name: true },
        },
      },
      orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
    })

    // Fetch company name
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    })

    // Generate Excel
    const buffer = generateScheduleExcel({
      schedules: schedules.map((s) => ({
        ...s,
        team: s.team ?? null,
      })),
      period: { start: startDate, end: endDate },
      companyName: company?.name ?? 'SmartPlanning',
    })

    // Return Excel response
    const filename = `planning-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.xlsx`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[Export Excel] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du fichier Excel' },
      { status: 500 }
    )
  }
}
