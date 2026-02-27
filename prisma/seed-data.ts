// Données de la grande distribution TechCorp pour le seed
// 12 équipes avec managers et employés aux noms français réalistes

export interface TeamDef {
  name: string
  color: string
  manager: { firstName: string; lastName: string; email?: string; jobTitle: string }
  employees: { firstName: string; lastName: string; jobTitle: string; weeklyHours: number; hireDate: string }[]
}

export const TECHCORP_TEAMS: TeamDef[] = [
  {
    name: 'Bazar',
    color: '#F59E0B',
    // Jane Smith = E2E user, conservée comme MANAGER
    manager: { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@techcorp.com', jobTitle: 'Responsable Bazar' },
    employees: [
      // Bob Wilson = E2E user, conservé comme EMPLOYEE
      { firstName: 'Bob', lastName: 'Wilson', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2021-04-10' },
      { firstName: 'Arnaud', lastName: 'Fabre', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2020-09-01' },
      { firstName: 'Céline', lastName: 'Mercier', jobTitle: 'Employée libre-service', weeklyHours: 30, hireDate: '2022-01-15' },
      { firstName: 'Damien', lastName: 'Blanc', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2019-06-01' },
      { firstName: 'Émilie', lastName: 'Renaud', jobTitle: 'Employée libre-service', weeklyHours: 32, hireDate: '2023-03-01' },
      { firstName: 'Florian', lastName: 'Chevalier', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2021-11-15' },
      { firstName: 'Géraldine', lastName: 'Fontaine', jobTitle: 'Employée libre-service', weeklyHours: 30, hireDate: '2024-01-08' },
      { firstName: 'Hugo', lastName: 'Maréchal', jobTitle: 'Employé libre-service', weeklyHours: 39, hireDate: '2018-05-01' },
    ],
  },
  {
    name: 'Secrétariat',
    color: '#6366F1',
    manager: { firstName: 'Marie', lastName: 'Lefèvre', jobTitle: 'Responsable Secrétariat' },
    employees: [
      { firstName: 'Agathe', lastName: 'Caron', jobTitle: 'Secrétaire', weeklyHours: 35, hireDate: '2020-03-01' },
      { firstName: 'Benoît', lastName: 'Picard', jobTitle: 'Assistant administratif', weeklyHours: 35, hireDate: '2021-09-01' },
      { firstName: 'Claire', lastName: 'Hubert', jobTitle: 'Secrétaire', weeklyHours: 32, hireDate: '2022-06-01' },
      { firstName: 'Denis', lastName: 'Vasseur', jobTitle: 'Assistant de direction', weeklyHours: 39, hireDate: '2019-01-15' },
      { firstName: 'Élise', lastName: 'Bonnet', jobTitle: 'Secrétaire', weeklyHours: 30, hireDate: '2023-10-01' },
    ],
  },
  {
    name: 'Ressources Humaines',
    color: '#EC4899',
    manager: { firstName: 'Sophie', lastName: 'Martin', jobTitle: 'Responsable RH' },
    employees: [
      { firstName: 'Antoine', lastName: 'Garnier', jobTitle: 'Chargé de recrutement', weeklyHours: 35, hireDate: '2020-06-01' },
      { firstName: 'Brigitte', lastName: 'Perrin', jobTitle: 'Gestionnaire paie', weeklyHours: 35, hireDate: '2019-03-15' },
      { firstName: 'Christelle', lastName: 'Morel', jobTitle: 'Chargée de formation', weeklyHours: 35, hireDate: '2021-01-10' },
      { firstName: 'David', lastName: 'Fournier', jobTitle: 'Assistant RH', weeklyHours: 32, hireDate: '2023-09-01' },
      { firstName: 'Estelle', lastName: 'Simon', jobTitle: 'Assistante RH', weeklyHours: 30, hireDate: '2024-02-01' },
    ],
  },
  {
    name: 'Liquide',
    color: '#3B82F6',
    manager: { firstName: 'Pierre', lastName: 'Durand', jobTitle: 'Responsable Liquide' },
    employees: [
      { firstName: 'Alexandre', lastName: 'Robin', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2020-01-15' },
      { firstName: 'Barbara', lastName: 'Lemoine', jobTitle: 'Employée libre-service', weeklyHours: 35, hireDate: '2021-05-01' },
      { firstName: 'Cédric', lastName: 'Marchand', jobTitle: 'Employé libre-service', weeklyHours: 39, hireDate: '2018-11-01' },
      { firstName: 'Delphine', lastName: 'Gautier', jobTitle: 'Employée libre-service', weeklyHours: 30, hireDate: '2022-08-01' },
      { firstName: 'Éric', lastName: 'Leclerc', jobTitle: 'Cariste', weeklyHours: 35, hireDate: '2019-07-01' },
      { firstName: 'Fabienne', lastName: 'Roche', jobTitle: 'Employée libre-service', weeklyHours: 32, hireDate: '2023-01-15' },
      { firstName: 'Grégory', lastName: 'Adam', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2020-10-01' },
      { firstName: 'Hélène', lastName: 'Henry', jobTitle: 'Employée libre-service', weeklyHours: 35, hireDate: '2021-03-01' },
      { firstName: 'Ivan', lastName: 'Masson', jobTitle: 'Cariste', weeklyHours: 39, hireDate: '2018-04-01' },
      { firstName: 'Julie', lastName: 'Moulin', jobTitle: 'Employée libre-service', weeklyHours: 30, hireDate: '2024-03-01' },
    ],
  },
  {
    name: 'Épicerie',
    color: '#22C55E',
    manager: { firstName: 'Nathalie', lastName: 'Rousseau', jobTitle: 'Responsable Épicerie' },
    employees: [
      { firstName: 'Adrien', lastName: 'Guillot', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2019-05-01' },
      { firstName: 'Blandine', lastName: 'Lecomte', jobTitle: 'Employée libre-service', weeklyHours: 35, hireDate: '2020-07-01' },
      { firstName: 'Corentin', lastName: 'Dufour', jobTitle: 'Employé libre-service', weeklyHours: 39, hireDate: '2018-09-01' },
      { firstName: 'Diana', lastName: 'Breton', jobTitle: 'Employée libre-service', weeklyHours: 30, hireDate: '2022-11-01' },
      { firstName: 'Emmanuel', lastName: 'Legrand', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2021-02-15' },
      { firstName: 'Françoise', lastName: 'Collet', jobTitle: 'Employée libre-service', weeklyHours: 32, hireDate: '2023-04-01' },
      { firstName: 'Gabriel', lastName: 'Meunier', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2020-12-01' },
      { firstName: 'Hortense', lastName: 'Rivière', jobTitle: 'Employée libre-service', weeklyHours: 35, hireDate: '2019-08-01' },
      { firstName: 'Igor', lastName: 'Dupuis', jobTitle: 'Cariste', weeklyHours: 39, hireDate: '2018-02-01' },
      { firstName: 'Justine', lastName: 'Aubert', jobTitle: 'Employée libre-service', weeklyHours: 30, hireDate: '2024-05-01' },
      { firstName: 'Kévin', lastName: 'Pichon', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2021-10-01' },
      { firstName: 'Laure', lastName: 'Gérard', jobTitle: 'Employée libre-service', weeklyHours: 32, hireDate: '2022-03-01' },
    ],
  },
  {
    name: 'Multimédia',
    color: '#8B5CF6',
    manager: { firstName: 'Karim', lastName: 'Benali', jobTitle: 'Responsable Multimédia' },
    employees: [
      { firstName: 'Alexis', lastName: 'Barbier', jobTitle: 'Vendeur multimédia', weeklyHours: 35, hireDate: '2020-04-01' },
      { firstName: 'Béatrice', lastName: 'Rolland', jobTitle: 'Vendeuse multimédia', weeklyHours: 35, hireDate: '2021-06-15' },
      { firstName: 'Cyril', lastName: 'Bouvier', jobTitle: 'Technicien SAV', weeklyHours: 35, hireDate: '2019-11-01' },
      { firstName: 'Dorothée', lastName: 'Arnaud', jobTitle: 'Vendeuse multimédia', weeklyHours: 32, hireDate: '2022-09-01' },
      { firstName: 'Étienne', lastName: 'Charpentier', jobTitle: 'Vendeur multimédia', weeklyHours: 39, hireDate: '2018-07-01' },
      { firstName: 'Fanny', lastName: 'Guérin', jobTitle: 'Vendeuse multimédia', weeklyHours: 30, hireDate: '2023-06-01' },
      { firstName: 'Guillaume', lastName: 'Lacroix', jobTitle: 'Vendeur multimédia', weeklyHours: 35, hireDate: '2021-01-15' },
    ],
  },
  {
    name: 'Hygiène',
    color: '#14B8A6',
    manager: { firstName: 'Christine', lastName: 'Lambert', jobTitle: 'Responsable Hygiène' },
    employees: [
      { firstName: 'Aurélien', lastName: 'Berger', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2020-02-01' },
      { firstName: 'Camille', lastName: 'Richard', jobTitle: 'Employée libre-service', weeklyHours: 35, hireDate: '2021-08-01' },
      { firstName: 'Damien', lastName: 'Muller', jobTitle: 'Employé libre-service', weeklyHours: 30, hireDate: '2022-04-01' },
      { firstName: 'Élodie', lastName: 'Schmitt', jobTitle: 'Employée libre-service', weeklyHours: 35, hireDate: '2019-12-01' },
      { firstName: 'Fabrice', lastName: 'Poulain', jobTitle: 'Employé libre-service', weeklyHours: 39, hireDate: '2018-08-01' },
      { firstName: 'Gisèle', lastName: 'Renard', jobTitle: 'Employée libre-service', weeklyHours: 32, hireDate: '2023-07-01' },
      { firstName: 'Hervé', lastName: 'Philippe', jobTitle: 'Employé libre-service', weeklyHours: 35, hireDate: '2020-11-01' },
      { firstName: 'Inès', lastName: 'David', jobTitle: 'Employée libre-service', weeklyHours: 30, hireDate: '2024-04-01' },
    ],
  },
  {
    name: 'Réception marchandises',
    color: '#F97316',
    manager: { firstName: 'Yannick', lastName: 'Moreau', jobTitle: 'Responsable Réception' },
    employees: [
      { firstName: 'Alain', lastName: 'Brun', jobTitle: 'Réceptionnaire', weeklyHours: 39, hireDate: '2019-02-01' },
      { firstName: 'Brigitte', lastName: 'Lejeune', jobTitle: 'Réceptionnaire', weeklyHours: 35, hireDate: '2020-05-01' },
      { firstName: 'Claude', lastName: 'Poirier', jobTitle: 'Cariste', weeklyHours: 39, hireDate: '2018-10-01' },
      { firstName: 'Dominique', lastName: 'Tanguy', jobTitle: 'Réceptionnaire', weeklyHours: 35, hireDate: '2021-07-01' },
      { firstName: 'Eugène', lastName: 'Coulon', jobTitle: 'Cariste', weeklyHours: 39, hireDate: '2019-09-01' },
      { firstName: 'Florence', lastName: 'Millet', jobTitle: 'Réceptionnaire', weeklyHours: 35, hireDate: '2022-02-01' },
    ],
  },
  {
    name: 'Boulangerie-Pâtisserie',
    color: '#A855F7',
    manager: { firstName: 'Isabelle', lastName: 'Petit', jobTitle: 'Responsable Boulangerie' },
    employees: [
      { firstName: 'André', lastName: 'Carpentier', jobTitle: 'Boulanger', weeklyHours: 39, hireDate: '2018-03-01' },
      { firstName: 'Bérangère', lastName: 'Vidal', jobTitle: 'Pâtissière', weeklyHours: 35, hireDate: '2019-10-01' },
      { firstName: 'Charles', lastName: 'Maillard', jobTitle: 'Boulanger', weeklyHours: 39, hireDate: '2020-06-01' },
      { firstName: 'Diane', lastName: 'Leclercq', jobTitle: 'Vendeuse boulangerie', weeklyHours: 30, hireDate: '2022-05-01' },
      { firstName: 'Edmond', lastName: 'Prévost', jobTitle: 'Boulanger', weeklyHours: 39, hireDate: '2018-12-01' },
      { firstName: 'Fleur', lastName: 'Baron', jobTitle: 'Pâtissière', weeklyHours: 35, hireDate: '2021-04-01' },
      { firstName: 'Gaston', lastName: 'Humbert', jobTitle: 'Boulanger', weeklyHours: 39, hireDate: '2019-06-01' },
      { firstName: 'Henriette', lastName: 'Jacquet', jobTitle: 'Vendeuse boulangerie', weeklyHours: 32, hireDate: '2023-02-01' },
      { firstName: 'Irène', lastName: 'Navarro', jobTitle: 'Pâtissière', weeklyHours: 35, hireDate: '2024-06-01' },
    ],
  },
  {
    name: 'Textile',
    color: '#EF4444',
    manager: { firstName: 'Sandrine', lastName: 'Girard', jobTitle: 'Responsable Textile' },
    employees: [
      { firstName: 'Arthur', lastName: 'Lemaire', jobTitle: 'Vendeur textile', weeklyHours: 35, hireDate: '2020-08-01' },
      { firstName: 'Bénédicte', lastName: 'Cordier', jobTitle: 'Vendeuse textile', weeklyHours: 35, hireDate: '2021-12-01' },
      { firstName: 'Clément', lastName: 'Royer', jobTitle: 'Vendeur textile', weeklyHours: 30, hireDate: '2022-10-01' },
      { firstName: 'Doriane', lastName: 'Maury', jobTitle: 'Vendeuse textile', weeklyHours: 32, hireDate: '2023-05-01' },
      { firstName: 'Erwan', lastName: 'Gilles', jobTitle: 'Vendeur textile', weeklyHours: 35, hireDate: '2019-04-01' },
      { firstName: 'Gaëlle', lastName: 'Ferreira', jobTitle: 'Vendeuse textile', weeklyHours: 35, hireDate: '2020-11-15' },
      { firstName: 'Hubert', lastName: 'Pascal', jobTitle: 'Vendeur textile', weeklyHours: 39, hireDate: '2018-06-01' },
    ],
  },
  {
    name: 'Caisses et Accueil',
    color: '#0EA5E9',
    manager: { firstName: 'Valérie', lastName: 'Dupont', jobTitle: 'Responsable Caisses' },
    employees: [
      { firstName: 'Amandine', lastName: 'Pons', jobTitle: 'Caissière', weeklyHours: 30, hireDate: '2020-01-01' },
      { firstName: 'Bastien', lastName: 'Rémy', jobTitle: 'Caissier', weeklyHours: 35, hireDate: '2021-03-15' },
      { firstName: 'Camille', lastName: 'Torres', jobTitle: 'Hôtesse d\'accueil', weeklyHours: 35, hireDate: '2019-09-01' },
      { firstName: 'Dylan', lastName: 'Faure', jobTitle: 'Caissier', weeklyHours: 30, hireDate: '2022-07-01' },
      { firstName: 'Eva', lastName: 'Brunet', jobTitle: 'Caissière', weeklyHours: 30, hireDate: '2023-08-01' },
      { firstName: 'Florent', lastName: 'Delorme', jobTitle: 'Caissier', weeklyHours: 35, hireDate: '2020-04-15' },
      { firstName: 'Gaëtane', lastName: 'Blanchet', jobTitle: 'Caissière', weeklyHours: 30, hireDate: '2021-10-01' },
      { firstName: 'Harold', lastName: 'Étienne', jobTitle: 'Agent d\'accueil', weeklyHours: 35, hireDate: '2019-05-01' },
      { firstName: 'Iris', lastName: 'Monnier', jobTitle: 'Caissière', weeklyHours: 32, hireDate: '2022-12-01' },
      { firstName: 'Joël', lastName: 'Charrier', jobTitle: 'Caissier', weeklyHours: 30, hireDate: '2023-11-01' },
      { firstName: 'Katia', lastName: 'Seguin', jobTitle: 'Caissière', weeklyHours: 30, hireDate: '2024-01-15' },
      { firstName: 'Ludovic', lastName: 'Allard', jobTitle: 'Caissier', weeklyHours: 35, hireDate: '2020-07-01' },
      { firstName: 'Mélanie', lastName: 'Bouchet', jobTitle: 'Caissière', weeklyHours: 30, hireDate: '2021-06-01' },
      { firstName: 'Nicolas', lastName: 'Lemoine', jobTitle: 'Agent d\'accueil', weeklyHours: 35, hireDate: '2019-11-01' },
      { firstName: 'Ophélie', lastName: 'Joubert', jobTitle: 'Caissière', weeklyHours: 32, hireDate: '2022-09-15' },
    ],
  },
  {
    name: 'Comptabilité',
    color: '#10B981',
    manager: { firstName: 'François', lastName: 'Leroy', jobTitle: 'Responsable Comptabilité' },
    employees: [
      { firstName: 'Audrey', lastName: 'Colas', jobTitle: 'Comptable', weeklyHours: 35, hireDate: '2019-01-01' },
      { firstName: 'Bernard', lastName: 'Tessier', jobTitle: 'Comptable', weeklyHours: 35, hireDate: '2020-09-01' },
      { firstName: 'Corinne', lastName: 'Marty', jobTitle: 'Aide-comptable', weeklyHours: 32, hireDate: '2022-01-01' },
      { firstName: 'Didier', lastName: 'Laurent', jobTitle: 'Comptable', weeklyHours: 39, hireDate: '2018-01-15' },
      { firstName: 'Estelle', lastName: 'Noel', jobTitle: 'Aide-comptable', weeklyHours: 30, hireDate: '2023-03-15' },
    ],
  },
]

// Créneaux typiques grande distribution
export const SHIFT_PATTERNS = {
  matin: { start: '06:00', end: '14:00' },
  journee: { start: '09:00', end: '17:00' },
  apresMidi: { start: '13:00', end: '21:00' },
  miJournee: { start: '08:00', end: '16:00' },
} as const

// Données congés
export interface LeaveDef {
  teamIndex: number
  employeeIndex: number // -1 = manager
  type: 'PAID_LEAVE' | 'SICK_LEAVE' | 'RTT' | 'FAMILY_EVENT' | 'OTHER'
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  startDate: string
  endDate: string
  days: number
  reason: string
  reviewComment?: string
}

export const LEAVE_REQUESTS: LeaveDef[] = [
  // PAID_LEAVE APPROVED (8)
  { teamIndex: 0, employeeIndex: 2, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-09', endDate: '2026-03-13', days: 5, reason: 'Vacances familiales', reviewComment: 'Approuvé, bon repos.' },
  { teamIndex: 4, employeeIndex: 3, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-16', endDate: '2026-03-20', days: 5, reason: 'Voyage personnel', reviewComment: 'Approuvé.' },
  { teamIndex: 8, employeeIndex: 1, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-04', endDate: '2026-03-06', days: 3, reason: 'Congés personnels', reviewComment: 'OK.' },
  { teamIndex: 10, employeeIndex: 5, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-11', endDate: '2026-03-13', days: 3, reason: 'Week-end prolongé', reviewComment: 'Approuvé.' },
  { teamIndex: 6, employeeIndex: 4, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-09', endDate: '2026-03-10', days: 2, reason: 'Déménagement', reviewComment: 'Approuvé.' },
  { teamIndex: 3, employeeIndex: 7, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-16', endDate: '2026-03-18', days: 3, reason: 'Mariage ami', reviewComment: 'Approuvé.' },
  { teamIndex: 9, employeeIndex: 2, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-05', endDate: '2026-03-06', days: 2, reason: 'Rendez-vous administratif', reviewComment: 'OK.' },
  { teamIndex: 11, employeeIndex: 1, type: 'PAID_LEAVE', status: 'APPROVED', startDate: '2026-03-12', endDate: '2026-03-13', days: 2, reason: 'Congé personnel', reviewComment: 'Approuvé.' },
  // SICK_LEAVE APPROVED (4)
  { teamIndex: 1, employeeIndex: 0, type: 'SICK_LEAVE', status: 'APPROVED', startDate: '2026-03-03', endDate: '2026-03-05', days: 3, reason: 'Grippe', reviewComment: 'Bon rétablissement.' },
  { teamIndex: 5, employeeIndex: 2, type: 'SICK_LEAVE', status: 'APPROVED', startDate: '2026-03-10', endDate: '2026-03-11', days: 2, reason: 'Gastro-entérite', reviewComment: 'Approuvé.' },
  { teamIndex: 7, employeeIndex: 0, type: 'SICK_LEAVE', status: 'APPROVED', startDate: '2026-03-06', endDate: '2026-03-06', days: 1, reason: 'Migraine', reviewComment: 'Approuvé.' },
  { teamIndex: 10, employeeIndex: 8, type: 'SICK_LEAVE', status: 'APPROVED', startDate: '2026-03-13', endDate: '2026-03-14', days: 2, reason: 'Angine', reviewComment: 'Bon rétablissement.' },
  // RTT APPROVED (3)
  { teamIndex: 2, employeeIndex: 0, type: 'RTT', status: 'APPROVED', startDate: '2026-03-06', endDate: '2026-03-06', days: 1, reason: 'RTT mars', reviewComment: 'OK.' },
  { teamIndex: 4, employeeIndex: 6, type: 'RTT', status: 'APPROVED', startDate: '2026-03-13', endDate: '2026-03-13', days: 1, reason: 'RTT', reviewComment: 'Approuvé.' },
  { teamIndex: 11, employeeIndex: 3, type: 'RTT', status: 'APPROVED', startDate: '2026-03-10', endDate: '2026-03-10', days: 1, reason: 'RTT mars', reviewComment: 'OK.' },
  // PENDING (4)
  { teamIndex: 0, employeeIndex: 4, type: 'PAID_LEAVE', status: 'PENDING', startDate: '2026-03-23', endDate: '2026-03-27', days: 5, reason: 'Vacances Pâques' },
  { teamIndex: 3, employeeIndex: 1, type: 'RTT', status: 'PENDING', startDate: '2026-03-20', endDate: '2026-03-20', days: 1, reason: 'RTT' },
  { teamIndex: 6, employeeIndex: 6, type: 'PAID_LEAVE', status: 'PENDING', startDate: '2026-03-30', endDate: '2026-04-03', days: 5, reason: 'Vacances printemps' },
  { teamIndex: 8, employeeIndex: 5, type: 'PAID_LEAVE', status: 'PENDING', startDate: '2026-03-19', endDate: '2026-03-20', days: 2, reason: 'Pont week-end' },
  // OTHER (Formation) (3)
  { teamIndex: 5, employeeIndex: 0, type: 'OTHER', status: 'APPROVED', startDate: '2026-03-16', endDate: '2026-03-17', days: 2, reason: 'Formation sécurité incendie', reviewComment: 'Formation obligatoire.' },
  { teamIndex: 10, employeeIndex: 2, type: 'OTHER', status: 'APPROVED', startDate: '2026-03-09', endDate: '2026-03-09', days: 1, reason: 'Formation accueil client', reviewComment: 'Approuvé.' },
  { teamIndex: 7, employeeIndex: 3, type: 'OTHER', status: 'PENDING', startDate: '2026-03-23', endDate: '2026-03-24', days: 2, reason: 'Formation CACES' },
  // FAMILY_EVENT (2)
  { teamIndex: 9, employeeIndex: 5, type: 'FAMILY_EVENT', status: 'APPROVED', startDate: '2026-03-07', endDate: '2026-03-07', days: 1, reason: 'Naissance neveu', reviewComment: 'Félicitations !' },
  { teamIndex: 4, employeeIndex: 9, type: 'FAMILY_EVENT', status: 'PENDING', startDate: '2026-03-21', endDate: '2026-03-21', days: 1, reason: 'Mariage cousin' },
]

// Incidents
export interface IncidentDef {
  teamIndex: number
  employeeIndex: number // -1 = manager
  authorTeamIndex: number
  authorIsManager: boolean
  authorIsDirector?: boolean
  title: string
  content: string
  date: string
  visibility: 'DIRECTOR_ONLY' | 'MANAGER_DIRECTOR' | 'ALL'
}

export const INCIDENTS: IncidentDef[] = [
  { teamIndex: 0, employeeIndex: 3, authorTeamIndex: 0, authorIsManager: true, title: 'Retard répété', content: 'Troisième retard ce mois-ci sans justificatif. Arrivée à 7h15 au lieu de 6h00. Convocation prévue.', date: '2026-02-24', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 10, employeeIndex: 0, authorTeamIndex: 10, authorIsManager: true, title: 'Erreur de caisse', content: 'Écart de caisse de 47,50€ constaté lors de la fermeture. Vérification des bandes en cours.', date: '2026-02-25', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 4, employeeIndex: 2, authorTeamIndex: 4, authorIsManager: true, title: 'Absence non justifiée', content: 'Absence le 20/02 sans prévenir ni fournir de justificatif. Rappel à l\'ordre effectué.', date: '2026-02-21', visibility: 'DIRECTOR_ONLY' },
  { teamIndex: 8, employeeIndex: 0, authorTeamIndex: 8, authorIsManager: true, title: 'Non-respect consignes hygiène', content: 'Port des gants non respecté lors de la manipulation des pâtons. Rappel des normes HACCP effectué.', date: '2026-02-26', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 3, employeeIndex: 4, authorTeamIndex: 3, authorIsManager: true, title: 'Conflit entre collègues', content: 'Altercation verbale avec un collègue en rayon. Les deux employés ont été reçus séparément. Médiation prévue.', date: '2026-02-23', visibility: 'DIRECTOR_ONLY' },
  { teamIndex: 6, employeeIndex: 1, authorTeamIndex: 6, authorIsManager: true, title: 'Casse de matériel', content: 'Bris d\'un transpalette électrique par mauvaise manipulation. Rapport de maintenance rédigé.', date: '2026-02-22', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 5, employeeIndex: 4, authorTeamIndex: 5, authorIsManager: true, title: 'Retard ouverture rayon', content: 'Rayon multimédia non prêt à l\'ouverture du magasin (9h00). Mise en place terminée à 9h45.', date: '2026-02-25', visibility: 'ALL' },
  { teamIndex: 10, employeeIndex: 9, authorTeamIndex: 10, authorIsManager: true, title: 'Impolitesse client', content: 'Comportement inapproprié signalé par un client. L\'employé a répondu sèchement à une réclamation.', date: '2026-02-24', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 7, employeeIndex: 2, authorTeamIndex: 7, authorIsManager: true, title: 'Erreur de stock', content: 'Erreur de saisie sur 3 palettes lors de la réception. Inventaire corrigé manuellement.', date: '2026-02-20', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 0, employeeIndex: 5, authorTeamIndex: -1, authorIsManager: false, authorIsDirector: true, title: 'Comportement exemplaire', content: 'Intervention remarquable auprès d\'un client en difficulté. Félicitations du directeur.', date: '2026-02-26', visibility: 'ALL' },
  { teamIndex: 9, employeeIndex: 3, authorTeamIndex: 9, authorIsManager: true, title: 'Non-respect du planning', content: 'Départ anticipé de 45 minutes sans autorisation le 19/02. Discussion effectuée.', date: '2026-02-20', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 4, employeeIndex: 8, authorTeamIndex: -1, authorIsManager: false, authorIsDirector: true, title: 'Problème de sécurité', content: 'Non-respect des consignes de sécurité lors de la conduite du chariot élévateur. Formation de rappel imposée.', date: '2026-02-19', visibility: 'DIRECTOR_ONLY' },
  { teamIndex: 10, employeeIndex: 3, authorTeamIndex: 10, authorIsManager: true, title: 'Absence caisse', content: 'A quitté sa caisse 20 minutes sans prévenir pendant les heures de pointe. Rappel des procédures.', date: '2026-02-27', visibility: 'MANAGER_DIRECTOR' },
  { teamIndex: 3, employeeIndex: 8, authorTeamIndex: 3, authorIsManager: true, title: 'Retard livraison rayon', content: 'Retard dans la mise en rayon des nouvelles références. Stock bloqué en réserve pendant 2 jours.', date: '2026-02-18', visibility: 'ALL' },
  { teamIndex: 6, employeeIndex: 5, authorTeamIndex: 6, authorIsManager: true, title: 'Tenue non conforme', content: 'Port de la tenue réglementaire non respecté (chaussures de sécurité manquantes). Rappel effectué.', date: '2026-02-25', visibility: 'ALL' },
  { teamIndex: 8, employeeIndex: 6, authorTeamIndex: -1, authorIsManager: false, authorIsDirector: true, title: 'Excellence produit', content: 'Création d\'une nouvelle recette de pain spécial très appréciée des clients. À valoriser.', date: '2026-02-27', visibility: 'ALL' },
]

// Notes personnelles
export interface PersonalTaskDef {
  userType: 'director' | 'manager' | 'employee'
  teamIndex?: number // pour manager/employee
  employeeIndex?: number // pour employee
  title: string
  description?: string
  dueDate?: string
  completed: boolean
  order: number
}

export const PERSONAL_TASKS: PersonalTaskDef[] = [
  // Directeur John Doe
  { userType: 'director', title: 'Bilan mensuel février', description: 'Préparer le bilan des ventes et du CA de février 2026', dueDate: '2026-03-05', completed: false, order: 0 },
  { userType: 'director', title: 'Entretiens annuels managers', description: 'Planifier les entretiens annuels avec les 12 responsables de rayon', dueDate: '2026-03-15', completed: false, order: 1 },
  { userType: 'director', title: 'Négociation bail commercial', description: 'Rendez-vous avec le bailleur pour le renouvellement du bail', dueDate: '2026-03-20', completed: false, order: 2 },
  { userType: 'director', title: 'Réunion comité de direction', description: 'Ordre du jour : résultats Q1, projets Q2, recrutements', dueDate: '2026-03-10', completed: false, order: 3 },
  { userType: 'director', title: 'Validation commande Pâques', description: 'Valider les volumes de commande pour les produits de Pâques', dueDate: '2026-03-01', completed: true, order: 4 },
  // Managers
  { userType: 'manager', teamIndex: 0, title: 'Préparer planning semaine prochaine', description: 'Mettre à jour le planning du rayon Bazar pour la semaine du 17 mars', dueDate: '2026-03-14', completed: false, order: 0 },
  { userType: 'manager', teamIndex: 0, title: 'Commander uniformes nouveaux employés', dueDate: '2026-03-07', completed: true, order: 1 },
  { userType: 'manager', teamIndex: 4, title: 'Inventaire rayon Épicerie', description: 'Inventaire trimestriel prévu fin mars', dueDate: '2026-03-28', completed: false, order: 0 },
  { userType: 'manager', teamIndex: 4, title: 'Réunion fournisseur café', dueDate: '2026-03-12', completed: false, order: 1 },
  { userType: 'manager', teamIndex: 8, title: 'Commande farine bio', description: 'Nouvelle gamme bio à intégrer au rayon boulangerie', dueDate: '2026-03-10', completed: false, order: 0 },
  { userType: 'manager', teamIndex: 10, title: 'Formation nouvelles caisses', description: 'Organiser la formation sur le nouveau système de caisse', dueDate: '2026-03-15', completed: false, order: 0 },
  { userType: 'manager', teamIndex: 10, title: 'Planning caisses week-end', dueDate: '2026-03-07', completed: true, order: 1 },
  { userType: 'manager', teamIndex: 3, title: 'Réorganisation rayon Liquide', description: 'Optimiser l\'implantation du rayon suite à la nouvelle gamme', dueDate: '2026-03-18', completed: false, order: 0 },
  { userType: 'manager', teamIndex: 5, title: 'Mise à jour étiquettes prix', description: 'Vérifier et mettre à jour les étiquettes suite aux changements de prix', dueDate: '2026-03-05', completed: true, order: 0 },
  { userType: 'manager', teamIndex: 7, title: 'Maintenance quai de réception', description: 'Planifier la maintenance du rideau métallique du quai 2', dueDate: '2026-03-20', completed: false, order: 0 },
  // Employés
  { userType: 'employee', teamIndex: 0, employeeIndex: 0, title: 'Demander changement horaire', description: 'Demander à passer en horaire après-midi la semaine du 17 mars', dueDate: '2026-03-10', completed: false, order: 0 },
  { userType: 'employee', teamIndex: 0, employeeIndex: 0, title: 'Récupérer attestation employeur', dueDate: '2026-03-08', completed: false, order: 1 },
  { userType: 'employee', teamIndex: 10, employeeIndex: 1, title: 'Poser congés été', description: 'Ne pas oublier de poser les congés pour juillet', dueDate: '2026-04-30', completed: false, order: 0 },
  { userType: 'employee', teamIndex: 4, employeeIndex: 0, title: 'Vérifier planning formation', dueDate: '2026-03-06', completed: true, order: 0 },
  { userType: 'employee', teamIndex: 8, employeeIndex: 2, title: 'Préparer concours pain', description: 'S\'inscrire au concours du meilleur boulanger régional', dueDate: '2026-03-25', completed: false, order: 0 },
  { userType: 'employee', teamIndex: 3, employeeIndex: 2, title: 'Signaler palette abîmée', description: 'Palette de sodas abîmée à signaler au responsable', completed: true, order: 0 },
  { userType: 'employee', teamIndex: 6, employeeIndex: 2, title: 'Renouveler certificat CACES', description: 'Certificat CACES expire en avril, prévoir renouvellement', dueDate: '2026-04-15', completed: false, order: 0 },
  { userType: 'employee', teamIndex: 9, employeeIndex: 0, title: 'Mettre à jour CV interne', completed: true, order: 0 },
  { userType: 'employee', teamIndex: 5, employeeIndex: 3, title: 'Préparer réunion SAV', description: 'Lister les retours produits du mois pour la réunion SAV', dueDate: '2026-03-08', completed: false, order: 0 },
]

// Notifications
export interface NotificationDef {
  userType: 'director' | 'manager' | 'employee'
  teamIndex?: number
  employeeIndex?: number
  title: string
  message: string
  type: 'PLANNING' | 'LEAVE' | 'INCIDENT' | 'INFO' | 'SUCCESS' | 'WARNING' | 'SYSTEM'
  isRead: boolean
  createdAt: string
}

export const NOTIFICATIONS: NotificationDef[] = [
  // Planning
  { userType: 'employee', teamIndex: 0, employeeIndex: 0, title: 'Nouveau planning assigné', message: 'Votre planning pour la semaine du 3 mars a été publié.', type: 'PLANNING', isRead: false, createdAt: '2026-02-27T08:00:00Z' },
  { userType: 'employee', teamIndex: 0, employeeIndex: 2, title: 'Modification de planning', message: 'Votre créneau du 5 mars a été modifié : passage en horaire après-midi.', type: 'PLANNING', isRead: true, createdAt: '2026-02-26T10:00:00Z' },
  { userType: 'employee', teamIndex: 10, employeeIndex: 3, title: 'Planning publié', message: 'Le planning des caisses pour la semaine du 10 mars est disponible.', type: 'PLANNING', isRead: false, createdAt: '2026-02-27T09:00:00Z' },
  { userType: 'employee', teamIndex: 8, employeeIndex: 0, title: 'Rappel planning', message: 'Rappel : début de service demain à 06h00 (Boulangerie).', type: 'PLANNING', isRead: false, createdAt: '2026-02-27T18:00:00Z' },
  // Leave
  { userType: 'manager', teamIndex: 0, title: 'Nouvelle demande de congé', message: 'Émilie Renaud a déposé une demande de congés du 23 au 27 mars.', type: 'LEAVE', isRead: false, createdAt: '2026-02-27T11:00:00Z' },
  { userType: 'employee', teamIndex: 4, employeeIndex: 3, title: 'Congé approuvé', message: 'Votre demande de congés du 16 au 20 mars a été approuvée.', type: 'LEAVE', isRead: true, createdAt: '2026-02-25T14:00:00Z' },
  { userType: 'employee', teamIndex: 0, employeeIndex: 2, title: 'Congé approuvé', message: 'Votre demande de congés du 9 au 13 mars a été approuvée.', type: 'LEAVE', isRead: true, createdAt: '2026-02-24T16:00:00Z' },
  { userType: 'director', title: 'Demande de congé en attente', message: '4 demandes de congés sont en attente de validation.', type: 'LEAVE', isRead: false, createdAt: '2026-02-27T08:30:00Z' },
  // Incident
  { userType: 'director', title: 'Nouvel incident signalé', message: 'Un incident a été signalé en caisse : erreur de caisse de 47,50€.', type: 'INCIDENT', isRead: false, createdAt: '2026-02-25T17:00:00Z' },
  { userType: 'manager', teamIndex: 4, title: 'Incident résolu', message: 'L\'incident d\'absence non justifiée de Corentin Dufour a été traité.', type: 'INCIDENT', isRead: true, createdAt: '2026-02-22T10:00:00Z' },
  // Info / System
  { userType: 'director', title: 'Rapport mensuel disponible', message: 'Le rapport mensuel de février 2026 est prêt à être consulté.', type: 'INFO', isRead: false, createdAt: '2026-02-27T07:00:00Z' },
  { userType: 'manager', teamIndex: 10, title: 'Mise à jour système', message: 'Le système de caisse sera mis à jour le 15 mars de 22h à 6h.', type: 'SYSTEM', isRead: false, createdAt: '2026-02-26T15:00:00Z' },
  { userType: 'manager', teamIndex: 8, title: 'Alerte stock', message: 'Stock de farine T65 bas. Commande recommandée.', type: 'WARNING', isRead: false, createdAt: '2026-02-27T06:30:00Z' },
  // Success
  { userType: 'director', title: 'Objectif atteint', message: 'Le CA de février dépasse l\'objectif de 3,2%. Félicitations à toutes les équipes.', type: 'SUCCESS', isRead: true, createdAt: '2026-02-27T12:00:00Z' },
  { userType: 'manager', teamIndex: 5, title: 'Formation complétée', message: 'Étienne Charpentier a terminé sa formation sécurité avec succès.', type: 'SUCCESS', isRead: true, createdAt: '2026-02-20T16:00:00Z' },
  // More diverse
  { userType: 'employee', teamIndex: 3, employeeIndex: 0, title: 'Bienvenue', message: 'Bienvenue sur SmartPlanning ! Consultez votre planning dans l\'onglet Planning.', type: 'INFO', isRead: true, createdAt: '2026-01-15T09:00:00Z' },
  { userType: 'employee', teamIndex: 6, employeeIndex: 2, title: 'Rappel formation', message: 'Rappel : votre certificat CACES expire dans 45 jours.', type: 'WARNING', isRead: false, createdAt: '2026-02-27T10:00:00Z' },
  { userType: 'manager', teamIndex: 3, title: 'Nouveau employé', message: 'Julie Moulin a rejoint l\'équipe Liquide.', type: 'INFO', isRead: true, createdAt: '2026-02-15T09:00:00Z' },
  { userType: 'employee', teamIndex: 9, employeeIndex: 1, title: 'Planning modifié', message: 'Votre planning du 12 mars a été modifié suite à un échange avec un collègue.', type: 'PLANNING', isRead: false, createdAt: '2026-02-27T14:00:00Z' },
  { userType: 'manager', teamIndex: 2, title: 'Rappel entretiens', message: 'Les entretiens annuels doivent être planifiés avant le 31 mars.', type: 'INFO', isRead: false, createdAt: '2026-02-26T08:00:00Z' },
  { userType: 'employee', teamIndex: 10, employeeIndex: 6, title: 'Congé approuvé', message: 'Votre RTT du 10 mars a été approuvé.', type: 'LEAVE', isRead: true, createdAt: '2026-02-25T11:00:00Z' },
  { userType: 'employee', teamIndex: 5, employeeIndex: 5, title: 'Nouveau planning', message: 'Votre planning pour la semaine du 10 mars est disponible.', type: 'PLANNING', isRead: false, createdAt: '2026-02-27T08:15:00Z' },
  { userType: 'manager', teamIndex: 6, title: 'Stock critique', message: 'Alerte : stock de produits d\'entretien critique. Commande urgente recommandée.', type: 'WARNING', isRead: false, createdAt: '2026-02-27T07:30:00Z' },
  { userType: 'employee', teamIndex: 4, employeeIndex: 5, title: 'Bienvenue', message: 'Bienvenue dans l\'équipe Épicerie ! N\'hésitez pas à consulter vos plannings.', type: 'INFO', isRead: true, createdAt: '2026-02-01T09:00:00Z' },
  { userType: 'director', title: 'Audit prévu', message: 'Un audit hygiène et sécurité est prévu le 25 mars.', type: 'WARNING', isRead: false, createdAt: '2026-02-26T11:00:00Z' },
  { userType: 'employee', teamIndex: 0, employeeIndex: 6, title: 'Confirmation horaire', message: 'Votre demande de changement d\'horaire a été prise en compte pour la semaine du 10 mars.', type: 'SUCCESS', isRead: false, createdAt: '2026-02-27T13:00:00Z' },
  { userType: 'manager', teamIndex: 9, title: 'Rapport inventaire', message: 'L\'inventaire du rayon Textile est à finaliser avant le 5 mars.', type: 'INFO', isRead: false, createdAt: '2026-02-26T14:00:00Z' },
  { userType: 'employee', teamIndex: 8, employeeIndex: 3, title: 'Formation programmée', message: 'Vous êtes inscrite à la formation hygiène alimentaire du 15 mars.', type: 'INFO', isRead: false, createdAt: '2026-02-27T09:30:00Z' },
  { userType: 'employee', teamIndex: 10, employeeIndex: 11, title: 'Changement caisse', message: 'Vous êtes affecté à la caisse 7 pour la semaine du 3 mars.', type: 'PLANNING', isRead: false, createdAt: '2026-02-27T08:45:00Z' },
  { userType: 'manager', teamIndex: 11, title: 'Clôture mensuelle', message: 'Rappel : clôture comptable de février le 3 mars au plus tard.', type: 'WARNING', isRead: false, createdAt: '2026-02-27T07:00:00Z' },
  { userType: 'employee', teamIndex: 7, employeeIndex: 4, title: 'Planning validé', message: 'Votre planning de la semaine prochaine est confirmé.', type: 'SUCCESS', isRead: true, createdAt: '2026-02-26T16:00:00Z' },
]
