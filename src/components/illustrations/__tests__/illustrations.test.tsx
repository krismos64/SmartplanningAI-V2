/**
 * Tests unitaires - Illustrations Components
 *
 * @see SP-378 - Empty States
 * Tests des illustrations SVG pour les états vides
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  EmptyBoxIllustration,
  SearchNotFoundIllustration,
  ErrorIllustration,
  NoPermissionIllustration,
} from '../index'

describe('EmptyBoxIllustration', () => {
  it('renders with default props', () => {
    render(<EmptyBoxIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-labelledby', 'empty-box-title')
  })

  it('renders with custom dimensions', () => {
    render(<EmptyBoxIllustration width={100} height={100} />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '100')
    expect(svg).toHaveAttribute('height', '100')
  })

  it('renders with custom title', () => {
    render(<EmptyBoxIllustration title="Custom title" />)

    expect(screen.getByTitle('Custom title')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<EmptyBoxIllustration className="custom-class" />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveClass('custom-class')
  })

  it('has default text-muted-foreground class', () => {
    render(<EmptyBoxIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveClass('text-muted-foreground')
  })
})

describe('SearchNotFoundIllustration', () => {
  it('renders with default props', () => {
    render(<SearchNotFoundIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-labelledby', 'search-not-found-title')
  })

  it('renders with custom dimensions', () => {
    render(<SearchNotFoundIllustration width={150} height={150} />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '150')
    expect(svg).toHaveAttribute('height', '150')
  })

  it('renders with custom title', () => {
    render(<SearchNotFoundIllustration title="Recherche sans résultat" />)

    expect(screen.getByTitle('Recherche sans résultat')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<SearchNotFoundIllustration className="search-illustration" />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveClass('search-illustration')
  })
})

describe('ErrorIllustration', () => {
  it('renders with default props', () => {
    render(<ErrorIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-labelledby', 'error-illustration-title')
  })

  it('renders with custom dimensions', () => {
    render(<ErrorIllustration width={180} height={180} />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '180')
    expect(svg).toHaveAttribute('height', '180')
  })

  it('renders with custom title', () => {
    render(<ErrorIllustration title="Erreur système" />)

    expect(screen.getByTitle('Erreur système')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ErrorIllustration className="error-svg" />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveClass('error-svg')
  })
})

describe('NoPermissionIllustration', () => {
  it('renders with default props', () => {
    render(<NoPermissionIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('aria-labelledby', 'no-permission-title')
  })

  it('renders with custom dimensions', () => {
    render(<NoPermissionIllustration width={120} height={120} />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '120')
    expect(svg).toHaveAttribute('height', '120')
  })

  it('renders with custom title', () => {
    render(<NoPermissionIllustration title="Permission refusée" />)

    expect(screen.getByTitle('Permission refusée')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<NoPermissionIllustration className="permission-illustration" />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveClass('permission-illustration')
  })
})

describe('Illustrations accessibility', () => {
  it('all illustrations have role="img"', () => {
    const { unmount } = render(<EmptyBoxIllustration />)
    expect(screen.getByRole('img')).toBeInTheDocument()
    unmount()

    const { unmount: unmount2 } = render(<SearchNotFoundIllustration />)
    expect(screen.getByRole('img')).toBeInTheDocument()
    unmount2()

    const { unmount: unmount3 } = render(<ErrorIllustration />)
    expect(screen.getByRole('img')).toBeInTheDocument()
    unmount3()

    render(<NoPermissionIllustration />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('all illustrations have accessible titles', () => {
    const { unmount } = render(<EmptyBoxIllustration />)
    expect(screen.getByTitle('Boîte vide')).toBeInTheDocument()
    unmount()

    const { unmount: unmount2 } = render(<SearchNotFoundIllustration />)
    expect(screen.getByTitle('Aucun résultat trouvé')).toBeInTheDocument()
    unmount2()

    const { unmount: unmount3 } = render(<ErrorIllustration />)
    expect(screen.getByTitle('Une erreur est survenue')).toBeInTheDocument()
    unmount3()

    render(<NoPermissionIllustration />)
    expect(screen.getByTitle('Accès non autorisé')).toBeInTheDocument()
  })
})

describe('Illustrations default values', () => {
  it('EmptyBoxIllustration has correct default dimensions', () => {
    render(<EmptyBoxIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('SearchNotFoundIllustration has correct default dimensions', () => {
    render(<SearchNotFoundIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('ErrorIllustration has correct default dimensions', () => {
    render(<ErrorIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('NoPermissionIllustration has correct default dimensions', () => {
    render(<NoPermissionIllustration />)

    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })
})
