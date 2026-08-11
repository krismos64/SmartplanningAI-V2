/**
 * commerce.ts - Contenu de la page /solutions/planning-commerce
 *
 * @description Page secteur commerce et retail : contenu rédigé pour les
 * requêtes « logiciel planning commerce / boutique » et pour être citable
 * par les moteurs génératifs (réponse directe, FAQ, chiffres datés).
 *
 * @ticket SP-554
 */

import type { SectorData } from './types'

export const commerceSector: SectorData = {
  slug: 'planning-commerce',
  name: 'Commerce et retail',
  shortName: 'commerce',
  badge: 'Commerce & retail',

  metaTitle: 'Logiciel planning magasin à 2,90 € par mois',
  metaDescription:
    'Ouverture 7j/7, temps partiels, samedis répartis équitablement : gérez le planning de votre boutique sans tableur. 2,90 € HT par employé, essai gratuit 21 jours.',
  keywords: [
    'logiciel planning commerce',
    'planning équipe boutique',
    'logiciel planning magasin',
    'planning vendeurs retail',
    'rotation samedis commerce',
    'logiciel horaires magasin',
    'planning temps partiel commerce',
    'planning multi-magasins',
    'logiciel RH commerce',
    'planning franchise retail',
  ],

  h1: 'Un logiciel de planning pensé pour le',
  h1Highlight: 'commerce et le retail',

  directAnswer:
    "SmartPlanning permet aux boutiques, franchises et enseignes multi-magasins de construire leurs plannings en quelques minutes : amplitude d'ouverture 7 jours sur 7, temps partiels multiples, rotation équitable des samedis et renforts saisonniers. Chaque vendeur consulte ses horaires en ligne et reçoit une notification à chaque changement. Le tarif est de 2,90 € HT par employé et par mois, toutes fonctionnalités incluses, avec un essai gratuit de 21 jours sans carte bancaire.",

  intro: [
    "Dans le commerce, le planning doit concilier des contraintes qui s'empilent : une amplitude d'ouverture large, souvent 7 jours sur 7, des équipes composées de temps pleins, de temps partiels et de contrats étudiants, et une activité qui explose aux soldes, aux fêtes et pendant les opérations commerciales. Ajouter à cela l'équité entre vendeurs sur les samedis et les dimanches travaillés, et le tableur hebdomadaire devient vite une source d'erreurs et de frustrations.",
    "SmartPlanning centralise tout : le responsable de magasin construit les horaires par glisser-déposer en s'appuyant sur des semaines types, chaque vendeur consulte son planning à jour depuis son téléphone, et le directeur de réseau garde une vue d'ensemble par équipe et par magasin. Congés, messagerie interne et exports pour le back-office sont intégrés au même outil.",
  ],

  challenges: [
    {
      icon: 'sun',
      title: "Amplitude d'ouverture 7j/7",
      description:
        "Ouverture continue du lundi au dimanche, nocturnes et jours fériés : couvrir toute l'amplitude sans dépasser les heures contractuelles de chacun relève du casse-tête hebdomadaire.",
    },
    {
      icon: 'clock',
      title: 'Temps partiels multiples',
      description:
        'Contrats 10h, 25h, 35h, étudiants disponibles uniquement le week-end : chaque vendeur a ses propres contraintes horaires que le planning doit respecter semaine après semaine.',
    },
    {
      icon: 'users',
      title: 'Équité des samedis et dimanches',
      description:
        "Le samedi est le jour le plus chargé et le moins désiré. Sans rotation visible et traçable, les tensions d'équipe s'installent et les accusations de favoritisme aussi.",
    },
    {
      icon: 'alert',
      title: 'Pics saisonniers',
      description:
        "Soldes, fêtes de fin d'année, rentrée : l'activité peut doubler en quelques jours et impose des renforts temporaires à intégrer puis à sortir du planning proprement.",
    },
  ],

  solutions: [
    {
      icon: 'store',
      feature: 'Multi-équipes et multi-magasins',
      benefit:
        'Organisez chaque magasin en équipes (caisse, rayon, réserve) avec un nombre illimité. Le directeur de réseau visualise tous les magasins, chaque responsable gère le sien.',
    },
    {
      icon: 'calendar',
      feature: 'Semaines types et récurrence',
      benefit:
        "Construisez une semaine type par glisser-déposer puis dupliquez-la. Les ajustements de dernière minute se font en un geste, sans repartir d'une page blanche.",
    },
    {
      icon: 'users',
      feature: 'Tableaux de bord par rôle',
      benefit:
        "Directeur, responsable de magasin et vendeur ont chacun leur espace : vision réseau pour l'un, gestion d'équipe pour l'autre, horaires personnels pour le dernier.",
    },
    {
      icon: 'smartphone',
      feature: 'Consultation mobile pour les vendeurs',
      benefit:
        'Chaque vendeur, y compris les contrats étudiants, consulte ses horaires à jour depuis son téléphone, sans application à installer.',
    },
    {
      icon: 'bell',
      feature: 'Notifications à chaque changement',
      benefit:
        'Toute modification de planning déclenche une notification email automatique : fini les captures de tableur envoyées sur les messageries personnelles.',
    },
    {
      icon: 'user-plus',
      feature: 'Renforts saisonniers en un import',
      benefit:
        "Ajoutez les renforts des soldes via import CSV ou Excel. La facturation per-seat s'ajuste automatiquement à l'embauche comme au départ.",
    },
  ],

  pricingExample: {
    headcount: 8,
    teamLabel: 'une boutique de 8 salariés',
    description:
      'Caisse, rayon et réserve compris. Toutes les fonctionnalités incluses, sans engagement, avec un essai gratuit de 21 jours sans carte bancaire.',
  },

  faqs: [
    {
      question: 'Comment répartir équitablement les samedis entre vendeurs ?',
      answer:
        "Le planning hebdomadaire donne une vision claire des samedis travaillés par chacun : la vue par équipe permet de constater la rotation sur plusieurs semaines et d'arbitrer en toute transparence. Chaque vendeur voit son propre historique de créneaux dans son espace personnel.",
    },
    {
      question: 'Peut-on gérer plusieurs magasins dans SmartPlanning ?',
      answer:
        "Oui. Chaque magasin s'organise en une ou plusieurs équipes, sans limite de nombre. Le directeur de réseau accède à l'ensemble des plannings et des demandes de congés, tandis que chaque responsable de magasin gère uniquement son périmètre.",
    },
    {
      question: 'Comment gérer les temps partiels et les contrats étudiants ?',
      answer:
        'Chaque employé a son propre profil et ses créneaux se planifient librement selon son contrat : 10h le week-end pour un étudiant, 25h réparties sur quatre jours pour un temps partiel. Les exports Excel récapitulent les heures planifiées par personne pour contrôler le respect des volumes contractuels.',
    },
    {
      question: 'Un vendeur est-il prévenu quand son planning change ?',
      answer:
        "Oui, automatiquement. Toute création, modification ou suppression de créneau déclenche une notification par email au vendeur concerné. Plus besoin de renvoyer le tableur à toute l'équipe à chaque ajustement.",
    },
    {
      question: 'Combien coûte SmartPlanning pour une boutique de 8 salariés ?',
      answer:
        '23,20 € HT par mois, soit 8 employés à 2,90 € HT chacun. Toutes les fonctionnalités sont incluses : plannings, congés, messagerie, exports et support. Sans engagement, avec un essai gratuit de 21 jours sans carte bancaire.',
    },
    {
      question: 'Comment absorber les pics des soldes et des fêtes ?',
      answer:
        "Importez les renforts temporaires en une fois via un fichier CSV ou Excel, planifiez-les sur la période concernée, puis désactivez-les à la fin du pic. La facturation per-seat s'ajuste automatiquement dans les deux sens, vous ne payez que l'effectif réel du mois.",
    },
  ],

  lastModified: '2026-08-11',
}
