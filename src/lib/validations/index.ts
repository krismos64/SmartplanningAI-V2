/**
 * Barrel export pour tous les schemas de validation
 * Import unique : import { loginSchema, createEmployeeSchema } from '@/lib/validations'
 *
 * @ticket SP-150
 */

// Common schemas
export * from './common'

// User schemas
export * from './user'

// Auth schemas (signup, error messages)
export * from './auth'

// Employee schemas
export * from './employee'

// Company schemas (SP-150)
export * from './company'

// Team schemas (SP-150)
export * from './team'

// Schedule schemas (SP-393)
export * from './schedule'

// Availability schemas (SP-393)
export * from './availability'

// Leave schemas (SP-409)
export * from './leave'

// Personal Task schemas (SP-417)
export * from './personal-task'

// Incident Note schemas (SP-424)
export * from './incident-note'
