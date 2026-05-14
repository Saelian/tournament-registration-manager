import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EventSection } from './EventSection'

const baseTournament = {
  name: 'Tournoi National B',
  startDate: '2026-05-16',
  endDate: '2026-05-17',
  eventResultUrl: null,
  eventContent: null,
}

describe('EventSection', () => {
  it('ne rend rien si eventResultUrl et eventContent sont null', () => {
    const { container } = render(<EventSection tournament={baseTournament} />)
    expect(container.firstChild).toBeNull()
  })

  it('affiche le lien et le QR code si eventResultUrl est défini', () => {
    render(
      <EventSection
        tournament={{
          ...baseTournament,
          eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
        }}
      />
    )
    expect(screen.getByText('Voir les résultats')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://docs.google.com/spreadsheets/d/123'
    )
  })

  it('affiche le contenu markdown si eventContent est défini', () => {
    render(
      <EventSection
        tournament={{
          ...baseTournament,
          eventContent: 'Buvette sur place',
        }}
      />
    )
    expect(screen.getByText(/Buvette sur place/)).toBeInTheDocument()
  })

  it('masque la bande markdown si eventContent est null', () => {
    render(
      <EventSection
        tournament={{
          ...baseTournament,
          eventResultUrl: 'https://docs.google.com/spreadsheets/d/123',
          eventContent: null,
        }}
      />
    )
    expect(screen.getByText('Voir les résultats')).toBeInTheDocument()
    expect(screen.queryByTestId('event-content')).toBeNull()
  })
})
