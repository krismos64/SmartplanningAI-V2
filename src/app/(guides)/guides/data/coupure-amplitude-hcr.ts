/**
 * coupure-amplitude-hcr.ts - Guide « Coupure, amplitude et repos en HCR »
 *
 * @description Guide de reference sur la convention collective HCR
 * (IDCC 1979) : distinction temps plein / temps partiel sur la coupure,
 * durees maximales journalieres, amplitude, repos quotidien. Sources
 * Legifrance verifiees le 3 aout 2026 (CCN du 30 avril 1997, avenant
 * n° 2 du 5 fevrier 2007, Code du travail L3131-1).
 *
 * Point editorial : la limite de 5 heures de coupure, presentee partout
 * comme une regle generale, ne concerne que les salaries a temps partiel
 * (article 13.5). C'est l'angle du guide.
 */

import type { GuideData } from './types'

export const coupureAmplitudeHcrGuide: GuideData = {
  slug: 'coupure-amplitude-restauration-hcr',
  title:
    'Coupure, amplitude et repos en restauration : ce que dit la convention HCR',
  metaTitle: 'Coupure et amplitude en HCR : les règles réelles',
  metaDescription:
    "Coupure de 5 heures, amplitude, durées maximales par poste, repos de 11 heures : les règles HCR expliquées, temps plein et temps partiel distingués.",
  keywords: [
    'coupure restauration',
    'amplitude horaire restaurant',
    'convention HCR temps de travail',
    'durée maximale journalière restauration',
    'repos quotidien 11 heures',
    'service en coupure horaires',
    'IDCC 1979 durée du travail',
    'temps partiel restauration coupure',
    'horaires brigade restaurant',
  ],
  excerpt:
    "La limite de 5 heures de coupure ne s'applique qu'aux temps partiel. Durées maximales par poste, amplitude, repos quotidien : les règles HCR remises à plat, articles à l'appui.",
  directAnswer:
    "En restauration, la règle des 5 heures de coupure maximum ne concerne que les salariés à temps partiel (article 13.5 de la convention HCR) : pour un temps plein, la convention ne fixe pas cette limite. Ce qui encadre la journée d'un temps plein, ce sont les durées maximales de travail par catégorie de personnel (11 heures pour un cuisinier, 11 h 30 pour les autres salariés, 12 heures en réception) et le repos quotidien de 11 heures consécutives entre deux journées.",

  sections: [
    {
      id: 'coupure-temps-partiel',
      title: 'La limite de 5 heures ne vaut que pour les temps partiel',
      paragraphs: [
        "C'est la confusion la plus répandue du secteur. On lit partout qu'en HCR, une journée de travail ne peut comporter qu'une seule interruption de 5 heures maximum. Cette règle existe bien, mais elle figure à l'article 13.5 de la convention collective, dans un article intitulé « Temps partiel » et qui ne s'applique qu'à ces salariés.",
        "Pour un salarié à temps partiel, la journée ne peut donc comporter qu'une seule interruption d'activité, temps de repas non compris, d'une durée maximale de 5 heures. Quand cette coupure dépasse 2 heures, deux contreparties se déclenchent : chacune des deux séquences de travail de la journée doit durer au minimum 3 heures consécutives, et la durée contractuelle hebdomadaire ne peut pas être inférieure à 24 heures.",
        "Pour un salarié à temps plein, la convention HCR ne fixe pas de plafond équivalent à la durée de la coupure. La journée est encadrée autrement : par les durées maximales de travail effectif et par le repos quotidien, détaillés plus bas. Confondre les deux régimes conduit soit à s'interdire une organisation licite, soit à croire respecter une règle qui ne s'applique pas au salarié concerné.",
      ],
    },
    {
      id: 'durees-maximales',
      title: 'Les durées maximales journalières, catégorie par catégorie',
      paragraphs: [
        "L'avenant n° 2 du 5 février 2007 fixe les durées maximales journalières par catégorie de personnel (article 6.1). Elles diffèrent d'un poste à l'autre, ce qui surprend souvent : dans une même brigade, le cuisinier et le personnel de réception n'ont pas la même limite.",
        "Ces durées portent sur le travail effectif. Une journée en coupure de 10 heures de travail réparties entre le service du midi et celui du soir reste dans la limite applicable à la salle, même si le salarié a quitté son domicile treize heures plus tôt.",
      ],
      bullets: [
        'Personnel administratif hors site : 10 heures',
        'Cuisinier : 11 heures',
        'Autre personnel : 11 heures 30',
        'Personnel de réception : 12 heures',
        'Veilleur de nuit : 12 heures',
      ],
    },
    {
      id: 'amplitude-vs-duree',
      title: "L'amplitude n'est pas la durée de travail",
      paragraphs: [
        "Les deux notions sont régulièrement mélangées, y compris dans les discussions d'équipe. L'amplitude, c'est le nombre d'heures séparant le début de la journée de travail de son achèvement, coupures comprises. La durée maximale, elle, ne compte que le travail effectif : la coupure n'y entre pas.",
        "Un exemple concret : un serveur qui commence à 10 h, coupe de 15 h à 18 h et termine à 23 h a une amplitude de 13 heures pour 10 heures de travail effectif. Sa durée de travail respecte la limite de 11 h 30, mais son amplitude est contrainte par autre chose : le repos quotidien de la section suivante.",
        "Le chiffre de 13 heures d'amplitude maximale circule beaucoup dans le secteur. Il ne vient pas de la convention HCR mais de dispositions propres au commerce de détail alimentaire. En HCR, l'amplitude n'est pas plafonnée en tant que telle : elle est bornée indirectement, par le repos quotidien obligatoire.",
      ],
    },
    {
      id: 'repos-quotidien',
      title: 'Le repos quotidien : 11 heures, et ce qui le borne vraiment',
      paragraphs: [
        "Tout salarié bénéficie d'un repos quotidien d'au moins 11 heures consécutives (article L3131-1 du Code du travail). Ce repos est la vraie contrainte sur les journées en coupure : si un salarié termine son service à 23 h 30, il ne peut pas reprendre avant 10 h 30 le lendemain matin. Sur une semaine de services du soir suivis de services du midi, c'est cette règle qui bloque en premier.",
        "Mécaniquement, un repos de 11 heures laisse au maximum 13 heures d'amplitude sur 24. C'est de là que vient le chiffre souvent cité : une conséquence du repos quotidien, pas un article de la convention HCR.",
        "La convention prévoit des aménagements : le repos entre deux journées est fixé à 11 heures consécutives, porté à 12 heures pour les salariés de moins de 18 ans. Il peut être réduit à 10 heures pour les salariés d'établissements situés dans certaines communes touristiques, sous conditions strictes. L'employeur doit alors tenir un registre mentionnant les jours d'utilisation de la dérogation, signé par le salarié une fois par semaine et tenu à disposition de l'inspection du travail. Les jeunes travailleurs sont exclus de cette dérogation.",
      ],
    },
    {
      id: 'durees-hebdomadaires',
      title: 'À la semaine : 46 heures en moyenne, 48 heures en absolu',
      paragraphs: [
        "Au-delà de la journée, la convention HCR encadre la semaine (article 6.2) : 46 heures en moyenne sur 12 semaines consécutives, et 48 heures en valeur absolue sur une semaine isolée. Un pic de saison peut donc atteindre 48 heures, à condition que la moyenne trimestrielle reste sous 46.",
        "L'article 21 de la convention fixe par ailleurs les durées hebdomadaires de travail par catégorie, dont 43 heures pour les cuisiniers, et prévoit un repos hebdomadaire de deux jours. Ces durées relèvent d'un dispositif conventionnel propre à la branche : elles se vérifient au cas par cas selon la taille de l'établissement et la catégorie du salarié.",
        "Le suivi de la moyenne sur 12 semaines est le point faible des plannings tenus au tableur : la limite hebdomadaire isolée se voit, la moyenne glissante non. C'est typiquement ce qui se découvre en fin de trimestre, quand il est trop tard pour lisser.",
      ],
    },
    {
      id: 'construire-planning',
      title: 'Traduire ces règles dans un planning hebdomadaire',
      paragraphs: [
        "Ces règles se ramènent à quelques vérifications à faire à chaque construction de planning, avant publication à l'équipe :",
      ],
      bullets: [
        "Distinguer les temps partiel des temps plein : seules les journées des temps partiel sont soumises à l'interruption unique de 5 heures et aux séquences minimales de 3 heures",
        'Vérifier la durée maximale applicable au poste, qui diffère entre cuisine, salle et réception',
        "Contrôler l'écart entre la fin d'un service du soir et la reprise du lendemain matin : 11 heures minimum",
        'Surveiller la moyenne hebdomadaire sur 12 semaines, pas seulement la semaine en cours',
        "Conserver une trace des horaires affichés et de leurs modifications, en cas de contrôle ou de litige sur les heures",
      ],
    },
    {
      id: 'outillage',
      title: "Ce qu'un logiciel de planning change, et ce qu'il ne fait pas",
      paragraphs: [
        "Un outil de planning ne remplace pas la lecture de la convention, et il ne décide pas à votre place. Ce qu'il apporte, c'est la fin des versions contradictoires : un planning unique, consultable par toute l'équipe sur mobile, avec une notification à chaque changement, et un historique de ce qui a été affiché.",
        "SmartPlanning construit le planning en glisser-déposer par service, détecte les chevauchements de créneaux et les conflits avec une absence validée, gère les demandes d'absence avec leurs soldes, et exporte les heures en Excel pour préparer la paie ou en PDF pour l'affichage en salle et en cuisine. Le tarif est de 2,90 € HT par employé et par mois, avec un essai gratuit de 21 jours sans carte bancaire.",
        "Un point d'honnêteté : SmartPlanning ne contrôle pas automatiquement le respect des durées maximales, de l'amplitude ni du repos de 11 heures, et ne fait ni badgeage ni paie. Il donne la visibilité pour appliquer ces règles, avec un historique consultable. Si le besoin premier est le pointage en temps réel ou un contrôle de conformité automatisé, ce n'est pas le bon outil.",
      ],
    },
  ],

  faqs: [
    {
      question: 'Quelle est la durée maximale de coupure en restauration ?',
      answer:
        "Pour un salarié à temps partiel, la journée ne peut comporter qu'une seule interruption d'activité, hors temps de repas, de 5 heures maximum (article 13.5 de la convention HCR). Au-delà de 2 heures de coupure, chaque séquence de travail doit durer au moins 3 heures consécutives et le contrat prévoir au minimum 24 heures par semaine. Pour un salarié à temps plein, la convention HCR ne fixe pas cette limite de 5 heures : la journée est encadrée par les durées maximales de travail et par le repos quotidien de 11 heures.",
    },
    {
      question: "Quelle est l'amplitude maximale d'une journée en HCR ?",
      answer:
        "La convention HCR ne fixe pas d'amplitude maximale en tant que telle. L'amplitude, qui compte les heures entre le début et la fin de la journée coupures comprises, se trouve bornée indirectement par le repos quotidien de 11 heures consécutives (article L3131-1 du Code du travail) : cela laisse au maximum 13 heures d'amplitude sur 24. Le chiffre de 13 heures souvent cité est donc une conséquence du repos quotidien, pas une règle propre à la branche.",
    },
    {
      question:
        'Combien de temps de repos entre un service du soir et un service du midi ?',
      answer:
        "11 heures consécutives au minimum, portées à 12 heures pour un salarié de moins de 18 ans. Un salarié qui termine à 23 h 30 ne peut donc pas reprendre avant 10 h 30 le lendemain. Une réduction à 10 heures est possible pour les établissements de certaines communes touristiques, sous conditions, avec tenue d'un registre signé par le salarié chaque semaine et tenu à disposition de l'inspection du travail.",
    },
    {
      question:
        'Quelle est la durée maximale de travail par jour dans un restaurant ?',
      answer:
        "Elle dépend de la catégorie de personnel (article 6.1 de l'avenant n° 2 du 5 février 2007) : 10 heures pour le personnel administratif hors site, 11 heures pour un cuisinier, 11 heures 30 pour les autres salariés, 12 heures pour le personnel de réception et pour un veilleur de nuit. Cette durée porte sur le travail effectif : la coupure n'y est pas comptée.",
    },
    {
      question: "Combien d'heures par semaine au maximum en HCR ?",
      answer:
        "46 heures en moyenne sur 12 semaines consécutives, et 48 heures en valeur absolue sur une semaine isolée (article 6.2). Une semaine de forte saison peut donc monter à 48 heures à condition que la moyenne sur le trimestre reste sous 46 heures. C'est cette moyenne glissante, invisible sur un planning hebdomadaire isolé, qui est le plus souvent perdue de vue.",
    },
    {
      question: 'Un logiciel de planning vérifie-t-il ces règles tout seul ?',
      answer:
        "SmartPlanning détecte les chevauchements de créneaux et les conflits avec une absence validée, mais ne contrôle pas automatiquement les durées maximales, l'amplitude ni le repos de 11 heures. Ces vérifications restent à la charge de l'employeur. L'outil apporte un planning unique et partagé, l'historique des horaires affichés et les exports d'heures : de la visibilité pour appliquer les règles, pas un contrôle de conformité automatisé.",
    },
  ],

  datePublished: '2026-08-03',
  lastModified: '2026-08-03',
  readingMinutes: 8,
}
