# 🗄️ Architecture Base de Données - SmartPlanning V2

## 📋 Vue d'Ensemble

**Type :** Architecture **multi-tenant** avec isolation par entreprise
**ORM :** Prisma 6.1.0
**Base :** PostgreSQL 16
**Pattern :** SaaS avec abonnements

---

## 🏗️ Diagramme des Relations

```
┌─────────────────────────────────────────────────────────────────┐
│                        MULTI-TENANT                              │
│                                                                  │
│  ┌──────────────┐                                                │
│  │   Company    │ ◄──── Organisation centrale (isolation)        │
│  │  (Tenant)    │                                                │
│  └──────┬───────┘                                                │
│         │                                                        │
│         │ 1:N (Une entreprise, plusieurs...)                    │
│         │                                                        │
│    ┌────┴─────────────────────────────────┐                     │
│    │                                      │                     │
│    ▼                                      ▼                     │
│  ┌─────────┐                          ┌──────┐                  │
│  │  User   │◄──────────────────┐      │ Team │                  │
│  │ (Auth)  │                   │      └──┬───┘                  │
│  └────┬────┘                   │         │                     │
│       │                        │         │ N:1                  │
│       │ 1:1                    │         │                     │
│       ▼                        │         ▼                     │
│  ┌──────────┐      1:N      ┌──┴─────────┐                     │
│  │ Employee │◄──────────────┤  Manager   │                     │
│  │ (Métier) │               │ (Employee) │                     │
│  └────┬─────┘               └────────────┘                     │
│       │                                                         │
│       │ 1:N (Un employé, plusieurs...)                         │
│       │                                                         │
│    ┌──┴──────────────────┐                                     │
│    │                     │                                     │
│    ▼                     ▼                                     │
│  ┌──────────┐      ┌─────────────┐                             │
│  │ Schedule │      │LeaveRequest │                             │
│  └────┬─────┘      └──────┬──────┘                             │
│       │                   │                                    │
│       └───────┬───────────┘                                    │
│               │ 1:N                                            │
│               ▼                                                │
│         ┌──────────────┐                                       │
│         │ Notification │                                       │
│         └──────────────┘                                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Relations NextAuth v5 (authentification)
┌──────┐
│ User │──┐
└──────┘  │ 1:N
          ├──► Account (OAuth providers)
          ├──► Session (sessions actives)
          └──► VerificationToken (reset password, etc.)
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

// Abonnement SaaS
- subscriptionPlan: Enum          // FREE, STARTER, BUSINESS, ENTERPRISE
- subscriptionStatus: Enum        // TRIAL, ACTIVE, PAST_DUE, CANCELED
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
- image: String?                  // Avatar
- role: UserRole                  // SYSTEM_ADMIN, DIRECTOR, MANAGER, EMPLOYEE

// Relations entreprise
- companyId: String?              // NULL pour SYSTEM_ADMIN
- company: Company?

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

**🎯 Les 4 Rôles (Enum UserRole) :**

| Rôle             | Description            | Accès                          |
| ---------------- | ---------------------- | ------------------------------ |
| **SYSTEM_ADMIN** | Super admin SaaS (toi) | Toutes les entreprises         |
| **DIRECTOR**     | Directeur entreprise   | Toute son entreprise           |
| **MANAGER**      | Manager d'équipe       | Son équipe uniquement          |
| **EMPLOYEE**     | Employé simple         | Son planning + demandes congés |

---

### 3️⃣ **Employee** (Profil Métier)

**Rôle :** Informations RH de l'employé. Extension du User pour la partie métier.

**Champs principaux :**

```prisma
- id: String (cuid)
- userId: String (unique)         // Lien 1:1 avec User
- user: User

// Informations RH
- firstName: String
- lastName: String
- jobTitle: String?               // "Développeur", "Manager"
- department: String?             // "IT", "RH"
- phone: String?
- hireDate: DateTime?             // Date d'embauche

// Planning
- weeklyHours: Float              // 35.0 heures/semaine

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

- **1:1 User** → Un employé = un compte user
- **N:1 Company** → Un employé appartient à UNE entreprise
- **N:1 Team** → Un employé est dans UNE équipe (optionnel)
- **1:N Schedule** → Un employé a plusieurs créneaux de planning
- **1:N LeaveRequest** → Un employé fait plusieurs demandes de congés

**Distinction User ↔ Employee :**

```
User = Authentification (login, password, rôle)
Employee = Métier RH (job, équipe, contrat)
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
- type: ScheduleType              // WORK, MEETING, REMOTE, OVERTIME...
- status: ScheduleStatus          // DRAFT, CONFIRMED, CANCELLED

// Description
- title: String?                  // "Réunion client"
- description: String?
- location: String?               // "Salle A", "Visio"
- color: String?                  // "#10B981"

// Relations
- employeeId: String
- employee: Employee
- teamId: String?
- team: Team?
- companyId: String
- company: Company

// Récurrence (V2)
- isRecurring: Boolean
- recurrenceRule: String?         // Format iCal RRULE

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
- status: LeaveRequestStatus      // PENDING, APPROVED, REJECTED

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
- `OTHER` : Autre

**Workflow de validation :**

```
1. Employee crée la demande → PENDING
2. Manager (MANAGER/DIRECTOR) valide → APPROVED ou REJECTED
3. Si APPROVED → l'employé est marqué absent sur le planning
```

---

### 7️⃣ **Notification** (Nouveau modèle)

**Rôle :** Notifications temps réel pour les utilisateurs.

**Champs principaux :**

```prisma
- id: String (cuid)

