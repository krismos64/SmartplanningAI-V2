/**
 * Barrel export pour les composants Schedule
 *
 * @ticket SP-396, SP-397, SP-399, SP-400, SP-402
 */

export {
  ScheduleCalendar,
  type ScheduleCalendarProps,
} from './ScheduleCalendar'
export { WeeklyGridView } from './WeeklyGridView'
export { ScheduleCalendarDesktop } from './ScheduleCalendarDesktop'
export { ScheduleCalendarMobile } from './ScheduleCalendarMobile'
export { ShiftModal, type ShiftModalProps } from './ShiftModal'
export {
  useShiftFormData,
  type EmployeeOption,
  type TeamOption,
  type ShiftFormData,
} from './useShiftFormData'
export { RecurrenceConfig } from './RecurrenceConfig'
export {
  RecurrenceEditDialog,
  DeleteConfirmDialog,
  type RecurrenceEditScope,
  type RecurrenceEditAction,
} from './RecurrenceEditDialog'
export { ConflictAlert, type ConflictAlertProps } from './ConflictAlert'
export {
  ConflictConfirmDialog,
  type ConflictConfirmDialogProps,
} from './ConflictConfirmDialog'

// SP-403: Export PDF
export { ExportDropdown } from './ExportDropdown'

// SP-406: Weekly Hours Panel
export {
  WeeklyHoursPanel,
  type WeeklyHoursPanelProps,
  type EmployeeWithHours,
} from './WeeklyHoursPanel'

// SP-402: Overlay Indisponibilités
export {
  AvailabilityBadge,
  AVAILABILITY_TYPE_CONFIG,
  HARD_AVAILABILITY_TYPES,
  type AvailabilityBadgeProps,
} from './AvailabilityBadge'
export {
  AvailabilityPopover,
  type AvailabilityPopoverProps,
} from './AvailabilityPopover'
export {
  AvailabilityOverlay,
  useAvailabilityOverlayEvents,
  AVAILABILITY_CALENDAR_CONFIG,
  type AvailabilityOverlayProps,
  type ScheduleXBackgroundEvent,
} from './AvailabilityOverlay'
