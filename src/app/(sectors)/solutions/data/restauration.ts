/**
 * restauration.ts - Contenu de la page /solutions/planning-restaurant
 *
 * @description Page secteur restauration et hôtellerie : contenu rédigé
 * pour les requêtes « logiciel planning restaurant » et pour être citable
 * par les moteurs génératifs (réponse directe, FAQ, chiffres datés).
 *
 * @ticket SP-553
 */

import type { SectorData } from './types'

export const restaurationSector: SectorData = {
  slug: 'planning-restaurant',
  name: 'Restauration et hôtellerie',
  shortName: 'restauration',
  badge: 'Restauration & hôtellerie',

  metaTitle: 'Logiciel planning restauration à 2,90 €',
  metaDescription:
    'Coupures, extras, remplacements de dernière minute : faites le planning de votre brigade en 10 minutes. 2,90 € HT par employé, essai 21 jours sans carte bancaire.',
  keywords: [
    'logiciel planning restaurant',
    'planning équipe restauration',
    'logiciel planning hôtel',
    'gestion planning brigade',
    'planning en coupure restaurant',
    'logiciel horaires restauration',
    'gestion congés saisonniers',
    'planning HCR',
    'logiciel RH restaurant',
    'planning salle cuisine',
  ],

  h1: 'Un logiciel de planning pensé pour la',
  h1Highlight: "restauration et l'hôtellerie",

  teaser:
    'Coupures du midi et du soir, extras, remplacements de dernière minute : construisez le planning de votre équipe en ligne et notifiez chaque changement automatiquement.',

  directAnswer:
    'SmartPlanning permet aux restaurants, bars et hôtels de construire leurs plannings de service en quelques minutes : shifts en coupure, rotations de week-end, remplacements de dernière minute et congés des saisonniers. Chaque employé consulte ses horaires en ligne et reçoit une notification à chaque changement. Le tarif est de 2,90 € HT par employé et par mois, toutes fonctionnalités incluses, avec un essai gratuit de 21 jours sans carte bancaire.',

  intro: [
    "En restauration comme en hôtellerie, le planning est un exercice permanent d'équilibriste. Les services du midi et du soir imposent des horaires en coupure, l'activité varie d'une semaine à l'autre selon les réservations et la saison, et une absence imprévue le samedi soir peut désorganiser toute la brigade. Résultat : beaucoup d'établissements passent encore des heures chaque semaine sur un tableur ou un planning papier, avec les erreurs et les tensions que cela génère.",
    "SmartPlanning remplace le tableur par un planning en ligne partagé : le gérant ou le chef de salle construit les horaires par glisser-déposer, les employés les consultent depuis leur téléphone et chaque modification est notifiée automatiquement. La gestion des congés, les échanges avec l'équipe et les exports pour l'affichage des horaires sont intégrés au même outil.",
  ],

  challenges: [
    {
      icon: 'clock',
      title: 'Horaires en coupure',
      description:
        "Service du midi, coupure, service du soir : chaque journée compte plusieurs créneaux par employé. Un planning en coupure mal communiqué, c'est du retard au démarrage du service et des heures mal comptées.",
    },
    {
      icon: 'users',
      title: 'Extras et saisonniers',
      description:
        "Le turnover et le recours aux extras imposent d'intégrer de nouveaux profils chaque mois, avec des contrats courts et des disponibilités changeantes qu'un tableur suit difficilement.",
    },
    {
      icon: 'alert',
      title: 'Remplacements de dernière minute',
      description:
        "Une absence le vendredi soir se gère dans l'urgence : trouver un remplaçant, prévenir l'équipe, mettre le planning à jour. Sans outil dédié, tout passe par des appels et des messages dispersés.",
    },
    {
      icon: 'scale',
      title: 'Conformité au droit du travail',
      description:
        'Repos hebdomadaire, durées maximales de travail, affichage des horaires : la convention collective HCR impose un suivi rigoureux que le planning doit refléter noir sur blanc.',
    },
  ],

  solutions: [
    {
      icon: 'calendar',
      feature: 'Plannings par service en glisser-déposer',
      benefit:
        'Construisez les horaires du midi et du soir en vue jour ou semaine, service par service. Un créneau se déplace ou se duplique en un geste, la récurrence gère les semaines types.',
    },
    {
      icon: 'smartphone',
      feature: 'Consultation mobile pour toute la brigade',
      benefit:
        'Chaque employé, extra compris, accède à son espace en ligne depuis son téléphone et voit toujours la dernière version de ses horaires.',
    },
    {
      icon: 'bell',
      feature: 'Notifications à chaque changement',
      benefit:
        'Toute modification de planning déclenche une notification email automatique : plus personne ne découvre son horaire en arrivant au service.',
    },
    {
      icon: 'message',
      feature: 'Messagerie interne pour les remplacements',
      benefit:
        "Un imprévu ? Prévenez l'équipe en un message de groupe, ajustez le créneau par glisser-déposer et laissez la notification faire le reste.",
    },
    {
      icon: 'file-down',
      feature: "Exports PDF pour l'affichage des horaires",
      benefit:
        "Imprimez le planning hebdomadaire filtré par équipe pour l'affichage en salle ou en cuisine, et utilisez les exports Excel pour préparer la paie.",
    },
    {
      icon: 'user-plus',
      feature: 'Import des saisonniers en un fichier',
      benefit:
        "Ajoutez la brigade d'été en une fois via import CSV ou Excel. La facturation per-seat s'ajuste automatiquement, à la hausse comme à la baisse.",
    },
  ],

  pricingExample: {
    headcount: 12,
    teamLabel: 'une brigade de 12 personnes',
    description:
      'Cuisine, salle et accueil compris. Toutes les fonctionnalités incluses, sans engagement, avec un essai gratuit de 21 jours sans carte bancaire.',
  },

  faqs: [
    {
      question: "Comment gérer les horaires en coupure d'un restaurant ?",
      answer:
        "Chaque employé peut avoir plusieurs créneaux par jour : un service du midi et un service du soir se planifient comme deux créneaux distincts sur la même journée. La vue jour affiche le déroulé complet des services, la vue semaine donne la vision d'ensemble de la brigade.",
    },
    {
      question:
        'Un extra ou un saisonnier peut-il consulter son planning sur mobile ?',
      answer:
        "Oui. Chaque employé dispose d'un espace personnel accessible depuis n'importe quel navigateur mobile, sans application à installer. Il y consulte ses horaires à jour, ses congés et la messagerie de l'équipe, et reçoit un email à chaque modification.",
    },
    {
      question: 'Comment gérer un remplacement de dernière minute ?',
      answer:
        "Modifiez le créneau par glisser-déposer : l'employé concerné est notifié immédiatement par email. La messagerie interne permet en parallèle de solliciter l'équipe ou un groupe dédié (par exemple les extras) pour trouver un volontaire.",
    },
    {
      question: "Peut-on imprimer le planning pour l'affichage des horaires ?",
      answer:
        "Oui. L'export PDF génère un planning hebdomadaire propre, filtrable par équipe (cuisine, salle, accueil), adapté à l'affichage dans l'établissement. Les exports Excel servent de base à la préparation de la paie.",
    },
    {
      question:
        'Combien coûte SmartPlanning pour un restaurant de 12 personnes ?',
      answer:
        '34,80 € HT par mois, soit 12 employés à 2,90 € HT chacun. Toutes les fonctionnalités sont incluses : plannings, congés, messagerie, exports et support. Sans engagement, avec un essai gratuit de 21 jours sans carte bancaire.',
    },
    {
      question: 'Comment sont gérés les congés des saisonniers ?',
      answer:
        "Chaque employé pose ses demandes de congés en ligne, le manager les valide ou les refuse via un circuit d'approbation clair avec historique. Les soldes sont suivis par employé, y compris pour les contrats courts, et les congés approuvés apparaissent automatiquement dans le planning.",
    },
  ],

  lastModified: '2026-08-11',
}
