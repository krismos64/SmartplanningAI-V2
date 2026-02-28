# Données de Test - SmartPlanning V2

> **Usage** : Comptes de démonstration pour tests et soutenance CDA
> **Dernière mise à jour** : 28 février 2026

---

## Mot de passe universel

**Tous les utilisateurs** utilisent le même mot de passe :

```
Password123!
```

---

## Organisations (3)

| Organisation | Secteur              | Plan     | Statut | Employés | Prix/mois | Stripe                          |
| ------------ | -------------------- | -------- | ------ | -------- | --------- | ------------------------------- |
| TechCorp     | Grande distribution  | PER_SEAT | ACTIVE | 110      | 319,00€   | Vrai client Stripe Test         |
| DesignStudio | Agence créative      | PER_SEAT | ACTIVE | 6        | 17,40€    | Vrai client Stripe Test         |
| StartupInc   | Startup tech         | FREE     | TRIAL  | 4        | 0€        | Client Stripe sans carte        |

> Le seed crée de **vrais clients Stripe en mode Test** (customers, subscriptions, payment methods) si `STRIPE_SECRET_KEY` est configurée. Fallback sur faux IDs si Stripe est indisponible. Les anciens clients seed sont nettoyés automatiquement via le metadata `source: smartplanning-seed`.

---

## Compte SYSTEM_ADMIN

```
Email: contact@smartplanning.fr
Password: Password123!
→ Super admin global, n'appartient à aucune entreprise (companyId: null)
→ Reçoit les notifications in-app + emails lors des résiliations
```

---

## TechCorp — Magasin Grande Distribution (110 employés)

**Adresse** : Centre Commercial Les Halles, 45 Rue du Commerce, 69003 Lyon
**Horaires** : Lun-Sam 06h00–21h00 | Pause 12h00–14h00

### Direction

| Email                 | Rôle     | Poste              | Téléphone          | Équipe | Photo   |
| --------------------- | -------- | ------------------ | ------------------ | ------ | ------- |
| john.doe@techcorp.com | DIRECTOR | Directeur magasin  | +33 6 01 02 03 04  | Aucune | ✅ Avatar |

> Le directeur n'appartient à aucune équipe : il supervise l'ensemble du magasin.

### 12 équipes (12 managers + 97 employés)

| Équipe                  | Manager            | Employés | Total |
| ----------------------- | ------------------ | -------- | ----- |
| Bazar                   | Jane Smith (E2E)   | 8        | 9     |
| Secrétariat             | Marie Lefèvre      | 5        | 6     |
| Ressources Humaines     | Sophie Martin      | 5        | 6     |
| Liquide                 | Pierre Durand      | 10       | 11    |
| Épicerie                | Nathalie Rousseau  | 12       | 13    |
| Multimédia              | Karim Benali       | 7        | 8     |
| Hygiène                 | Christine Lambert  | 8        | 9     |
| Réception marchandises  | Yannick Moreau     | 6        | 7     |
| Boulangerie-Pâtisserie  | Isabelle Petit     | 9        | 10    |
| Textile                 | Sandrine Girard    | 7        | 8     |
| Caisses et Accueil      | Valérie Dupont     | 15       | 16    |
| Comptabilité            | François Leroy     | 5        | 6     |

**Postes typiques** : Employé libre-service, Caissier/ère, Vendeur/euse, Boulanger/ère, Pâtissier/ère, Cariste, Réceptionnaire, Comptable, Secrétaire, Chargé RH, Technicien SAV, Hôtesse d'accueil

### Données employés enrichies

Tous les utilisateurs TechCorp disposent de :

