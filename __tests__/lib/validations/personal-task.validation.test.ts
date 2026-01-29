/**
 * Tests unitaires pour les validations des tâches personnelles
 *
 * @ticket SP-417
 * @description Tests des schémas Zod pour PersonalTask
 */

import { describe, it, expect } from 'vitest'
import {
  personalTaskCreateSchema,
  personalTaskUpdateSchema,
  personalTaskReorderSchema,
  personalTaskToggleSchema,
  personalTaskFiltersSchema,
} from '@/lib/validations/personal-task'

// ============================================================================
// Tests personalTaskCreateSchema
// ============================================================================

describe('personalTaskCreateSchema', () => {
  it('valide avec titre seul', () => {
    const result = personalTaskCreateSchema.safeParse({
      title: 'Ma première tâche',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Ma première tâche')
      expect(result.data.description).toBeUndefined()
      expect(result.data.dueDate).toBeUndefined()
    }
  })

  it('valide avec titre + description + dueDate', () => {
    const dueDate = new Date('2026-02-15')
    const result = personalTaskCreateSchema.safeParse({
      title: 'Tâche complète',
      description: 'Une description détaillée',
      dueDate: dueDate.toISOString(),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Tâche complète')
      expect(result.data.description).toBe('Une description détaillée')
      expect(result.data.dueDate).toEqual(dueDate)
    }
  })

  it('valide avec dueDate null', () => {
    const result = personalTaskCreateSchema.safeParse({
      title: 'Sans date',
      dueDate: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeNull()
    }
  })

  it('échoue sans titre (string vide)', () => {
    const result = personalTaskCreateSchema.safeParse({
      title: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Le titre est requis')
    }
  })

  it('échoue avec titre > 200 caractères', () => {
    const result = personalTaskCreateSchema.safeParse({
      title: 'a'.repeat(201),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Le titre ne doit pas dépasser 200 caractères'
      )
    }
  })

  it('échoue avec description > 2000 caractères', () => {
    const result = personalTaskCreateSchema.safeParse({
      title: 'Titre valide',
      description: 'a'.repeat(2001),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'La description ne doit pas dépasser 2000 caractères'
      )
    }
  })

  it('valide avec titre exactement 200 caractères', () => {
    const result = personalTaskCreateSchema.safeParse({
      title: 'a'.repeat(200),
    })
    expect(result.success).toBe(true)
  })

  it('coerce une string date en Date', () => {
    const result = personalTaskCreateSchema.safeParse({
      title: 'Test coerce',
      dueDate: '2026-03-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date)
    }
  })
})

// ============================================================================
// Tests personalTaskUpdateSchema
// ============================================================================

describe('personalTaskUpdateSchema', () => {
  it('valide avec objet vide (tous optionnels)', () => {
    const result = personalTaskUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('valide avec completed: true', () => {
    const result = personalTaskUpdateSchema.safeParse({
      completed: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.completed).toBe(true)
    }
  })

  it('valide avec completed: false', () => {
    const result = personalTaskUpdateSchema.safeParse({
      completed: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.completed).toBe(false)
    }
  })

  it('valide avec dueDate: null (suppression)', () => {
    const result = personalTaskUpdateSchema.safeParse({
      dueDate: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeNull()
    }
  })

  it('valide avec description: null (suppression)', () => {
    const result = personalTaskUpdateSchema.safeParse({
      description: null,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.description).toBeNull()
    }
  })

  it('échoue avec titre vide si fourni', () => {
    const result = personalTaskUpdateSchema.safeParse({
      title: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Le titre ne peut pas être vide'
      )
    }
  })

  it('valide avec titre modifié', () => {
    const result = personalTaskUpdateSchema.safeParse({
      title: 'Nouveau titre',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Nouveau titre')
    }
  })

  it('valide mise à jour partielle multiple', () => {
    const result = personalTaskUpdateSchema.safeParse({
      title: 'Titre modifié',
      completed: true,
      dueDate: '2026-04-01',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe('Titre modifié')
      expect(result.data.completed).toBe(true)
      expect(result.data.dueDate).toBeInstanceOf(Date)
    }
  })
})

// ============================================================================
// Tests personalTaskReorderSchema
// ============================================================================

describe('personalTaskReorderSchema', () => {
  it('valide avec tableau d IDs CUID', () => {
    const result = personalTaskReorderSchema.safeParse({
      orderedIds: [
        'clz1234567890abcdefghij',
        'clz0987654321abcdefghij',
        'clz1111111111abcdefghij',
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.orderedIds).toHaveLength(3)
    }
  })

  it('valide avec un seul ID', () => {
    const result = personalTaskReorderSchema.safeParse({
      orderedIds: ['clz1234567890abcdefghij'],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.orderedIds).toHaveLength(1)
    }
  })

  it('échoue avec tableau vide', () => {
    const result = personalTaskReorderSchema.safeParse({
      orderedIds: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Au moins une tâche requise')
    }
  })

  it('échoue avec IDs non-CUID', () => {
    const result = personalTaskReorderSchema.safeParse({
      orderedIds: ['not-a-cuid', '12345'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('ID de tâche invalide')
    }
  })

  it('échoue si orderedIds manquant', () => {
    const result = personalTaskReorderSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Tests personalTaskToggleSchema
// ============================================================================

describe('personalTaskToggleSchema', () => {
  it('valide avec id CUID et completed true', () => {
    const result = personalTaskToggleSchema.safeParse({
      id: 'clz1234567890abcdefghij',
      completed: true,
    })
    expect(result.success).toBe(true)
  })

  it('valide avec id CUID et completed false', () => {
    const result = personalTaskToggleSchema.safeParse({
      id: 'clz1234567890abcdefghij',
      completed: false,
    })
    expect(result.success).toBe(true)
  })

  it('échoue avec id invalide', () => {
    const result = personalTaskToggleSchema.safeParse({
      id: 'invalid-id',
      completed: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('ID de tâche invalide')
    }
  })

  it('échoue sans completed', () => {
    const result = personalTaskToggleSchema.safeParse({
      id: 'clz1234567890abcdefghij',
    })
    expect(result.success).toBe(false)
  })
})

// ============================================================================
// Tests personalTaskFiltersSchema
// ============================================================================

describe('personalTaskFiltersSchema', () => {
  it('valide avec objet vide', () => {
    const result = personalTaskFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('valide avec completed filter', () => {
    const result = personalTaskFiltersSchema.safeParse({
      completed: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.completed).toBe(false)
    }
  })

  it('valide avec search filter', () => {
    const result = personalTaskFiltersSchema.safeParse({
      search: 'urgent',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.search).toBe('urgent')
    }
  })

  it('valide avec les deux filtres', () => {
    const result = personalTaskFiltersSchema.safeParse({
      completed: true,
      search: 'réunion',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.completed).toBe(true)
      expect(result.data.search).toBe('réunion')
    }
  })
})
