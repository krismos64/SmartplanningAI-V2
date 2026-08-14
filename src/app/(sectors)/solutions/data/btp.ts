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

  metaTitle: 'Logiciel planning chantier BTP à 2,90 €',
  metaDescription:
    'Affectez vos compagnons par chantier, gérez les intempéries et sortez les heures par projet. 2,90 € HT par employé, essai 21 jours sans carte bancaire.',
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

  teaser:
    'Compagnons répartis sur plusieurs chantiers, affectations qui bougent chaque jour, arrêts intempéries : suivez qui travaille où, et exportez les heures pour la facturation.',

  directAnswer:
    "SmartPlanning permet aux entreprises du BTP d'affecter leurs compagnons par chantier en quelques minutes : plannings multi-chantiers, congés intempéries, export des heures par créneau (durée et lieu) et notes d'incidents pour tracer un accident ou un retard. Chaque compagnon consulte son planning depuis son téléphone et le chef de chantier ajuste les affectations par glisser-déposer. Le tarif est de 2,90 € HT par employé et par mois, toutes fonctionnalités incluses, avec un essai gratuit de 21 jours sans carte bancaire.",

  intro: [
    "Sur un chantier, le planning ne s'arrête jamais à une seule adresse. Une entreprise du bâtiment ou des travaux publics doit répartir ses compagnons sur plusieurs chantiers en parallèle, ajuster les affectations au jour le jour selon l'avancement, et composer avec les arrêts intempéries qui décalent tout le calendrier. Beaucoup d'entreprises jonglent encore entre un tableur, des appels le matin et des feuilles d'heures papier récupérées en fin de semaine, avec le risque d'oublier un compagnon sur le mauvais chantier ou de perdre la trace d'un incident.",
    "SmartPlanning centralise l'affectation des compagnons par chantier dans un planning en ligne partagé : le chef de chantier organise les équipes par glisser-déposer, chaque compagnon consulte ses affectations du jour depuis son téléphone, et les congés intempéries se gèrent avec le même workflow d'approbation que les congés payés classiques. Les notes d'incidents et l'export Excel des créneaux (durée et lieu de chaque intervention) complètent l'outil pour la facturation client et le suivi de projet.",
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
        'Les arrêts pour intempéries décalent le calendrier de tout un chantier du jour au lendemain. Il faut pouvoir replanifier rapidement les équipes concernées sans perdre le suivi des congés déjà posés.',
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
      feature: "Consultation mobile pour toute l'équipe",
      benefit:
        'Chaque compagnon accède à son planning depuis son téléphone, sans application à installer, et voit toujours la dernière version de ses affectations du jour.',
    },
    {
      icon: 'bell',
      feature: "Notifications à chaque changement d'affectation",
      benefit:
        'Un chantier réaffecté suite à une intempérie ou un imprévu ? Chaque compagnon concerné reçoit une notification email automatique dès la mise à jour du planning.',
    },
    {
      icon: 'scale',
      feature: "Notes d'incidents horodatées",
      benefit:
        'Le chef de chantier ou la direction consigne un accident, un retard ou un incident de sécurité dans une note horodatée, avec une visibilité RBAC adaptée au rôle : la note reste réservée à la direction ou devient visible par le compagnon concerné.',
    },
    {
      icon: 'file-down',
      feature: 'Exports Excel pour la facturation client',
      benefit:
        "Renseignez le chantier dans le lieu de chaque créneau : l'export Excel liste chaque intervention avec sa durée, son lieu et le compagnon, une base directement exploitable dans un tableur pour ventiler les heures par chantier et préparer la facturation client.",
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
        'Les congés intempéries suivent le même circuit que les congés classiques : demande, validation par le manager, mise à jour automatique du planning. Le solde de chaque compagnon reste visible à tout moment.',
    },
    {
      question: 'Peut-on suivre les heures travaillées par chantier ?',
      answer:
        "Oui. Indiquez le chantier dans le champ « lieu » de chaque créneau : l'export Excel détaille alors, pour chaque intervention, la durée, le lieu et le compagnon. Vous ventilez ensuite les heures par chantier dans votre tableur pour la facturation client ou la préparation de la paie. L'export se filtre par équipe, par employé et par période.",
    },
    {
      question: 'Comment signaler un incident sur un chantier ?',
      answer:
        "Le chef de chantier (manager) ou la direction crée une note d'incident depuis son espace, avec une visibilité adaptée au rôle : selon les règles RBAC définies, la note reste réservée à la direction ou devient visible par le compagnon concerné, qui la retrouve alors dans son espace personnel.",
    },
    {
      question:
        'Combien coûte SmartPlanning pour une équipe de 15 compagnons ?',
      answer:
        '43,50 € HT par mois, soit 15 employés à 2,90 € HT chacun. Toutes les fonctionnalités sont incluses : plannings multi-chantiers, congés, incidents, exports et support. Sans engagement, avec un essai gratuit de 21 jours sans carte bancaire.',
    },
    {
      question:
        'Un compagnon peut-il consulter son planning depuis le chantier ?',
      answer:
        "Oui. L'espace employé est accessible depuis n'importe quel navigateur mobile, sans application à installer. Le compagnon y consulte ses affectations du jour, ses congés et reçoit une notification à chaque changement de planning.",
    },
  ],

  lastModified: '2026-08-11',
}
