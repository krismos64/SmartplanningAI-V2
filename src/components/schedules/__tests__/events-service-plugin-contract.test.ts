/**
 * Contrat du plugin events-service de Schedule-X
 *
 * @description Le calendrier resynchronise ses événements après le montage en
 * appelant `eventsService.set(events)`. Ce test fixe la contrainte que le
 * plugin impose à cet appel, et qui a cassé la page en production.
 *
 * Il n'utilise volontairement aucun mock de `@schedule-x/events-service` : le
 * mock du test de composant renvoie un objet toujours prêt, donc il ne pouvait
 * pas voir le défaut. C'est le vrai paquet qui porte la contrainte.
 *
 * @ticket SP-581
 */

import { describe, it, expect } from 'vitest'
import { createEventsServicePlugin } from '@schedule-x/events-service'

describe('contrat du plugin events-service', () => {
  // Le garde de ScheduleCalendarDesktop testait `if (!eventsServiceRef.current)`.
  // Ce test dit pourquoi ce garde ne suffisait pas : l'objet existe bien avant
  // d'être utilisable.
  it("expose un objet dont l'état interne n'est pas encore prêt", () => {
    const service = createEventsServicePlugin()

    expect(service).toBeDefined()
    // ...et pourtant :
    expect((service as unknown as { $app?: unknown }).$app).toBeUndefined()
  })

  // Le défaut exact vu en production : « Cannot read properties of undefined
  // (reading 'set') », qui remplaçait toute la page par l'error boundary.
  it('lève si set() est appelé avant le montage du calendrier', () => {
    const service = createEventsServicePlugin()

    expect(() => service.set([])).toThrow(TypeError)
  })

  // Le garde retenu. Si une version future de Schedule-X initialisait `$app`
  // dès le constructeur, ce test resterait vert et le garde deviendrait
  // simplement inutile, jamais faux.
  it('le garde sur $app suffit à éviter la levée', () => {
    const service = createEventsServicePlugin()
    const pret = (service as unknown as { $app?: unknown }).$app !== undefined

    expect(pret).toBe(false)
    expect(() => {
      if (!pret) return
      service.set([])
    }).not.toThrow()
  })
})
