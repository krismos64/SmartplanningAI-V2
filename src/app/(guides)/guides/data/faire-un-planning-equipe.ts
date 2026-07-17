/**
 * faire-un-planning-equipe.ts - Guide « Comment faire un planning d'équipe »
 *
 * @description Guide méthode en 6 étapes avec schéma HowTo. Références
 * légales du Code du travail vérifiées en juillet 2026.
 *
 * @ticket SP-555
 */

import type { GuideData } from './types'

export const planningEquipeGuide: GuideData = {
  slug: 'faire-un-planning-equipe',
  title: "Comment faire un planning d'équipe : méthode en 6 étapes",
  metaTitle: "Faire un planning d'équipe : méthode en 6 étapes",
  metaDescription:
    "Méthode complète pour construire un planning d'équipe : besoins de couverture, contraintes légales, communication. 6 étapes concrètes et erreurs à éviter.",
  keywords: [
    "faire un planning d'équipe",
    'comment faire un planning',
    'méthode planning équipe',
    'planning de travail salariés',
    'construire planning hebdomadaire',
    'modèle planning équipe',
    'règles légales planning',
    'planning horaires entreprise',
  ],
  excerpt:
    "La méthode en 6 étapes pour construire un planning d'équipe fiable : recenser les besoins, poser les contraintes, répartir équitablement, communiquer et gérer les imprévus.",
  directAnswer:
    "Pour faire un planning d'équipe efficace, procédez en 6 étapes : recensez les besoins de couverture par créneau, listez les contraintes de chaque employé, vérifiez les règles légales (durées maximales, repos obligatoires), construisez une semaine type, répartissez équitablement les créneaux sensibles, puis communiquez le planning à l'avance et gérez les imprévus avec un outil partagé. Cette méthode s'applique au papier, au tableur comme à un logiciel dédié.",

  sections: [
    {
      id: 'pourquoi',
      title: "Pourquoi le planning d'équipe est un sujet stratégique",
      paragraphs: [
        "Un planning n'est pas un simple tableau d'horaires : il détermine la qualité de service (assez de monde aux heures de pointe), la masse salariale (pas de sureffectif aux heures creuses), le climat social (équité des week-ends et des soirées) et la conformité légale (durées maximales, repos obligatoires). Un planning raté se paie quatre fois.",
        "Dans les TPE et PME, il repose souvent sur une seule personne et un tableur transmis par capture d'écran. Ça fonctionne, jusqu'au premier arrêt maladie un samedi matin ou au premier conflit sur les dimanches travaillés. D'où l'intérêt d'une méthode reproductible, quel que soit l'outil.",
      ],
    },
    {
      id: 'etape-1-besoins',
      title: 'Étape 1 : recenser les besoins de couverture',
      stepName: 'Recenser les besoins de couverture',
      paragraphs: [
        "Commencez par la demande, pas par les personnes. Pour chaque jour et chaque créneau, notez l'effectif minimal nécessaire par poste ou par compétence : deux personnes en caisse le samedi après-midi, un cuisinier et deux serveurs au service du midi, un agent la nuit. Appuyez-vous sur l'historique d'activité (ventes, réservations, passages) plutôt que sur l'intuition.",
        "Ce recensement donne votre « grille de charge ». C'est elle qui dira si vous êtes en sous-effectif structurel, un problème de recrutement que le meilleur planning du monde ne résoudra pas.",
      ],
    },
    {
      id: 'etape-2-contraintes',
      title: 'Étape 2 : lister les contraintes individuelles',
      stepName: 'Lister les contraintes individuelles',
      paragraphs: [
        "Pour chaque membre de l'équipe, notez le volume horaire contractuel (35h, temps partiel 25h, contrat étudiant 10h), les indisponibilités récurrentes (cours le mardi, enfants le mercredi), les souhaits exprimés et les compétences (qui peut ouvrir, qui peut fermer, qui est formé sur quel poste).",
        'Distinguez bien les contraintes contractuelles (opposables, à respecter absolument) des préférences (à arbitrer). Cette liste évite les erreurs de casting et facilite les arbitrages transparents quand tout le monde veut le même samedi.',
      ],
    },
    {
      id: 'etape-3-regles-legales',
      title: 'Étape 3 : vérifier le cadre légal',
      stepName: 'Vérifier le cadre légal',
      paragraphs: [
        "Avant de placer le moindre créneau, verrouillez les règles du Code du travail qui s'imposent à tout planning (références vérifiées en juillet 2026, votre convention collective peut être plus favorable) :",
      ],
      bullets: [
        'Durée quotidienne maximale : 10 heures de travail effectif (article L3121-18)',
        'Durée hebdomadaire maximale : 48 heures sur une semaine, 44 heures en moyenne sur 12 semaines consécutives (articles L3121-20 et L3121-22)',
        'Repos quotidien : 11 heures consécutives minimum entre deux journées (article L3131-1)',
        'Repos hebdomadaire : 35 heures consécutives minimum, incluant en principe le dimanche (articles L3132-1 à L3132-3)',
        'Affichage des horaires collectifs sur le lieu de travail (articles D3171-1 et suivants)',
        'Temps partiel : délai de prévenance de 7 jours ouvrés en cas de modification de la répartition des horaires, réductible à 3 jours par accord (article L3123-11)',
      ],
    },
    {
      id: 'etape-4-semaine-type',
      title: 'Étape 4 : construire une semaine type',
      stepName: 'Construire une semaine type',
      paragraphs: [
        "Croisez la grille de charge (étape 1) et les contraintes (étapes 2 et 3) pour construire une semaine « normale » : qui ouvre, qui ferme, qui couvre chaque créneau. Cette semaine type devient votre modèle : 80 % des semaines en dériveront avec quelques ajustements, plutôt que de repartir chaque dimanche soir d'une page blanche.",
        "Prévoyez d'emblée une marge de manœuvre : si votre couverture minimale exige que tout le monde soit présent en permanence, la première absence fera tout tomber. Une bonne semaine type absorbe un imprévu sans heures supplémentaires en cascade.",
      ],
    },
    {
      id: 'etape-5-equite',
      title: 'Étape 5 : répartir équitablement les créneaux sensibles',
      stepName: 'Répartir équitablement les créneaux sensibles',
      paragraphs: [
        "Samedis, dimanches, soirées, veilles de fêtes : les créneaux que personne ne veut doivent tourner de façon visible et traçable. Tenez un compteur par personne (nombre de samedis travaillés sur les 8 dernières semaines, par exemple) et affichez la règle de rotation. L'équité perçue compte autant que l'équité réelle : une rotation objective coupe court aux soupçons de favoritisme.",
        "C'est aussi à cette étape qu'on arbitre les demandes de congés concurrentes, avec des critères annoncés à l'avance (ordre des demandes, ancienneté, situation familiale) plutôt qu'au cas par cas.",
      ],
    },
    {
      id: 'etape-6-communiquer',
      title: 'Étape 6 : communiquer tôt et gérer les imprévus',
      stepName: 'Communiquer le planning et gérer les imprévus',
      paragraphs: [
        "Un bon planning communiqué tard est un mauvais planning. Publiez-le avec au moins une à deux semaines d'avance, sur un support que chacun consulte réellement, et surtout : notifiez chaque modification. La plupart des tensions viennent d'un changement que l'intéressé découvre en arrivant.",
        'Pour les imprévus (maladie, retard, coup de feu), définissez un circuit clair : qui prévenir, comment se fait le remplacement, où est la version à jour du planning. Un canal unique vaut mieux que trois groupes de discussion parallèles.',
      ],
    },
    {
      id: 'erreurs-courantes',
      title: 'Les 5 erreurs les plus courantes',
      paragraphs: [
        'Ces pièges reviennent dans la quasi-totalité des équipes qui gèrent leur planning à la main :',
      ],
      bullets: [
        'Partir des personnes plutôt que des besoins : on reconduit les habitudes au lieu de couvrir la charge réelle',
        "Oublier les repos obligatoires en enchaînant une fermeture (23h) et une ouverture (7h) : le repos de 11 heures n'est pas respecté",
        "Communiquer le planning par captures d'écran : personne ne sait quelle version fait foi",
        "Concentrer les créneaux ingrats sur les plus arrangeants, jusqu'à la démission",
        "Ne garder aucun historique : impossible de prouver l'équité ni de préparer la paie sereinement",
      ],
    },
    {
      id: 'tableur-ou-logiciel',
      title: 'Du tableur au logiciel : quand passer le cap',
      paragraphs: [
        "Le tableur convient à une équipe stable de 3 ou 4 personnes aux horaires réguliers. Au-delà, chaque semaine apporte son lot de versions contradictoires, de formules cassées et de changements non communiqués. Les signaux qui indiquent qu'il est temps de changer : plus de 30 minutes par semaine passées sur le planning, des disputes récurrentes sur les week-ends, des oublis de congés validés.",
        "Un logiciel de planning comme SmartPlanning applique cette méthode nativement : semaines types dupliquables en glisser-déposer, congés intégrés au planning, notification automatique de chaque changement, exports PDF pour l'affichage obligatoire et Excel pour la paie. Le tarif est de 2,90 € HT par employé et par mois, avec un essai gratuit de 21 jours sans carte bancaire.",
      ],
    },
  ],

  faqs: [
    {
      question: "Combien de temps à l'avance faut-il communiquer un planning ?",
      answer:
        "Le Code du travail n'impose pas de délai général pour les temps pleins, mais la convention collective peut en prévoir un. Pour les temps partiels, toute modification de la répartition des horaires exige un délai de prévenance de 7 jours ouvrés (3 jours minimum par accord). En pratique, publier le planning une à deux semaines à l'avance est le standard qui évite la plupart des conflits.",
    },
    {
      question: "Excel suffit-il pour gérer un planning d'équipe ?",
      answer:
        "Pour une petite équipe stable, oui. Excel montre ses limites dès que le planning change souvent : pas de notifications, pas d'historique fiable, pas de gestion des congés intégrée, et des versions contradictoires qui circulent. Le temps passé à maintenir le fichier et à répondre aux questions dépasse alors vite le coût d'un outil dédié.",
    },
    {
      question: 'Quelles sont les durées maximales de travail à respecter ?',
      answer:
        '10 heures par jour, 48 heures par semaine et 44 heures en moyenne sur 12 semaines consécutives, avec un repos quotidien de 11 heures consécutives et un repos hebdomadaire de 35 heures consécutives (articles L3121-18, L3121-20, L3121-22, L3131-1 et L3132-2 du Code du travail, vérifiés en juillet 2026). Des dérogations existent par accord collectif.',
    },
    {
      question: 'Comment gérer les absences de dernière minute ?',
      answer:
        "Préparez le circuit avant l'imprévu : une liste de remplaçants volontaires par poste, un canal de communication unique pour prévenir l'équipe, et un planning en ligne mis à jour en temps réel avec notification automatique. L'improvisation par appels en chaîne est ce qui coûte le plus cher en temps et en tensions.",
    },
    {
      question: 'Comment répartir équitablement les week-ends ?',
      answer:
        "Avec une rotation explicite et un compteur visible : chacun doit pouvoir vérifier combien de samedis et de dimanches il a travaillés sur la période. Annoncez la règle (par exemple un week-end sur deux ou sur trois selon l'effectif), tenez l'historique, et traitez les exceptions comme des échanges entre collègues plutôt que des faveurs accordées.",
    },
  ],

  datePublished: '2026-07-17',
  lastModified: '2026-07-17',
  readingMinutes: 8,
}
