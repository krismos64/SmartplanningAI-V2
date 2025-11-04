# 🚀 Guide Prisma - SmartPlanning V2

## ✅ Schéma Créé

Le fichier `prisma/schema.prisma` contient :

- ✅ **8 modèles principaux** : User, Company, Employee, Team, Schedule, LeaveRequest, Notification
- ✅ **3 modèles NextAuth** : Account, Session, VerificationToken
- ✅ **2 modèles Stripe** : Subscription, Payment
- ✅ **8 enums** : UserRole, SubscriptionPlan, ScheduleType, LeaveType, etc.
- ✅ **Tous les index** de performance
- ✅ **Modifications demandées** :
  - `Company.defaultOpeningHours` (JSON)
  - `Employee.skills` (String[]) et `preferences` (JSON)
  - Modèles Subscription et Payment complets

---

## 📝 Modifications Appliquées

### 1. Company - Configuration horaires avancée
```prisma
defaultOpeningHours Json? // Configuration par jour
// Exemple:
{
  "MONDAY": { "start": "09:00", "end": "18:00", "break": "12:00-14:00" },
  "TUESDAY": { "start": "09:00", "end": "18:00", "break": "12:00-14:00" }
}
```

### 2. Employee - Compétences & Préférences
```prisma
skills      String[] @default([])  // ["React", "TypeScript"]
preferences Json?                  // Préférences de planning
// Exemple preferences:
{
  "preferredDays": ["MONDAY", "TUESDAY"],
  "avoidDays": ["SUNDAY"],
  "maxConsecutiveDays": 5
}
```

### 3. Subscription - Stripe complet
- `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`
- Gestion du cycle de facturation
- Relation avec Payment

### 4. Payment - Historique paiements
- `stripePaymentId`, `stripeInvoiceId`
- Statut (succeeded, pending, failed, refunded)
- Relation avec Subscription

### 5. Schedule - Simplifié pour MVP
- ❌ Enlevé `isRecurring` et `recurrenceRule` (V2)
- ✅ Gardé tous les autres champs

---

## 🎯 Étape 1 : Générer Prisma Client

Le **Prisma Client** est le code TypeScript généré automatiquement pour accéder à ta base de données.

### Commande
```bash
npm run db:generate
```

**Équivalent à :**
```bash
npx prisma generate
```

### Ce que ça fait
1. Lit le fichier `prisma/schema.prisma`
2. Génère le code TypeScript dans `node_modules/@prisma/client`
3. Crée les types TypeScript pour tous tes modèles
4. Configure l'autocomplete dans VSCode

### Résultat attendu
```
✔ Generated Prisma Client (v6.1.0) to ./node_modules/@prisma/client
```

### Utilisation ensuite
```typescript
import { prisma } from '@/lib/prisma'

// Autocomplete parfait avec TypeScript ! ✨
const users = await prisma.user.findMany({
  where: { companyId: 'xxx' },
  include: { employee: true }
})
```

---

## 🎯 Étape 2 : Créer la Migration

La **migration** crée les tables dans PostgreSQL selon ton schéma.

### Commande
```bash
npm run db:migrate
```

**Équivalent à :**
```bash
npx prisma migrate dev --name init
```

### Ce que ça fait
1. Compare ton schéma Prisma avec la base PostgreSQL
2. Génère un fichier SQL de migration (`prisma/migrations/xxx_init/migration.sql`)
3. **EXÉCUTE** le SQL dans PostgreSQL (crée les tables)
4. Génère automatiquement le Prisma Client

### Résultat attendu
```
Prisma Migrate applied the following migration(s):

migrations/
  └─ 20251104_init/
      └─ migration.sql

✔ Generated Prisma Client (v6.1.0)
```

### Fichier migration.sql généré
Le fichier contient tous les `CREATE TABLE`, `CREATE INDEX`, etc.

**Exemple extrait :**
```sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SYSTEM_ADMIN', 'DIRECTOR', 'MANAGER', 'EMPLOYEE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    ...
    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_companyId_idx" ON "users"("companyId");
...
```

---

## 🎯 Étape 3 : Vérifier dans DBeaver

