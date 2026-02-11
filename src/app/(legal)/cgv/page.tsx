/**
 * CGV Page - Conditions Générales de Vente
 *
 * @description Document légal définissant les conditions commerciales
 * de la plateforme SmartPlanning (abonnements, paiements, rétractation)
 *
 * @see SP-280 - Page CGV : Conditions Générales de Vente
 * @ticket SP-280
 */

import { ShoppingCart } from 'lucide-react'
import { Metadata } from 'next'
import {
  LegalAcceptanceBox,
  LegalContact,
  LegalDivider,
  LegalHighlight,
  LegalList,
  LegalPageLayout,
  LegalParagraph,
  LegalSection,
  type TableOfContentsItem,
} from '../components'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | SmartPlanning',
  description:
    'Consultez les conditions générales de vente de SmartPlanning. Informations sur les tarifs, abonnements, modalités de paiement et droit de rétractation.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'}/cgv`,
  },
  openGraph: {
    title: 'Conditions Générales de Vente | SmartPlanning',
    description:
      'Conditions commerciales et tarifaires de la plateforme SmartPlanning.',
    type: 'website',
  },
}

// Table des matières
const tableOfContents: TableOfContentsItem[] = [
  { id: 'objet', title: 'Article 1 - Objet', level: 1 },
  {
    id: 'produits-services',
    title: 'Article 2 - Produits et Services',
    level: 1,
  },
  { id: 'tarifs', title: 'Article 3 - Tarifs', level: 1 },
  { id: 'commande', title: 'Article 4 - Commande', level: 1 },
  { id: 'paiement', title: 'Article 5 - Paiement', level: 1 },
  { id: 'abonnement', title: 'Article 6 - Abonnement', level: 1 },
  { id: 'retractation', title: 'Article 7 - Droit de rétractation', level: 1 },
  { id: 'livraison', title: 'Article 8 - Livraison et accès', level: 1 },
  { id: 'garanties', title: 'Article 9 - Garanties', level: 1 },
  { id: 'responsabilite', title: 'Article 10 - Responsabilité', level: 1 },
  { id: 'resiliation', title: 'Article 11 - Résiliation', level: 1 },
  { id: 'reclamations', title: 'Article 12 - Réclamations', level: 1 },
  { id: 'droit-applicable', title: 'Article 13 - Droit applicable', level: 1 },
  { id: 'contact', title: 'Article 14 - Contact', level: 1 },
]

export default function CGVPage() {
  return (
    <LegalPageLayout
      title="Conditions Générales de Vente"
      subtitle="Les présentes conditions générales de vente régissent les relations commerciales entre SmartPlanning et ses clients. Elles définissent les modalités de souscription, de paiement et d'utilisation de nos services."
      lastUpdated="15 janvier 2026"
      version="1.0"
      icon={<ShoppingCart className="h-5 w-5" />}
      tableOfContents={tableOfContents}
    >
      {/* Préambule */}
      <LegalHighlight type="important">
        <strong>Important :</strong> Toute souscription à un abonnement
        SmartPlanning implique l&apos;acceptation pleine et entière des
        présentes Conditions Générales de Vente. Veuillez les lire attentivement
        avant toute commande.
      </LegalHighlight>

      <LegalDivider />

      {/* Article 1 - Objet */}
      <LegalSection id="objet" title="Objet" number="Article 1">
        <LegalParagraph>
          Les présentes Conditions Générales de Vente (ci-après &quot;CGV&quot;)
          ont pour objet de définir les conditions dans lesquelles
          l&apos;Éditeur, Christophe MOSTEFAOUI, entrepreneur individuel dont le
          siège est situé à 64170 Artix, France, commercialise ses services de
          gestion de planning en ligne sous la marque SmartPlanning.
        </LegalParagraph>
        <LegalParagraph>
          Les CGV s&apos;appliquent à toute souscription d&apos;abonnement
          effectuée par un Client professionnel ou consommateur, via le site
          internet smartplanning.fr ou toute autre interface mise à disposition
          par l&apos;Éditeur.
        </LegalParagraph>
        <LegalParagraph>
          Les CGV prévalent sur tout autre document émanant du Client, sauf
          accord écrit et préalable de l&apos;Éditeur.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 2 - Produits et Services */}
      <LegalSection
        id="produits-services"
        title="Produits et Services"
        number="Article 2"
      >
        <LegalParagraph>
          <strong>2.1 Description du Service</strong>
        </LegalParagraph>
        <LegalParagraph>
          SmartPlanning est une solution SaaS (Software as a Service) de gestion
          de planning et de ressources humaines accessible via Internet. Le
          Service comprend notamment :
        </LegalParagraph>
        <LegalList
          items={[
            'Gestion des plannings et emplois du temps',
            'Gestion des équipes et des employés',
            'Suivi des congés et absences',
            'Tableaux de bord et statistiques',
            'Notifications et alertes',
            'Export des données',
            'Support technique',
          ]}
        />
        <LegalParagraph>
          <strong>2.2 Évolution du Service</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur se réserve le droit de faire évoluer les
          fonctionnalités du Service à tout moment, notamment pour en améliorer
          la qualité ou se conformer aux évolutions légales et technologiques.
          Ces évolutions ne pourront donner lieu à aucune indemnisation.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 3 - Tarifs */}
      <LegalSection id="tarifs" title="Tarifs" number="Article 3">
        <LegalParagraph>
          <strong>3.1 Grille tarifaire</strong>
        </LegalParagraph>
        <LegalParagraph>
          Les tarifs en vigueur sont ceux affichés sur la page Tarifs du site
          smartplanning.fr au moment de la souscription. Les prix sont exprimés
          en euros et s&apos;entendent :
        </LegalParagraph>
        <LegalList
          items={[
            'Hors Taxes (HT) pour les professionnels',
            'Toutes Taxes Comprises (TTC) pour les consommateurs',
          ]}
        />
        <LegalParagraph>
          <strong>3.2 Formules d&apos;abonnement</strong>
        </LegalParagraph>
        <LegalParagraph>
          SmartPlanning propose plusieurs formules adaptées aux besoins des
          entreprises :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="starter">
              <strong>Starter</strong> : Pour les petites équipes (jusqu&apos;à
              10 utilisateurs)
            </span>,
            <span key="business">
              <strong>Business</strong> : Pour les PME (jusqu&apos;à 50
              utilisateurs)
            </span>,
            <span key="enterprise">
              <strong>Enterprise</strong> : Pour les grandes organisations
              (utilisateurs illimités)
            </span>,
          ]}
        />
        <LegalParagraph>
          <strong>3.3 Modification des tarifs</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur se réserve le droit de modifier ses tarifs à tout
          moment. Les nouveaux tarifs s&apos;appliqueront aux nouvelles
          souscriptions et aux renouvellements d&apos;abonnement. Le Client sera
          informé de toute modification au moins 30 jours avant la date de
          renouvellement de son abonnement.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 4 - Commande */}
      <LegalSection id="commande" title="Commande" number="Article 4">
        <LegalParagraph>
          <strong>4.1 Processus de commande</strong>
        </LegalParagraph>
        <LegalParagraph>
          La souscription à un abonnement SmartPlanning s&apos;effectue en ligne
          via le site smartplanning.fr selon les étapes suivantes :
        </LegalParagraph>
        <LegalList
          ordered
          items={[
            "Création d'un compte utilisateur",
            "Sélection de la formule d'abonnement souhaitée",
            'Saisie des informations de facturation',
            'Acceptation des CGV et de la politique de confidentialité',
            'Validation du paiement',
            'Confirmation de la commande par email',
          ]}
        />
        <LegalParagraph>
          <strong>4.2 Confirmation de commande</strong>
        </LegalParagraph>
        <LegalParagraph>
          Toute commande validée fait l&apos;objet d&apos;un email de
          confirmation adressé au Client, récapitulant les éléments essentiels
          de la commande (formule, tarif, durée, date de début).
        </LegalParagraph>
        <LegalParagraph>
          <strong>4.3 Informations de facturation</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le Client s&apos;engage à fournir des informations exactes et
          complètes lors de sa commande. Toute erreur dans les informations de
          facturation pourra entraîner un retard ou un refus de la commande.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 5 - Paiement */}
      <LegalSection id="paiement" title="Paiement" number="Article 5">
        <LegalParagraph>
          <strong>5.1 Moyens de paiement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le paiement des abonnements SmartPlanning peut être effectué par :
        </LegalParagraph>
        <LegalList
          items={[
            'Carte bancaire (Visa, Mastercard, American Express)',
            'Prélèvement SEPA (pour les abonnements annuels)',
            'Virement bancaire (sur demande, pour les clients Enterprise)',
          ]}
        />
        <LegalParagraph>
          Les paiements sont sécurisés par notre partenaire Stripe, certifié PCI
          DSS niveau 1.
        </LegalParagraph>
        <LegalParagraph>
          <strong>5.2 Échéances de paiement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Selon la formule choisie, le paiement est dû :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="mensuel">
              <strong>Abonnement mensuel</strong> : paiement mensuel à date
              anniversaire
            </span>,
            <span key="annuel">
              <strong>Abonnement annuel</strong> : paiement en une fois à la
              souscription
            </span>,
          ]}
        />
        <LegalParagraph>
          <strong>5.3 Défaut de paiement</strong>
        </LegalParagraph>
        <LegalParagraph>
          En cas de défaut de paiement à l&apos;échéance, l&apos;Éditeur se
          réserve le droit de :
        </LegalParagraph>
        <LegalList
          items={[
            "Suspendre l'accès au Service après un délai de 7 jours",
            "Résilier l'abonnement après un délai de 30 jours",
            'Appliquer des pénalités de retard au taux légal en vigueur',
            'Facturer les frais de recouvrement engagés',
          ]}
        />
        <LegalParagraph>
          <strong>5.4 Facturation</strong>
        </LegalParagraph>
        <LegalParagraph>
          Une facture est émise à chaque paiement et mise à disposition du
          Client dans son espace personnel. Les factures sont conservées pendant
          10 ans conformément aux obligations légales.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 6 - Abonnement */}
      <LegalSection id="abonnement" title="Abonnement" number="Article 6">
        <LegalParagraph>
          <strong>6.1 Durée de l&apos;abonnement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Les abonnements SmartPlanning sont souscrits pour une durée initiale
          de :
        </LegalParagraph>
        <LegalList
          items={[
            '1 mois pour les abonnements mensuels',
            '12 mois pour les abonnements annuels',
          ]}
        />
        <LegalParagraph>
          <strong>6.2 Renouvellement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Sauf résiliation dans les conditions prévues à l&apos;Article 11, les
          abonnements sont renouvelés automatiquement par tacite reconduction
          pour une durée identique à la période initiale.
        </LegalParagraph>
        <LegalParagraph>
          <strong>6.3 Période d&apos;essai</strong>
        </LegalParagraph>
        <LegalParagraph>
          Une période d&apos;essai gratuite de 14 jours peut être proposée pour
          les nouvelles souscriptions. Durant cette période, le Client bénéficie
          de l&apos;ensemble des fonctionnalités de la formule choisie.
        </LegalParagraph>
        <LegalParagraph>
          À l&apos;issue de la période d&apos;essai, l&apos;abonnement est
          automatiquement converti en abonnement payant, sauf si le Client a
          expressément demandé la résiliation avant la fin de la période
          d&apos;essai.
        </LegalParagraph>
        <LegalParagraph>
          <strong>6.4 Changement de formule</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le Client peut à tout moment passer à une formule supérieure
          (upgrade). Le changement prend effet immédiatement et le montant est
          calculé au prorata de la période restante.
        </LegalParagraph>
        <LegalParagraph>
          Le passage à une formule inférieure (downgrade) prend effet au
          prochain renouvellement de l&apos;abonnement.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 7 - Droit de rétractation */}
      <LegalSection
        id="retractation"
        title="Droit de rétractation"
        number="Article 7"
      >
        <LegalHighlight type="warning">
          <strong>Information importante pour les consommateurs :</strong> En
          tant que consommateur, vous disposez d&apos;un droit de rétractation
          de 14 jours. Cependant, ce droit ne s&apos;applique pas si vous avez
          commencé à utiliser le Service avant la fin du délai de rétractation.
        </LegalHighlight>

        <LegalParagraph>
          <strong>7.1 Principe</strong>
        </LegalParagraph>
        <LegalParagraph>
          Conformément aux articles L.221-18 et suivants du Code de la
          consommation, le Client consommateur dispose d&apos;un délai de 14
          jours à compter de la souscription pour exercer son droit de
          rétractation, sans avoir à justifier de motifs ni à payer de
          pénalités.
        </LegalParagraph>
        <LegalParagraph>
          <strong>7.2 Exception</strong>
        </LegalParagraph>
        <LegalParagraph>
          Conformément à l&apos;article L.221-28 du Code de la consommation, le
          droit de rétractation ne peut être exercé pour les contrats de
          fourniture de contenu numérique non fourni sur un support matériel
          dont l&apos;exécution a commencé après accord préalable exprès du
          consommateur et renoncement exprès à son droit de rétractation.
        </LegalParagraph>
        <LegalParagraph>
          En acceptant les présentes CGV et en accédant au Service,
          l&apos;Utilisateur consommateur reconnaît expressément :
        </LegalParagraph>
        <LegalList
          items={[
            "Demander l'exécution immédiate du Service",
            "Renoncer à son droit de rétractation dès l'accès au Service",
          ]}
        />
        <LegalParagraph>
          <strong>7.3 Exercice du droit de rétractation</strong>
        </LegalParagraph>
        <LegalParagraph>
          Si le Client n&apos;a pas encore accédé au Service, il peut exercer
          son droit de rétractation en adressant une demande claire par email à
          contact@smartplanning.fr ou via le formulaire de contact, en indiquant
          ses coordonnées et le numéro de commande concerné.
        </LegalParagraph>
        <LegalParagraph>
          <strong>7.4 Remboursement</strong>
        </LegalParagraph>
        <LegalParagraph>
          En cas de rétractation valide, l&apos;Éditeur procède au remboursement
          intégral des sommes versées dans un délai de 14 jours suivant la
          réception de la demande, via le même moyen de paiement que celui
          utilisé pour la commande.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 8 - Livraison et accès */}
      <LegalSection
        id="livraison"
        title="Livraison et accès au Service"
        number="Article 8"
      >
        <LegalParagraph>
          <strong>8.1 Activation du Service</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;accès au Service est activé immédiatement après la validation
          du paiement. Le Client reçoit un email de confirmation contenant les
          informations de connexion à son espace personnel.
        </LegalParagraph>
        <LegalParagraph>
          <strong>8.2 Disponibilité</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur s&apos;engage à assurer une disponibilité du Service de
          99,5% sur une base mensuelle, hors périodes de maintenance programmée.
          Les maintenances programmées sont annoncées au moins 48 heures à
          l&apos;avance.
        </LegalParagraph>
        <LegalParagraph>
          <strong>8.3 Support technique</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le support technique est accessible selon la formule souscrite :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="starter-support">
              <strong>Starter</strong> : Support par email, réponse sous 48h
              ouvrées
            </span>,
            <span key="business-support">
              <strong>Business</strong> : Support par email et chat, réponse
              sous 24h ouvrées
            </span>,
            <span key="enterprise-support">
              <strong>Enterprise</strong> : Support prioritaire, account manager
              dédié
            </span>,
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Article 9 - Garanties */}
      <LegalSection id="garanties" title="Garanties" number="Article 9">
        <LegalParagraph>
          <strong>9.1 Garantie de conformité</strong>
        </LegalParagraph>
        <LegalParagraph>
          Conformément aux articles L.217-3 et suivants du Code de la
          consommation, l&apos;Éditeur garantit la conformité du Service aux
          spécifications annoncées et aux usages habituellement attendus
          d&apos;un service similaire.
        </LegalParagraph>
        <LegalParagraph>
          <strong>9.2 Garantie des vices cachés</strong>
        </LegalParagraph>
        <LegalParagraph>
          Conformément aux articles 1641 et suivants du Code civil,
          l&apos;Éditeur garantit le Client contre les vices cachés du Service.
        </LegalParagraph>
        <LegalParagraph>
          <strong>9.3 Exclusions de garantie</strong>
        </LegalParagraph>
        <LegalParagraph>
          Les garanties ne couvrent pas les défauts ou dysfonctionnements
          résultant :
        </LegalParagraph>
        <LegalList
          items={[
            "D'une utilisation non conforme aux CGU ou à la documentation",
            'De modifications apportées par le Client ou un tiers',
            'De la négligence ou faute du Client',
            "D'événements de force majeure",
            "De problèmes liés à l'environnement technique du Client",
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Article 10 - Responsabilité */}
      <LegalSection
        id="responsabilite"
        title="Responsabilité"
        number="Article 10"
      >
        <LegalParagraph>
          <strong>10.1 Limitation de responsabilité</strong>
        </LegalParagraph>
        <LegalParagraph>
          La responsabilité de l&apos;Éditeur au titre des présentes CGV est
          expressément limitée à l&apos;indemnisation des dommages directs
          prouvés par le Client.
        </LegalParagraph>
        <LegalParagraph>
          En tout état de cause, la responsabilité de l&apos;Éditeur ne pourra
          excéder le montant total des sommes versées par le Client au cours des
          12 derniers mois précédant le fait générateur du dommage.
        </LegalParagraph>
        <LegalParagraph>
          <strong>10.2 Exclusions</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur ne saurait être tenu responsable des dommages indirects
          tels que :
        </LegalParagraph>
        <LegalList
          items={[
            "Perte de chiffre d'affaires ou de bénéfices",
            'Perte de données',
            'Perte de clientèle',
            'Préjudice commercial',
            "Atteinte à l'image de marque",
          ]}
        />
        <LegalParagraph>
          <strong>10.3 Sauvegarde des données</strong>
        </LegalParagraph>
        <LegalParagraph>
          Bien que l&apos;Éditeur effectue des sauvegardes régulières, le Client
          est invité à effectuer ses propres sauvegardes des données qu&apos;il
          estime critiques via les fonctionnalités d&apos;export du Service.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 11 - Résiliation */}
      <LegalSection id="resiliation" title="Résiliation" number="Article 11">
        <LegalParagraph>
          <strong>11.1 Résiliation par le Client</strong>
        </LegalParagraph>
        <LegalParagraph>
          Le Client peut résilier son abonnement à tout moment depuis son espace
          personnel ou en contactant le support. La résiliation prend effet :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="mensuel-resil">
              <strong>Abonnement mensuel</strong> : à la fin du mois en cours
            </span>,
            <span key="annuel-resil">
              <strong>Abonnement annuel</strong> : à la date anniversaire du
              contrat
            </span>,
          ]}
        />
        <LegalParagraph>
          Aucun remboursement au prorata ne sera effectué pour la période
          restante.
        </LegalParagraph>
        <LegalParagraph>
          <strong>11.2 Résiliation par l&apos;Éditeur</strong>
        </LegalParagraph>
        <LegalParagraph>
          L&apos;Éditeur peut résilier l&apos;abonnement d&apos;un Client en cas
          de :
        </LegalParagraph>
        <LegalList
          items={[
            'Non-paiement persistant après mise en demeure',
            'Violation grave ou répétée des CGU',
            'Utilisation frauduleuse du Service',
            "Cessation d'activité du Client",
          ]}
        />
        <LegalParagraph>
          <strong>11.3 Conséquences de la résiliation</strong>
        </LegalParagraph>
        <LegalParagraph>
          À la résiliation, le Client conserve l&apos;accès au Service
          jusqu&apos;à la fin de la période payée. Passé ce délai, le compte est
          désactivé. Le Client dispose de 30 jours après la résiliation pour
          exporter ses données via les fonctionnalités du Service.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 12 - Réclamations */}
      <LegalSection id="reclamations" title="Réclamations" number="Article 12">
        <LegalParagraph>
          <strong>12.1 Service client</strong>
        </LegalParagraph>
        <LegalParagraph>
          Toute réclamation peut être adressée au service client par email à
          contact@smartplanning.fr ou via le formulaire de contact disponible
          sur le site. L&apos;Éditeur s&apos;engage à accuser réception de la
          réclamation sous 48 heures ouvrées et à y apporter une réponse sous 15
          jours ouvrés.
        </LegalParagraph>
        <LegalParagraph>
          <strong>12.2 Médiation</strong>
        </LegalParagraph>
        <LegalParagraph>
          Conformément aux articles L.612-1 et suivants du Code de la
          consommation, le Client consommateur peut recourir gratuitement à un
          médiateur de la consommation en cas de litige non résolu avec
          l&apos;Éditeur.
        </LegalParagraph>
        <LegalParagraph>
          Le médiateur compétent est : Médiateur de la consommation - Les
          coordonnées seront communiquées sur demande.
        </LegalParagraph>
        <LegalParagraph>
          Le Client peut également recourir à la plateforme européenne de
          règlement en ligne des litiges (RLL) accessible à l&apos;adresse :
          https://ec.europa.eu/consumers/odr
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 13 - Droit applicable */}
      <LegalSection
        id="droit-applicable"
        title="Droit applicable et juridiction"
        number="Article 13"
      >
        <LegalParagraph>
          Les présentes CGV sont soumises au droit français.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Pour les clients professionnels :</strong> En cas de litige,
          compétence exclusive est attribuée aux tribunaux du ressort de la Cour
          d&apos;appel de Pau, nonobstant pluralité de défendeurs ou appel en
          garantie.
        </LegalParagraph>
        <LegalParagraph>
          <strong>Pour les clients consommateurs :</strong> Conformément aux
          règles légales, le consommateur peut saisir soit les tribunaux du lieu
          où il demeurait au moment de la conclusion du contrat ou de la
          survenance du fait dommageable, soit ceux du lieu du siège de
          l&apos;Éditeur.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Article 14 - Contact */}
      <LegalSection id="contact" title="Contact" number="Article 14">
        <LegalParagraph>
          Pour toute question relative aux présentes CGV, aux commandes ou au
          Service, le Client peut contacter l&apos;Éditeur :
        </LegalParagraph>

        <LegalContact
          title="SmartPlanning - Service Commercial"
          email="contact@smartplanning.fr"
          address="64170 Artix, France"
        />

        <LegalParagraph className="mt-6">
          <strong>Informations légales :</strong>
        </LegalParagraph>
        <LegalList
          items={[
            'Raison sociale : Christophe MOSTEFAOUI - Entrepreneur individuel',
            'Siège social : 64170 Artix, France',
            'Email : contact@smartplanning.fr',
            'Hébergeur : OVH SAS, 2 rue Kellermann, 59100 Roubaix, France',
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Acceptation */}
      <LegalAcceptanceBox
        message="En souscrivant à un abonnement SmartPlanning, vous reconnaissez avoir lu, compris et accepté les présentes Conditions Générales de Vente dans leur intégralité."
        lastUpdated="15 janvier 2026"
        version="1.0"
      />
    </LegalPageLayout>
  )
}
