# SP-325 - Points d'intégration des notifications

## Vue d'ensemble

Ce document décrit les points d'intégration pour le système de notifications créé dans le cadre du ticket SP-325. Les factory functions permettent de créer des notifications typées par domaine métier de manière non-bloquante.

## Architecture

```
src/lib/actions/notifications.ts
├── Factory Functions (création par domaine)
│   ├── createPlanningNotification()
│   ├── createLeaveNotification()
│   ├── createTaskNotification()
│   ├── createIncidentNotification()
│   └── createSystemNotification()
├── CRUD Operations
│   ├── getNotifications()
│   ├── getUnreadCount()
│   ├── markAsRead()
│   ├── markAllAsRead()
│   ├── deleteNotification()
│   └── cleanupOldNotifications()
└── Helpers
    └── formatDate()
```

## Points d'intégration par module

### 1. Module Planning (`src/lib/actions/schedules.ts`)

#### createSchedule / updateSchedule / deleteSchedule

```typescript
import { createPlanningNotification } from '@/lib/actions/notifications'

// Dans createSchedule, après création réussie :
createPlanningNotification(schedule.id, employee.userId, 'created')
  .catch(console.error) // Non-bloquant

// Dans updateSchedule, après mise à jour réussie :
createPlanningNotification(schedule.id, employee.userId, 'updated')
  .catch(console.error)

// Dans deleteSchedule, avant suppression (récupérer userId avant) :
createPlanningNotification(scheduleId, employee.userId, 'deleted')
  .catch(console.error)
```

**Actions supportées :** `created`, `updated`, `deleted`

**Priorités assignées :**
- `created` → LOW
- `updated` → MEDIUM
- `deleted` → HIGH

---

### 2. Module Congés (`src/lib/actions/leaves.ts`)

#### createLeaveRequest

```typescript
import { createLeaveNotification } from '@/lib/actions/notifications'

// Notifier les managers de l'équipe
for (const manager of teamManagers) {
  createLeaveNotification(leaveRequest.id, manager.userId, 'requested')
    .catch(console.error)
}
```

#### reviewLeaveRequest

```typescript
// Notifier l'employé de la décision
const action = approved ? 'approved' : 'rejected'
createLeaveNotification(leaveRequest.id, employee.userId, action)
  .catch(console.error)
```

**Actions supportées :** `requested`, `approved`, `rejected`

**Priorités assignées :**
- `requested` → MEDIUM (pour manager)
- `approved` → LOW (pour employé)
- `rejected` → HIGH (pour employé)

---

### 3. Module Notes Perso (`src/lib/actions/personal-tasks.ts`)

#### Rappels de tâches (optionnel - CRON job)

```typescript
import { createTaskNotification } from '@/lib/actions/notifications'

// Job planifié pour les rappels de deadline
const tasksNearDeadline = await prisma.personalTask.findMany({
  where: {
    completed: false,
    dueDate: {
      gte: now,
      lte: tomorrow,
    },
  },
})

for (const task of tasksNearDeadline) {
  createTaskNotification(task.id, task.userId, 'reminder')
    .catch(console.error)
}
```

**Actions supportées :** `reminder`, `overdue`

**Priorités assignées :**
- `reminder` → MEDIUM
- `overdue` → HIGH

**Note :** Les tâches personnelles étant privées, ces notifications sont optionnelles et uniquement pour des rappels automatiques.

---

### 4. Module Incidents (`src/lib/actions/incident-notes.ts`)

#### createIncidentNote

```typescript
import { createIncidentNotification } from '@/lib/actions/notifications'

// Uniquement si visibility = 'ALL' (employé peut voir)
if (incidentNote.visibility === 'ALL') {
  const subjectUser = await prisma.employee.findUnique({
    where: { id: incidentNote.subjectId },
    select: { userId: true },
  })

  if (subjectUser?.userId) {
    createIncidentNotification(incidentNote.id, subjectUser.userId, 'created')
      .catch(console.error)
  }
}
```

**Actions supportées :** `created`, `updated`

**Priorité fixe :** HIGH

**Condition RBAC :** Ne notifier l'employé que si `visibility === 'ALL'`

---

