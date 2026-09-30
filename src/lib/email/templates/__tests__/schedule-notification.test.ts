/**
 * SP-603 : le conteneur de production tourne en UTC. Un créneau posé d'un
 * clic dans la grille est stocké à 22:00 UTC la veille, et l'email annonçait
 * donc le jour précédent. Le fuseau du processus est forcé à UTC pour que le
 * test reproduise la production, y compris sur un poste en heure de Paris.
 */
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

const { mockSendEmail, mockRender } = vi.hoisted(() => ({
  mockSendEmail: vi.fn(),
  mockRender: vi.fn(),
}))

vi.mock('@/lib/email', () => ({ sendEmail: mockSendEmail }))
vi.mock('@/lib/email/config', () => ({
  getBaseUrl: () => 'https://smartplanning.fr',
}))
vi.mock('@react-email/components', () => ({ render: mockRender }))
vi.mock('../../../../../emails/templates/ScheduleNotificationEmail', () => ({
  ScheduleNotificationEmail: (props: unknown) => props,
}))

import { sendScheduleNotificationEmail } from '../schedule-notification'

describe('sendScheduleNotificationEmail : date du créneau (SP-603)', () => {
  const tzOrigine = process.env.TZ

  beforeAll(() => {
    process.env.TZ = 'UTC'
  })

  afterAll(() => {
    process.env.TZ = tzOrigine
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockRender.mockResolvedValue('<html></html>')
    mockSendEmail.mockResolvedValue({ success: true })
  })

  it('annonce le jour de Paris pour un créneau stocké à 22:00 UTC la veille', async () => {
    // Relevé en production le 28 septembre 2026 : dimanche 4 octobre
    await sendScheduleNotificationEmail({
      employeeEmail: 'employe@example.com',
      firstName: 'Pablo',
      action: 'created',
      count: 1,
      startDate: new Date('2026-10-03T22:00:00.000Z'),
      scheduleType: 'WORK',
      timeRange: '10:00 - 19:00',
    })

    const [envoi] = mockSendEmail.mock.calls[0] as [{ subject: string }]
    expect(envoi.subject).toContain('4 octobre 2026')
    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: '4 octobre 2026' })
    )
  })

  it("rend aussi la date de fin d'une plage dans le fuseau de Paris", async () => {
    await sendScheduleNotificationEmail({
      employeeEmail: 'employe@example.com',
      firstName: 'Pablo',
      action: 'created',
      count: 5,
      startDate: new Date('2026-09-27T22:00:00.000Z'),
      endDate: new Date('2026-10-03T22:00:00.000Z'),
      scheduleType: 'WORK',
    })

    expect(mockRender).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '28 septembre 2026',
        endDate: '4 octobre 2026',
      })
    )
  })
})
