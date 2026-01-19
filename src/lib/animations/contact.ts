/**
 * Animation variants pour le formulaire de contact
 *
 * @ticket SP-289
 * @description Variants Framer Motion pour les états success/error du contact form
 *
 * ✅ Source : Context7 - Framer Motion SVG path animations
 */

import type { Variants } from 'framer-motion'

/**
 * Variants pour le conteneur de succès
 * Animation d'entrée avec scale et opacity
 */
export const successContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
}

/**
 * Variants pour les éléments enfants du succès
 */
export const successItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      bounce: 0.3,
    },
  },
}

/**
 * Variants pour le cercle du checkmark SVG
 * Animation de dessin du cercle
 */
export const checkmarkCircleVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.5,
        ease: 'easeInOut',
      },
      opacity: {
        duration: 0.2,
      },
    },
  },
}

/**
 * Variants pour la coche du checkmark SVG
 * Animation avec délai pour apparaître après le cercle
 */
export const checkmarkTickVariants: Variants = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        duration: 0.4,
        delay: 0.3,
        ease: 'easeOut',
      },
      opacity: {
        duration: 0.2,
        delay: 0.3,
      },
    },
  },
}

/**
 * Variants pour le conteneur d'erreur
 * Animation shake horizontale
 */
export const errorContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      bounce: 0.3,
      duration: 0.5,
    },
  },
  shake: {
    x: [0, -10, 10, -10, 10, -5, 5, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
}

/**
 * Variants pour l'icône d'erreur (X)
 */
export const errorIconVariants: Variants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      bounce: 0.5,
      duration: 0.6,
    },
  },
}

/**
 * Variants pour le formulaire avec AnimatePresence
 */
export const formContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
}
