/**
 * btp.ts - Contenu de la page /solutions/planning-btp
 *
 * @description Page secteur BTP et chantiers : contenu rédigé pour les
 * requêtes « logiciel planning BTP » et pour être citable par les moteurs
 * génératifs (réponse directe, FAQ, chiffres datés).
 *
 * @ticket SP-560
 */

import type { SectorData } from './types'

export const btpSector: SectorData = {
  slug: 'planning-btp',
  name: 'BTP et chantiers',
  shortName: 'BTP',
  badge: 'BTP & chantiers',

  metaTitle: 'Logiciel de planning pour le BTP et les chantiers',
  metaDescription:
    "Affectation des compagnons par chantier, congés intempéries, heures par projet : SmartPlanning simplifie le planning BTP. 2,90 € HT par employé, essai 21 jours.",
  keywords: [
    'logiciel planning btp',
    'planning chantier',
    'logiciel planning compagnons',
    'gestion planning btp',
    'gestion congés intempéries',
    'logiciel horaires chantier',
    'planning multi-chantiers',
    'logiciel rh btp',
    'planning chef de chantier',
    'affectation compagnons chantier',
  ],

  h1: 'Un logiciel de planning pensé pour le',
  h1Highlight: 'BTP et les chantiers',

  directAnswer:
    "SmartPlanning permet aux entreprises du BTP d'affecter leurs compagnons par chantier en quelques minutes : plannings multi-chantiers, congés intempéries, suivi des heures par projet et notes d'incidents pour signaler un accident ou un retard. Chaque compagnon consulte son planning depuis son téléphone et le chef de chantier ajuste les affectations par glisser-déposer. Le tarif est de 2,90 € HT par employé et par mois, toutes fonctionnalités incluses, avec un essai gratuit de 21 jours sans carte bancaire.",

  intro: [
    "Sur un chantier, le planning ne s'arrête jamais à une seule adresse. Une entreprise du bâtiment ou des travaux publics doit répartir ses compagnons sur plusieurs chantiers en parallèle, ajuster les affectations au jour le jour selon l'avancement, et composer avec les arrêts intempéries qui décalent tout le calendrier. Beaucoup d'entreprises jonglent encore entre un tableur, des appels le matin et des feuilles d'heures papier récupérées en fin de semaine, avec le risque d'oublier un compagnon sur le mauvais chantier ou de perdre la trace d'un incident.",
    "SmartPlanning centralise l'affectation des compagnons par chantier dans un planning en ligne partagé : le chef de chantier organise les équipes par glisser-déposer, chaque compagnon consulte ses affectations du jour depuis son téléphone, et les congés intempéries se gèrent avec le même workflow d'approbation que les congés payés classiques. Les notes d'incidents et les exports d'heures par chantier complètent l'outil pour la facturation client et le suivi de projet.",
  ],

  challenges: [
    {
      icon: 'hard-hat',
      title: 'Compagnons répartis sur plusieurs chantiers',
      description:
        "Une même équipe peut intervenir sur deux ou trois chantiers dans la semaine, avec des besoins qui changent selon l'avancement des travaux. Sans planning centralisé, un compagnon peut se retrouver au mauvais endroit ou une affectation peut être oubliée.",
    },
    {
      icon: 'alert',
      title: 'Congés et arrêts intempéries',
      description:
        "Les arrêts pour intempéries décalent le calendrier de tout un chantier du jour au lendemain. Il faut pouvoir replanifier rapidement les équipes concernées sans perdre le suivi des congés déjà posés.",
    },
    {
      icon: 'map-pin',
      title: 'Heures par projet et par chantier',
      description:
        "Pour facturer correctement chaque client, il faut savoir combien d'heures chaque compagnon a passées sur chaque chantier. Un suivi papier ou dispersé sur plusieurs fichiers rend cet exercice long et sujet aux erreurs.",
    },
    {
      icon: 'scale',
      title: 'Suivi des incidents et de la sécurité',
      description:
        "Un accident, un retard de livraison de matériel ou un incident de sécurité doit être tracé et remonté rapidement au bon niveau hiérarchique, sans dépendre d'un carnet papier qui reste dans le véhicule.",
    },
  ],

  solutions: [
    {
      icon: 'calendar',
      feature: 'Plannings multi-chantiers en glisser-déposer',
      benefit:
        "Affectez chaque compagnon à un chantier par simple glisser-déposer, en vue jour ou semaine. Un changement d'affectation se répercute immédiatement sur le planning de l'équipe concernée.",
    },
    {
      icon: 'smartphone',
      feature: 'Consultation mobile pour toute l\'équipe',
      benefit:
        "Chaque compagnon accède à son planning depuis son téléphone, sans application à installer, et voit toujours la dernière version de ses affectations du jour.",
    },
    {
      icon: 'bell',
      feature: 'Notifications à chaque changement d\'affectation',
      benefit:
        "Un chantier réaffecté suite à une intempérie ou un imprévu ? Chaque compagnon concerné reçoit une notification email automatique dès la mise à jour du planning.",
    },
    {
      icon: 'scale',
      feature: 'Notes d\'incidents horodatées',
      benefit:
        "Signalez un accident, un retard ou un incident de sécurité directement depuis l'espace de l'employé ou du manager, avec visibilité RBAC adaptée au rôle (compagnon, chef de chantier, direction).",
    },
    {
      icon: 'file-down',
      feature: 'Exports Excel pour la facturation client',
      benefit:
        "Filtrez les heures travaillées par chantier et par compagnon pour préparer la facturation client ou les situations de travaux, sans ressaisie manuelle.",
    },
    {
      icon: 'user-plus',
      feature: 'Import des équipes en un fichier',
      benefit:
        "Ajoutez une nouvelle équipe de compagnons en une fois via import CSV ou Excel. La facturation per-seat s'ajuste automatiquement, à la hausse comme à la baisse.",
    },
  ],

  pricingExample: {
    headcount: 15,
    teamLabel: 'une équipe de 15 compagnons',
    description:
      'Répartis sur plusieurs chantiers. Toutes les fonctionnalités incluses, sans engagement, avec un essai gratuit de 21 jours sans carte bancaire.',
  },

  faqs: [
    {
      question: 'Comment affecter des compagnons à plusieurs chantiers ?',
      answer:
        "Chaque compagnon est affecté à un ou plusieurs chantiers via le planning en glisser-déposer. La vue semaine donne au chef de chantier une vision d'ensemble des affectations de toute l'équipe, chantier par chantier.",
    },
    {
      question: 'Comment gérer les congés intempéries dans le planning ?',
      answer:
        "Les congés intempéries suivent le même circuit que les congés classiques : demande, validation par le manager, mise à jour automatique du planning. Le solde de chaque compagnon reste visible à tout moment.",
    },
    {
      question: "Peut-on suivre les heures travaillées par chantier ?",
      answer:
        "Oui. L'export Excel filtré par chantier et par compagnon donne le détail des heures affectées à chaque projet, une base directement exploitable pour la facturation client ou la préparation de la paie.",
    },
    {
      question: 'Comment signaler un incident sur un chantier ?',
      answer:
        "Le compagnon ou le chef de chantier crée une note d'incident depuis son espace, avec une visibilité adaptée au rôle : le manager et la direction sont informés selon les règles RBAC définies pour l'entreprise.",
    },
    {
      question: 'Combien coûte SmartPlanning pour une équipe de 15 compagnons ?',
      answer:
        "43,50 € HT par mois, soit 15 employés à 2,90 € HT chacun. Toutes les fonctionnalités sont incluses : plannings multi-chantiers, congés, incidents, exports et support. Sans engagement, avec un essai gratuit de 21 jours sans carte bancaire.",
    },
    {
      question:
        'Un compagnon peut-il consulter son planning depuis le chantier ?',
      answer:
        "Oui. L'espace employé est accessible depuis n'importe quel navigateur mobile, sans application à installer. Le compagnon y consulte ses affectations du jour, ses congés et reçoit une notification à chaque changement de planning.",
    },
  ],

  lastModified: '2026-07-20',
}
