# 🗄️ Architecture Base de Données - SmartPlanning V2

**Dernière mise à jour** : 10 février 2026
**ORM** : Prisma 6.18.0
**Base** : PostgreSQL 16
**Migrations** : 11 migrations appliquées

---

## 📋 Vue d'Ensemble

**Type :** Architecture **multi-tenant** avec isolation par entreprise
**Pattern :** SaaS avec abonnements Stripe
**Modèles :** 17 tables principales + 4 tables NextAuth

---

## 🏗️ Diagramme des Relations

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           MULTI-TENANT SaaS                                  │
│                                                                              │
│  ┌──────────────┐                                                            │
│  │   Company    │ ◄──── Organisation centrale (isolation tenant)             │
│  │  (Tenant)    │                                                            │
│  └──────┬───────┘                                                            │
│         │                                                                    │
│         │ 1:N (Une entreprise, plusieurs...)                                │
│         │                                                                    │
│    ┌────┴────────────────────────────────────────────────┐                  │
│    │                    │                    │           │                  │
│    ▼                    ▼                    ▼           ▼                  │
│  ┌─────────┐        ┌──────┐          ┌──────────┐  ┌────────────┐         │
│  │  User   │        │ Team │          │Subscription│ │IncidentNote│         │
│  │ (Auth)  │        └──┬───┘          │  (Stripe) │ └────────────┘         │
│  └────┬────┘           │              └─────┬────┘                          │
│       │                │ N:1                │ 1:N                           │
│       │ 1:1            │                    ▼                               │
│       ▼                ▼              ┌──────────┐   ┌──────────┐          │
│  ┌──────────┐      ┌─────────────┐   │ Payment  │   │ EmailLog │          │
│  │ Employee │◄─────┤   Manager   │   └──────────┘   │ (Billing)│          │
│  │ (Métier) │      │ (Employee)  │                   └──────────┘          │
│  └────┬─────┘      └─────────────┘                                          │
│       │                                                                      │
│       │ 1:N (Un employé, plusieurs...)                                      │
│       │                                                                      │
│    ┌──┴──────────────────────────────────┐                                  │
│    │              │              │        │                                  │
│    ▼              ▼              ▼        ▼                                  │
│  ┌──────────┐ ┌─────────────┐ ┌────────────┐ ┌──────────────┐              │
│  │ Schedule │ │LeaveRequest │ │LeaveBalance│ │ Availability │              │
│  └──────────┘ └─────────────┘ └────────────┘ └──────────────┘              │
│                                                                              │
│                     ┌──────────────┐                                         │
│  User ─────────────►│ Notification │                                         │
│       │             └──────────────┘                                         │
│       │             ┌──────────────┐                                         │
│       └────────────►│ PersonalTask │ (100% privé)                           │
│                     └──────────────┘                                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

Relations NextAuth v5 (authentification)
┌──────┐
│ User │──┐
└──────┘  │ 1:N
          ├──► Account (OAuth providers)
          ├──► Session (sessions actives)
          └──► VerificationToken (reset password)
```

---

## 📚 Modèles Détaillés

### 1️⃣ **Company** (Tenant - Organisation)

**Rôle :** Point central de l'isolation multi-tenant. Chaque entreprise cliente du SaaS.

**Champs principaux :**

```prisma
- id: String (cuid)
- name: String                    // Ex: "Acme Corp"
- slug: String (unique)           // Ex: "acme-corp" (pour URLs)
- logo: String?                   // URL logo entreprise
- email, phone, address           // Infos de contact

// Configuration planning
- workingHoursStart: String       // "09:00"
- workingHoursEnd: String         // "18:00"
- workingDays: String[]           // ["MONDAY", "TUESDAY", ...]
- timezone: String                // "Europe/Paris"
- defaultOpeningHours: Json?      // Configuration avancée par jour

// Abonnement SaaS (source de vérité = Subscription.plan)
- trialEndsAt: DateTime?
- subscriptionEndsAt: DateTime?

