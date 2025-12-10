/**
 * Utilitaires de formatage pour les dashboards
 *
 * Fonctions de formatage des nombres, pourcentages, devises
 * et autres valeurs affichees dans les composants dashboard.
 *
 * @ticket SP-142
 */

/**
 * Formate un nombre avec separateurs de milliers (format francais)
 *
 * @param value - Nombre a formater
 * @param decimals - Nombre de decimales (defaut: 0)
 * @returns Nombre formate avec espaces comme separateurs
 *
 * @example
 * formatNumber(1234567) // "1 234 567"
 * formatNumber(1234.567, 2) // "1 234,57"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formate un pourcentage
 *
 * @param value - Valeur du pourcentage (0-100 ou 0-1 selon asRatio)
 * @param decimals - Nombre de decimales (defaut: 1)
 * @param asRatio - Si true, la valeur est un ratio 0-1 (defaut: false)
 * @returns Pourcentage formate avec symbole %
 *
 * @example
 * formatPercent(75.5) // "75,5 %"
 * formatPercent(0.755, 1, true) // "75,5 %"
 */
export function formatPercent(
  value: number,
  decimals: number = 1,
  asRatio: boolean = false
): string {
  const percentValue = asRatio ? value * 100 : value
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(percentValue / 100)
}

/**
 * Formate une devise en euros
 *
 * @param value - Montant a formater
 * @param decimals - Nombre de decimales (defaut: 0)
 * @returns Montant formate avec symbole euro
 *
 * @example
 * formatCurrency(1234.56) // "1 235 €"
 * formatCurrency(1234.56, 2) // "1 234,56 €"
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formate une duree en heures
 *
 * @param hours - Nombre d'heures
 * @param showMinutes - Afficher les minutes si decimales (defaut: true)
 * @returns Duree formatee (ex: "8h", "7h30")
 *
 * @example
 * formatHours(8) // "8h"
 * formatHours(7.5) // "7h30"
 * formatHours(7.5, false) // "7,5h"
 */
export function formatHours(hours: number, showMinutes: boolean = true): string {
  if (Number.isInteger(hours)) {
    return `${formatNumber(hours)}h`
  }

  if (!showMinutes) {
    return `${formatNumber(hours, 1)}h`
  }

  const wholeHours = Math.floor(hours)
  const minutes = Math.round((hours - wholeHours) * 60)

  if (minutes === 0) {
    return `${wholeHours}h`
  }

  return `${wholeHours}h${minutes.toString().padStart(2, '0')}`
}

/**
 * Formate un nombre de jours
 *
 * @param days - Nombre de jours
 * @param decimals - Nombre de decimales (defaut: 1)
 * @returns Jours formates avec unite
 *
 * @example
 * formatDays(5) // "5 j"
 * formatDays(2.5) // "2,5 j"
 */
export function formatDays(days: number, decimals: number = 1): string {
  const formatted = formatNumber(days, Number.isInteger(days) ? 0 : decimals)
  return `${formatted} j`
}

/**
 * Formate un nombre de maniere compacte pour les grands nombres
 *
 * @param value - Nombre a formater
 * @returns Nombre compact (ex: "1,2k", "3,5M")
 *
 * @example
 * formatCompact(1234) // "1,2 k"
 * formatCompact(1234567) // "1,2 M"
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Formate une tendance avec signe et pourcentage
 *
 * @param value - Valeur de la tendance (peut etre negative)
 * @param decimals - Nombre de decimales (defaut: 1)
 * @returns Tendance formatee avec signe (+/-)
 *
 * @example
 * formatTrend(12.5) // "+12,5 %"
 * formatTrend(-5.3) // "-5,3 %"
 * formatTrend(0) // "0 %"
 */
export function formatTrend(value: number, decimals: number = 1): string {
  const sign = value > 0 ? '+' : ''
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
  return `${sign}${formatted} %`
}

/**
 * Formate une date relative (aujourd'hui, demain, dans X jours)
 *
 * @param date - Date a formater
 * @returns Date relative en francais
 *
 * @example
 * formatRelativeDate(new Date()) // "Aujourd'hui"
 * formatRelativeDate(tomorrow) // "Demain"
 * formatRelativeDate(nextWeek) // "Dans 7 jours"
 */
export function formatRelativeDate(date: Date | string | null): string {
  if (!date) {
    return '-'
  }

  const targetDate = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  targetDate.setHours(0, 0, 0, 0)

  const diffTime = targetDate.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return "Aujourd'hui"
  }
  if (diffDays === 1) {
    return 'Demain'
  }
  if (diffDays === -1) {
    return 'Hier'
  }
  if (diffDays > 1 && diffDays <= 7) {
    return `Dans ${diffDays} jours`
  }
  if (diffDays < -1 && diffDays >= -7) {
    return `Il y a ${Math.abs(diffDays)} jours`
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(targetDate)
}
