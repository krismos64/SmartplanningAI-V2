/**
 * WeeklyGridView : la liste des employés vient de l'entreprise, pas des seuls
 * créneaux
 *
 * @description Le défaut corrigé : la grille déduisait ses lignes uniquement
 * des créneaux et congés de la semaine affichée. Une entreprise sans aucun
 * créneau n'affichait donc aucune ligne, seulement le message d'état vide, et
 * un employé non planifié restait invisible. Mesuré en production : un
 * dirigeant avec 11 employés voyait une grille vide et n'a jamais créé de
 * créneau.
 *
 * Le correctif ajoute une prop `employees`, composée par le parent, et
 * compose la liste affichée ainsi : employés de l'entreprise d'abord, puis
 * ceux déduits des créneaux et congés (repli conservé pour un employé devenu
 * inactif qui garde un créneau sur la semaine consultée).
 *
 * @ticket SP-601
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WeeklyGridView } from '@/components/schedules/WeeklyGridView'
import type { ScheduleWithRelations } from '@/lib/actions/schedules'
import type { LeaveRequest } from '@prisma/client'

// ============================================================================
// Données
// ============================================================================

const MARDI_8_SEPTEMBRE = new Date('2026-09-08T10:00:00.000Z')

const aucunPlanning: ScheduleWithRelations[] = []

/**
 * Construit un employé minimal, tel que le fournirait le parent (SP-601).
 */
function employe(
  id: string,
  firstName: string,
  lastName: string
): { id: string; firstName: string; lastName: string; image?: string | null } {
  return { id, firstName, lastName, image: null }
}

/**
 * Construit un créneau minimal, suffisant pour peupler `scheduleIndex` et la
 * déduction historique. La date est fixée au mardi de la semaine testée pour
 * tomber dans la grille affichée.
 */
function creneau(
  id: string,
  employeeId: string,
  firstName: string,
  lastName: string
): ScheduleWithRelations {
  return {
    id,
    startDate: MARDI_8_SEPTEMBRE,
    endDate: MARDI_8_SEPTEMBRE,
    startTime: '09:00',
    endTime: '17:00',
    type: 'WORK',
    status: 'PUBLISHED',
    title: null,
    description: null,
    location: null,
    color: null,
    isRecurring: false,
    recurrenceRule: null,
    recurrenceGroupId: null,
    scheduleGroupId: null,
    employeeId,
    teamId: null,
    companyId: 'company-1',
    createdAt: MARDI_8_SEPTEMBRE,
    updatedAt: MARDI_8_SEPTEMBRE,
    employee: {
      id: employeeId,
      firstName,
      lastName,
      user: { image: null },
    },
    team: null,
  } as ScheduleWithRelations
}

type LeaveRequestWithEmployee = LeaveRequest & {
  employee: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    teamId: string | null
    user?: { image: string | null } | null
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('WeeklyGridView, composition des lignes employé', () => {
  describe('le cas du défaut : entreprise sans créneau', () => {
    it('affiche les employés de la prop employees même sans aucun créneau', () => {
      render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
          employees={[
            employe('emp-1', 'Alice', 'Martin'),
            employe('emp-2', 'Bob', 'Durand'),
            employe('emp-3', 'Chloé', 'Bernard'),
          ]}
        />
      )

      expect(screen.getByText('Alice Martin')).toBeInTheDocument()
      expect(screen.getByText('Bob Durand')).toBeInTheDocument()
      expect(screen.getByText('Chloé Bernard')).toBeInTheDocument()
      expect(
        screen.queryByText('Aucun collaborateur à planifier')
      ).not.toBeInTheDocument()
    })
  })

  describe('non-régression : sans la prop employees', () => {
    it('déduit toujours la liste depuis les créneaux', () => {
      render(
        <WeeklyGridView
          schedules={[creneau('s-1', 'emp-1', 'Alice', 'Martin')]}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
        />
      )

      expect(screen.getByText('Alice Martin')).toBeInTheDocument()
    })
  })

  describe('repli pour un employé absent de employees', () => {
    it('affiche un employé présent seulement dans les créneaux, sans doublon pour celui des deux sources', () => {
      render(
        <WeeklyGridView
          schedules={[
            // Doit rester unique : déjà présent dans employees.
            creneau('s-1', 'emp-1', 'Alice', 'Martin'),
            // Employé devenu inactif, absent de employees, qui garde un
            // créneau sur la semaine consultée.
            creneau('s-2', 'emp-2', 'Bob', 'Durand'),
          ]}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
          employees={[employe('emp-1', 'Alice', 'Martin')]}
        />
      )

      const lignesAlice = screen.getAllByText('Alice Martin')
      expect(lignesAlice).toHaveLength(1)
      expect(screen.getByText('Bob Durand')).toBeInTheDocument()
    })
  })

  describe("l'état vide résiduel", () => {
    it("affiche le message d'entreprise sans collaborateur avec son lien", () => {
      render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
          employees={[]}
        />
      )

      expect(
        screen.getByText('Aucun collaborateur à planifier')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', { name: 'Ajouter un collaborateur' })
      ).toHaveAttribute('href', '/app/dashboard/employees/new')
    })
  })

  describe('tri', () => {
    it('trie les lignes par nom puis prénom', () => {
      render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
          employees={[
            employe('emp-1', 'Zoé', 'Bernard'),
            employe('emp-2', 'Alice', 'Bernard'),
            employe('emp-3', 'Bob', 'Aubert'),
          ]}
        />
      )

      const noms = screen
        .getAllByRole('row')
        .slice(1) // écarte la ligne d'en-tête
        .map((row) => row.textContent ?? '')

      // Attendu : Aubert Bob, puis Bernard Alice, puis Bernard Zoé.
      expect(noms[0]).toContain('Bob Aubert')
      expect(noms[1]).toContain('Alice Bernard')
      expect(noms[2]).toContain('Zoé Bernard')
    })
  })

  describe('case libre', () => {
    it('appelle onEmptyCellClick avec le bon employé et le bon jour quand canEdit est vrai', async () => {
      const user = userEvent.setup()
      const onEmptyCellClick = vi.fn()

      render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
          employees={[employe('emp-1', 'Alice', 'Martin')]}
          canEdit
          onEmptyCellClick={onEmptyCellClick}
        />
      )

      const boutons = screen.getAllByTestId('empty-cell-button')
      expect(boutons.length).toBeGreaterThan(0)

      // Le premier bouton correspond au premier jour de la semaine affichée,
      // le lundi 7 septembre 2026.
      await user.click(boutons[0]!)

      expect(onEmptyCellClick).toHaveBeenCalledTimes(1)
      const [employeeId, jour] = onEmptyCellClick.mock.calls[0] as [
        string,
        Date,
      ]
      expect(employeeId).toBe('emp-1')
      expect(jour.getFullYear()).toBe(2026)
      expect(jour.getMonth()).toBe(8) // septembre, 0-indexé
      expect(jour.getDate()).toBe(7)
    })

    it('ne rend aucun bouton de case libre quand canEdit est faux', () => {
      render(
        <WeeklyGridView
          schedules={aucunPlanning}
          currentDate={MARDI_8_SEPTEMBRE}
          leaveRequests={[]}
          employees={[employe('emp-1', 'Alice', 'Martin')]}
          canEdit={false}
        />
      )

      expect(screen.queryByTestId('empty-cell-button')).not.toBeInTheDocument()
    })
  })
})