### Ouvre DBeaver
1. Connexion déjà créée : `smartplanning` (localhost:5432)
2. Expand : **smartplanning** → **Schemas** → **public** → **Tables**

### Tables créées (13 tables)
Tu devrais voir :

**Métier (8 tables)**
- ✅ `users`
- ✅ `companies`
- ✅ `employees`
- ✅ `teams`
- ✅ `schedules`
- ✅ `leave_requests`
- ✅ `notifications`

**Abonnements (2 tables)**
- ✅ `subscriptions`
- ✅ `payments`

**NextAuth (3 tables)**
- ✅ `accounts`
- ✅ `sessions`
- ✅ `verification_tokens`

**Prisma (1 table)**
- ✅ `_prisma_migrations` (historique des migrations)

### Vérifier une table
1. Clic droit sur `users` → **View Table**
2. Tu verras les colonnes :
   - `id`, `email`, `password`, `role`, `companyId`, etc.
   - `createdAt`, `updatedAt`

### Vérifier les relations
1. Clic droit sur `users` → **View Diagram**
2. DBeaver affiche les relations (FK) entre les tables

### Vérifier les index
1. Expand `users` → **Indexes**
2. Tu devrais voir :
   - `users_email_key` (UNIQUE)
   - `users_companyId_idx`
   - `users_role_idx`

---

## 🎯 Étape 4 : (Optionnel) Prisma Studio

**Prisma Studio** = Interface web pour visualiser/éditer les données.

### Commande
```bash
npm run db:studio
```

**Équivalent à :**
```bash
npx prisma studio
```

### Ce que ça fait
1. Lance un serveur web sur **http://localhost:5555**
2. Interface visuelle pour voir toutes les tables
3. Permet de créer/modifier/supprimer des données

### Utilisation
- Clique sur une table (ex: `User`)
- Clique sur **"Add record"** pour créer un utilisateur
- Édite les champs directement
- Sauvegarde → Prisma écrit dans PostgreSQL

**Utile pour :**
- Tester rapidement sans écrire de code
- Créer des données de test
- Debug (voir les données en temps réel)

---

## 🎯 Étape 5 : (Optionnel) Seed Data

Le **seed** crée des données de test automatiquement.

