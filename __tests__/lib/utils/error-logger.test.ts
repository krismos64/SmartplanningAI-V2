/**
 * Error Logger Unit Tests - SP-303
 *
 * Unit tests for the error logging utility.
 * Tests error extraction, logging behavior, and context handling.
 *
 * @see Context7 Documentation:
 * - Vitest: Mocking console methods, environment variables
 * - Testing: Server-side utility testing patterns
 *
 * @ticket SP-303
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  logServerError,
  createErrorLogger,
  type ErrorContext,
} from '@/lib/utils/error-logger'

describe('Error Logger', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>
  let consoleTableSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {})
    consoleGroupEndSpy = vi
      .spyOn(console, 'groupEnd')
      .mockImplementation(() => {})
    consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  describe('logServerError', () => {
    describe('Development Environment', () => {
      beforeEach(() => {
        vi.stubEnv('NODE_ENV', 'development')
      })

      it('should log error in development with console.group', async () => {
        const error = new Error('Test error')
        await logServerError(error)

        expect(consoleGroupSpy).toHaveBeenCalledWith('🚨 Server Error')
        expect(consoleGroupEndSpy).toHaveBeenCalled()
      })

      it('should log error message', async () => {
        const error = new Error('Test error message')
        await logServerError(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error:',
          'Test error message'
        )
      })

      it('should log error name', async () => {
        const error = new TypeError('Type error')
        await logServerError(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith('Name:', 'TypeError')
      })

      it('should log error stack in development', async () => {
        const error = new Error('Test error')
        await logServerError(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Stack:',
          expect.stringContaining('Error: Test error')
        )
      })

      it('should log context as table', async () => {
        const context: ErrorContext = {
          route: '/api/test',
          method: 'POST',
          userId: 'user-123',
        }
        await logServerError(new Error('Test'), context)

        expect(consoleTableSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            Route: '/api/test',
            Method: 'POST',
            UserId: 'user-123',
          })
        )
      })
    })

    describe('Production Environment', () => {
      beforeEach(() => {
        vi.stubEnv('NODE_ENV', 'production')
      })

      it('should log as JSON in production', async () => {
        const error = new Error('Production error')
        await logServerError(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('"message":"Production error"')
        )
      })

      it('should not include stack trace in production', async () => {
        const error = new Error('Production error')
        await logServerError(error)

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.stack).toBeUndefined()
      })

      it('should include environment in JSON log', async () => {
        await logServerError(new Error('Test'))

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.environment).toBe('production')
      })

      it('should include timestamp in JSON log', async () => {
        await logServerError(new Error('Test'))

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/)
      })
    })

    describe('Error Type Handling', () => {
      beforeEach(() => {
        vi.stubEnv('NODE_ENV', 'development')
      })

      it('should handle Error objects', async () => {
        const error = new Error('Standard error')
        await logServerError(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'Standard error')
        expect(consoleErrorSpy).toHaveBeenCalledWith('Name:', 'Error')
      })

      it('should handle TypeError', async () => {
        const error = new TypeError('Type error')
        await logServerError(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith('Name:', 'TypeError')
      })

      it('should handle RangeError', async () => {
        const error = new RangeError('Range error')
        await logServerError(error)

        expect(consoleErrorSpy).toHaveBeenCalledWith('Name:', 'RangeError')
      })

      it('should handle string errors', async () => {
        await logServerError('String error message')

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error:',
          'String error message'
        )
      })

      it('should handle number as error', async () => {
        await logServerError(404)

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', '404')
      })

      it('should handle null', async () => {
        await logServerError(null)

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'null')
      })

      it('should handle undefined', async () => {
        await logServerError(undefined)

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'undefined')
      })

      it('should handle object as error', async () => {
        await logServerError({ custom: 'error' })

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error:',
          '[object Object]'
        )
      })

      it('should extract digest from Next.js errors', async () => {
        vi.stubEnv('NODE_ENV', 'production')
        const error = new Error('Next.js error') as Error & { digest?: string }
        error.digest = 'NEXT_NOT_FOUND'
        await logServerError(error)

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.digest).toBe('NEXT_NOT_FOUND')
      })
    })

    describe('Context Handling', () => {
      beforeEach(() => {
        vi.stubEnv('NODE_ENV', 'production')
      })

      it('should include route in context', async () => {
        await logServerError(new Error('Test'), { route: '/api/users' })

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.context.route).toBe('/api/users')
      })

      it('should include userId in context', async () => {
        await logServerError(new Error('Test'), { userId: 'user-456' })

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.context.userId).toBe('user-456')
      })

      it('should include requestId in context', async () => {
        await logServerError(new Error('Test'), { requestId: 'req-789' })

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.context.requestId).toBe('req-789')
      })

      it('should include method in context', async () => {
        await logServerError(new Error('Test'), { method: 'DELETE' })

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.context.method).toBe('DELETE')
      })

      it('should include custom fields in context', async () => {
        await logServerError(new Error('Test'), {
          customField: 'custom value',
        })

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.context.customField).toBe('custom value')
      })

      it('should handle empty context', async () => {
        await logServerError(new Error('Test'), {})

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.context).toBeDefined()
      })

      it('should handle no context parameter', async () => {
        await logServerError(new Error('Test'))

        const logOutput = consoleErrorSpy.mock.calls[0][0]
        const parsed = JSON.parse(logOutput)
        expect(parsed.context).toBeDefined()
      })
    })
  })

  describe('createErrorLogger', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production')
    })

    it('should create a logger with default context', async () => {
      const logger = createErrorLogger({ route: '/api/default' })
      await logger(new Error('Test'))

      const logOutput = consoleErrorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logOutput)
      expect(parsed.context.route).toBe('/api/default')
    })

    it('should merge additional context with default context', async () => {
      const logger = createErrorLogger({ route: '/api/default', method: 'GET' })
      await logger(new Error('Test'), { userId: 'user-123' })

      const logOutput = consoleErrorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logOutput)
      expect(parsed.context.route).toBe('/api/default')
      expect(parsed.context.method).toBe('GET')
      expect(parsed.context.userId).toBe('user-123')
    })

    it('should override default context with additional context', async () => {
      const logger = createErrorLogger({ route: '/api/default' })
      await logger(new Error('Test'), { route: '/api/override' })

      const logOutput = consoleErrorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logOutput)
      expect(parsed.context.route).toBe('/api/override')
    })

    it('should work with empty additional context', async () => {
      const logger = createErrorLogger({ route: '/api/test' })
      await logger(new Error('Test'))

      const logOutput = consoleErrorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logOutput)
      expect(parsed.context.route).toBe('/api/test')
    })

    it('should handle complex default context', async () => {
      const logger = createErrorLogger({
        route: '/api/complex',
        method: 'POST',
        service: 'auth-service',
        version: '1.0.0',
      })
      await logger(new Error('Test'))

      const logOutput = consoleErrorSpy.mock.calls[0][0]
      const parsed = JSON.parse(logOutput)
      expect(parsed.context.route).toBe('/api/complex')
      expect(parsed.context.method).toBe('POST')
      expect(parsed.context.service).toBe('auth-service')
      expect(parsed.context.version).toBe('1.0.0')
    })
  })

  describe('Async Behavior', () => {
    it('should return a Promise', () => {
      const result = logServerError(new Error('Test'))
      expect(result).toBeInstanceOf(Promise)
    })

    it('should resolve without errors', async () => {
      await expect(logServerError(new Error('Test'))).resolves.toBeUndefined()
    })

    it('should handle multiple concurrent logs', async () => {
      vi.stubEnv('NODE_ENV', 'production')

      await Promise.all([
        logServerError(new Error('Error 1')),
        logServerError(new Error('Error 2')),
        logServerError(new Error('Error 3')),
      ])

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3)
    })
  })
})
