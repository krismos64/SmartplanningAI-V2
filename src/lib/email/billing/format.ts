/**
 * Helpers de formatage pour les emails billing
 *
 * @ticket SP-370
 */

/**
 * Formate un montant en centimes vers une chaîne en euros
 *
 * @param amountInCents - Montant en centimes (ex: 2900 → "29,00 €")
 * @returns Chaîne formatée avec virgule décimale et symbole €
 */
export function formatAmountEuros(amountInCents: number): string {
  const euros = (amountInCents / 100).toFixed(2).replace('.', ',')
  return `${euros} €`
}
