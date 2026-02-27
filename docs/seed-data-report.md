# Données de Test - SmartPlanning V2

> **Usage** : Comptes de démonstration pour tests et soutenance CDA
> **Dernière mise à jour** : 10 février 2026

---

## Mot de passe universel

**Tous les utilisateurs** utilisent le même mot de passe :

```
Password123!
```

---

## Organisations (3)

| Organisation | Plan     | Statut | Employés | Prix/mois | Email                  |
| ------------ | -------- | ------ | -------- | --------- | ---------------------- |
| TechCorp     | PER_SEAT | ACTIVE | 10       | 29,00€    | contact@techcorp.com   |
| DesignStudio | PER_SEAT | ACTIVE | 6        | 17,40€    | hello@designstudio.com |
| StartupInc   | FREE     | TRIAL  | 4        | 0€        | team@startupinc.com    |

---

## Comptes de test par organisation

### TechCorp (10 utilisateurs)

| Email                        | Rôle     | Poste                | Équipe      |
| ---------------------------- | -------- | -------------------- | ----------- |
| john.doe@techcorp.com        | DIRECTOR | CEO & Director       | Engineering |
| jane.smith@techcorp.com      | MANAGER  | Engineering Manager  | Engineering |
| bob.wilson@techcorp.com      | EMPLOYEE | Senior Developer     | Engineering |
| eva.garcia@techcorp.com      | EMPLOYEE | Full Stack Developer | Engineering |
| henry.lopez@techcorp.com     | EMPLOYEE | Junior Developer     | Engineering |
| alice.brown@techcorp.com     | MANAGER  | Product Manager      | Product     |
| charlie.davis@techcorp.com   | EMPLOYEE | Product Owner        | Product     |
| david.miller@techcorp.com    | EMPLOYEE | Product Analyst      | Product     |
| frank.martinez@techcorp.com  | MANAGER  | Design Lead          | Design      |
| grace.rodriguez@techcorp.com | EMPLOYEE | UI Designer          | Design      |

### DesignStudio (6 utilisateurs)

| Email                           | Rôle     | Poste                    | Équipe    |
| ------------------------------- | -------- | ------------------------ | --------- |
| emma.jones@designstudio.com     | DIRECTOR | Creative Director        | Designers |
| liam.white@designstudio.com     | MANAGER  | Senior Designer          | Designers |
| olivia.martin@designstudio.com  | EMPLOYEE | Graphic Designer         | Designers |
| noah.thompson@designstudio.com  | EMPLOYEE | Web Designer             | Designers |
| ava.anderson@designstudio.com   | MANAGER  | Office Manager           | Admin     |
| william.taylor@designstudio.com | EMPLOYEE | Administrative Assistant | Admin     |

### StartupInc (4 utilisateurs)

| Email                        | Rôle     | Poste                | Équipe    |
| ---------------------------- | -------- | -------------------- | --------- |
| oliver.green@startupinc.com  | DIRECTOR | Founder & CEO        | Core Team |
| james.walker@startupinc.com  | MANAGER  | CTO                  | Core Team |
| sophia.clark@startupinc.com  | EMPLOYEE | Full Stack Developer | Core Team |
| isabella.hall@startupinc.com | EMPLOYEE | Product Designer     | Core Team |

---

## Comptes recommandés pour la démo CDA

### Test des rôles DIRECTOR

```
Email: john.doe@techcorp.com
Password: Password123!
→ Accès total sur TechCorp (gestion équipes, congés, plannings, paramètres)
```

### Test des rôles MANAGER

```
Email: jane.smith@techcorp.com
Password: Password123!
→ Gestion équipe Engineering (plannings, approbation congés équipe)
```

### Test des rôles EMPLOYEE

```
Email: bob.wilson@techcorp.com
Password: Password123!
→ Consultation plannings, demandes de congés, notes personnelles
```

### Test multi-tenant (isolation)

Connectez-vous successivement avec :

- `john.doe@techcorp.com` (TechCorp)
- `emma.jones@designstudio.com` (DesignStudio)

→ Vérifiez que chaque directeur ne voit que les données de **son** organisation.

---

## Équipes (6)

### TechCorp

- **Engineering** - Manager: Jane Smith
- **Product** - Manager: Alice Brown
- **Design** - Manager: Frank Martinez

### DesignStudio

- **Designers** - Manager: Liam White
- **Admin** - Manager: Ava Anderson

### StartupInc

- **Core Team** - Manager: James Walker

---

## Données de démonstration

### Plannings (15)

- TechCorp : 10 plannings (Development Sprint, Code Review, Remote Work, Team Building, On-Call)
- DesignStudio : 3 plannings (Client Presentation, Creative Brainstorming, Web Design)
- StartupInc : 2 plannings (Product Development, Design Sprint)

### Demandes de congés (14)

- 5 approuvées (dont 1 halfDay AM, 1 congé parental)
- 5 en attente (dont 1 halfDay PM, 1 événement familial)
- 2 rejetées
- 2 annulées
- Types variés : CP, RTT, maladie, sans solde, parental, événement familial

### Soldes de congés (20)

- 1 LeaveBalance par employé (année 2026)
- Soldes variés (CP 0-12 utilisés, RTT 0-6 utilisés)

### Notifications (15)

- Types : SUCCESS, INFO, WARNING, SYSTEM
- 8 lues, 7 non lues

---

## Compte SYSTEM_ADMIN

Le seed crée un compte `SYSTEM_ADMIN` pour les tests E2E RBAC :

```
Email: contact@smartplanning.fr
Password: Password123!
→ Super admin global, n'appartient à aucune entreprise (companyId: null)
```

## Abonnements Stripe (3)

| Organisation | Plan     | Quantity | Prix unitaire | Prix total | Statut |
| ------------ | -------- | -------- | ------------- | ---------- | ------ |
| TechCorp     | PER_SEAT | 10       | 2,90€         | 29,00€     | ACTIVE |
| DesignStudio | PER_SEAT | 6        | 2,90€         | 17,40€     | ACTIVE |
| StartupInc   | FREE     | 4        | 2,90€         | 0€         | TRIAL  |

## Paiements (2)

| Organisation | Montant | Méthode    | Statut    |
| ------------ | ------- | ---------- | --------- |
| TechCorp     | 29,00€  | card       | SUCCEEDED |
| DesignStudio | 17,40€  | sepa_debit | SUCCEEDED |

---

## Commandes

```bash
# Réinitialiser la base et re-seeder
npm run db:reset

# Visualiser les données
npm run db:studio
```

> ⚠️ Le seed n'est pas idempotent. Utilisez `db:reset` pour éviter les doublons.
