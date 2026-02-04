# Données de Test - SmartPlanning V2

> **Usage** : Comptes de démonstration pour tests et soutenance CDA
> **Dernière mise à jour** : 4 février 2026

---

## Mot de passe universel

**Tous les utilisateurs** utilisent le même mot de passe :

```
Password123!
```

---

## Organisations (3)

| Organisation | Plan       | Statut | Employés | Email                  |
| ------------ | ---------- | ------ | -------- | ---------------------- |
| TechCorp     | ENTERPRISE | ACTIVE | 10       | contact@techcorp.com   |
| DesignStudio | BUSINESS   | ACTIVE | 6        | hello@designstudio.com |
| StartupInc   | STARTER    | TRIAL  | 4        | team@startupinc.com    |

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

### Demandes de congés (8)
- 3 approuvées, 3 en attente, 2 rejetées
- Types variés : CP, RTT, maladie, sans solde

### Notifications (15)
- Types : SUCCESS, INFO, WARNING, SYSTEM
- Mix de lues et non lues

---

## Note SYSTEM_ADMIN

Le rôle `SYSTEM_ADMIN` n'est **pas créé dans le seed**. Il est réservé au propriétaire de la plateforme SaaS et créé manuellement en production.

---

## Commandes

```bash
# Réinitialiser la base et re-seeder
npm run db:reset

# Visualiser les données
npm run db:studio
```

> ⚠️ Le seed n'est pas idempotent. Utilisez `db:reset` pour éviter les doublons.
