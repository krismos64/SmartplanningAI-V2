/**
 * Implémentation de `$transaction` pour un client Prisma mocké (SP-619)
 *
 * Une transaction interactive reçoit un rappel : le mock l'exécute avec le
 * client mocké lui-même comme `tx`, si bien que les tests observent toujours
 * `schedule.create` ou `schedule.update`. La forme en tableau est résolue
 * telle quelle.
 *
 * Ce mock ne dit rien de la concurrence, qu'il ne peut pas reproduire : elle
 * est prouvée sur une vraie base par `__tests__/integration/`.
 */
export function runTransactionOn<TClient>(client: TClient) {
  return (arg: unknown): Promise<unknown> =>
    typeof arg === 'function'
      ? Promise.resolve((arg as (tx: TClient) => unknown)(client))
      : Promise.all(arg as unknown[])
}
