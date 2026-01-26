/**
 * Composant AvailabilitiesList - Liste des indisponibilités
 *
 * @description Affiche une liste d'indisponibilités avec filtres et pagination
 * @ticket SP-401
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Plus,
  Calendar as CalendarIcon,
  Loader2,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { AvailabilityType } from '@prisma/client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

import { AvailabilityCard } from './AvailabilityCard'
import { AvailabilityModal } from './AvailabilityModal'
import {
  getAvailabilities,
  deleteAvailability,
  type AvailabilityWithRelations,
  type AvailabilityFiltersInput,
} from '@/lib/actions/availabilities'
import {
  availabilityTypeLabels,
  availabilityTypeColors,
} from '@/lib/validations/availability'

// ============================================================================
// Types
// ============================================================================

export interface AvailabilitiesListProps {
  /** ID entreprise */
  companyId: string
  /** ID employé (optionnel, pour filtrer) */
  employeeId?: string
  /** Nom de l'employé (pour le modal) */
  employeeName?: string
  /** Afficher le nom des employés dans les cartes */
  showEmployeeNames?: boolean
  /** Titre de la section */
  title?: string
  /** Afficher le bouton d'ajout */
  showAddButton?: boolean
  /** Limiter le nombre d'éléments par page */
  pageSize?: number
}

// ============================================================================
// Composant principal
// ============================================================================

export function AvailabilitiesList({
  companyId,
  employeeId,
  employeeName,
  showEmployeeNames = false,
  title = 'Indisponibilités',
  showAddButton = true,
  pageSize = 10,
}: AvailabilitiesListProps) {
  // États
  const [availabilities, setAvailabilities] = useState<
    AvailabilityWithRelations[]
  >([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // États filtres
  const [typeFilter, setTypeFilter] = useState<AvailabilityType | 'all'>('all')
  const [startDateFilter, setStartDateFilter] = useState<Date | undefined>(
    undefined
  )
  const [endDateFilter, setEndDateFilter] = useState<Date | undefined>(
    undefined
  )

  // États modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedAvailability, setSelectedAvailability] =
    useState<AvailabilityWithRelations | null>(null)

  // État suppression
  const [deleteTarget, setDeleteTarget] =
    useState<AvailabilityWithRelations | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Charger les données
  const fetchAvailabilities = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const filters: AvailabilityFiltersInput = {
        companyId,
        page,
        limit: pageSize,
        sortBy: 'startDate',
        sortOrder: 'desc',
      }

      if (employeeId) {
        filters.employeeId = employeeId
      }
      if (typeFilter !== 'all') {
        filters.type = typeFilter
      }
      if (startDateFilter) {
        filters.startDate = startDateFilter
      }
      if (endDateFilter) {
        filters.endDate = endDateFilter
      }

      const result = await getAvailabilities(filters)

      if (!result.success) {
        setError(result.error ?? 'Erreur lors du chargement')
        return
      }

      setAvailabilities(result.data.availabilities)
      setTotal(result.data.total)
    } catch {
      setError('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }, [
    companyId,
    employeeId,
    page,
    pageSize,
    typeFilter,
    startDateFilter,
    endDateFilter,
  ])

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    void fetchAvailabilities()
  }, [fetchAvailabilities])

  // Reset page quand les filtres changent
  useEffect(() => {
    setPage(1)
  }, [typeFilter, startDateFilter, endDateFilter])

  // Ouvrir modal création
  const handleCreate = () => {
    setSelectedAvailability(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  // Ouvrir modal édition
  const handleEdit = (availability: AvailabilityWithRelations) => {
    setSelectedAvailability(availability)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  // Confirmer suppression
  const handleDeleteConfirm = (availability: AvailabilityWithRelations) => {
    setDeleteTarget(availability)
  }

  // Exécuter suppression
  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const result = await deleteAvailability(deleteTarget.id)
      if (result.success) {
        void fetchAvailabilities()
      } else {
        setError(result.error ?? 'Erreur lors de la suppression')
      }
    } catch {
      setError('Une erreur inattendue est survenue')
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // Succès modal
  const handleModalSuccess = () => {
    void fetchAvailabilities()
  }

  // Pagination
  const totalPages = Math.ceil(total / pageSize)
  const canPrevious = page > 1
  const canNext = page < totalPages

  // Réinitialiser les filtres
  const clearFilters = () => {
    setTypeFilter('all')
    setStartDateFilter(undefined)
    setEndDateFilter(undefined)
    setPage(1)
  }

  const hasActiveFilters =
    typeFilter !== 'all' || startDateFilter || endDateFilter

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">
            {total} indisponibilité{total > 1 ? 's' : ''}
          </p>
        </div>

        {showAddButton && employeeId && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filtre type */}
        <Select
          value={typeFilter}
          onValueChange={(value) =>
            setTypeFilter(value as AvailabilityType | 'all')
          }
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {Object.entries(availabilityTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        availabilityTypeColors[value as AvailabilityType],
                    }}
                  />
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtre date début */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !startDateFilter && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDateFilter
                ? format(startDateFilter, 'dd/MM/yyyy', { locale: fr })
                : 'Date début'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDateFilter}
              onSelect={setStartDateFilter}
              locale={fr}
            />
          </PopoverContent>
        </Popover>

        {/* Filtre date fin */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[180px] justify-start text-left font-normal',
                !endDateFilter && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDateFilter
                ? format(endDateFilter, 'dd/MM/yyyy', { locale: fr })
                : 'Date fin'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDateFilter}
              onSelect={setEndDateFilter}
              disabled={(date) =>
                startDateFilter ? date < startDateFilter : false
              }
              locale={fr}
            />
          </PopoverContent>
        </Popover>

        {/* Bouton réinitialiser */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : availabilities.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Aucune indisponibilité trouvée
          </p>
          {showAddButton && employeeId && (
            <Button variant="outline" className="mt-4" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une indisponibilité
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {availabilities.map((availability) => (
            <AvailabilityCard
              key={availability.id}
              availability={availability}
              onEdit={handleEdit}
              onDelete={handleDeleteConfirm}
              showEmployee={showEmployeeNames}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!canPrevious || isLoading}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!canNext || isLoading}
            >
              Suivant
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal création/édition */}
      <AvailabilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        availability={selectedAvailability}
        employeeId={employeeId ?? ''}
        companyId={companyId}
        employeeName={
          modalMode === 'edit' && selectedAvailability
            ? `${selectedAvailability.employee.firstName} ${selectedAvailability.employee.lastName}`
            : employeeName
        }
        onSuccess={handleModalSuccess}
      />

      {/* Dialog confirmation suppression */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette indisponibilité ? Cette
              action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
