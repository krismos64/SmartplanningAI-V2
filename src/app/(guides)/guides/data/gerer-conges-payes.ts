/**
 * gerer-conges-payes.ts - Guide « Gérer les congés payés en TPE/PME »
 *
 * @description Guide de référence : acquisition, prise, validation et
 * obligations de l'employeur. Références légales du Code du travail
 * vérifiées en juillet 2026 (dont réforme acquisition maladie 2024).
 *
 * @ticket SP-555
 */

import type { GuideData } from './types'

export const congesPayesGuide: GuideData = {
  slug: 'gerer-conges-payes-tpe-pme',
  title: 'Gérer les congés payés en TPE/PME : le guide complet',
  metaTitle: 'Congés payés en TPE/PME : le guide 2026',
  metaDescription:
    'Acquisition de 2,5 jours par mois, ouvrables ou ouvrés, ordre des départs, refus et report : les règles des congés payés expliquées avec des exemples chiffrés.',
  keywords: [
    'congés payés TPE',
    'gestion congés payés PME',
    'acquisition congés payés',
    'jours ouvrables jours ouvrés',
    'ordre des départs en congé',
    'refus congés employeur',
    'report congés payés',
    'solde congés salarié',
    'workflow validation congés',
  ],
  excerpt:
    'Acquisition, jours ouvrables ou ouvrés, ordre des départs, refus, report : toutes les règles des congés payés applicables aux TPE et PME, avec les références du Code du travail.',
  directAnswer:
    "En France, un salarié acquiert 2,5 jours ouvrables de congés payés par mois de travail effectif, soit 30 jours ouvrables (5 semaines) par an au maximum. L'employeur organise les départs : il valide les dates, peut les refuser pour un motif tiré de l'intérêt de l'entreprise, mais doit permettre la prise effective des congés, communiquer l'ordre des départs au moins un mois à l'avance et ne plus modifier les dates moins d'un mois avant le départ, sauf circonstances exceptionnelles.",

  sections: [
    {
      id: 'acquisition',
      title: 'Acquisition : 2,5 jours ouvrables par mois',
      paragraphs: [
        "Tout salarié acquiert 2,5 jours ouvrables de congés payés par mois de travail effectif chez le même employeur, dans la limite de 30 jours ouvrables par an, soit 5 semaines (article L3141-3 du Code du travail, vérifié en juillet 2026). Le droit s'ouvre dès le premier jour de travail, quel que soit le contrat : CDI, CDD, temps partiel ou temps plein acquièrent au même rythme.",
        "Depuis la loi du 22 avril 2024, les arrêts maladie d'origine non professionnelle ouvrent aussi des droits : 2 jours ouvrables par mois d'arrêt, dans la limite de 24 jours par an. Les arrêts pour accident du travail ou maladie professionnelle continuent d'ouvrir 2,5 jours par mois. Une TPE qui l'ignore sous-estime les soldes de ses salariés absents, avec un risque de contentieux.",
        "La période de référence court par défaut du 1er juin de l'année précédente au 31 mai de l'année en cours, sauf accord d'entreprise fixant d'autres dates (l'année civile est fréquente).",
      ],
    },
    {
      id: 'ouvrables-ouvres',
      title: 'Jours ouvrables ou jours ouvrés : ne pas mélanger',
      paragraphs: [
        "Les jours ouvrables comptent 6 jours par semaine (du lundi au samedi, hors jours fériés chômés) : c'est l'unité légale, avec 30 jours acquis par an. Les jours ouvrés comptent 5 jours par semaine (les jours réellement travaillés dans l'entreprise, souvent du lundi au vendredi) : 25 jours par an. Les deux systèmes sont équivalents à condition de choisir une unité et de s'y tenir.",
        "L'erreur classique en TPE : décompter les acquisitions en ouvrables (2,5 par mois) et les prises en ouvrés, ou l'inverse. Le salarié y perd ou y gagne une semaine par an, et personne ne s'en aperçoit avant le solde de tout compte. Affichez l'unité choisie sur chaque solde communiqué.",
      ],
    },
    {
      id: 'periode-prise',
      title: 'La prise des congés : période légale et congé principal',
      paragraphs: [
        "La période de prise des congés doit inclure au minimum l'intervalle du 1er mai au 31 octobre (article L3141-13). Le congé principal pris dans cette période est d'au moins 12 jours ouvrables continus et d'au plus 24 : la cinquième semaine se prend séparément.",
        "Si le salarié prend une partie de son congé principal en dehors de la période légale, il peut avoir droit à des jours de fractionnement : 2 jours ouvrables supplémentaires si 6 jours ou plus sont pris hors période, 1 jour pour 3 à 5 jours (article L3141-23, sauf renonciation prévue par accord). Beaucoup de TPE découvrent cette règle lors d'un contrôle ou d'un contentieux : anticipez-la dans vos validations d'automne et d'hiver.",
      ],
    },
    {
      id: 'ordre-departs',
      title: "L'ordre des départs : critères et délais",
      paragraphs: [
        "C'est l'employeur qui fixe l'ordre des départs, après avis du CSE s'il existe, en tenant compte de critères objectifs : situation de famille (enfants scolarisés, conjoint dont les congés sont imposés), ancienneté, et activité éventuelle chez d'autres employeurs (article L3141-16).",
        "Deux délais protègent les salariés : l'ordre des départs est communiqué à chaque salarié au moins un mois avant son départ, et l'employeur ne peut plus modifier les dates validées moins d'un mois avant le départ, sauf circonstances exceptionnelles. Valider tôt et par écrit n'est donc pas seulement une bonne pratique : c'est ce qui rend vos arbitrages opposables.",
      ],
    },
    {
      id: 'refus-report',
      title: 'Refus, report et congés non pris',
      paragraphs: [
        "L'employeur peut refuser des dates demandées pour un motif tiré de l'intérêt de l'entreprise (surcroît d'activité, continuité de service), à condition de ne pas vider le droit de sa substance : le salarié doit pouvoir prendre effectivement ses congés sur la période. Un refus systématique ou discriminatoire expose à des dommages et intérêts.",
        "En principe, les congés non pris à la fin de la période sont perdus, sauf accord permettant le report. Exceptions importantes : le salarié malade pendant la période de prise conserve ses droits (report dans la limite de 15 mois depuis la loi de 2024), et les congés acquis avant un congé maternité ou d'adoption sont reportés. Là encore, un suivi précis des soldes évite les mauvaises surprises.",
      ],
    },
    {
      id: 'suivi-soldes',
      title: 'Tenir les soldes : les pièges du suivi manuel',
      paragraphs: [
        "La plupart des litiges congés en TPE viennent d'un suivi défaillant, pas d'une mauvaise foi. Les pièges récurrents :",
      ],
      bullets: [
        'Soldes tenus dans un tableur jamais synchronisé avec le planning réel',
        "Demandes validées à l'oral puis oubliées au moment de construire le planning",
        'Acquisitions pendant les arrêts maladie non comptées (règle de 2024 ignorée)',
        'Mélange jours ouvrables / jours ouvrés dans le même fichier',
        'Aucune trace écrite des validations et des refus, indéfendable en cas de litige',
      ],
    },
    {
      id: 'workflow-numerique',
      title: 'Mettre en place un workflow de validation clair',
      paragraphs: [
        "Le circuit sain tient en quatre temps : le salarié pose sa demande par écrit avec ses dates, le manager la valide ou la refuse avec un motif, la décision est notifiée et archivée, et les congés approuvés apparaissent automatiquement dans le planning de l'équipe. Chacun voit son solde à jour en permanence.",
        "C'est exactement le workflow intégré de SmartPlanning : demandes en ligne, validation par le manager avec historique complet, soldes calculés par salarié, notification par email à chaque décision et congés approuvés reportés d'office sur le planning. Le tarif est de 2,90 € HT par employé et par mois, avec un essai gratuit de 21 jours sans carte bancaire.",
      ],
    },
  ],

  faqs: [
    {
      question: 'Un employeur peut-il refuser une demande de congés payés ?',
      answer:
        "Oui, pour un motif tiré de l'intérêt de l'entreprise (activité, continuité de service), et à condition de respecter les critères d'ordre des départs. Mais il ne peut pas empêcher le salarié de prendre effectivement ses congés sur la période : le refus repousse des dates, il ne supprime pas le droit. Une fois les dates validées, elles ne peuvent plus être modifiées moins d'un mois avant le départ, sauf circonstances exceptionnelles.",
    },
    {
      question: 'Combien de jours de congés payés acquiert-on par mois ?',
      answer:
        '2,5 jours ouvrables par mois de travail effectif, dans la limite de 30 jours ouvrables (5 semaines) par an, dès le premier jour de travail et quel que soit le contrat (article L3141-3 du Code du travail). En jours ouvrés, cela correspond à environ 2,08 jours par mois, soit 25 jours par an.',
    },
    {
      question:
        'Quelle est la différence entre jours ouvrables et jours ouvrés ?',
      answer:
        "Les jours ouvrables vont du lundi au samedi (6 jours par semaine, unité légale : 30 jours de congés par an). Les jours ouvrés sont les jours effectivement travaillés dans l'entreprise, en général du lundi au vendredi (5 jours par semaine : 25 jours par an). Les deux décomptes sont équivalents si l'on ne les mélange jamais dans un même calcul.",
    },
    {
      question: 'Les congés payés non pris sont-ils perdus ?',
      answer:
        "En principe oui, à la fin de la période de prise, sauf accord d'entreprise permettant le report. Exceptions : le salarié qui n'a pas pu prendre ses congés pour cause de maladie bénéficie d'un report (dans la limite de 15 mois), et les congés acquis avant un congé maternité ou d'adoption sont conservés. L'employeur doit pouvoir prouver qu'il a mis le salarié en mesure de prendre ses congés.",
    },
    {
      question: 'Acquiert-on des congés payés pendant un arrêt maladie ?',
      answer:
        "Oui, depuis la loi du 22 avril 2024 : un arrêt maladie d'origine non professionnelle ouvre droit à 2 jours ouvrables de congés par mois d'arrêt (24 jours par an au maximum). Un arrêt pour accident du travail ou maladie professionnelle ouvre 2,5 jours par mois, comme du travail effectif. Ces règles s'appliquent rétroactivement et doivent être intégrées aux soldes.",
    },
  ],

  datePublished: '2026-07-17',
  lastModified: '2026-08-11',
  readingMinutes: 9,
}
