/**
 * Le formulaire de contact doit reellement poster vers /api/contact.
 *
 * Le defaut couvert ici a vecu depuis SP-287 : `ContactForm` etait monte sans
 * prop `onSubmit`, et le hook retombait alors sur un mode demo qui affichait
 * un succes apres 1,5 s sans qu'aucune requete ne parte. Cote visiteur, le
 * message semblait envoye, et rien n'arrivait sur contact@smartplanning.fr.
 *
 * Toute la suite existante injecte un `onSubmit` mocke, donc aucun test ne
 * montait le composant tel que la page l'utilise. C'est cet angle mort que
 * les deux cas ci-dessous ferment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ContactForm } from '../ContactForm'

async function remplirEtEnvoyer() {
  const user = userEvent.setup()

  await user.type(screen.getByLabelText(/nom/i), 'Chloé Bernard')
  await user.type(screen.getByLabelText(/email/i), 'chloe@exemple.fr')
  await user.type(screen.getByLabelText(/sujet/i), 'Demande de démonstration')
  await user.type(
    screen.getByLabelText(/message/i),
    'Bonjour, je souhaite une démonstration de votre outil de planning.'
  )
  await user.click(screen.getByRole('button', { name: /envoyer/i }))
}

describe('ContactForm, envoi par defaut', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('poste vers /api/contact quand aucun onSubmit n est fourni', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: true, message: 'Envoyé' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    render(<ContactForm />)
    await remplirEtEnvoyer()

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))

    const call = vi.mocked(global.fetch).mock.calls[0]
    expect(call).toBeDefined()
    const [url, init] = call!
    expect(url).toBe('/api/contact')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(init?.body as string)).toMatchObject({
      name: 'Chloé Bernard',
      email: 'chloe@exemple.fr',
    })
  })

  it('n annonce jamais un succes quand la route echoue', async () => {
    vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({ success: false, message: 'SMTP muet' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    render(<ContactForm />)
    await remplirEtEnvoyer()

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    expect(await screen.findByText(/SMTP muet/)).toBeInTheDocument()
    expect(screen.queryByText(/Merci Chloé/)).not.toBeInTheDocument()
  })
})
