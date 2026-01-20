'use client'

/**
 * Test Error Page - SP-304
 *
 * This page is used for E2E testing of the Error Boundary.
 * It allows triggering an error manually via a button click.
 *
 * NOTE: This page should be excluded from production builds or protected.
 * Currently protected by being in a (test) route group.
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Bug } from 'lucide-react'

/**
 * Component that throws when shouldThrow is true
 */
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error triggered intentionally for E2E testing')
  }
  return (
    <div data-testid="working-component" className="text-green-500">
      Component is working normally
    </div>
  )
}

/**
 * TestErrorPage - Page for testing Error Boundary behavior
 */
export default function TestErrorPage() {
  const [triggerError, setTriggerError] = useState(false)

  // Only accessible in development/test environments
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>This page is not available in production.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Error Boundary Test Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This page is used for E2E testing of the Error Boundary component.
            Click the button below to trigger an error and see the fallback UI.
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => setTriggerError(true)}
              variant="destructive"
              data-testid="trigger-error-button"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Trigger Error
            </Button>

            {triggerError && (
              <Button
                onClick={() => setTriggerError(false)}
                variant="outline"
                data-testid="reset-error-button"
              >
                Reset
              </Button>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <BuggyComponent shouldThrow={triggerError} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