### 5. Notifications Système (Admin)

#### Annonces entreprise

```typescript
import { createSystemNotification } from '@/lib/actions/notifications'

// Annonce de maintenance
await createSystemNotification(
  companyId,
  'Maintenance planifiée',
  'Une maintenance est prévue le 15 février de 2h à 4h.',
  'HIGH',
  '/app/dashboard/announcements'
)
```

**Permissions requises :** DIRECTOR+ ou SYSTEM_ADMIN

**Comportement :** Crée une notification pour chaque utilisateur de l'entreprise (bulk insert)

---

## Schéma de données

### NotificationType (enum Prisma)

| Valeur | Usage |
|--------|-------|
| INFO | Informations générales |
| SUCCESS | Confirmation d'opération |
| WARNING | Avertissement |
| ERROR | Erreur |
| SYSTEM | Annonces système |
| PLANNING | Plannings (SP-325) |
| LEAVE | Congés (SP-325) |
| TASK | Tâches perso (SP-325) |
| INCIDENT | Notes d'incident (SP-325) |

### NotificationPriority (enum Prisma)

| Valeur | Description | Usage |
|--------|-------------|-------|
| LOW | Priorité basse | Informative |
| MEDIUM | Priorité moyenne | Action recommandée |
| HIGH | Priorité haute | Action requise |
| URGENT | Urgente | Action immédiate |

### Champs relatedType

| Type notification | relatedType | relatedId |
|-------------------|-------------|-----------|
| PLANNING | Schedule | schedule.id |
| LEAVE | LeaveRequest | leaveRequest.id |
| TASK | PersonalTask | personalTask.id |
| INCIDENT | IncidentNote | incidentNote.id |
| SYSTEM | null | null |

---

## Pattern d'intégration non-bloquant

Les factory functions retournent une Promise mais **ne doivent jamais bloquer l'action principale**.

### Pattern recommandé

```typescript
// ✅ Correct : .catch() pour éviter le blocage
createPlanningNotification(schedule.id, userId, 'created')
  .catch((error) => console.error('[Notification Error]', error))

// ✅ Alternative : fire-and-forget avec void
void createPlanningNotification(schedule.id, userId, 'created')

// ❌ Incorrect : await bloque l'action si notification échoue
await createPlanningNotification(schedule.id, userId, 'created')
```

### Gestion des erreurs

Les factory functions :
1. Log les erreurs en console
2. Retournent `{ success: false, error: string }` en cas d'échec
3. Ne lancent jamais d'exception

---

## API CRUD pour l'UI

### Récupération des notifications

```typescript
// Liste paginée avec filtres
const result = await getNotifications(
  { type: 'LEAVE', isRead: false },
  { page: 1, pageSize: 20 }
)

// Compteur non lu (pour badge)
const { data: count } = await getUnreadCount()
```

### Actions utilisateur

```typescript
// Marquer comme lu
await markAsRead(notificationId)

// Tout marquer comme lu
await markAllAsRead()

// Supprimer
await deleteNotification(notificationId)
```

### Maintenance (SYSTEM_ADMIN)

```typescript
// Purger les notifications lues de +30 jours
await cleanupOldNotifications(30)
```

---

## Tests recommandés

### Unit tests (`__tests__/lib/actions/notifications.test.ts`)

1. **Factory functions** :
   - Création avec données valides
   - Validation des actions (enum)
   - Gestion entité non trouvée
   - Assignation correcte des priorités

2. **CRUD operations** :
   - getNotifications avec filtres
   - getUnreadCount
   - markAsRead / markAllAsRead
   - deleteNotification (ownership check)
   - cleanupOldNotifications (RBAC SYSTEM_ADMIN)

3. **RBAC** :
   - createSystemNotification : DIRECTOR+ uniquement
   - Isolation multi-tenant

---

## Checklist d'intégration

- [ ] Module Planning : 3 points (create, update, delete)
- [ ] Module Congés : 3 points (request, approve, reject)
- [ ] Module Incidents : 1 point (create avec visibility=ALL)
- [ ] Admin : createSystemNotification
- [ ] UI : NotificationBell component avec getUnreadCount
- [ ] Tests unitaires : minimum 15 tests