// Audit
- isActive: Boolean
- createdAt, updatedAt
```

**Relations :**

- **1:N User** → Une entreprise a plusieurs utilisateurs
- **1:N Team** → Une entreprise a plusieurs équipes
- **1:N Employee** → Une entreprise a plusieurs employés
- **1:N Schedule** → Une entreprise gère plusieurs plannings
- **1:N LeaveRequest** → Une entreprise reçoit plusieurs demandes de congés
- **1:N LeaveBalance** → Soldes de congés par employé/année
- **1:N Notification** → Notifications de l'entreprise
- **1:1 Subscription** → Abonnement Stripe
- **1:N Payment** → Historique des paiements
- **1:N Availability** → Disponibilités des employés
- **1:N IncidentNote** → Notes d'incident
- **1:N EmailLog** → Logs des emails billing (SP-368)

**🔐 Sécurité :** Toutes les requêtes doivent filtrer par `companyId` pour l'isolation.

---

### 2️⃣ **User** (Authentification)

**Rôle :** Compte d'authentification (NextAuth v5). Sépare l'auth de la logique métier.

**Champs principaux :**

```prisma
- id: String (cuid)
- email: String (unique)          // Login
- emailVerified: DateTime?        // Email confirmé ?
- name: String?                   // Nom affiché
- password: String                // Hash bcrypt
- image: String?                  // Avatar (URL Cloudinary)
- role: UserRole                  // SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE

// Relations entreprise
- companyId: String?              // NULL pour SYSTEM_ADMIN
- company: Company?

// Préférences utilisateur (SP-433)
- preferences: Json?              // { display: {...}, notifications: {...} }

// Sécurité
- isActive: Boolean               // Compte désactivé ?
- isEmailVerified: Boolean
- lastLoginAt: DateTime?

// Audit
- createdAt, updatedAt
```

**Relations :**

- **N:1 Company** → Un user appartient à UNE entreprise (ou aucune si admin système)
- **1:1 Employee** → Un user peut avoir UN profil employé
- **1:N Account** → OAuth providers (Google, GitHub, etc.)
- **1:N Session** → Sessions actives
- **1:N Notification** → Notifications de l'utilisateur
- **1:N PersonalTask** → Tâches personnelles privées
- **1:N IncidentNote** → Notes d'incident rédigées (auteur)
- **1:N LeaveBalance** → Mises à jour des soldes (updatedBy)

**🎯 Les 4 Rôles (Enum UserRole) :**

| Rôle             | Description          | Accès                          |
| ---------------- | -------------------- | ------------------------------ |
| **SYSTEM_ADMIN** | Super admin SaaS     | Toutes les entreprises         |
| **DIRECTOR**     | Directeur entreprise | Toute son entreprise           |
| **MANAGER**      | Manager d'équipe     | Son équipe uniquement          |
| **EMPLOYEE**     | Employé simple       | Son planning + demandes congés |

---

### 3️⃣ **Employee** (Profil Métier)

**Rôle :** Informations RH de l'employé. Extension du User pour la partie métier.

**Champs principaux :**

```prisma
- id: String (cuid)
- userId: String? (unique)        // Lien 1:1 avec User (optionnel)
- user: User?

// Informations RH
- firstName: String
- lastName: String
- jobTitle: String?               // "Développeur", "Manager"
- department: String?             // "IT", "RH"
- phone: String?
- email: String?
- hireDate: DateTime?             // Date d'embauche

// Planning
- weeklyHours: Float              // 35.0 heures/semaine

// Compétences & Préférences (IA future)
- skills: String[]                // ["React", "TypeScript", "Node.js"]
- preferences: Json?              // Préférences horaires

// Relations
- companyId: String
- company: Company
- teamId: String?
- team: Team?

// Audit
- isActive: Boolean
- createdAt, updatedAt
```

**Relations :**

- **1:1 User** → Un employé = un compte user (optionnel)
- **N:1 Company** → Un employé appartient à UNE entreprise
- **N:1 Team** → Un employé est dans UNE équipe (optionnel)
- **1:N Team (managedTeams)** → Un employé peut manager plusieurs équipes
- **1:N Schedule** → Un employé a plusieurs créneaux de planning
- **1:N LeaveRequest** → Un employé fait plusieurs demandes de congés
- **1:N LeaveBalance** → Soldes de congés par année
- **1:N Availability** → Disponibilités déclarées
- **1:N IncidentNote** → Notes d'incident le concernant (sujet)

**Distinction User ↔ Employee :**

```
User = Authentification (login, password, rôle, avatar)
Employee = Métier RH (job, équipe, contrat, compétences)
```

**Pourquoi séparer ?** Un SYSTEM_ADMIN peut n'avoir QUE un User (pas d'Employee).

---

### 4️⃣ **Team** (Équipe)

**Rôle :** Regroupement d'employés sous un manager.

**Champs principaux :**

```prisma
- id: String (cuid)
- name: String                    // "Équipe Dev", "Équipe Vente"
- description: String?
- color: String                   // "#3B82F6" (couleur planning)

