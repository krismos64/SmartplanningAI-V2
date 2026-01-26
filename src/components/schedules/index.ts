/**
 * Barrel export pour les composants Schedule
 *
 * @ticket SP-396, SP-397, SP-399, SP-400
 */

export {
  ScheduleCalendar,
  type ScheduleCalendarProps,
} from './ScheduleCalendar'
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
export { ConflictConfirmDialog, type ConflictConfirmDialogProps } from './ConflictConfirmDialog'
