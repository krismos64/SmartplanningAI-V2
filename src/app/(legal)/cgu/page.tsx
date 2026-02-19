/**
 * Page CGU - Conditions Générales d'Utilisation
 *
 * @description Document légal conforme au RGPD définissant les conditions
 * d'utilisation de la plateforme SmartPlanning
 *
 * @see SP-279 - Page CGU : Conditions Générales d'Utilisation
 * @ticket SP-279
 */

import { FileText } from 'lucide-react'
import { Metadata } from 'next'
import {
  LegalAcceptanceBox,
  LegalContact,
  LegalDivider,
  LegalHighlight,
  LegalLink,
  LegalList,
  LegalPageLayout,
  LegalParagraph,
  LegalSection,
  type TableOfContentsItem,
} from '../components'

// SEO Metadata
export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | SmartPlanning",
  description:
    "Consultez les conditions générales d'utilisation de SmartPlanning. Découvrez vos droits et obligations en tant qu'utilisateur de notre plateforme de gestion de planning.",
  openGraph: {
    title: "CGU - Conditions Générales d'Utilisation | SmartPlanning",
    description:
      "Conditions générales d'utilisation de la plateforme SmartPlanning",
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'}/cgu`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Table des matières
const tableOfContents: TableOfContentsItem[] = [
  { id: 'objet', title: 'Article 1 - Objet', level: 1 },
  { id: 'definitions', title: 'Article 2 - Définitions', level: 1 },
  { id: 'acces-service', title: 'Article 3 - Accès au Service', level: 1 },
  { id: 'inscription', title: 'Article 4 - Inscription', level: 1 },
  { id: 'abonnements', title: 'Article 5 - Abonnements et Tarifs', level: 1 },
  { id: 'obligations-utilisateur', title: 'Article 6 - Obligations', level: 1 },
  {
    id: 'propriete-intellectuelle',
    title: 'Article 7 - Propriété intellectuelle',
    level: 1,
  },
  {
    id: 'donnees-personnelles',
    title: 'Article 8 - Données personnelles',
    level: 1,
  },
  {
    id: 'acces-support',
    title: 'Article 9 - Accès support technique',
    level: 1,
  },
  { id: 'responsabilite', title: 'Article 10 - Responsabilité', level: 1 },
  { id: 'resiliation', title: 'Article 11 - Résiliation', level: 1 },
  {
    id: 'modification-cgu',
    title: 'Article 12 - Modification des CGU',
    level: 1,
  },
  { id: 'droit-applicable', title: 'Article 13 - Droit applicable', level: 1 },
  { id: 'contact', title: 'Article 14 - Contact', level: 1 },
]

export default function CGUPage() {
  return (
    <LegalPageLayout
      title="Conditions Générales d'Utilisation"
      subtitle="Les présentes conditions générales régissent l'utilisation de la plateforme SmartPlanning. En utilisant notre service, vous acceptez ces conditions dans leur intégralité."
      lastUpdated="19 février 2026"
      version="1.1"
      icon={<FileText className="h-5 w-5" />}
      tableOfContents={tableOfContents}
    >
      {/* Préambule */}
      <LegalHighlight type="important">
        <strong>Important :</strong> L&apos;utilisation de la plateforme
        SmartPlanning implique l&apos;acceptation pleine et entière des
        présentes Conditions Générales d&apos;Utilisation. Si vous
        n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre
        service.
      </LegalHighlight>

      <LegalDivider />

      {/* Article 1 - Objet */}
      <LegalSection id="objet" title="Objet" number="Article 1">
        <LegalParagraph>
          Les présentes Conditions Générales d&apos;Utilisation (ci-après
          &quot;CGU&quot;) ont pour objet de définir les modalités et conditions
          d&apos;utilisation de la plateforme SmartPlanning (ci-après &quot;le
          Service&quot; ou &quot;la Plateforme&quot;), ainsi que de définir les
          droits et obligations des parties dans ce cadre.
        </LegalParagraph>
        <LegalParagraph>
          SmartPlanning est une solution SaaS (Software as a Service) de gestion
          de planning et de ressources humaines permettant aux entreprises de :
        </LegalParagraph>
        <LegalList
          items={[
            'Gérer les plannings de leurs équipes et employés',
            'Administrer les demandes de congés et absences',
            'Suivre les heures de travail et la présence',
            'Gérer les équipes et leurs affectations',
            'Accéder à des tableaux de bord et statistiques',
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Article 2 - Définitions */}
      <LegalSection id="definitions" title="Définitions" number="Article 2">
        <LegalParagraph>
          Dans les présentes CGU, les termes suivants auront la signification
          indiquée ci-dessous :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="editeur">
              <strong>&quot;Éditeur&quot;</strong> : désigne Christophe
              MOSTEFAOUI, entrepreneur individuel, éditeur et propriétaire de la
              plateforme SmartPlanning, dont le siège social est situé à 64170
              Artix, France.
            </span>,
            <span key="utilisateur">
              <strong>&quot;Utilisateur&quot;</strong> : désigne toute personne
              physique accédant et utilisant la Plateforme, qu&apos;elle soit
              titulaire d&apos;un compte ou simple visiteur.
            </span>,
            <span key="client">
              <strong>&quot;Client&quot;</strong> : désigne toute personne
              morale (entreprise, organisation) ayant souscrit un abonnement
              pour utiliser le Service.
            </span>,
            <span key="compte">
              <strong>&quot;Compte&quot;</strong> : désigne l&apos;espace
              personnel créé par l&apos;Utilisateur lors de son inscription, lui
              permettant d&apos;accéder aux fonctionnalités du Service.
            </span>,
            <span key="contenu">
              <strong>&quot;Contenu&quot;</strong> : désigne l&apos;ensemble des
              données, informations, textes, images et autres éléments publiés
              ou transmis via la Plateforme.
            </span>,
            <span key="donnees">
              <strong>&quot;Données Personnelles&quot;</strong> : désigne toute
              information se rapportant à une personne physique identifiée ou
              identifiable, au sens du RGPD.
            </span>,
            <span key="service">
              <strong>&quot;Service&quot;</strong> : désigne l&apos;ensemble des
              fonctionnalités et services proposés par la Plateforme
              SmartPlanning.
            </span>,
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Article 3 - Accès au Service */}
      <LegalSection
        id="acces-service"
        title="Accès au Service"
        number="Article 3"
      >
        <LegalParagraph>
          <strong>3.1 Conditions d&apos;accès</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le Service est accessible à toute personne physique disposant de la
          pleine capacité juridique pour s&apos;engager au titre des présentes
          CGU. L&apos;Utilisateur qui ne dispose pas de la pleine capacité
          juridique ne peut accéder au Service qu&apos;avec l&apos;accord de son
          représentant légal.
        </LegalParagraph>
        <LegalParagraph>
          <strong>3.2 Disponibilité du Service</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur s&apos;efforce d&apos;assurer la disponibilité du
          Service 24 heures sur 24, 7 jours sur 7. Toutefois, l&apos;Éditeur se
          réserve le droit de suspendre, sans préavis, l&apos;accès au Service
          pour des raisons de maintenance, de mise à jour ou pour tout autre
          motif jugé nécessaire.
        </LegalParagraph>
        <LegalParagraph>
          <strong>3.3 Prérequis techniques</strong>
        </LegalParagraph>
        <LegalParagraph>L&apos;accès au Service nécessite :</LegalParagraph>
        <LegalList
          items={[
            'Une connexion Internet haut débit',
            'Un navigateur web récent (Chrome, Firefox, Safari, Edge dans leurs versions récentes)',
            'JavaScript activé',
            "L'acceptation des cookies essentiels au fonctionnement du Service",
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Article 4 - Inscription */}
      <LegalSection
        id="inscription"
        title="Inscription et Compte"
        number="Article 4"
      >
        <LegalParagraph>
          <strong>4.1 Création de compte</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;accès aux fonctionnalités du Service nécessite la création
          d&apos;un Compte. Lors de l&apos;inscription, l&apos;Utilisateur
          s&apos;engage à fournir des informations exactes, complètes et à jour.
          L&apos;Utilisateur est seul responsable de l&apos;exactitude des
          informations fournies.
        </LegalParagraph>
        <LegalParagraph>
          <strong>4.2 Identifiants de connexion</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Utilisateur est responsable de la confidentialité de ses
          identifiants de connexion (adresse email et mot de passe). Toute
          utilisation du Service effectuée à partir du Compte de
          l&apos;Utilisateur sera présumée avoir été effectuée par celui-ci.
        </LegalParagraph>
        <LegalParagraph>
          En cas de perte, de vol ou d&apos;utilisation frauduleuse de ses
          identifiants, l&apos;Utilisateur s&apos;engage à en informer
          immédiatement l&apos;Éditeur à l&apos;adresse :
          contact@smartplanning.fr
        </LegalParagraph>
        <LegalParagraph>
          <strong>4.3 Types de comptes</strong>
        </LegalParagraph>
        <LegalParagraph>
          La Plateforme propose différents niveaux d&apos;accès :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="director">
              <strong>Directeur (DIRECTOR)</strong> : accès complet à toutes les
              fonctionnalités de gestion de l&apos;entreprise
            </span>,
            <span key="manager">
              <strong>Manager (MANAGER)</strong> : accès à la gestion de son
              équipe et aux plannings associés
            </span>,
            <span key="employee">
              <strong>Employé (EMPLOYEE)</strong> : accès à son planning
              personnel et à ses demandes de congés
            </span>,
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Article 5 - Abonnements et Tarifs */}
      <LegalSection
        id="abonnements"
        title="Abonnements et Tarifs"
        number="Article 5"
      >
        <LegalParagraph>
          <strong>5.1 Offres d&apos;abonnement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le Service est proposé selon différentes formules d&apos;abonnement
          dont les caractéristiques et tarifs sont détaillés sur la page Tarifs
          de la Plateforme. Les tarifs sont exprimés en euros et hors taxes.
        </LegalParagraph>
        <LegalParagraph>
          <strong>5.2 Période d&apos;essai</strong>
        </LegalParagraph>
        <LegalParagraph>
          Une période d&apos;essai gratuite peut être proposée pour certaines
          formules. À l&apos;issue de cette période, le Client devra souscrire
          un abonnement payant pour continuer à utiliser le Service.
        </LegalParagraph>
        <LegalParagraph>
          <strong>5.3 Facturation et paiement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Les modalités de facturation et de paiement sont définies dans les
          Conditions Générales de Vente (CGV), disponibles sur la Plateforme.
        </LegalParagraph>
        <LegalParagraph>
          <strong>5.4 Modification des tarifs</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur se réserve le droit de modifier ses tarifs à tout
          moment. Les nouveaux tarifs seront applicables aux nouveaux
          abonnements et aux renouvellements. Les Clients seront informés de
          toute modification tarifaire au moins 30 jours avant son entrée en
          vigueur.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 6 - Obligations de l'Utilisateur */}
      <LegalSection
        id="obligations-utilisateur"
        title="Obligations de l'Utilisateur"
        number="Article 6"
      >
        <LegalParagraph>
          <strong>6.1 Utilisation conforme</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Utilisateur s&apos;engage à utiliser le Service conformément
          aux présentes CGU, aux lois et règlements en vigueur, et de manière
          responsable.
        </LegalParagraph>
        <LegalParagraph>
          <strong>6.2 Comportements interdits</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Utilisateur s&apos;interdit notamment de :
        </LegalParagraph>
        <LegalList
          items={[
            "Utiliser le Service à des fins illicites ou contraires à l'ordre public",
            'Porter atteinte aux droits de tiers (propriété intellectuelle, vie privée, etc.)',
            'Transmettre des virus, logiciels malveillants ou tout code nuisible',
            "Tenter d'accéder de manière non autorisée au Service ou aux systèmes informatiques de l'Éditeur",
            "Collecter des données personnelles d'autres utilisateurs sans autorisation",
            'Utiliser des robots, scrapers ou tout autre moyen automatisé pour accéder au Service',
            "Revendre ou sous-licencier l'accès au Service sans autorisation",
            "Usurper l'identité d'un tiers",
          ]}
        />
        <LegalParagraph>
          <strong>6.3 Contenu publié</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Utilisateur est seul responsable du Contenu qu&apos;il publie
          ou transmet via le Service. Il garantit détenir tous les droits
          nécessaires sur ce Contenu et s&apos;engage à ce que celui-ci ne porte
          pas atteinte aux droits de tiers.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 7 - Propriété intellectuelle */}
      <LegalSection
        id="propriete-intellectuelle"
        title="Propriété intellectuelle"
        number="Article 7"
      >
        <LegalParagraph>
          <strong>7.1 Droits de l&apos;Éditeur</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;ensemble des éléments constituant la Plateforme (textes,
          graphismes, logiciels, photographies, images, vidéos, sons, plans,
          noms, logos, marques, créations et œuvres protégeables diverses, bases
          de données, etc.) ainsi que la Plateforme elle-même, sont la propriété
          exclusive de l&apos;Éditeur ou font l&apos;objet d&apos;une
          autorisation d&apos;utilisation.
        </LegalParagraph>
        <LegalParagraph>
          Ces éléments sont protégés par les lois françaises et internationales
          relatives à la propriété intellectuelle.
        </LegalParagraph>
        <LegalParagraph>
          <strong>7.2 Licence d&apos;utilisation</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur concède à l&apos;Utilisateur une licence personnelle,
          non exclusive, non transférable et révocable d&apos;utilisation du
          Service, dans le cadre de son activité professionnelle et conformément
          aux présentes CGU.
        </LegalParagraph>
        <LegalParagraph>
          <strong>7.3 Restrictions</strong>
        </LegalParagraph>
        <LegalParagraph>
          Toute reproduction, représentation, modification, publication,
          transmission, dénaturation, totale ou partielle de la Plateforme ou de
          son contenu, par quelque procédé que ce soit, et sur quelque support
          que ce soit est interdite sans l&apos;autorisation écrite préalable de
          l&apos;Éditeur.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 8 - Données personnelles */}
      <LegalSection
        id="donnees-personnelles"
        title="Données personnelles et RGPD"
        number="Article 8"
      >
        <LegalHighlight type="info">
          Pour une information complète sur le traitement de vos données
          personnelles, veuillez consulter notre{' '}
          <LegalLink href="/confidentialite">
            Politique de Confidentialité
          </LegalLink>
          .
        </LegalHighlight>

        <LegalParagraph>
          <strong>8.1 Responsable du traitement</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur, Christophe MOSTEFAOUI, est responsable du traitement
          des Données Personnelles collectées dans le cadre de
          l&apos;utilisation du Service, au sens du Règlement Général sur la
          Protection des Données (RGPD).
        </LegalParagraph>
        <LegalParagraph>
          <strong>8.2 Données collectées</strong>
        </LegalParagraph>
        <LegalParagraph>
          Dans le cadre de l&apos;utilisation du Service, l&apos;Éditeur est
          amené à collecter et traiter les Données Personnelles suivantes :
        </LegalParagraph>
        <LegalList
          items={[
            "Données d'identification : nom, prénom, adresse email professionnelle",
            'Données de connexion : adresse IP, logs de connexion, données de navigation',
            'Données professionnelles : fonction, équipe, planning, congés',
            "Données d'utilisation : interactions avec le Service, préférences",
          ]}
        />
        <LegalParagraph>
          <strong>8.3 Finalités du traitement</strong>
        </LegalParagraph>
        <LegalParagraph>Les données sont collectées pour :</LegalParagraph>
        <LegalList
          items={[
            'Fournir et améliorer le Service',
            'Gérer les comptes utilisateurs',
            'Assurer la sécurité du Service',
            'Répondre aux demandes des utilisateurs',
            'Envoyer des communications relatives au Service',
            'Respecter les obligations légales',
          ]}
        />
        <LegalParagraph>
          <strong>8.4 Base légale du traitement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le traitement des données est fondé sur :
        </LegalParagraph>
        <LegalList
          items={[
            "L'exécution du contrat (fourniture du Service)",
            "Le consentement de l'utilisateur (communications marketing)",
            "L'intérêt légitime de l'éditeur (amélioration du Service, sécurité)",
            'Le respect des obligations légales',
          ]}
        />
        <LegalParagraph>
          <strong>8.5 Durée de conservation</strong>
        </LegalParagraph>
        <LegalParagraph>
          Les données sont conservées pendant la durée de la relation
          contractuelle, puis archivées conformément aux délais de prescription
          légaux (généralement 5 ans après la fin du contrat).
        </LegalParagraph>
        <LegalParagraph>
          <strong>8.6 Droits des Utilisateurs</strong>
        </LegalParagraph>
        <LegalParagraph>
          Conformément au RGPD, l&apos;Utilisateur dispose des droits suivants :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="acces">
              <strong>Droit d&apos;accès</strong> : obtenir la confirmation du
              traitement et accéder à ses données
            </span>,
            <span key="rectification">
              <strong>Droit de rectification</strong> : faire corriger des
              données inexactes ou incomplètes
            </span>,
            <span key="effacement">
              <strong>Droit à l&apos;effacement</strong> : demander la
              suppression de ses données (&quot;droit à l&apos;oubli&quot;)
            </span>,
            <span key="limitation">
              <strong>Droit à la limitation</strong> : limiter le traitement de
              ses données
            </span>,
            <span key="portabilite">
              <strong>Droit à la portabilité</strong> : récupérer ses données
              dans un format structuré
            </span>,
            <span key="opposition">
              <strong>Droit d&apos;opposition</strong> : s&apos;opposer au
              traitement de ses données
            </span>,
            <span key="directives">
              <strong>Droit de définir des directives</strong> : concernant le
              sort des données après le décès
            </span>,
          ]}
        />
        <LegalParagraph>
          Pour exercer ces droits, l&apos;Utilisateur peut contacter
          l&apos;Éditeur à l&apos;adresse : contact@smartplanning.fr
        </LegalParagraph>
        <LegalParagraph>
          <strong>8.7 Réclamation auprès de la CNIL</strong>
        </LegalParagraph>
        <LegalParagraph>
          En cas de difficulté, l&apos;Utilisateur peut introduire une
          réclamation auprès de la Commission Nationale de l&apos;Informatique
          et des Libertés (CNIL) : www.cnil.fr
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 9 - Accès support technique (SP-455 RGPD) */}
      <LegalSection
        id="acces-support"
        title="Accès support technique"
        number="Article 9"
      >
        <LegalParagraph>
          <strong>9.1 Mode support en lecture seule</strong>
        </LegalParagraph>
        <LegalParagraph>
          Afin de fournir un support technique de qualité, l&apos;Éditeur se
          réserve le droit d&apos;accéder à l&apos;espace du Client en mode
          lecture seule, à la demande du Client ou lors du diagnostic d&apos;un
          incident signalé. Cet accès est strictement encadré par les garanties
          suivantes :
        </LegalParagraph>
        <LegalList
          items={[
            'L\u2019accès est limité à 1 heure maximum par session, au-delà de laquelle il expire automatiquement',
            'Aucune modification, suppression ou création de données n\u2019est possible pendant cet accès (50 opérations de mutation sont bloquées côté serveur)',
            'Chaque session d\u2019accès est systématiquement enregistrée dans un journal d\u2019audit horodaté, incluant l\u2019identité de l\u2019administrateur, l\u2019entreprise concernée, la date, l\u2019heure de début et la durée de la session',
            'Les données de paiement et de facturation (informations bancaires, numéros de carte) ne sont jamais accessibles lors de ces sessions',
            'Les mots de passe des Utilisateurs ne sont jamais exposés (stockage par hachage irréversible)',
          ]}
        />
        <LegalParagraph>
          <strong>9.2 Base légale</strong>
        </LegalParagraph>
        <LegalParagraph>
          Ce traitement repose sur l&apos;intérêt légitime de l&apos;Éditeur au
          sens de l&apos;Article 6.1.f du Règlement (UE) 2016/679 (RGPD), à
          savoir le maintien de la qualité et de la continuité du service
          souscrit par le Client.
        </LegalParagraph>
        <LegalParagraph>
          <strong>9.3 Droits du Client</strong>
        </LegalParagraph>
        <LegalParagraph>
          Conformément au RGPD, tout Client peut :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="historique">
              <strong>Demander l&apos;historique</strong> des sessions
              d&apos;accès support ayant concerné son compte, en contactant :{' '}
              <LegalLink href="mailto:contact@smartplanning.fr">
                contact@smartplanning.fr
              </LegalLink>
            </span>,
            <span key="opposition">
              <strong>S&apos;opposer</strong> à ce traitement (Article 21 RGPD).
              Dans ce cas, l&apos;Éditeur ne sera plus en mesure de fournir un
              support technique de niveau 2 (diagnostic en conditions réelles).
              Cette limitation sera notifiée au Client par écrit.
            </span>,
          ]}
        />
        <LegalParagraph>
          <strong>9.4 Conservation des données d&apos;audit</strong>
        </LegalParagraph>
        <LegalParagraph>
          Les entrées du journal d&apos;audit relatives aux sessions
          d&apos;accès support sont conservées 12 mois à compter de la date de
          la session, conformément à la politique de rétention des logs de
          SmartPlanning.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 10 - Responsabilité */}
      <LegalSection
        id="responsabilite"
        title="Responsabilité"
        number="Article 10"
      >
        <LegalParagraph>
          <strong>10.1 Responsabilité de l&apos;Éditeur</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur s&apos;engage à mettre en œuvre tous les moyens
          nécessaires pour assurer la continuité et la qualité du Service.
          Toutefois, sa responsabilité est limitée à une obligation de moyens.
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur ne saurait être tenu responsable :
        </LegalParagraph>
        <LegalList
          items={[
            'Des interruptions temporaires du Service pour maintenance ou mise à jour',
            'Des dysfonctionnements ou interruptions dus à des causes externes (force majeure, défaillance des réseaux de télécommunication, etc.)',
            "De l'utilisation faite du Service par les Utilisateurs",
            'Du contenu publié par les Utilisateurs',
            "Des dommages indirects résultant de l'utilisation du Service",
          ]}
        />
        <LegalParagraph>
          <strong>10.2 Responsabilité de l&apos;Utilisateur</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Utilisateur est seul responsable de l&apos;utilisation
          qu&apos;il fait du Service et des conséquences qui en découlent. Il
          garantit l&apos;Éditeur contre toute réclamation de tiers liée à son
          utilisation du Service.
        </LegalParagraph>
        <LegalParagraph>
          <strong>10.3 Force majeure</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur ne pourra être tenu responsable de tout retard ou
          inexécution résultant d&apos;un cas de force majeure tel que défini
          par l&apos;article 1218 du Code civil et la jurisprudence des
          tribunaux français.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 11 - Résiliation */}
      <LegalSection id="resiliation" title="Résiliation" number="Article 11">
        <LegalParagraph>
          <strong>11.1 Résiliation par l&apos;Utilisateur</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Utilisateur peut résilier son Compte à tout moment, depuis les
          paramètres de son profil ou en contactant le support. La résiliation
          prendra effet à la fin de la période d&apos;abonnement en cours.
        </LegalParagraph>
        <LegalParagraph>
          <strong>11.2 Résiliation par l&apos;Éditeur</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur se réserve le droit de suspendre ou résilier le Compte
          d&apos;un Utilisateur en cas de :
        </LegalParagraph>
        <LegalList
          items={[
            'Non-respect des présentes CGU',
            'Non-paiement des sommes dues',
            'Utilisation frauduleuse ou abusive du Service',
            "Atteinte aux droits de tiers ou à l'intégrité du Service",
            'Comportement portant atteinte à l&apos;image de l&apos;Éditeur',
          ]}
        />
        <LegalParagraph>
          <strong>11.3 Conséquences de la résiliation</strong>
        </LegalParagraph>
        <LegalParagraph>
          En cas de résiliation, l&apos;Utilisateur perd l&apos;accès à son
          Compte et aux données qui y sont associées. L&apos;Utilisateur pourra
          demander une copie de ses données avant la résiliation effective.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 12 - Modification des CGU */}
      <LegalSection
        id="modification-cgu"
        title="Modification des CGU"
        number="Article 12"
      >
        <LegalParagraph>
          L&apos;Éditeur se réserve le droit de modifier les présentes CGU à
          tout moment. Les Utilisateurs seront informés de toute modification
          par email ou par notification sur la Plateforme, au moins 30 jours
          avant l&apos;entrée en vigueur des nouvelles conditions.
        </LegalParagraph>
        <LegalParagraph>
          L&apos;utilisation continue du Service après l&apos;entrée en vigueur
          des nouvelles CGU vaut acceptation de celles-ci. En cas de désaccord,
          l&apos;Utilisateur pourra résilier son Compte conformément à
          l&apos;Article 11.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 13 - Droit applicable et juridiction */}
      <LegalSection
        id="droit-applicable"
        title="Droit applicable et juridiction"
        number="Article 13"
      >
        <LegalParagraph>
          Les présentes CGU sont soumises au droit français.
        </LegalParagraph>
        <LegalParagraph>
          En cas de litige relatif à l&apos;interprétation ou à l&apos;exécution
          des présentes CGU, les parties s&apos;efforceront de trouver une
          solution amiable. À défaut, le litige sera porté devant les tribunaux
          compétents du ressort de la Cour d&apos;appel de Pau.
        </LegalParagraph>
        <LegalParagraph>
          Conformément aux articles L.616-1 et R.616-1 du Code de la
          consommation, le Client consommateur peut recourir gratuitement à un
          médiateur de la consommation en vue de la résolution amiable d&apos;un
          litige.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 14 - Contact */}
      <LegalSection id="contact" title="Contact" number="Article 14">
        <LegalParagraph>
          Pour toute question relative aux présentes CGU ou à l&apos;utilisation
          du Service, l&apos;Utilisateur peut contacter l&apos;Éditeur :
        </LegalParagraph>

        <LegalContact
          title="SmartPlanning - Support"
          email="contact@smartplanning.fr"
          address="64170 Artix, France"
        />

        <LegalParagraph className="mt-6">
          Pour les demandes relatives à la protection des données personnelles :
        </LegalParagraph>

        <LegalContact
          title="Délégué à la Protection des Données (DPO)"
          email="contact@smartplanning.fr"
        />
      </LegalSection>

      <LegalDivider />

      {/* Acceptation */}
      <LegalAcceptanceBox
        message="En utilisant SmartPlanning, vous reconnaissez avoir lu, compris et accepté les présentes Conditions Générales d'Utilisation dans leur intégralité."
        lastUpdated="19 février 2026"
        version="1.1"
      />
    </LegalPageLayout>
  )
}