// Manager
- managerId: String?
- manager: Employee?              // Chef d'équipe

// Relations
- companyId: String
- company: Company
- employees: Employee[]           // Membres de l'équipe
- schedules: Schedule[]           // Plannings d'équipe

// Audit
- createdAt, updatedAt
```

**Relations :**

- **N:1 Company** → Une équipe appartient à UNE entreprise
- **N:1 Employee (manager)** → Une équipe a UN manager
- **1:N Employee (members)** → Une équipe a plusieurs membres
- **1:N Schedule** → Une équipe peut avoir des plannings collectifs

---

### 5️⃣ **Schedule** (Planning)

**Rôle :** Créneaux de planning (travail, réunion, astreinte, etc.)

**Champs principaux :**

```prisma
- id: String (cuid)

// Date & horaires
- startDate: DateTime             // 2025-11-05
- endDate: DateTime               // 2025-11-05
- startTime: String               // "09:00"
- endTime: String                 // "17:00"

// Type & statut
- type: ScheduleType              // WORK, MEETING, REMOTE, OVERTIME, REST...
- status: ScheduleStatus          // DRAFT, CONFIRMED

// Description
- title: String?                  // "Réunion client"
- description: String?
- location: String?               // "Salle A", "Visio"
- color: String?                  // "#10B981"

// Récurrence (SP-399)
- isRecurring: Boolean
- recurrenceRule: Json?           // { frequency, interval, daysOfWeek, endDate }
- recurrenceGroupId: String?      // ID partagé par tous les créneaux récurrents

// Multi-employés (SP-397)
- scheduleGroupId: String?        // ID partagé pour créneaux multi-employés

// Relations
- employeeId: String
- employee: Employee
- teamId: String?
- team: Team?
- companyId: String
- company: Company

// Audit
- createdById: String?            // Qui a créé ce créneau
- createdAt, updatedAt
```

**Relations :**

- **N:1 Employee** → Un créneau appartient à UN employé
- **N:1 Team** → Un créneau peut être lié à une équipe (optionnel)
- **N:1 Company** → Isolation multi-tenant

**🎯 Types de Créneaux (Enum ScheduleType) :**

- `WORK` : Travail normal
- `MEETING` : Réunion
- `BREAK` : Pause
- `TRAINING` : Formation
- `REMOTE` : Télétravail
- `ON_CALL` : Astreinte
- `OVERTIME` : Heures supplémentaires
- `REST` : Repos (journée entière)

---

### 6️⃣ **LeaveRequest** (Demande de Congés)

**Rôle :** Gestion des absences et congés payés.

**Champs principaux :**

```prisma
- id: String (cuid)

// Dates
- startDate: DateTime             // 2025-12-20
- endDate: DateTime               // 2025-12-31
- days: Float                     // 8.0 jours ouvrés

// Type & statut
- type: LeaveType                 // PAID_LEAVE, SICK_LEAVE, RTT...
- status: LeaveRequestStatus      // PENDING, APPROVED, REJECTED, CANCELLED

// Demi-journée
- halfDay: Boolean                // Demi-journée ?
- halfDayPeriod: String?          // "AM" | "PM"

// Justification
- reason: String?                 // Raison de la demande
- comment: String?
- attachments: String[]           // URLs justificatifs médicaux

// Relations
- employeeId: String
- employee: Employee
- companyId: String
- company: Company

// Validation
- reviewedById: String?           // Manager qui valide
- reviewedAt: DateTime?
- reviewComment: String?          // Commentaire du manager