### Créer le fichier seed
**Fichier :** `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Créer une entreprise de test
  const company = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      email: 'contact@acme-corp.fr',
      phone: '01 23 45 67 89',
      subscriptionPlan: 'STARTER',
      subscriptionStatus: 'ACTIVE',
    },
  })

  console.log('✅ Company created:', company.name)

  // 2. Créer un directeur
  const directorUser = await prisma.user.create({
    data: {
      email: 'director@acme-corp.fr',
      password: await bcrypt.hash('password123', 10),
      name: 'Jean Dupont',
      role: 'DIRECTOR',
      companyId: company.id,
      isEmailVerified: true,
    },
  })

  const director = await prisma.employee.create({
    data: {
      userId: directorUser.id,
      firstName: 'Jean',
      lastName: 'Dupont',
      jobTitle: 'Directeur Général',
      companyId: company.id,
      weeklyHours: 39,
      skills: ['Management', 'Stratégie'],
    },
  })

  console.log('✅ Director created:', director.firstName, director.lastName)

  // 3. Créer une équipe
  const team = await prisma.team.create({
    data: {
      name: 'Équipe Développement',
      description: 'Équipe de développeurs',
      color: '#3B82F6',
      companyId: company.id,
      managerId: director.id,
    },
  })

  console.log('✅ Team created:', team.name)

  // 4. Créer des employés
  const employeeData = [
    { firstName: 'Marie', lastName: 'Martin', email: 'marie@acme-corp.fr', jobTitle: 'Développeur Senior', skills: ['React', 'TypeScript'] },
    { firstName: 'Pierre', lastName: 'Bernard', email: 'pierre@acme-corp.fr', jobTitle: 'Développeur Junior', skills: ['JavaScript', 'Node.js'] },
  ]

  for (const emp of employeeData) {
    const user = await prisma.user.create({
      data: {
        email: emp.email,
        password: await bcrypt.hash('password123', 10),
        name: `${emp.firstName} ${emp.lastName}`,
        role: 'EMPLOYEE',
        companyId: company.id,
        isEmailVerified: true,
      },
    })

    await prisma.employee.create({
      data: {
        userId: user.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        jobTitle: emp.jobTitle,
        companyId: company.id,
        teamId: team.id,
        skills: emp.skills,
        weeklyHours: 35,
      },
    })

    console.log(`✅ Employee created: ${emp.firstName} ${emp.lastName}`)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Exécuter le seed
```bash
npm run db:seed
```

**Équivalent à :**
```bash
npx tsx prisma/seed.ts
```

### Résultat
```
🌱 Seeding database...
✅ Company created: Acme Corp
✅ Director created: Jean Dupont
✅ Team created: Équipe Développement
✅ Employee created: Marie Martin
✅ Employee created: Pierre Bernard
🎉 Seeding completed!
```

Ensuite, ouvre **DBeaver** ou **Prisma Studio** pour voir les données !

---

## 🎯 Étape 6 : Réinitialiser la Base (si besoin)

Si tu veux tout supprimer et repartir de zéro :

### Commande
```bash
npm run db:reset
```

**Équivalent à :**
```bash
npx prisma migrate reset
```

### Ce que ça fait
1. **SUPPRIME** toutes les tables
2. **RECRÉE** toutes les tables (re-execute les migrations)
3. **EXÉCUTE** le seed automatiquement

⚠️ **ATTENTION** : Supprime TOUTES les données !

---

## 📝 Commandes Prisma Récapitulatives

| Commande | Équivalent | Description |
|----------|------------|-------------|
| `npm run db:generate` | `npx prisma generate` | Génère le Prisma Client TypeScript |
| `npm run db:migrate` | `npx prisma migrate dev` | Crée une migration + applique |
| `npm run db:push` | `npx prisma db push` | Applique le schéma sans créer de migration (dev rapide) |
| `npm run db:studio` | `npx prisma studio` | Interface web (localhost:5555) |
| `npm run db:seed` | `npx tsx prisma/seed.ts` | Créer des données de test |
| `npm run db:reset` | `npx prisma migrate reset` | Supprimer + recréer + seed |
| `npm run db:migrate:prod` | `npx prisma migrate deploy` | Déploiement production |

---

## 🎓 Pour la Soutenance CDA

### Points à expliquer au jury

1. **Architecture Multi-Tenant**
   - Toutes les tables ont `companyId` pour isolation
   - Index sur `companyId` pour performance

2. **Relations TypeScript Strictes**
   - Prisma génère les types automatiquement
   - Autocomplete parfait (plus d'erreurs SQL)

3. **Migrations Versionnées**
   - Historique dans `prisma/migrations/`
   - Reproductible sur tous les environnements
   - Déploiement production sécurisé

4. **Séparation Auth/Métier**
   - `User` (NextAuth) ↔ `Employee` (métier)
   - Flexibilité pour les SYSTEM_ADMIN

5. **Index de Performance**
   - Sur toutes les clés étrangères
   - Sur les champs de recherche (email, slug)
   - Sur les dates (startDate, createdAt)

6. **Champs JSON Flexibles**
   - `Company.defaultOpeningHours` : config horaires complexe
   - `Employee.preferences` : préférences de planning
   - Évolutif sans migration

7. **Audit Trail**
   - `createdAt`, `updatedAt` partout
   - `createdById` pour traçabilité
   - `reviewedById`, `reviewedAt` pour validations

---

## ✅ Checklist Avant de Continuer

- [ ] `npm run db:generate` exécuté sans erreur
- [ ] `npm run db:migrate` créé les tables
- [ ] DBeaver affiche les 13 tables
- [ ] (Optionnel) Prisma Studio fonctionne
- [ ] (Optionnel) Seed créé des données de test

---

**Document créé le :** 4 novembre 2025
**Auteur :** Christophe Mostefaoui
**Projet :** SmartPlanning V2 - Titre CDA
**Statut :** ✅ Schéma Prisma prêt, guide complet