- **Numéro de téléphone** : format français `+33 6 XX XX XX XX` (unique par employé)
- **Photo de profil** : avatar fictif via [i.pravatar.cc](https://i.pravatar.cc) (visage réaliste, déterministe par email)

---

## DesignStudio — Agence Créative (6 employés)

**Adresse** : 42 Rue du Faubourg Saint-Antoine, 75012 Paris
**Horaires** : Lun-Ven 09h00–17h00 (Ven 16h00) | Pause 12h00–13h00

| Email                           | Rôle     | Poste                    | Équipe    |
| ------------------------------- | -------- | ------------------------ | --------- |
| emma.jones@designstudio.com     | DIRECTOR | Creative Director        | Designers |
| liam.white@designstudio.com     | MANAGER  | Senior Designer          | Designers |
| olivia.martin@designstudio.com  | EMPLOYEE | Graphic Designer         | Designers |
| noah.thompson@designstudio.com  | EMPLOYEE | Web Designer             | Designers |
| ava.anderson@designstudio.com   | MANAGER  | Office Manager           | Admin     |
| william.taylor@designstudio.com | EMPLOYEE | Administrative Assistant | Admin     |

---

## StartupInc — Startup Tech (4 employés)

**Adresse** : 15 Rue de Rivoli, 75001 Paris
**Horaires** : Lun-Ven 10h00–19h00 (Ven 18h00) | Pause 13h00–14h00

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
→ Accès total TechCorp (110 employés, 12 équipes, congés, facturation)
→ N'appartient à aucune équipe (supervise tout le magasin)
```

### Test des rôles MANAGER

```
Email: jane.smith@techcorp.com
Password: Password123!
→ Responsable rayon Bazar (8 employés, approbation congés)
```

### Test des rôles EMPLOYEE

```
Email: bob.wilson@techcorp.com
Password: Password123!
→ Employé libre-service Bazar (consultation plannings, demandes de congés, notes)
```

### Test multi-tenant (isolation)

Connectez-vous successivement avec :

- `john.doe@techcorp.com` (TechCorp — 110 employés)
- `emma.jones@designstudio.com` (DesignStudio — 6 employés)

> Vérifiez que chaque directeur ne voit que les données de **son** organisation.

### Test SYSTEM_ADMIN

```
Email: contact@smartplanning.fr
Password: Password123!
→ Panel admin, monitoring, impersonation, notifications résiliation
```

---

## Équipes (15)

### TechCorp (12 équipes)

- **Bazar** — Manager: Jane Smith
- **Secrétariat** — Manager: Marie Lefèvre
- **Ressources Humaines** — Manager: Sophie Martin
- **Liquide** — Manager: Pierre Durand
- **Épicerie** — Manager: Nathalie Rousseau
- **Multimédia** — Manager: Karim Benali
- **Hygiène** — Manager: Christine Lambert
- **Réception marchandises** — Manager: Yannick Moreau
- **Boulangerie-Pâtisserie** — Manager: Isabelle Petit
- **Textile** — Manager: Sandrine Girard
- **Caisses et Accueil** — Manager: Valérie Dupont
- **Comptabilité** — Manager: François Leroy

### DesignStudio (2 équipes)

- **Designers** — Manager: Liam White
- **Admin** — Manager: Ava Anderson

### StartupInc (1 équipe)

- **Core Team** — Manager: James Walker

---

## Données de démonstration

### Plannings

Aucun planning n'est pré-créé par le seed. Les plannings sont destinés à être créés via l'interface utilisateur lors de la démonstration.

### Demandes de congés (26)

- **15 approuvées** : CP (8), Maladie (4), RTT (3)
- **6 en attente** : CP (3), RTT (1), Formation (1), Événement familial (1)
- **3 formations** : sécurité incendie, accueil client, CACES
- **2 événements familiaux** : naissance, mariage

### Incidents (16)

- Retards, absences, erreurs de caisse, conflits, casse matériel
- Visibilité variée : DIRECTOR_ONLY, MANAGER_DIRECTOR, ALL
- 2 notes positives du directeur (comportement exemplaire, excellence produit)

### Notes personnelles (24)

- Directeur : 5 notes (bilan, entretiens, négociation, réunion, commande)
- Managers : 10 notes (plannings, inventaires, formations, maintenance)
- Employés : 9 notes (congés, formations, attestations, CV)

### Soldes de congés (120)

- 1 LeaveBalance par employé (année 2026)
- Soldes variés (CP 0-12 utilisés sur 25, RTT 0-6 utilisés sur 10)

### Notifications (31)

- Types : PLANNING (7), LEAVE (5), INCIDENT (2), INFO (7), SUCCESS (4), WARNING (5), SYSTEM (1)
- Mix lues / non lues

---

## Abonnements Stripe (3)

| Organisation | Plan     | Quantity | Prix unitaire | Prix total | Statut | Stripe          |
| ------------ | -------- | -------- | ------------- | ---------- | ------ | --------------- |
| TechCorp     | PER_SEAT | 110      | 2,90€         | 319,00€    | ACTIVE | Vrai abonnement |
| DesignStudio | PER_SEAT | 6        | 2,90€         | 17,40€     | ACTIVE | Vrai abonnement |
| StartupInc   | FREE     | 4        | 2,90€         | 0€         | TRIAL  | Sans carte      |

## Paiements (2)

| Organisation | Montant | Méthode | Statut    | Source        |
| ------------ | ------- | ------- | --------- | ------------- |
| TechCorp     | 319,00€ | card    | SUCCEEDED | Facture Stripe |
| DesignStudio | 17,40€  | card    | SUCCEEDED | Facture Stripe |

---

## Commandes

```bash
# Réinitialiser la base et re-seeder
npm run db:reset

# Seeder uniquement (base existante)
npm run db:seed

# Visualiser les données
npm run db:studio
```

> ⚠️ Le seed n'est pas idempotent. Utilisez `db:reset` pour éviter les doublons.
> ⚠️ Configurez `STRIPE_SECRET_KEY` et `STRIPE_PRICE_ID` dans `.env` pour créer de vrais clients Stripe Test. Sans ces variables, des faux IDs sont utilisés.
