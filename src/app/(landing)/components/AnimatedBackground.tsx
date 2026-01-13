'use client'

/**
 * AnimatedBackground Component
 * Animated gradient background for the landing page
 */

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />

      {/* Animated blobs */}
      <div className="absolute left-1/4 top-0 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-purple-600/10 blur-[120px] delay-1000" />
      <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] animate-pulse rounded-full bg-cyan-500/5 blur-[100px] delay-500" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  )
}