// Audit
- createdAt, updatedAt
```

**Relations :**

- **N:1 Employee** → Une demande appartient à UN employé
- **N:1 Company** → Isolation multi-tenant
- **N:1 User (reviewer)** → Validée par un manager (FK via reviewedById)

**🎯 Types de Congés (Enum LeaveType) :**

- `PAID_LEAVE` : Congés payés
- `SICK_LEAVE` : Arrêt maladie
- `UNPAID_LEAVE` : Congé sans solde
- `RTT` : Réduction du temps de travail
- `PARENTAL_LEAVE` : Congé parental
- `FAMILY_EVENT` : Événement familial
- `OTHER` : Autre

**Workflow de validation :**

```
1. Employee crée la demande → PENDING
2. Manager (MANAGER/DIRECTOR) valide → APPROVED ou REJECTED
3. Si APPROVED → le solde de congés est débité automatiquement
4. Si CANCELLED → le solde est re-crédité
```

---

### 7️⃣ **LeaveBalance** (Soldes de Congés - SP-408)

**Rôle :** Suivi des soldes de congés payés et RTT par employé et par année.

**Champs principaux :**

```prisma
- id: String (cuid)
- employeeId: String
- companyId: String
- year: Int                       // 2026

// Congés payés
- paidLeaveTotal: Float           // 25 jours par défaut
- paidLeaveUsed: Float            // Jours utilisés

// RTT
- rttTotal: Float                 // 0 par défaut
- rttUsed: Float                  // Jours utilisés

// Audit
- updatedById: String?            // Qui a modifié
- createdAt, updatedAt
```

**Relations :**

- **N:1 Employee** → Solde d'UN employé
- **N:1 Company** → Isolation multi-tenant
- **N:1 User (updatedBy)** → Dernière modification par

**Contrainte unique :** `@@unique([employeeId, year])` - Un seul solde par employé par année.

---

### 8️⃣ **Availability** (Disponibilités - SP-392)

**Rôle :** Déclaration des disponibilités/indisponibilités des employés.

**Champs principaux :**

```prisma
- id: String (cuid)

// Période
- startDate: DateTime
- endDate: DateTime
- startTime: String?              // Format HH:mm (optionnel)
- endTime: String?                // Format HH:mm (optionnel)

// Type
- type: AvailabilityType          // UNAVAILABLE, PREFERRED, VACATION...
- reason: String?

// Récurrence
- isRecurring: Boolean
- recurrenceRule: Json?           // { frequency, daysOfWeek }

// Relations
- employeeId: String
- employee: Employee
- companyId: String
- company: Company

// Audit
- createdAt, updatedAt
```

**🎯 Types de Disponibilité (Enum AvailabilityType) :**

- `UNAVAILABLE` : Indisponible
- `PREFERRED` : Préférence horaire
- `VACATION` : Congés/Vacances
- `SICK` : Maladie
- `TRAINING` : Formation
- `OTHER` : Autre

---

### 9️⃣ **Notification**

**Rôle :** Notifications temps réel et persistantes pour les utilisateurs.

**Champs principaux :**

```prisma
- id: String (cuid)

// Contenu
- title: String                   // "Nouvelle demande de congés"
- message: String                 // Détails
- type: NotificationType          // INFO, SUCCESS, WARNING, ERROR, PLANNING, LEAVE...
- priority: NotificationPriority  // LOW, MEDIUM, HIGH, URGENT

// Contexte
- relatedType: String?            // "LeaveRequest", "Schedule", "PersonalTask", "IncidentNote"
- relatedId: String?              // ID de l'objet lié
- actionUrl: String?              // URL d'action (ex: "/app/dashboard/leaves/123")

// Destinataire
- userId: String
- user: User
- companyId: String
- company: Company

// Statut
- isRead: Boolean                 // Lue ou non
- readAt: DateTime?

// Audit
- createdAt, updatedAt
```

**🎯 Types de Notification (Enum NotificationType) :**

- Génériques : `INFO`, `SUCCESS`, `WARNING`, `ERROR`, `SYSTEM`
- Métier : `PLANNING`, `LEAVE`, `TASK`, `INCIDENT`

**🎯 Priorités (Enum NotificationPriority) :**

- `LOW` : Informative
- `MEDIUM` : Action recommandée
- `HIGH` : Action requise
- `URGENT` : Action immédiate requise

---

### 🔟 **PersonalTask** (Tâches Personnelles - SP-417)

**Rôle :** Todolist privée 100% personnelle. Aucune visibilité par les managers.

**Champs principaux :**

```prisma
- id: String (cuid)
- title: String (max 200)         // Titre de la tâche
- description: String?            // Description détaillée
- dueDate: DateTime?              // Échéance
- completed: Boolean              // Terminée ?
- order: Int                      // Ordre d'affichage (drag & drop)

