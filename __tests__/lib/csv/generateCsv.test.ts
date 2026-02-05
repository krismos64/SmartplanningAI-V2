/**
 * Tests unitaires pour l'utilitaire CSV
 *
 * @ticket SP-333
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateCsv,
  formatDateFr,
  formatDateTimeFr,
  formatBooleanFr,
  formatDayOfWeek,
  type CsvColumn,
} from '@/lib/csv'

describe('generateCsv', () => {
  // Mock la date pour des tests reproductibles
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-02T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const sampleData = [
    { name: 'Alice', age: 30, active: true },
    { name: 'Bob', age: 25, active: false },
  ]

  const columns: CsvColumn<(typeof sampleData)[0]>[] = [
    { key: 'name', header: 'Nom' },
    { key: 'age', header: 'Âge' },
    { key: 'active', header: 'Actif' },
  ]

  // ============================================
  // GÉNÉRATION BASIQUE
  // ============================================
  describe('Génération basique', () => {
    it('génère un CSV avec en-têtes et données', () => {
      const result = generateCsv(sampleData, columns, { filename: 'test' })

      expect(result.filename).toBe('test-2026-02-02.csv')
      expect(result.mimeType).toBe('text/csv;charset=utf-8')
      expect(result.data).toContain('Nom;Âge;Actif')
      expect(result.data).toContain('Alice;30;true')
      expect(result.data).toContain('Bob;25;false')
    })

    it('inclut le BOM UTF-8 par défaut', () => {
      const result = generateCsv(sampleData, columns, { filename: 'test' })

      expect(result.data.startsWith('\uFEFF')).toBe(true)
    })

    it('peut exclure le BOM UTF-8', () => {
      const result = generateCsv(sampleData, columns, {
        filename: 'test',
        includeBom: false,
      })

      expect(result.data.startsWith('\uFEFF')).toBe(false)
    })

    it('utilise le séparateur point-virgule par défaut', () => {
      const result = generateCsv(sampleData, columns, { filename: 'test' })

      // Vérifier que le séparateur est bien ;
      expect(result.data).toContain('Nom;Âge;Actif')
    })

    it('permet de changer le séparateur', () => {
      const result = generateCsv(sampleData, columns, {
        filename: 'test',
        separator: ',',
      })

      expect(result.data).toContain('Nom,Âge,Actif')
    })

    it('gère un tableau vide', () => {
      const result = generateCsv([], columns, { filename: 'empty' })

      // Doit contenir seulement l'en-tête
      expect(result.data).toContain('Nom;Âge;Actif')
      const lines = result.data.split('\n')
      // BOM + en-tête = 1 ligne après le BOM
      expect(lines.length).toBe(1)
    })

    it('génère un nom de fichier avec la date', () => {
      const result = generateCsv(sampleData, columns, {
        filename: 'employes-export',
      })

      expect(result.filename).toBe('employes-export-2026-02-02.csv')
    })
  })

  // ============================================
  // ÉCHAPPEMENT DES VALEURS
  // ============================================
  describe('Échappement des valeurs', () => {
    it('échappe les valeurs contenant le séparateur', () => {
      const data = [{ name: 'Alice; Bob', age: 30, active: true }]
      const result = generateCsv(data, columns, { filename: 'test' })

      expect(result.data).toContain('"Alice; Bob"')
    })

    it('échappe les valeurs contenant des guillemets', () => {
      const data = [{ name: 'Alice "la grande"', age: 30, active: true }]
      const result = generateCsv(data, columns, { filename: 'test' })

      // Les guillemets doivent être doublés et la valeur entourée de guillemets
      expect(result.data).toContain('"Alice ""la grande"""')
    })

    it('échappe les valeurs contenant des retours à la ligne', () => {
      const data = [{ name: 'Alice\nBob', age: 30, active: true }]
      const result = generateCsv(data, columns, { filename: 'test' })

      expect(result.data).toContain('"Alice\nBob"')
    })

    it('échappe les valeurs contenant des retours chariot', () => {
      const data = [{ name: 'Alice\rBob', age: 30, active: true }]
      const result = generateCsv(data, columns, { filename: 'test' })

      expect(result.data).toContain('"Alice\rBob"')
    })

    it('gère les valeurs null', () => {
      const data = [{ name: null as unknown as string, age: 30, active: true }]
      const result = generateCsv(data, columns, { filename: 'test' })

      // La valeur null doit être convertie en string vide
      expect(result.data).toContain(';30;true')
    })

    it('gère les valeurs undefined', () => {
      const data = [
        { name: undefined as unknown as string, age: 30, active: true },
      ]
      const result = generateCsv(data, columns, { filename: 'test' })

      expect(result.data).toContain(';30;true')
    })
  })

  // ============================================
  // FONCTIONS D'EXTRACTION
  // ============================================
  describe("Fonctions d'extraction", () => {
    it('supporte les fonctions comme clé', () => {
      const columnsWithFn: CsvColumn<(typeof sampleData)[0]>[] = [
        {
          key: (item) => `${item.name} (${item.age})`,
          header: 'Info',
        },
      ]

      const result = generateCsv(sampleData, columnsWithFn, {
        filename: 'test',
      })

      expect(result.data).toContain('Alice (30)')
      expect(result.data).toContain('Bob (25)')
    })

    it('gère les objets imbriqués via fonction', () => {
      const nestedData = [
        { person: { name: 'Alice' }, active: true },
        { person: { name: 'Bob' }, active: false },
      ]

      const nestedColumns: CsvColumn<(typeof nestedData)[0]>[] = [
        { key: (item) => item.person.name, header: 'Nom' },
        { key: 'active', header: 'Actif' },
      ]

      const result = generateCsv(nestedData, nestedColumns, {
        filename: 'test',
      })

      expect(result.data).toContain('Alice')
      expect(result.data).toContain('Bob')
    })

    it('gère les valeurs nullables via fonction', () => {
      const dataWithNullable = [
        { team: { name: 'Alpha' } },
        { team: null as { name: string } | null },
      ]

      const columnsNullable: CsvColumn<(typeof dataWithNullable)[0]>[] = [
        { key: (item) => item.team?.name ?? '', header: 'Équipe' },
      ]

      const result = generateCsv(dataWithNullable, columnsNullable, {
        filename: 'test',
      })

      expect(result.data).toContain('Alpha')
      // La deuxième ligne doit avoir une chaîne vide pour l'équipe
    })
  })

  // ============================================
  // FORMATAGE
  // ============================================
  describe('Formatage', () => {
    it('applique les fonctions de formatage', () => {
      const columnsWithFormat: CsvColumn<(typeof sampleData)[0]>[] = [
        { key: 'name', header: 'Nom' },
        {
          key: 'active',
          header: 'Actif',
          format: (v) => ((v as boolean) ? 'Oui' : 'Non'),
        },
      ]

      const result = generateCsv(sampleData, columnsWithFormat, {
        filename: 'test',
      })

      expect(result.data).toContain('Oui')
      expect(result.data).toContain('Non')
    })

    it('passe l item complet à la fonction de formatage', () => {
      const columnsWithItemFormat: CsvColumn<(typeof sampleData)[0]>[] = [
        {
          key: 'name',
          header: 'Info',
          format: (value, item) => `${value} - Age: ${item.age}`,
        },
      ]

      const result = generateCsv(sampleData, columnsWithItemFormat, {
        filename: 'test',
      })

      expect(result.data).toContain('Alice - Age: 30')
      expect(result.data).toContain('Bob - Age: 25')
    })
  })
})

// ============================================
// FONCTIONS DE FORMATAGE DE DATE
// ============================================
describe('formatDateFr', () => {
  it('formate une date en DD/MM/YYYY', () => {
    const date = new Date('2026-02-15T10:30:00Z')
    expect(formatDateFr(date)).toBe('15/02/2026')
  })

  it('accepte une string ISO', () => {
    expect(formatDateFr('2026-02-15T10:30:00Z')).toBe('15/02/2026')
  })

  it('retourne vide pour null', () => {
    expect(formatDateFr(null)).toBe('')
  })

  it('retourne vide pour undefined', () => {
    expect(formatDateFr(undefined)).toBe('')
  })

  it('retourne vide pour une date invalide', () => {
    expect(formatDateFr('invalid-date')).toBe('')
  })
})

describe('formatDateTimeFr', () => {
  it('formate une date avec heure', () => {
    const date = new Date('2026-02-15T10:30:00')
    const result = formatDateTimeFr(date)
    expect(result).toMatch(/15\/02\/2026/)
    expect(result).toMatch(/10:30/)
  })

  it('retourne vide pour null', () => {
    expect(formatDateTimeFr(null)).toBe('')
  })

  it('retourne vide pour undefined', () => {
    expect(formatDateTimeFr(undefined)).toBe('')
  })

  it('retourne vide pour une date invalide', () => {
    expect(formatDateTimeFr('invalid')).toBe('')
  })
})

describe('formatBooleanFr', () => {
  it('formate true en "Oui"', () => {
    expect(formatBooleanFr(true)).toBe('Oui')
  })

  it('formate false en "Non"', () => {
    expect(formatBooleanFr(false)).toBe('Non')
  })

  it('retourne vide pour null', () => {
    expect(formatBooleanFr(null)).toBe('')
  })

  it('retourne vide pour undefined', () => {
    expect(formatBooleanFr(undefined)).toBe('')
  })
})

describe('formatDayOfWeek', () => {
  it('retourne le jour de la semaine en français pour un lundi', () => {
    const monday = new Date('2026-02-02') // Lundi
    expect(formatDayOfWeek(monday)).toBe('lundi')
  })

  it('retourne le jour de la semaine en français pour un dimanche', () => {
    const sunday = new Date('2026-02-08') // Dimanche
    expect(formatDayOfWeek(sunday)).toBe('dimanche')
  })

  it('accepte une string ISO', () => {
    expect(formatDayOfWeek('2026-02-02')).toBe('lundi')
  })
})
