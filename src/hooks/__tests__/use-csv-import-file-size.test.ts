/**
 * Tests de la garde de taille a l'import de collaborateurs
 *
 * @description SP-590 : `processFile` lisait le fichier en entier
 * (`file.arrayBuffer()` pour XLSX, `readAsText` pour CSV) et le parsait avant
 * que MAX_IMPORT_ROWS n'intervienne. Un fichier de plusieurs centaines de
 * megaoctets etait donc charge en memoire avant d'etre refuse pour son nombre
 * de lignes, ce qui gele l'onglet du dirigeant en plein onboarding.
 *
 * L'enjeu de ces tests n'est pas seulement que le fichier soit refuse, mais
 * qu'il ne soit **pas lu** : c'est la lecture qui coute, pas le refus. D'où
 * l'espion sur `arrayBuffer`, et la verification que `FileReader` n'est jamais
 * instancie.
 *
 * @ticket SP-590
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useCsvImport } from '../use-csv-import'
import {
  MAX_IMPORT_FILE_SIZE,
  formatFileSize,
} from '@/components/import/csv-import.utils'

vi.mock('@/lib/actions/csv-import', () => ({
  importEmployeesFromCsv: vi.fn(),
}))

/**
 * Construit un File dont `size` est arbitraire sans allouer les octets
 * correspondants : un test qui materialiserait 300 Mo serait inutilisable.
 * `arrayBuffer` et `text` sont espionnes pour prouver la non-lecture.
 */
function fileOfSize(
  bytes: number,
  name = 'collaborateurs.csv'
): { file: File; arrayBufferSpy: ReturnType<typeof vi.fn> } {
  const file = new File(['x'], name, { type: 'text/csv' })
  const arrayBufferSpy = vi.fn(() => Promise.resolve(new ArrayBuffer(0)))

  Object.defineProperty(file, 'size', { value: bytes, configurable: true })
  Object.defineProperty(file, 'arrayBuffer', {
    value: arrayBufferSpy,
    configurable: true,
  })

  return { file, arrayBufferSpy }
}

describe('useCsvImport — garde de taille avant lecture (SP-590)', () => {
  let fileReaderCalls = 0

  beforeEach(() => {
    fileReaderCalls = 0
    // Compte les instanciations de FileReader : le chemin CSV passe par lui,
    // et un fichier refuse ne doit jamais en construire.
    const RealFileReader = globalThis.FileReader
    vi.stubGlobal(
      'FileReader',
      class extends RealFileReader {
        constructor() {
          super()
          fileReaderCalls += 1
        }
      }
    )
  })

  it('refuse un fichier au-dessus du plafond sans le lire', async () => {
    const { file, arrayBufferSpy } = fileOfSize(MAX_IMPORT_FILE_SIZE + 1)
    const { result } = renderHook(() => useCsvImport())

    await act(async () => {
      await result.current.processFile(file)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.step).toBe('upload')
    // Le coeur du ticket : aucune lecture n'a eu lieu.
    expect(arrayBufferSpy).not.toHaveBeenCalled()
    expect(fileReaderCalls).toBe(0)
  })

  it('refuse un XLSX volumineux sans appeler arrayBuffer', async () => {
    // 300 Mo, le cas qui gelait l'onglet.
    const { file, arrayBufferSpy } = fileOfSize(
      300 * 1024 * 1024,
      'export-paie.xlsx'
    )
    const { result } = renderHook(() => useCsvImport())

    await act(async () => {
      await result.current.processFile(file)
    })

    expect(result.current.error).toBeTruthy()
    expect(arrayBufferSpy).not.toHaveBeenCalled()
  })

  it('donne un message lisible par un non-technicien', async () => {
    const { file } = fileOfSize(13_001_523, 'gros.xlsx')
    const { result } = renderHook(() => useCsvImport())

    await act(async () => {
      await result.current.processFile(file)
    })

    const error = result.current.error ?? ''
    // La taille apparait en Mo, jamais en octets bruts.
    expect(error).toContain('12,4 Mo')
    expect(error).not.toContain('13001523')
    // Et la limite est rappelee, sinon l'utilisateur ne sait pas quoi corriger.
    expect(error).toContain(formatFileSize(MAX_IMPORT_FILE_SIZE))
  })

  it('refuse un fichier vide avec son propre message', async () => {
    const { file, arrayBufferSpy } = fileOfSize(0)
    const { result } = renderHook(() => useCsvImport())

    await act(async () => {
      await result.current.processFile(file)
    })

    expect(result.current.error).toContain('vide')
    expect(arrayBufferSpy).not.toHaveBeenCalled()
  })

  it('laisse passer un fichier sous le plafond, qui est alors lu', async () => {
    // Un CSV valide de taille normale : la garde ne doit pas s'y opposer, et
    // le traitement doit aller jusqu'a la preview.
    const csv = 'nom;prenom;email\nDupont;Marie;marie.dupont@exemple.fr\n'
    const file = new File([csv], 'ok.csv', { type: 'text/csv' })
    Object.defineProperty(file, 'size', {
      value: csv.length,
      configurable: true,
    })

    const { result } = renderHook(() => useCsvImport())

    await act(async () => {
      await result.current.processFile(file)
    })

    // Le fichier a bien ete lu : FileReader a servi, et on n'est plus a l'etape
    // d'upload.
    expect(fileReaderCalls).toBeGreaterThan(0)
    expect(result.current.error).toBeNull()
    expect(result.current.step).toBe('preview')
  })
})

describe('formatFileSize', () => {
  it('affiche les octets en dessous du kilooctet', () => {
    expect(formatFileSize(512)).toBe('512 octets')
  })

  it('affiche les kilooctets en dessous du megaoctet', () => {
    expect(formatFileSize(150 * 1024)).toBe('150 Ko')
  })

  it('affiche les megaoctets avec une decimale et une virgule francaise', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5,0 Mo')
    expect(formatFileSize(13_001_523)).toBe('12,4 Mo')
  })
})