// Propriétaire unique - 100% privé
- userId: String
- user: User

// Audit
- createdAt, updatedAt
```

**Relations :**

- **N:1 User** → Tâches d'UN user (pas de companyId = vraiment privé)

**🔐 Sécurité :** Aucun accès RBAC. Seul le propriétaire peut voir/modifier ses tâches.

---

### 1️⃣1️⃣ **IncidentNote** (Notes d'Incident - SP-424)

**Rôle :** Suivi comportemental des employés avec visibilité RBAC.

**Champs principaux :**

```prisma
- id: String (cuid)

// Sujet (employé concerné)
- subjectId: String
- subject: Employee

// Auteur (manager/directeur qui rédige)
- authorId: String
- author: User

// Contenu
- title: String (max 200)
- content: String                 // Détail de l'incident
- date: DateTime                  // Date de l'incident

// Visibilité RBAC
- visibility: IncidentNoteVisibility  // DIRECTOR_ONLY, MANAGER_DIRECTOR, ALL

// Multi-tenant
- companyId: String
- company: Company

// Audit
- createdAt, updatedAt
```

**🎯 Visibilité (Enum IncidentNoteVisibility) :**

| Visibilité         | Qui peut voir         |
| ------------------ | --------------------- |
| `DIRECTOR_ONLY`    | Directeurs uniquement |
| `MANAGER_DIRECTOR` | Managers + Directeurs |
| `ALL`              | Tous (info générale)  |

---

### 1️⃣2️⃣ **Subscription** (Abonnement Stripe)

**Rôle :** Gestion des abonnements SaaS via Stripe. Relation 1:1 avec Company.

**Modèle tarifaire :** Per-seat à 2,90€/employé/mois. La `quantity` est synchronisée automatiquement avec le nombre d'employés actifs via `syncEmployeeCountToStripe` (SP-439).

**Champs principaux :**

```prisma
- id: String (cuid)
- companyId: String (unique)

// Stripe
- stripeCustomerId: String (unique)
- stripeSubscriptionId: String? (unique)
- stripePriceId: String?
- stripeProductId: String?         // ID du produit Stripe

// Plan per-seat
- plan: SubscriptionPlan          // FREE, PER_SEAT
- quantity: Int                   // Nombre d'employés facturés (= Stripe quantity)
- pricePerEmployee: Int           // Prix en CENTIMES (290 = 2,90€)
- planPrice: Int                  // Prix total CENTIMES (quantity × pricePerEmployee)
- currency: String                // "EUR"
- billingInterval: String?        // "month" ou "year"

// Métadonnées techniques webhooks (jamais de PII)
- metadata: Json?

// Statut
- status: SubscriptionStatus      // TRIAL, ACTIVE, PAST_DUE, CANCELED, EXPIRED, INCOMPLETE
- currentPeriodStart: DateTime?
- currentPeriodEnd: DateTime?
- cancelAtPeriodEnd: Boolean
- canceledAt: DateTime?

// Audit
- createdAt, updatedAt
```

**Relations :**

- **N:1 Company** → Un abonnement appartient à UNE entreprise (1:1)
- **1:N Payment** → Un abonnement génère plusieurs paiements

---

### 1️⃣3️⃣ **Payment** (Paiements Stripe)

**Rôle :** Historique des paiements liés aux abonnements.

**Champs principaux :**

```prisma
- id: String (cuid)
- companyId: String
- subscriptionId: String?

// Stripe
- stripePaymentId: String (unique)
- stripeInvoiceId: String?

// Montant (en centimes)
- amount: Int                     // Montant en centimes (ex: 2900 = 29,00€)
- currency: String                // "EUR"

// Statut
- status: PaymentStatus           // PENDING, SUCCEEDED, FAILED, REFUNDED, REQUIRES_ACTION
- paymentMethod: String?          // "card", "sepa_debit", etc.
- failureReason: String?          // Code d'erreur Stripe (ex: "card_declined")
- failureMessage: String?         // Message d'erreur lisible

// Métadonnées techniques
- metadata: Json?

