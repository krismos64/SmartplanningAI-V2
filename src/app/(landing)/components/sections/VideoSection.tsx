'use client'

/**
 * VideoSection Component
 * Promotional video showcase with embedded YouTube player
 * Refactored to use centralized data and SectionHeader
 */

import { useState } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { motion, fadeInUp, staggerContainer } from '@/lib/animations'
import { videoFeatures } from '../../data'
import { SectionHeader } from '../index'

// YouTube icon component (custom SVG)
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

export function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section id="demo" className="py-24 lg:py-32">
      <div className="container-custom">
        {/* Section Header - Using reusable component */}
        <SectionHeader
          badge="Vidéo de présentation"
          badgeIcon={<YoutubeIcon className="h-4 w-4" />}
          color="red"
          title="Découvrez SmartPlanning"
          titleHighlight="en action"
          description="Visualisez en 2 minutes comment SmartPlanning peut transformer la gestion de vos plannings au quotidien."
          marginBottom="mb-12 lg:mb-16"
        />

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Glow Effect */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 blur-2xl" />

          {/* Video Frame */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Aspect Ratio Container */}
            <div className="relative aspect-video w-full">
              {!isPlaying ? (
                /* Thumbnail with Play Button */
                <>
                  {/* Miniature vidéo promotionnelle */}
                  <Image
                    src="/images/video-promotionnelle.png"
                    alt="SmartPlanning - Vidéo de présentation"
                    fill
                    sizes="(min-width: 1024px) 80vw, 100vw"
                    priority
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* Overlay Gradient pour lisibilité du bouton play */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30" />

                  {/* Play Button */}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="group absolute inset-0 flex cursor-pointer items-center justify-center"
                    aria-label="Lancer la vidéo"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      {/* Pulsing Ring */}
                      <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
                      <div className="absolute -inset-4 rounded-full bg-red-500/20 blur-xl transition-all group-hover:bg-red-500/40" />

                      {/* Play Icon */}
                      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg shadow-red-500/50 transition-all group-hover:shadow-xl group-hover:shadow-red-500/60 sm:h-24 sm:w-24">
                        <Play className="h-8 w-8 fill-white text-white sm:h-10 sm:w-10" />
                      </div>
                    </motion.div>

                    {/* Badge at top - Animated */}
                    <motion.span
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap sm:top-8"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30"
                      >
                        <YoutubeIcon className="h-4 w-4" />
                        Regarder la vidéo
                      </motion.span>
                    </motion.span>
                  </button>
                </>
              ) : (
                /* YouTube Embed - Code officiel YouTube */
                <iframe
                  src="https://www.youtube.com/embed/Drd2_9te5LM?autoplay=1"
                  title="Smartplanning"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-pink-500/10 blur-3xl" />
        </motion.div>

        {/* Video Features - Using centralized data */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 grid gap-6 sm:grid-cols-3"
        >
          {videoFeatures.map((feature) => (
            <motion.div
              key={feature.id}
              variants={fadeInUp}
              className="rounded-xl border border-border/50 bg-card/50 p-6 text-center"
            >
              <h3 className="mb-2 font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
