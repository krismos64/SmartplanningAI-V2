# Audit Complet des Dashboards SmartPlanningAI

> **Date** : 30 janvier 2026
> **Version** : 2.0.0
> **Projet** : SmartPlanning V2 - Certification CDA

---

## Table des matières

1. [Cartographie des Pages Dashboard](#1-cartographie-des-pages-dashboard)
2. [Inventaire des Composants](#2-inventaire-des-composants)
3. [Analyse des Données Disponibles](#3-analyse-des-données-disponibles)
4. [Évaluation UX/UI Actuelle](#4-évaluation-uxui-actuelle)
5. [Analyse SWOT](#5-analyse-swot)
6. [Gaps Identifiés](#6-gaps-identifiés)
7. [Recommandations & Roadmap](#7-recommandations--roadmap)
8. [Maquettes Proposées](#8-maquettes-proposées)

---

## 1. Cartographie des Pages Dashboard

### 1.1 Structure des Routes

| Route | Rôle(s) Autorisé(s) | État | Ticket | Description |
|-------|---------------------|------|--------|-------------|
| `/app/dashboard` | EMPLOYEE | ✅ Complet | SP-145 | Dashboard personnel employé |
| `/app/manager/dashboard` | MANAGER | ⚠️ Placeholder | SP-146 | Dashboard manager (KPIs `--`) |
| `/app/director/dashboard` | DIRECTOR | ✅ Complet | SP-147 | Dashboard directeur entreprise |
| `/app/admin/dashboard` | SYSTEM_ADMIN | ✅ Complet | SP-148 | Dashboard super admin SaaS |
| `/app/dashboard/employees` | DIRECTOR, MANAGER | ✅ Complet | SP-152 | Liste employés avec DataTable |
| `/app/dashboard/leaves` | ALL | ✅ Complet | SP-413 | Gestion des congés |
| `/app/dashboard/schedules` | ALL | ✅ Complet | SP-395 | Planning calendrier |
| `/app/dashboard/tasks` | ALL | ✅ Complet | SP-419 | Notes personnelles privées |
| `/app/dashboard/incidents` | DIRECTOR, MANAGER, EMPLOYEE* | ✅ Complet | SP-426 | Notes d'incident RBAC |
| `/app/director/teams` | DIRECTOR | ✅ Complet | - | Gestion des équipes |

### 1.2 Détail par Dashboard Principal

#### Dashboard Employee (`/app/dashboard`)
```
┌─────────────────────────────────────────────────────────────┐
│  EmployeeWelcome                                            │
│  "Bonjour, Jean !" + date + prochain shift                 │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ Heures      │ Shifts      │ Solde       │ Demandes        │
│ travaillées │ à venir     │ congés      │ en attente      │
│ 32h (+12%)  │ 5           │ 15 jours    │ 2               │
├─────────────┴─────────────┴─────────────┴─────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────────┐   │
│  │ EmployeeSchedule     │  │ EmployeeLeaveBalance     │   │
│  │ (BarChart semaine)   │  │ (PieChart donut)         │   │
│  └──────────────────────┘  └──────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  PersonalTasksWidget (Notes perso avec drag & drop)        │
├─────────────────────────────────────────────────────────────┤
│  EmployeeQuickActions (Boutons actions rapides)            │
└─────────────────────────────────────────────────────────────┘
```
**Composants** : EmployeeWelcome, EmployeeStats, EmployeeSchedule, EmployeeLeaveBalance, PersonalTasksWidget, EmployeeQuickActions
**Données** : `getEmployeeStats()`, `getPersonalTasksForWidget()`
**État** : ✅ Complet avec graphiques Recharts

---

#### Dashboard Manager (`/app/manager/dashboard`)
```
┌─────────────────────────────────────────────────────────────┐
│  Card gradient "Bienvenue, {name} !"                       │
│  "Vue d'ensemble de votre équipe"                          │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│ Membres     │ Congés à    │ Absents     │ Heures          │
│ équipe      │ valider     │ aujourd'hui │ équipe          │
│ --          │ --          │ --          │ --              │
├─────────────┴─────────────┴─────────────┴─────────────────┤
│  Card "Actions rapides"                                    │
│  [Gérer équipe] [Congés en attente] [Voir planning]       │
├─────────────────────────────────────────────────────────────┤
│  PersonalTasksWidget                                        │
├─────────────────────────────────────────────────────────────┤
│  Card "Role: MANAGER"                                       │
└─────────────────────────────────────────────────────────────┘
```
**État** : ⚠️ **PLACEHOLDER** - KPIs affichent `--`, pas de données réelles
**Manque** : Service `getManagerStats()` non intégré, aucun graphique

---

#### Dashboard Director (`/app/director/dashboard`)
```
┌─────────────────────────────────────────────────────────────┐
│  DirectorWelcome                                            │
│  "Bienvenue, {name} !" + entreprise + alertes              │
├──────────┬──────────┬──────────┬──────────┬──────┬───────┤
│ Employés │ Équipes  │ Congés   │ Heures   │ Taux │ Abs.  │
│ actifs   │          │ attente  │ planif.  │ prés │ 7j    │
│ 45       │ 6        │ 8        │ --       │ 92%  │ --    │
├──────────┴──────────┴──────────┴──────────┴──────┴───────┤
│  ┌─────────────────────┐  ┌─────────────────────────┐     │
│  │ DirectorTeamsChart  │  │ DirectorTrendsChart     │     │
│  │ (BarChart équipes)  │  │ (AreaChart croissance)  │     │
│  └─────────────────────┘  └─────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  DirectorPendingLeaves (Liste 5 derniers congés)           │
├─────────────────────────────────────────────────────────────┤
│  PersonalTasksWidget                                        │
├─────────────────────────────────────────────────────────────┤
│  DirectorQuickActions                                       │
└─────────────────────────────────────────────────────────────┘
```
**Composants** : DirectorWelcome, DirectorStats (6 KPIs), DirectorTeamsChart, DirectorTrendsChart, DirectorPendingLeaves, PersonalTasksWidget, DirectorQuickActions
**État** : ✅ Complet mais 2 KPIs affichent `--` (heures planifiées, absences 7j)

---

#### Dashboard Admin (`/app/admin/dashboard`)
```
┌─────────────────────────────────────────────────────────────┐
│  AdminWelcome                                               │
│  "Bienvenue, Admin !" + métriques SaaS                     │
├──────────┬──────────┬──────────┬──────────┬──────┬───────┤
│ Entrep.  │ Users    │ Abos     │ MRR      │ Conv │ Churn │
│ 127(+5%) │ 890(+8%) │ actifs   │ 12.5k€   │ 75%  │ 2.1%  │
│          │          │ 98       │ (+12%)   │      │       │
├──────────┴──────────┴──────────┴──────────┴──────┴───────┤
│  ┌─────────────────────┐  ┌─────────────────────────┐     │
│  │ AdminMrrChart       │  │ AdminSignupsChart       │     │
│  │ (AreaChart MRR)     │  │ (AreaChart inscriptions)│     │
│  └─────────────────────┘  └─────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────────┐     │
│  │ AdminPlansChart     │  │ AdminRecentCompanies    │     │
│  │ (PieChart plans)    │  │ (Liste entreprises)     │     │
│  └─────────────────────┘  └─────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  PersonalTasksWidget                                        │
├─────────────────────────────────────────────────────────────┤
│  AdminQuickActions                                          │
└─────────────────────────────────────────────────────────────┘
```
**Composants** : AdminWelcome, AdminStats (6 KPIs), AdminMrrChart, AdminSignupsChart, AdminPlansChart, AdminRecentCompanies, PersonalTasksWidget, AdminQuickActions
**État** : ✅ Complet avec graphiques et tendances

---

## 2. Inventaire des Composants

### 2.1 Composants Dashboard Réutilisables

| Composant | Fichier | Usage | Props |
|-----------|---------|-------|-------|
| `StatCard` | `src/components/dashboard/StatCard.tsx` | Carte KPI individuelle | title, value, icon, trend, unit, description, isLoading |
| `StatsGrid` | `src/components/dashboard/StatsGrid.tsx` | Grille de StatCards | stats[], columns (2/3/4), isLoading |
| `TrendIndicator` | `src/components/dashboard/TrendIndicator.tsx` | Badge tendance (+/-) | value, direction, label, size |
| `PersonalTasksWidget` | `src/components/dashboard/PersonalTasksWidget.tsx` | Widget notes perso | initialTasks, totalPendingCount |

### 2.2 Composants Charts (Recharts)

| Composant | Fichier | Type | Props |
|-----------|---------|------|-------|
| `ChartContainer` | `src/components/charts/ChartContainer.tsx` | Wrapper responsive | height, isLoading, isEmpty, emptyMessage |
| `BarChartWidget` | `src/components/charts/BarChartWidget.tsx` | Bar Chart | data, dataKey, colors, showGrid, showTooltip |
| `AreaChartWidget` | `src/components/charts/AreaChartWidget.tsx` | Area Chart | data, dataKey, colors, gradient |
| `PieChartWidget` | `src/components/charts/PieChartWidget.tsx` | Pie/Donut Chart | data, dataKey, innerRadius, outerRadius, showLegend |

### 2.3 Composants UI Shadcn/ui Disponibles

```
src/components/ui/
├── card.tsx           ✅ Card, CardHeader, CardContent, CardTitle
├── badge.tsx          ✅ Badge
├── button.tsx         ✅ Button, variants
├── skeleton.tsx       ✅ Skeleton (loading)
├── progress-bar.tsx   ✅ ProgressBar
├── progress-circle.tsx✅ ProgressCircle
├── tabs.tsx           ✅ Tabs
├── tooltip.tsx        ✅ Tooltip
├── avatar.tsx         ✅ Avatar
├── separator.tsx      ✅ Separator
├── alert.tsx          ✅ Alert
├── empty-state.tsx    ✅ EmptyState
├── dialog.tsx         ✅ Dialog
├── sheet.tsx          ✅ Sheet (mobile drawer)
└── ... (35 composants au total)
```

### 2.4 Système d'Animations

| Élément | Fichier | Description |
|---------|---------|-------------|
| `AnimatedContainer` | `src/lib/animations/components/AnimatedContainer.tsx` | Wrapper avec variants Framer Motion |
| `AnimatedList` | `src/lib/animations/components/AnimatedList.tsx` | Liste avec stagger animation |
| `variants.ts` | `src/lib/animations/variants.ts` | 30+ variants (fade, slide, scale, stagger...) |
| `framer-motion` | `package.json` | v12.23.25 installé |

---

## 3. Analyse des Données Disponibles

### 3.1 Services Dashboard (`src/lib/services/dashboard/`)

| Service | Fichier | Données Retournées |
|---------|---------|-------------------|
| `getEmployeeStats` | `employee-stats.service.ts` | hoursWorked, upcomingShifts, leaveBalance, pendingRequests, nextShift, weeklySchedule |
| `getManagerStats` | `manager-stats.service.ts` | teamSize, pendingLeaveRequests, todayAbsences, coverageRate, teamHoursWorked, teamPerformance, leaveRequestsTrend |
| `getDirectorStats` | `director-stats.service.ts` | totalEmployees, totalTeams, pendingLeaveRequests, averageAttendanceRate, teamStats, leaveTypeDistribution, employeeGrowth |
| `getAdminStats` | `admin-stats.service.ts` | totalCompanies, totalUsers, activeSubscriptions, mrr, churnRate, companiesGrowth, revenueByPlan, subscriptionStatusDistribution |

### 3.2 Types de Données (Métriques par Rôle)

#### EMPLOYEE
- ✅ Heures travaillées (avec tendance)
- ✅ Shifts à venir (compte)
- ✅ Solde congés (remaining/used/total)
- ✅ Demandes en attente
- ✅ Prochain shift (date, horaires)
- ✅ Planning semaine (7 jours, heures/jour)

#### MANAGER (données disponibles mais non affichées)
- ✅ Taille équipe
- ✅ Congés à valider
- ✅ Absences du jour
- ✅ Taux de couverture
- ✅ Heures équipe (avec tendance)
- ✅ Performance par membre (pour chart)
- ✅ Tendance demandes congés (pour chart)

#### DIRECTOR
- ✅ Employés actifs
- ✅ Nombre d'équipes
- ✅ Congés en attente
- ❌ Heures planifiées (affiche `--`)
- ✅ Taux de présence
- ❌ Absences 7j (affiche `--`)
- ✅ Stats par équipe (pour bar chart)
- ✅ Évolution effectifs (pour area chart)

#### SYSTEM_ADMIN
- ✅ Total entreprises (avec tendance)
- ✅ Total utilisateurs (avec tendance)
- ✅ Abonnements actifs
- ✅ MRR (avec tendance)
- ✅ Taux de conversion
- ✅ Taux de churn
- ✅ Croissance entreprises (pour area chart)
- ✅ Revenue par plan (pour pie chart)

---

## 4. Évaluation UX/UI Actuelle

### 4.1 Design System

| Aspect | État | Détails |
|--------|------|---------|
| **Palette** | ✅ Cohérente | CSS variables (--primary, --muted, etc.), dark mode |
| **Typographie** | ✅ OK | Font system, tailles cohérentes |
| **Espacements** | ✅ OK | Tailwind space-y-6, gap-4, gap-6 |
| **Icônes** | ✅ OK | Lucide React |
| **Dark Mode** | ✅ Complet | next-themes implémenté |

### 4.2 États de Chargement

| Dashboard | Loading State | Skeleton |
|-----------|--------------|----------|
| Employee | ✅ `loading.tsx` | Skeletons détaillés (cards, charts) |
| Manager | ❌ Manquant | - |
| Director | ✅ `loading.tsx` | Skeletons complets |
| Admin | ✅ `loading.tsx` | Skeletons complets |
| Leaves | ✅ `loading.tsx` | Skeletons |
| Schedules | ✅ `loading.tsx` | Skeletons |
| Tasks | ✅ `loading.tsx` | Skeletons |
| Incidents | ✅ `loading.tsx` | Skeletons |

### 4.3 Responsive Design

| Breakpoint | Grille KPIs | Charts |
|------------|-------------|--------|
| Mobile (<640px) | 1 colonne | Pleine largeur |
| Tablet (640-1024px) | 2 colonnes | 1 colonne |
| Desktop (>1024px) | 3-4 colonnes | 2 colonnes |

### 4.4 Animations Actuelles

- ✅ Sidebar : Framer Motion sur les items de navigation
- ✅ Hover cards : `transition-shadow hover:shadow-md`
- ✅ Progress bars : `transition-all duration-500`
- ❌ Page transitions : Non implémentées sur les dashboards
- ❌ Stagger animations : Disponibles mais non utilisées
- ❌ Chart animations : Recharts animations de base uniquement

---

## 5. Analyse SWOT

### Forces (Strengths)

1. **Architecture solide** : Server/Client Components bien séparés
2. **Services de données complets** : 4 services spécialisés par rôle
3. **Composants réutilisables** : StatCard, StatsGrid, ChartWidgets
4. **Stack moderne** : Next.js 15, React 19, Recharts, Framer Motion
5. **Dark mode** : Implémenté et fonctionnel
6. **Loading states** : Skeletons détaillés pour 3/4 dashboards
7. **Responsive** : Grilles adaptatives mobile/tablet/desktop
8. **Système d'animations** : 30+ variants Framer Motion prêts à l'emploi

### Faiblesses (Weaknesses)

1. **Dashboard Manager incomplet** : Affiche uniquement `--` sur tous les KPIs
2. **2 KPIs Director manquants** : Heures planifiées et Absences 7j
3. **Pas d'animations de page** : Transitions abruptes entre les dashboards
4. **Charts statiques** : Animations Recharts basiques
5. **Pas de rafraîchissement temps réel** : Données chargées au mount uniquement
6. **Pas de filtres temporels** : Impossible de changer la période affichée
7. **Actions rapides limitées** : Liens simples, pas d'actions contextuelles

### Opportunités (Opportunities)

1. **Framer Motion déjà installé** : Peut être utilisé sur les dashboards
2. **AnimatedContainer disponible** : Wrapper prêt pour les sections
3. **Stagger animations** : Parfait pour les grilles de KPIs
4. **Bento grid trend** : Design moderne à implémenter
5. **@tanstack/react-query** : Non utilisé mais standard pour le caching
6. **Notifications temps réel** : WebSocket/SSE pour les alertes

### Menaces (Threats)

1. **Performance** : Trop d'animations peut impacter les mobiles
2. **Accessibilité** : Animations doivent respecter prefers-reduced-motion
3. **Complexité** : Risque de sur-ingénierie avec trop de features
4. **Délais CDA** : Soutenance le 2 avril 2026, prioriser l'essentiel

---

## 6. Gaps Identifiés

### 6.1 Fonctionnel

| Gap | Criticité | Dashboard(s) |
|-----|-----------|--------------|
| Dashboard Manager = placeholder complet | 🔴 Haute | Manager |
| 2 KPIs affichent `--` | 🟠 Moyenne | Director |
| Pas de filtres temporels (jour/semaine/mois) | 🟠 Moyenne | Tous |
| Pas de rafraîchissement automatique | 🟡 Basse | Tous |
| Pas d'export données | 🟡 Basse | Tous |

### 6.2 UX/UI

| Gap | Criticité | Impact |
|-----|-----------|--------|
| Pas d'animations de page | 🟠 Moyenne | Expérience statique |
| Charts sans animations d'entrée | 🟠 Moyenne | Données apparaissent brusquement |
| KPIs sans animation stagger | 🟡 Basse | Grille monotone |
| Pas de micro-interactions | 🟡 Basse | Feedback utilisateur limité |
| Welcome cards basiques | 🟡 Basse | Pas de personnalisation visuelle |

### 6.3 Performance

| Gap | Criticité | Solution |
|-----|-----------|----------|
| Pas de cache côté client | 🟠 Moyenne | Implémenter SWR ou React Query |
| Rechargement complet à chaque navigation | 🟠 Moyenne | Optimistic updates |

---

## 7. Recommandations & Roadmap

### 7.1 Quick Wins (< 2h chacun)

1. **Ajouter stagger animation sur les grilles de KPIs**
   - Utiliser `AnimatedList` ou `staggerContainer`
   - Fichiers : `EmployeeStats.tsx`, `DirectorStats.tsx`, `AdminStats.tsx`

2. **Animer l'apparition des charts**
   - Wrapper les ChartWidgets avec `AnimatedContainer variant="fadeSlideUp"`
   - Délai progressif entre les 2 charts

3. **Améliorer les Welcome cards**
   - Gradient plus prononcé
   - Icône animée (pulse ou float)

4. **Ajouter loading state Manager dashboard**
   - Créer `/app/manager/dashboard/loading.tsx`

### 7.2 Améliorations Moyennes (1 jour chacune)

1. **Compléter le Dashboard Manager**
   - Intégrer `getManagerStats()` dans la page
   - Créer `ManagerStats.tsx` avec 4 KPIs
   - Ajouter `ManagerTeamChart.tsx` (performance équipe)
   - Ajouter `ManagerPendingLeaves.tsx`

2. **Corriger les KPIs Director manquants**
   - Implémenter calcul "Heures planifiées" dans `director-stats.service.ts`
   - Implémenter calcul "Absences 7j"

3. **Ajouter filtres temporels**
   - Créer composant `PeriodSelector` (Aujourd'hui / Cette semaine / Ce mois)
   - Intégrer dans les headers de dashboard

4. **Implémenter animations de transition de page**
   - Utiliser `pageTransitionSlide` ou `pageTransitionFade`
   - Appliquer via layout ou composant wrapper

### 7.3 Refonte Majeure (2-3 jours)

1. **Passer en layout Bento Grid**
   - Cards de tailles variées (1x1, 2x1, 1x2)
   - Highlight sur les métriques importantes
   - Responsive avec réorganisation mobile

2. **Implémenter temps réel avec SWR/React Query**
   - Polling automatique toutes les 30s
   - Optimistic updates sur les actions
   - Cache intelligent

3. **Créer un mode "Focus"**
   - Click sur un KPI pour l'agrandir
   - Détails supplémentaires + graphique dédié
   - Animation scale + overlay

---

## 8. Maquettes Proposées

### 8.1 Dashboard Employee (Refonte Bento)

```
┌───────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐  ┌─────────────────────┐ │
│  │ WELCOME CARD (2x1)                  │  │ PROCHAIN SHIFT      │ │
│  │ "Bonjour, Jean !"                   │  │ (1x1)               │ │
│  │ ○ Date du jour                      │  │ ┌───────────────┐   │ │
│  │ ○ Animation floating particles      │  │ │ 🕐 Demain     │   │ │
│  │                                      │  │ │ 09:00 → 17:00│   │ │
│  └─────────────────────────────────────┘  └─────────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐ │
│  │ HEURES    │ │ SHIFTS    │ │ CONGÉS    │ │ DEMANDES          │ │
│  │ 32h       │ │ 5         │ │ 15j       │ │ 2 en attente      │ │
│  │ +12% ▲    │ │ planifiés │ │ restants  │ │ ○○                │ │
│  │ (1x1)     │ │ (1x1)     │ │ (1x1)     │ │ (1x1) pulsing     │ │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────────┘ │
│       ↑ stagger animation 100ms entre chaque card                 │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐ │
│  │ PLANNING SEMAINE (1x1)  │  │ SOLDE CONGÉS (1x1)              │ │
│  │                         │  │                                  │ │
│  │  ▁▃▅▇▅▃▁               │  │    ╭────╮                        │ │
│  │  L M M J V S D         │  │   ╱  15j ╲  donut                │ │
│  │                         │  │  ╰──────╯  animé                 │ │
│  │  Total: 35h             │  │                                  │ │
│  │  ↳ animate on mount     │  │  CP: 10j | RTT: 5j              │ │
│  └─────────────────────────┘  └─────────────────────────────────┘ │
│       ↑ charts apparaissent avec fadeSlideUp delay 200ms          │
├───────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ NOTES PERSO (2x1)                                             │ │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐                          │ │
│  │ │ Note 1  │ │ Note 2  │ │ Note 3  │  drag & drop             │ │
│  │ │ ☐       │ │ ☐       │ │ ☑       │                          │ │
│  │ └─────────┘ └─────────┘ └─────────┘  [+ Ajouter]             │ │
│  └───────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│  │ 📅 Demander congé   │ │ 📋 Mon planning │ │ 💬 Support      │  │
│  └─────────────────────┘ └─────────────────┘ └─────────────────┘  │
│       ↑ boutons avec hover scale 1.02 + lift                      │
└───────────────────────────────────────────────────────────────────┘
```

### 8.2 Dashboard Manager (À implémenter)

```
┌───────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ WELCOME + ALERTES (2x1)                                      │  │
│  │ "Bonjour, Manager !"                                         │  │
│  │ ⚠️ 3 congés à valider | ✓ Équipe au complet demain          │  │
│  └─────────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────────┐ │
│  │ ÉQUIPE    │ │ CONGÉS    │ │ ABSENTS   │ │ HEURES ÉQUIPE     │ │
│  │ 12        │ │ 3         │ │ 2         │ │ 420h              │ │
│  │ membres   │ │ à valider │ │ ce jour   │ │ ce mois (+5%)     │ │
│  └───────────┘ └───────────┘ └───────────┘ └───────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐ │
│  │ PERFORMANCE ÉQUIPE      │  │ CONGÉS EN ATTENTE               │ │
│  │ (BarChart horizontal)   │  │                                  │ │
│  │                         │  │ ┌─────────────────────────────┐ │ │
│  │ Alice  ████████ 95%     │  │ │ Jean D. | 15-17 jan | CP   │ │ │
│  │ Bob    ███████░ 85%     │  │ │ [✓] [✗]                     │ │ │
│  │ Claire ████████ 92%     │  │ ├─────────────────────────────┤ │ │
│  │                         │  │ │ Marie L. | 22-24 jan | RTT │ │ │
│  │                         │  │ │ [✓] [✗]                     │ │ │
│  └─────────────────────────┘  └─────────────────────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ PLANNING ÉQUIPE (calendrier semaine mini)                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

### 8.3 Animations Recommandées

```typescript
// Séquence d'animations recommandée pour un dashboard

1. Page wrapper : fadeSlideUp (duration: 300ms)
   └── delay: 0ms

2. Welcome card : fadeSlideUp
   └── delay: 100ms

3. KPIs grid : staggerContainer
   └── staggerChildren: 80ms
   └── delayChildren: 200ms
   └── Chaque card: slideUp + fade

4. Charts : fadeSlideUp
   └── delay: 400ms (gauche)
   └── delay: 500ms (droite)

5. Quick actions : slideUp
   └── delay: 600ms

// Interactions
- Hover cards: scale(1.02) + shadow
- Click KPI: scale(0.98) feedback
- Chart hover: highlight data point
```

---

## Annexe : Checklist de Validation

### Routes Dashboard
- [x] `/app/dashboard` - Employee dashboard complet
- [ ] `/app/manager/dashboard` - **À COMPLÉTER**
- [x] `/app/director/dashboard` - Director dashboard (2 KPIs à corriger)
- [x] `/app/admin/dashboard` - Admin dashboard complet

### Composants de Visualisation
- [x] StatCard avec loading state
- [x] StatsGrid responsive
- [x] BarChartWidget
- [x] AreaChartWidget
- [x] PieChartWidget
- [ ] Animations stagger sur grilles

### Données Disponibles
- [x] getEmployeeStats() - Utilisé
- [x] getManagerStats() - **NON UTILISÉ**
- [x] getDirectorStats() - Utilisé (partiellement)
- [x] getAdminStats() - Utilisé

### Performance
- [ ] Cache client (SWR/React Query)
- [x] Loading states (skeletons)
- [ ] Optimistic updates

---

*Fin du rapport d'audit*