// Dates
- paidAt: DateTime?
- createdAt: DateTime
```

**Relations :**

- **N:1 Company** → Un paiement appartient à UNE entreprise
- **N:1 Subscription** → Un paiement est lié à UN abonnement (optionnel)

**🎯 Statuts de Paiement (Enum PaymentStatus) :**

- `PENDING` : En attente de traitement
- `SUCCEEDED` : Paiement réussi
- `FAILED` : Paiement échoué
- `REFUNDED` : Remboursé
- `REQUIRES_ACTION` : 3D Secure en attente

---

### 1️⃣4️⃣ **EmailLog** (Logs Emails Billing - SP-368)

**Rôle :** Traçabilité des emails transactionnels envoyés pour le billing (confirmations, relances trial, échecs paiement). Empêche les doublons via contrainte unique.

**Champs principaux :**

```prisma
- id: String (cuid)
- companyId: String
- subscriptionId: String?

// Email
- emailType: String               // PAYMENT_CONFIRMED, PAYMENT_FAILED, SUBSCRIPTION_ACTIVATED,
                                   // SUBSCRIPTION_CANCELED, TRIAL_REMINDER_14, TRIAL_REMINDER_7,
                                   // TRIAL_REMINDER_3, TRIAL_EXPIRED, QUANTITY_UPDATED
- recipientEmail: String
- sentAt: DateTime                 // Date d'envoi
- status: String                   // "SENT", "FAILED", "BOUNCED"

