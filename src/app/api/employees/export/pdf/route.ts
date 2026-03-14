/**
 * API Route - Export PDF de la liste des employés
 *
 * @description Génère un PDF A4 paysage avec la liste des employés.
 * Respecte les filtres et le tri du tableau.
 * RBAC: SYSTEM_ADMIN, DIRECTOR, MANAGER.
 */

import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  EmployeesPdfDocument,
  type EmployeeForPdf,
} from '@/lib/pdf/EmployeesPdfDocument'

export async function GET(request: NextRequest) {
  try {
    // Auth
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { role } = session.user
    const userId = session.user.id

    // RBAC
    if (role !== 'SYSTEM_ADMIN' && role !== 'DIRECTOR' && role !== 'MANAGER') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    // Query params (filtres + tri)
    const { searchParams } = request.nextUrl
    const search = searchParams.get('search')
    const teamId = searchParams.get('teamId')
    const isActiveParam = searchParams.get('isActive')
    const sortBy = searchParams.get('sortBy') || 'lastName'
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

    // Build where clause with RBAC
    const where: Record<string, unknown> = {}

    if (role === 'DIRECTOR') {
      const companyId = session.user.companyId
      if (!companyId) {
        return NextResponse.json(
          { error: 'Aucune entreprise associée' },
          { status: 403 }
        )
      }
      where.companyId = companyId
    }

    if (role === 'MANAGER') {
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
      where.teamId = { in: managedTeamIds }
    }

    // Filtres optionnels
    if (teamId) {
      where.teamId = teamId
    }
    if (isActiveParam !== null && isActiveParam !== '') {
      where.isActive = isActiveParam === 'true'
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    // Résoudre le tri
    let orderBy: Record<string, unknown>[]
    if (sortBy === 'email') {
      orderBy = [{ user: { email: sortOrder } }]
    } else {
      orderBy = [{ [sortBy]: sortOrder }]
    }

    // Fetch employees
    const employees = await prisma.employee.findMany({
      where,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        hireDate: true,
        weeklyHours: true,
        isActive: true,
        user: { select: { email: true, role: true } },
        team: { select: { name: true } },
      },
      orderBy,
      take: 10000,
    })

    // Company name
    const companyId =
      session.user.companyId ??
      (role === 'SYSTEM_ADMIN' ? undefined : undefined)
    let companyName = 'SmartPlanning'
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true },
      })
      if (company) companyName = company.name
    }

    // Transform data
    const pdfEmployees: EmployeeForPdf[] = employees.map((e) => ({
      lastName: e.lastName,
      firstName: e.firstName,
      email: e.email ?? e.user?.email ?? null,
      phone: e.phone,
      teamName: e.team?.name ?? null,
      role: e.user?.role ?? null,
      weeklyHours: e.weeklyHours,
      hireDate: e.hireDate,
      isActive: e.isActive,
    }))

    // Build active filters description
    const filterParts: string[] = []
    if (search) filterParts.push(`Recherche : "${search}"`)
    if (teamId) {
      const teamName = employees[0]?.team?.name
      if (teamName) filterParts.push(`Équipe : ${teamName}`)
    }
    if (isActiveParam === 'true') filterParts.push('Actifs uniquement')
    if (isActiveParam === 'false') filterParts.push('Inactifs uniquement')
    const activeFilters =
      filterParts.length > 0 ? filterParts.join(' | ') : undefined

    // Render PDF
    /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
    const buffer = await renderToBuffer(
      React.createElement(EmployeesPdfDocument, {
        employees: pdfEmployees,
        companyName,
        generatedAt: new Date(),
        activeFilters,
      }) as any
    )
    /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */

    // Return PDF
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `employes-${dateStr}.pdf`
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('[Export Employees PDF] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}