// Contenu
- title: String                   // "Nouvelle demande de congés"
- message: String                 // Détails
- type: NotificationType          // INFO, SUCCESS, WARNING, ERROR

// Contexte
- relatedType: String?            // "LeaveRequest", "Schedule"
- relatedId: String?              // ID de l'objet lié

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

**Relations :**

- **N:1 User** → Une notification pour UN user
- **N:1 Company** → Isolation multi-tenant

**🎯 Cas d'usage :**

- "Votre demande de congés a été approuvée"
- "Nouveau planning disponible pour la semaine prochaine"
- "Réunion annulée : Réunion client"

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

**Solution :** Créer un middleware Prisma qui ajoute automatiquement `companyId` à chaque requête.

---

## 🎯 Relations NextAuth v5

### **Account** (OAuth Providers)

```prisma
- userId: String
- provider: String                // "google", "github"
- providerAccountId: String
- access_token, refresh_token...
```

**Usage :** Login avec Google/GitHub en plus du mot de passe.

### **Session** (Sessions Actives)

```prisma
- userId: String
- sessionToken: String (unique)
- expires: DateTime
```

**Usage :** Stockage des sessions actives (on utilisera Redis pour les perfs).

### **VerificationToken** (Tokens)

```prisma
- identifier: String              // Email
- token: String (unique)
- expires: DateTime
```

**Usage :** Reset password, confirmation email.

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
  FREE        // 0€ - 5 employés max
  STARTER     // 29€/mois - 20 employés
  BUSINESS    // 99€/mois - 100 employés
  ENTERPRISE  // Sur devis - illimité
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
}
```

### ScheduleType

```prisma
enum ScheduleType {
  WORK
  MEETING
  BREAK
  TRAINING
  REMOTE
  ON_CALL
  OVERTIME
}
```

### ScheduleStatus

```prisma
enum ScheduleStatus {
  DRAFT
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

### LeaveType

```prisma
enum LeaveType {
  PAID_LEAVE
  SICK_LEAVE
  UNPAID_LEAVE
  RTT
  PARENTAL_LEAVE
  OTHER
}
```

### LeaveRequestStatus

```prisma
enum LeaveRequestStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}
```

### NotificationType

```prisma
enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
  SYSTEM
}
```

---

## 🎓 Points Clés pour la Soutenance CDA

### 1. Architecture Multi-Tenant Sécurisée

- Isolation par `companyId` dans TOUTES les requêtes
- Prévention des fuites de données entre entreprises
- Middleware Prisma pour automatiser la sécurité

### 2. Séparation Auth ↔ Métier

- **User** = Authentification (NextAuth)
- **Employee** = Logique métier RH
- Flexibilité : un SYSTEM_ADMIN n'a pas besoin d'être un Employee

### 3. Modélisation des Relations

- **1:1** (User ↔ Employee)
- **1:N** (Company → Users, Employees, Teams...)
- **N:1** (Plusieurs Employees → Une Team)

### 4. Gestion des Rôles & Permissions

- 4 rôles hiérarchiques (SYSTEM_ADMIN > DIRECTOR > MANAGER > EMPLOYEE)
- Permissions cascadées (un DIRECTOR peut tout faire dans son entreprise)

### 5. Bonnes Pratiques Prisma

- Index sur les clés étrangères (`companyId`, `userId`, `employeeId`)
- Index sur les champs de recherche (`email`, `slug`, `startDate`)
- Relations bidirectionnelles pour faciliter les requêtes

### 6. Audit & Traçabilité

- `createdAt`, `updatedAt` sur tous les modèles
- `createdById` pour savoir qui a créé un planning
- `reviewedById`, `reviewedAt` pour les validations

---

## ✅ Validation Avant Implémentation

**Questions à se poser :**

✅ Un employé peut-il appartenir à plusieurs équipes ?
→ **Non** (relation N:1), mais ça pourrait évoluer en N:N en V2

✅ Un manager peut-il gérer plusieurs équipes ?
→ **Oui** (relation 1:N avec `managedTeams`)

✅ Un planning peut-il concerner plusieurs employés ?
→ **Non** dans cette version (1 créneau = 1 employé), mais on peut ajouter des plannings d'équipe via `teamId`

✅ Les notifications sont-elles persistantes ou temps réel ?
→ **Persistantes** (BDD) + possibilité WebSocket en V2

---

## 🚀 Prochaines Étapes

1. ✅ Architecture validée → **Créer le fichier `prisma/schema.prisma`**
2. Générer Prisma Client : `npm run db:generate`
3. Créer la migration : `npm run db:migrate`
4. Vérifier les tables dans DBeaver
5. (Optionnel) Créer un seed pour données de test