// Métadonnées techniques
- metadata: Json?
```

**Relations :**

- **N:1 Company** → Un log email appartient à UNE entreprise

**Contrainte unique :** `@@unique([subscriptionId, emailType])` - Un seul email de chaque type par abonnement (anti-doublon).

**Index :**

- `[companyId]` — recherche par entreprise
- `[emailType, sentAt]` — recherche par type et date

---

## 🔐 Isolation Multi-Tenant

**Principe :** Chaque requête doit filtrer par `companyId` pour éviter les fuites de données.

### ✅ Bon exemple (sécurisé)

```typescript
// Récupérer les employés de MON entreprise uniquement
const employees = await prisma.employee.findMany({
  where: {
    companyId: currentUser.companyId, // ✅ Filtre obligatoire
  },
})
```

### ❌ Mauvais exemple (fuite de données)

```typescript
// DANGER : récupère TOUS les employés de TOUTES les entreprises
const employees = await prisma.employee.findMany() // ❌ Pas de filtre
```

**Exception :** `PersonalTask` n'a pas de `companyId` car 100% privé (filtré par `userId`).

---

## 🎯 Relations NextAuth v5

### **Account** (OAuth Providers)

```prisma
- userId: String
- provider: String                // "google", "github"
- providerAccountId: String
- access_token, refresh_token...
```

### **Session** (Sessions Actives)

```prisma
- userId: String
- sessionToken: String (unique)
- expires: DateTime
```

### **VerificationToken** (Tokens)

```prisma
- identifier: String              // Email
- token: String (unique)
- expires: DateTime
```

---

## 📊 Enums Complets

### UserRole

```prisma
enum UserRole {
  SYSTEM_ADMIN   // Super admin plateforme
  DIRECTOR       // Directeur entreprise
  MANAGER        // Manager équipe
  EMPLOYEE       // Employé
}
```

### SubscriptionPlan

```prisma
enum SubscriptionPlan {
  FREE        // Essai gratuit / démo
  PER_SEAT    // Tarif unique 2,90€/employé/mois
}
```

### SubscriptionStatus

```prisma
enum SubscriptionStatus {
  TRIAL       // Période d'essai
  ACTIVE      // Actif payé
  PAST_DUE    // Paiement en retard
  CANCELED    // Annulé
  EXPIRED     // Expiré
  INCOMPLETE  // Paiement incomplet Stripe (3D Secure en attente)
}
```

### ScheduleType

```prisma
enum ScheduleType {
  WORK        // Travail normal
  MEETING     // Réunion
  BREAK       // Pause
  TRAINING    // Formation
  REMOTE      // Télétravail
  ON_CALL     // Astreinte
  OVERTIME    // Heures supplémentaires
  REST        // Repos (journée entière)
}
```

### ScheduleStatus

```prisma
enum ScheduleStatus {
  DRAFT       // Brouillon
  CONFIRMED   // Confirmé
}
```

### LeaveType

```prisma
enum LeaveType {
  PAID_LEAVE     // Congés payés
  SICK_LEAVE     // Arrêt maladie
  UNPAID_LEAVE   // Congé sans solde
  RTT            // RTT
  PARENTAL_LEAVE // Congé parental
  FAMILY_EVENT   // Événement familial
  OTHER          // Autre
}
```

### LeaveRequestStatus

```prisma
enum LeaveRequestStatus {
  PENDING     // En attente
  APPROVED    // Approuvée
  REJECTED    // Refusée
  CANCELLED   // Annulée par l'employé
}
```

### NotificationType

```prisma
enum NotificationType {
  // Génériques
  INFO, SUCCESS, WARNING, ERROR, SYSTEM
  // Métier
  PLANNING, LEAVE, TASK, INCIDENT
}
```

### NotificationPriority

```prisma
enum NotificationPriority {
  LOW       // Informative
  MEDIUM    // Action recommandée
  HIGH      // Action requise
  URGENT    // Action immédiate
}
```

### AvailabilityType

```prisma
enum AvailabilityType {
  UNAVAILABLE  // Indisponible
  PREFERRED    // Préférence horaire
  VACATION     // Congés/Vacances
  SICK         // Maladie
  TRAINING     // Formation
  OTHER        // Autre
}
```

### IncidentNoteVisibility

```prisma
enum IncidentNoteVisibility {
  DIRECTOR_ONLY     // Directeurs uniquement
  MANAGER_DIRECTOR  // Managers + Directeurs
  ALL               // Tous (info générale)
}
```

---

## 🎓 Points Clés pour la Soutenance CDA

### 1. Architecture Multi-Tenant Sécurisée

- Isolation par `companyId` dans TOUTES les requêtes
- Prévention des fuites de données entre entreprises
- Exception : `PersonalTask` isolé par `userId` (vraiment privé)

### 2. Séparation Auth ↔ Métier

- **User** = Authentification (NextAuth, avatar Cloudinary)
- **Employee** = Logique métier RH
- Flexibilité : un SYSTEM_ADMIN n'a pas besoin d'être un Employee

### 3. Modélisation des Relations

- **1:1** (User ↔ Employee)
- **1:N** (Company → Users, Employees, Teams...)
- **N:1** (Plusieurs Employees → Une Team)
- **Contraintes uniques** (LeaveBalance: employeeId + year)

### 4. Gestion des Rôles & Permissions

- 4 rôles hiérarchiques (SYSTEM_ADMIN > DIRECTOR > MANAGER > EMPLOYEE)
- RBAC dynamique pour IncidentNote via `visibility`
- Permissions cascadées (un DIRECTOR peut tout faire dans son entreprise)

### 5. Bonnes Pratiques Prisma

- Index sur les clés étrangères (`companyId`, `userId`, `employeeId`)
- Index sur les champs de recherche (`email`, `slug`, `startDate`)
- Index composites pour les requêtes fréquentes
- Relations bidirectionnelles pour faciliter les requêtes

### 6. Audit & Traçabilité

- `createdAt`, `updatedAt` sur tous les modèles
- `createdById` pour savoir qui a créé un planning
- `reviewedById`, `reviewedAt` pour les validations de congés
- `updatedById` pour les modifications de soldes

### 7. Intégrations Externes

- **Stripe** : Subscriptions + Payments pour le SaaS
- **Cloudinary** : Stockage des avatars (User.image)
- **NextAuth v5** : Authentification avec sessions

---

## ✅ Statistiques Actuelles

| Métrique              | Valeur |
| --------------------- | ------ |
| Tables principales    | 17     |
| Tables NextAuth       | 4      |
| Enums                 | 12     |
| Migrations appliquées | 11     |
| Index                 | 45+    |

---

## 📅 Historique des Mises à Jour

| Date       | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| 10/02/2026 | Ajout EmailLog (SP-368), correction compteur 16→17 tables, mise à jour diagramme et relations Company |
| 10/02/2026 | Correction Subscription per-seat, Payment typé, SubscriptionStatus +INCOMPLETE, diagramme Subscription→Payment |
| 04/02/2026 | Ajout User.image (Cloudinary SP-272), mise à jour complète documentation |
| 01/2026    | Ajout IncidentNote (SP-424), PersonalTask (SP-417)                       |
| 01/2026    | Ajout LeaveBalance (SP-408), Availability (SP-392)                       |
| 12/2025    | Ajout Subscription, Payment (Stripe)                                     |
| 11/2025    | Création initiale du schéma                                              |
