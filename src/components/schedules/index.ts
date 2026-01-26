/**
 * Barrel export pour les composants Schedule
 *
 * @ticket SP-396, SP-397
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
