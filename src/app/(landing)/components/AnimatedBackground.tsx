'use client'

/**
 * AnimatedBackground Component
 * Animated gradient background for the landing page
 * Supports light/dark mode
 */

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Radial gradient overlay - monochrome primary */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent dark:from-blue-400/15" />

      {/* Static blobs - monochrome primary */}
      <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px] dark:bg-blue-400/10" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-[120px] dark:bg-blue-400/10" />

      {/* Grid pattern - adapts to light/dark mode */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] bg-[size:100px_100px] dark:bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)]" />
    </div>
  )
}
