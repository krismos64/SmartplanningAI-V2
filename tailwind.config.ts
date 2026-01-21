/**
 * Configuration Tailwind CSS - SmartPlanning V2
 *
 * Intègre les design tokens pour assurer la cohérence visuelle
 *
 * @see SP-259 - Design Tokens
 */

import type { Config } from 'tailwindcss'

// Import des design tokens
import {
  slate,
  blue,
  cyan,
  emerald,
  amber,
  rose,
  violet,
} from './src/styles/tokens/colors'
import { fontFamily, fontSize } from './src/styles/tokens/typography'
import { spacing, breakpoints, containerWidths } from './src/styles/tokens/spacing'
import { boxShadowLight } from './src/styles/tokens/shadows'
import { borderRadius } from './src/styles/tokens/radius'

const config: Config = {
  // Dark mode basé sur la classe (recommandé par Shadcn/ui)
  darkMode: ['class'],

  // Chemins des fichiers à scanner pour les classes Tailwind
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    // Containers personnalisés
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },

    // Breakpoints
    screens: {
      sm: breakpoints.sm,
      md: breakpoints.md,
      lg: breakpoints.lg,
      xl: breakpoints.xl,
      '2xl': breakpoints['2xl'],
    },

    extend: {
      // =================================================================
      // TYPOGRAPHIE
      // =================================================================
      fontFamily: {
        // Police display pour titres
        display: [...fontFamily.display],
        rajdhani: [...fontFamily.display], // Alias pour compatibilité
        // Police principale
        sans: [...fontFamily.sans],
        // Police code
        mono: [...fontFamily.mono],
        // Police serif
        serif: [...fontFamily.serif],
      },

      fontSize: {
        xs: [fontSize.xs.size, { lineHeight: fontSize.xs.lineHeight, letterSpacing: fontSize.xs.letterSpacing }],
        sm: [fontSize.sm.size, { lineHeight: fontSize.sm.lineHeight, letterSpacing: fontSize.sm.letterSpacing }],
        base: [fontSize.base.size, { lineHeight: fontSize.base.lineHeight, letterSpacing: fontSize.base.letterSpacing }],
        lg: [fontSize.lg.size, { lineHeight: fontSize.lg.lineHeight, letterSpacing: fontSize.lg.letterSpacing }],
        xl: [fontSize.xl.size, { lineHeight: fontSize.xl.lineHeight, letterSpacing: fontSize.xl.letterSpacing }],
        '2xl': [fontSize['2xl'].size, { lineHeight: fontSize['2xl'].lineHeight, letterSpacing: fontSize['2xl'].letterSpacing }],
        '3xl': [fontSize['3xl'].size, { lineHeight: fontSize['3xl'].lineHeight, letterSpacing: fontSize['3xl'].letterSpacing }],
        '4xl': [fontSize['4xl'].size, { lineHeight: fontSize['4xl'].lineHeight, letterSpacing: fontSize['4xl'].letterSpacing }],
        '5xl': [fontSize['5xl'].size, { lineHeight: fontSize['5xl'].lineHeight, letterSpacing: fontSize['5xl'].letterSpacing }],
        '6xl': [fontSize['6xl'].size, { lineHeight: fontSize['6xl'].lineHeight, letterSpacing: fontSize['6xl'].letterSpacing }],
        '7xl': [fontSize['7xl'].size, { lineHeight: fontSize['7xl'].lineHeight, letterSpacing: fontSize['7xl'].letterSpacing }],
        '8xl': [fontSize['8xl'].size, { lineHeight: fontSize['8xl'].lineHeight, letterSpacing: fontSize['8xl'].letterSpacing }],
        '9xl': [fontSize['9xl'].size, { lineHeight: fontSize['9xl'].lineHeight, letterSpacing: fontSize['9xl'].letterSpacing }],
      },

      // =================================================================
      // COULEURS
      // =================================================================
      colors: {
        // Palettes primitives
        slate,
        blue,
        cyan,
        emerald,
        amber,
        rose,
        violet,

        // Couleurs sémantiques via CSS variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          muted: 'hsl(var(--primary-muted))',
        },

        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          hover: 'hsl(var(--secondary-hover))',
          muted: 'hsl(var(--secondary-muted))',
        },

        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          hover: 'hsl(var(--accent-hover))',
          muted: 'hsl(var(--accent-muted))',
        },

        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          hover: 'hsl(var(--destructive-hover))',
          muted: 'hsl(var(--destructive-muted))',
        },

        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          hover: 'hsl(var(--success-hover))',
          muted: 'hsl(var(--success-muted))',
        },

        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          hover: 'hsl(var(--warning-hover))',
          muted: 'hsl(var(--warning-muted))',
        },

        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          hover: 'hsl(var(--info-hover))',
          muted: 'hsl(var(--info-muted))',
        },

        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },

        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },

        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },

      // =================================================================
      // ESPACEMENTS
      // =================================================================
      spacing,

      // Container widths
      maxWidth: {
        ...containerWidths,
      },

      // =================================================================
      // BORDER RADIUS
      // =================================================================
      borderRadius: {
        none: borderRadius.none,
        xs: borderRadius.xs,
        sm: borderRadius.sm,
        md: borderRadius.md,
        DEFAULT: borderRadius.DEFAULT,
        lg: borderRadius.lg,
        xl: borderRadius.xl,
        '2xl': borderRadius['2xl'],
        '3xl': borderRadius['3xl'],
        full: borderRadius.full,
        // Legacy Shadcn compatibility
        'radius-lg': 'var(--radius)',
        'radius-md': 'calc(var(--radius) - 2px)',
        'radius-sm': 'calc(var(--radius) - 4px)',
      },

      // =================================================================
      // OMBRES
      // =================================================================
      boxShadow: {
        // Échelle de base
        none: boxShadowLight.none,
        xs: boxShadowLight.xs,
        sm: boxShadowLight.sm,
        DEFAULT: boxShadowLight.md,
        md: boxShadowLight.md,
        lg: boxShadowLight.lg,
        xl: boxShadowLight.xl,
        '2xl': boxShadowLight['2xl'],
        inner: boxShadowLight.inner,
        'inner-lg': boxShadowLight.innerLg,

        // Ombres spéciales avec glow
        'primary-glow': '0 4px 14px 0 rgba(59, 130, 246, 0.35)',
        'primary-glow-lg': '0 6px 20px 0 rgba(59, 130, 246, 0.45)',
        'accent-glow': '0 4px 14px 0 rgba(6, 182, 212, 0.35)',
        'success-glow': '0 4px 14px 0 rgba(16, 185, 129, 0.35)',
        'error-glow': '0 4px 14px 0 rgba(225, 29, 72, 0.35)',

        // Focus rings
        'focus-primary': '0 0 0 3px rgba(59, 130, 246, 0.15)',
        'focus-error': '0 0 0 3px rgba(225, 29, 72, 0.15)',
        'focus-success': '0 0 0 3px rgba(16, 185, 129, 0.15)',
      },

      dropShadow: {
        none: 'none',
        xs: '0 1px 1px rgba(59, 130, 246, 0.05)',
        sm: '0 1px 2px rgba(59, 130, 246, 0.1)',
        DEFAULT: '0 3px 3px rgba(59, 130, 246, 0.1)',
        md: '0 3px 3px rgba(59, 130, 246, 0.1)',
        lg: '0 4px 4px rgba(59, 130, 246, 0.12)',
        xl: '0 9px 7px rgba(59, 130, 246, 0.08)',
        '2xl': '0 25px 25px rgba(59, 130, 246, 0.1)',
        glow: '0 0 20px rgba(59, 130, 246, 0.5)',
      },

      // =================================================================
      // ANIMATIONS
      // =================================================================
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-left': {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-right': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },

      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out forwards',
        'fade-out': 'fade-out 0.3s ease-in-out forwards',
        'scale-in': 'scale-in 0.3s ease-in-out forwards',
        'scale-out': 'scale-out 0.3s ease-in-out forwards',
        'slide-up': 'slide-up 0.3s ease-in-out forwards',
        'slide-down': 'slide-down 0.3s ease-in-out forwards',
        'slide-left': 'slide-left 0.3s ease-in-out forwards',
        'slide-right': 'slide-right 0.3s ease-in-out forwards',
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },

      // =================================================================
      // TRANSITIONS
      // =================================================================
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
      },

      transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },

  // Plugins Tailwind
  plugins: [require('tailwindcss-animate')],
}

export default config
