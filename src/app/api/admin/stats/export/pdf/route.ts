/**
 * API Route - Export PDF des statistiques admin
 *
 * @description Genere un PDF des stats globales de la plateforme.
 * RBAC: SYSTEM_ADMIN uniquement.
 * @ticket SP-475
 */

import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { requireRole } from '@/lib/api-auth'
import { getAdminStats } from '@/lib/services/dashboard/admin-stats.service'
import { AdminStatsPdfDocument } from '@/lib/pdf/AdminStatsPdfDocument'

export async function GET() {
  try {
    // 1. RBAC : SYSTEM_ADMIN uniquement
    const { error } = await requireRole('SYSTEM_ADMIN')
    if (error) return error

    // 2. Recuperer les stats
    const result = await getAdminStats()

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error ?? 'Erreur lors de la recuperation des stats' },
        { status: 500 }
      )
    }

    // 3. Generer le PDF — cast necessaire pour compatibilite React 19 / @react-pdf
    /* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
    const buffer = await renderToBuffer(
      React.createElement(AdminStatsPdfDocument, {
        stats: result.data,
        generatedAt: new Date(),
      }) as any
    )
    /* eslint-enable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */

    // 4. Retourner le PDF
    const now = new Date().toISOString().slice(0, 10)
    const filename = `smartplanning-stats-${now}.pdf`

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('[Export PDF Stats] Error:', err)
    return NextResponse.json(
      { error: 'Erreur lors de la generation du PDF' },
      { status: 500 }
    )
  }
}
