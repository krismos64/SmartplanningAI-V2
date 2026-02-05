/**
 * Confidentialité Page - Politique de Confidentialité RGPD
 *
 * @description Document légal détaillant la collecte et le traitement
 * des données personnelles conformément au RGPD
 *
 * @see SP-281 - Page Confidentialité : Politique RGPD
 * @ticket SP-281
 */

import { Shield } from 'lucide-react'
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
  title: 'Politique de Confidentialité | SmartPlanning',
  description:
    'Découvrez comment SmartPlanning collecte, utilise et protège vos données personnelles. Politique de confidentialité conforme au RGPD.',
  openGraph: {
    title: 'Politique de Confidentialité | SmartPlanning',
    description: 'Protection de vos données personnelles - Conformité RGPD.',
    type: 'website',
  },
}

// Table des matières
const tableOfContents: TableOfContentsItem[] = [
  { id: 'introduction', title: 'Introduction', level: 1 },
  { id: 'responsable', title: 'Responsable du traitement', level: 1 },
  { id: 'donnees-collectees', title: 'Données collectées', level: 1 },
  { id: 'finalites', title: 'Finalités du traitement', level: 1 },
  { id: 'base-legale', title: 'Base légale', level: 1 },
  { id: 'destinataires', title: 'Destinataires des données', level: 1 },
  { id: 'transferts', title: 'Transferts hors UE', level: 1 },
  { id: 'duree-conservation', title: 'Durée de conservation', level: 1 },
  { id: 'droits', title: 'Vos droits', level: 1 },
  { id: 'securite', title: 'Sécurité des données', level: 1 },
  { id: 'cookies', title: 'Cookies', level: 1 },
  { id: 'modifications', title: 'Modifications', level: 1 },
  { id: 'contact', title: 'Contact', level: 1 },
]

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout
      title="Politique de Confidentialité"
      subtitle="SmartPlanning s'engage à protéger votre vie privée et vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations conformément au Règlement Général sur la Protection des Données (RGPD)."
      lastUpdated="15 janvier 2026"
      version="1.0"
      icon={<Shield className="h-5 w-5" />}
      tableOfContents={tableOfContents}
    >
      {/* Introduction */}
      <LegalSection id="introduction" title="Introduction" number="1">
        <LegalParagraph>
          La présente Politique de Confidentialité a pour objectif de vous
          informer sur la manière dont SmartPlanning collecte, traite et protège
          vos données personnelles lorsque vous utilisez notre plateforme de
          gestion de planning.
        </LegalParagraph>
        <LegalParagraph>
          Cette politique s&apos;applique à tous les utilisateurs de la
          plateforme SmartPlanning, qu&apos;ils soient visiteurs, utilisateurs
          inscrits ou clients.
        </LegalParagraph>
        <LegalHighlight type="important">
          <strong>Engagement RGPD :</strong> SmartPlanning est pleinement
          conforme au Règlement Général sur la Protection des Données (RGPD -
          Règlement UE 2016/679) entré en application le 25 mai 2018, ainsi
          qu&apos;à la loi Informatique et Libertés du 6 janvier 1978 modifiée.
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Responsable du traitement */}
      <LegalSection
        id="responsable"
        title="Responsable du traitement"
        number="2"
      >
        <LegalParagraph>
          Le responsable du traitement des données personnelles est :
        </LegalParagraph>
        <LegalContact
          title="Responsable du traitement"
          email="contact@smartplanning.fr"
          address="64170 Artix, France"
        />
        <LegalParagraph className="mt-6">
          <strong>Identité :</strong> Christophe MOSTEFAOUI, entrepreneur
          individuel, exploitant la plateforme SmartPlanning.
        </LegalParagraph>
        <LegalParagraph>
          En tant que responsable du traitement, nous déterminons les finalités
          et les moyens du traitement de vos données personnelles et nous nous
          engageons à les protéger conformément à la réglementation en vigueur.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Données collectées */}
      <LegalSection
        id="donnees-collectees"
        title="Données collectées"
        number="3"
      >
        <LegalParagraph>
          <strong>3.1 Données que vous nous fournissez directement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Lors de votre inscription et de l&apos;utilisation du Service, nous
          collectons :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="identite">
              <strong>Données d&apos;identification :</strong> nom, prénom,
              adresse email professionnelle
            </span>,
            <span key="entreprise">
              <strong>Données professionnelles :</strong> nom de
              l&apos;entreprise, fonction, équipe
            </span>,
            <span key="facturation">
              <strong>Données de facturation :</strong> adresse de facturation,
              informations de paiement (traitées par notre prestataire Stripe)
            </span>,
            <span key="planning">
              <strong>Données de planning :</strong> horaires, congés, absences,
              disponibilités
            </span>,
          ]}
        />

        <LegalParagraph>
          <strong>3.2 Données collectées automatiquement</strong>
        </LegalParagraph>
        <LegalParagraph>
          Lors de votre navigation sur notre plateforme, nous collectons
          automatiquement :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="connexion">
              <strong>Données de connexion :</strong> adresse IP, type de
              navigateur, système d&apos;exploitation, pages visitées
            </span>,
            <span key="logs">
              <strong>Logs d&apos;activité :</strong> dates et heures de
              connexion, actions effectuées sur la plateforme
            </span>,
            <span key="device">
              <strong>Données techniques :</strong> identifiant de
              l&apos;appareil, résolution d&apos;écran, langue du navigateur
            </span>,
            <span key="cookies">
              <strong>Cookies et traceurs :</strong> voir notre{' '}
              <LegalLink href="/cookies">Politique Cookies</LegalLink>
            </span>,
          ]}
        />

        <LegalParagraph>
          <strong>3.3 Données que nous ne collectons pas</strong>
        </LegalParagraph>
        <LegalParagraph>
          SmartPlanning ne collecte pas de données sensibles au sens du RGPD
          (origine raciale, opinions politiques, convictions religieuses,
          données de santé, orientation sexuelle, etc.) sauf si cela est
          strictement nécessaire et avec votre consentement explicite.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Finalités du traitement */}
      <LegalSection id="finalites" title="Finalités du traitement" number="4">
        <LegalParagraph>
          Vos données personnelles sont collectées et traitées pour les
          finalités suivantes :
        </LegalParagraph>

        <LegalParagraph>
          <strong>4.1 Fourniture et gestion du Service</strong>
        </LegalParagraph>
        <LegalList
          items={[
            'Création et gestion de votre compte utilisateur',
            'Fourniture des fonctionnalités de gestion de planning',
            'Gestion des équipes et des plannings',
            'Suivi des congés et absences',
            'Génération de rapports et statistiques',
          ]}
        />

        <LegalParagraph>
          <strong>4.2 Relation client et support</strong>
        </LegalParagraph>
        <LegalList
          items={[
            'Réponse à vos demandes et questions',
            'Support technique et assistance',
            'Envoi de notifications relatives au Service',
            'Communication sur les mises à jour et évolutions',
          ]}
        />

        <LegalParagraph>
          <strong>4.3 Facturation et paiements</strong>
        </LegalParagraph>
        <LegalList
          items={[
            'Gestion des abonnements et facturations',
            'Traitement des paiements (via Stripe)',
            'Envoi des factures et reçus',
            "Gestion des relances en cas d'impayé",
          ]}
        />

        <LegalParagraph>
          <strong>4.4 Amélioration du Service</strong>
        </LegalParagraph>
        <LegalList
          items={[
            "Analyse de l&apos;utilisation pour améliorer l'expérience utilisateur",
            'Détection et correction des bugs',
            'Développement de nouvelles fonctionnalités',
            'Mesure de performance et optimisation',
          ]}
        />

        <LegalParagraph>
          <strong>4.5 Sécurité et conformité</strong>
        </LegalParagraph>
        <LegalList
          items={[
            'Protection contre les fraudes et abus',
            'Sécurisation des accès et des données',
            'Respect des obligations légales et réglementaires',
            'Conservation des preuves en cas de litige',
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Base légale */}
      <LegalSection
        id="base-legale"
        title="Base légale du traitement"
        number="5"
      >
        <LegalParagraph>
          Conformément au RGPD, tout traitement de données personnelles doit
          reposer sur une base légale. Voici les bases légales sur lesquelles
          nous fondons nos traitements :
        </LegalParagraph>

        <LegalList
          items={[
            <span key="contrat">
              <strong>Exécution du contrat (Article 6.1.b RGPD) :</strong> Le
              traitement est nécessaire à la fourniture du Service que vous avez
              souscrit (création de compte, gestion des plannings, facturation).
            </span>,
            <span key="consentement">
              <strong>Consentement (Article 6.1.a RGPD) :</strong> Pour certains
              traitements comme l&apos;envoi de communications marketing ou
              l&apos;utilisation de cookies non essentiels, nous recueillons
              votre consentement préalable.
            </span>,
            <span key="interet">
              <strong>Intérêt légitime (Article 6.1.f RGPD) :</strong> Pour
              l&apos;amélioration du Service, la sécurité, la prévention des
              fraudes et l&apos;analyse d&apos;utilisation.
            </span>,
            <span key="legal">
              <strong>Obligation légale (Article 6.1.c RGPD) :</strong> Pour
              respecter nos obligations comptables, fiscales et réglementaires.
            </span>,
          ]}
        />

        <LegalHighlight type="info">
          <strong>Retrait du consentement :</strong> Lorsque le traitement est
          fondé sur votre consentement, vous pouvez le retirer à tout moment. Ce
          retrait ne remet pas en cause la licéité du traitement effectué avant
          le retrait.
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Destinataires des données */}
      <LegalSection
        id="destinataires"
        title="Destinataires des données"
        number="6"
      >
        <LegalParagraph>
          <strong>6.1 Accès interne</strong>
        </LegalParagraph>
        <LegalParagraph>
          Au sein de SmartPlanning, seules les personnes habilitées ont accès à
          vos données dans le cadre de leurs fonctions : équipe technique,
          support client, service comptable.
        </LegalParagraph>

        <LegalParagraph>
          <strong>6.2 Sous-traitants</strong>
        </LegalParagraph>
        <LegalParagraph>
          Nous faisons appel à des sous-traitants pour certaines opérations
          techniques. Ces sous-traitants agissent uniquement sur nos
          instructions et sont contractuellement tenus de respecter la
          confidentialité et la sécurité de vos données :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="ovh">
              <strong>OVH (France)</strong> - Hébergement des données et
              infrastructure serveur
            </span>,
            <span key="stripe">
              <strong>Stripe (USA/UE)</strong> - Traitement des paiements
              sécurisés
            </span>,
            <span key="resend">
              <strong>Resend (USA)</strong> - Envoi des emails transactionnels
            </span>,
            <span key="vercel">
              <strong>Vercel (USA)</strong> - Hébergement de l&apos;application
              web
            </span>,
          ]}
        />

        <LegalParagraph>
          <strong>6.3 Autres destinataires</strong>
        </LegalParagraph>
        <LegalParagraph>
          Vos données peuvent également être communiquées :
        </LegalParagraph>
        <LegalList
          items={[
            'Aux autorités compétentes en cas de réquisition judiciaire',
            'À des tiers en cas de restructuration de notre activité (fusion, acquisition)',
          ]}
        />
        <LegalParagraph>
          <strong>
            Nous ne vendons jamais vos données personnelles à des tiers.
          </strong>
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Transferts hors UE */}
      <LegalSection
        id="transferts"
        title="Transferts de données hors UE"
        number="7"
      >
        <LegalParagraph>
          Certains de nos sous-traitants sont situés en dehors de l&apos;Union
          Européenne, notamment aux États-Unis. Dans ce cas, nous nous assurons
          que des garanties appropriées sont mises en place :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="adequation">
              <strong>Décision d&apos;adéquation :</strong> Transferts vers des
              pays reconnus comme offrant un niveau de protection adéquat par la
              Commission européenne
            </span>,
            <span key="scc">
              <strong>Clauses Contractuelles Types (CCT) :</strong> Contrats
              incluant les clauses types adoptées par la Commission européenne
            </span>,
            <span key="dpf">
              <strong>Data Privacy Framework :</strong> Pour les transferts vers
              les USA, certification au EU-US Data Privacy Framework
            </span>,
          ]}
        />

        <LegalHighlight type="info">
          Vous pouvez obtenir une copie des garanties mises en place en nous
          contactant à l&apos;adresse : contact@smartplanning.fr
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Durée de conservation */}
      <LegalSection
        id="duree-conservation"
        title="Durée de conservation"
        number="8"
      >
        <LegalParagraph>
          Nous conservons vos données personnelles uniquement pendant la durée
          nécessaire aux finalités pour lesquelles elles ont été collectées :
        </LegalParagraph>

        <LegalList
          items={[
            <span key="compte">
              <strong>Données de compte :</strong> Pendant toute la durée de
              votre inscription, puis 3 ans après la dernière activité ou la
              clôture du compte
            </span>,
            <span key="facturation">
              <strong>Données de facturation :</strong> 10 ans conformément aux
              obligations comptables et fiscales
            </span>,
            <span key="logs">
              <strong>Logs de connexion :</strong> 1 an conformément aux
              obligations légales
            </span>,
            <span key="cookies">
              <strong>Données de cookies :</strong> 13 mois maximum
            </span>,
            <span key="prospects">
              <strong>Données prospects :</strong> 3 ans à compter du dernier
              contact
            </span>,
            <span key="support">
              <strong>Échanges support :</strong> 5 ans après la clôture du
              ticket
            </span>,
          ]}
        />

        <LegalParagraph>
          À l&apos;issue de ces délais, vos données sont supprimées ou
          anonymisées de manière irréversible.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Vos droits */}
      <LegalSection id="droits" title="Vos droits" number="9">
        <LegalParagraph>
          Conformément au RGPD, vous disposez des droits suivants sur vos
          données personnelles :
        </LegalParagraph>

        <LegalList
          items={[
            <span key="acces">
              <strong>Droit d&apos;accès (Article 15) :</strong> Vous pouvez
              obtenir la confirmation que vos données sont traitées et en
              recevoir une copie.
            </span>,
            <span key="rectification">
              <strong>Droit de rectification (Article 16) :</strong> Vous pouvez
              demander la correction de données inexactes ou incomplètes.
            </span>,
            <span key="effacement">
              <strong>Droit à l&apos;effacement (Article 17) :</strong> Vous
              pouvez demander la suppression de vos données dans certains cas
              (&quot;droit à l&apos;oubli&quot;).
            </span>,
            <span key="limitation">
              <strong>Droit à la limitation (Article 18) :</strong> Vous pouvez
              demander la limitation du traitement de vos données.
            </span>,
            <span key="portabilite">
              <strong>Droit à la portabilité (Article 20) :</strong> Vous pouvez
              recevoir vos données dans un format structuré et les transmettre à
              un autre responsable.
            </span>,
            <span key="opposition">
              <strong>Droit d&apos;opposition (Article 21) :</strong> Vous
              pouvez vous opposer au traitement de vos données pour des motifs
              légitimes.
            </span>,
            <span key="directives">
              <strong>Directives post-mortem :</strong> Vous pouvez définir des
              directives relatives au sort de vos données après votre décès.
            </span>,
          ]}
        />

        <LegalParagraph>
          <strong>Comment exercer vos droits ?</strong>
        </LegalParagraph>
        <LegalParagraph>
          Vous pouvez exercer ces droits à tout moment en nous contactant :
        </LegalParagraph>
        <LegalList
          items={[
            'Par email : contact@smartplanning.fr',
            'Via les paramètres de votre compte (pour certaines demandes)',
            'Par courrier postal à notre adresse',
          ]}
        />
        <LegalParagraph>
          Nous répondrons à votre demande dans un délai d&apos;un mois. Ce délai
          peut être prolongé de deux mois supplémentaires pour les demandes
          complexes.
        </LegalParagraph>

        <LegalHighlight type="warning">
          <strong>Réclamation auprès de la CNIL :</strong> Si vous estimez que
          vos droits ne sont pas respectés, vous pouvez introduire une
          réclamation auprès de la Commission Nationale de l&apos;Informatique
          et des Libertés (CNIL) : www.cnil.fr
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Sécurité des données */}
      <LegalSection id="securite" title="Sécurité des données" number="10">
        <LegalParagraph>
          SmartPlanning met en œuvre des mesures techniques et
          organisationnelles appropriées pour protéger vos données personnelles
          contre la destruction accidentelle ou illicite, la perte,
          l&apos;altération, la divulgation ou l&apos;accès non autorisé.
        </LegalParagraph>

        <LegalParagraph>
          <strong>10.1 Mesures techniques</strong>
        </LegalParagraph>
        <LegalList
          items={[
            'Chiffrement des données en transit (HTTPS/TLS)',
            'Chiffrement des données sensibles au repos',
            'Authentification sécurisée avec hachage des mots de passe (bcrypt)',
            'Protection contre les attaques courantes (XSS, CSRF, injection SQL)',
            'Sauvegardes régulières et chiffrées',
            'Surveillance et détection des intrusions',
          ]}
        />

        <LegalParagraph>
          <strong>10.2 Mesures organisationnelles</strong>
        </LegalParagraph>
        <LegalList
          items={[
            'Accès aux données limité aux personnes habilitées',
            'Sensibilisation du personnel à la protection des données',
            'Procédures de gestion des incidents de sécurité',
            'Audits de sécurité réguliers',
            'Politique de mots de passe robuste',
          ]}
        />

        <LegalParagraph>
          <strong>10.3 Notification des violations</strong>
        </LegalParagraph>
        <LegalParagraph>
          En cas de violation de données susceptible d&apos;engendrer un risque
          pour vos droits et libertés, nous nous engageons à notifier la CNIL
          dans les 72 heures et à vous informer dans les meilleurs délais si le
          risque est élevé.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Cookies */}
      <LegalSection id="cookies" title="Cookies et traceurs" number="11">
        <LegalParagraph>
          SmartPlanning utilise des cookies et traceurs pour assurer le bon
          fonctionnement du Service et améliorer votre expérience utilisateur.
        </LegalParagraph>
        <LegalParagraph>
          Pour en savoir plus sur les cookies que nous utilisons, comment les
          gérer et vos choix en la matière, consultez notre{' '}
          <LegalLink href="/cookies">Politique relative aux Cookies</LegalLink>.
        </LegalParagraph>
        <LegalHighlight type="info">
          Vous pouvez à tout moment modifier vos préférences en matière de
          cookies via le bandeau de gestion des cookies ou les paramètres de
          votre navigateur.
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Modifications */}
      <LegalSection
        id="modifications"
        title="Modifications de la politique"
        number="12"
      >
        <LegalParagraph>
          Nous pouvons mettre à jour cette Politique de Confidentialité pour
          refléter les évolutions de nos pratiques ou de la réglementation. En
          cas de modification substantielle, nous vous en informerons par email
          ou par notification sur la plateforme.
        </LegalParagraph>
        <LegalParagraph>
          Nous vous encourageons à consulter régulièrement cette page pour
          rester informé de nos pratiques en matière de protection des données.
        </LegalParagraph>
        <LegalParagraph>
          La date de dernière mise à jour est indiquée en haut de ce document.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Contact */}
      <LegalSection id="contact" title="Nous contacter" number="13">
        <LegalParagraph>
          Pour toute question relative à cette Politique de Confidentialité ou à
          la protection de vos données personnelles, vous pouvez nous contacter
          :
        </LegalParagraph>

        <LegalContact
          title="SmartPlanning - Protection des données"
          email="contact@smartplanning.fr"
          address="64170 Artix, France"
        />

        <LegalParagraph className="mt-6">
          <strong>Autorité de contrôle :</strong>
        </LegalParagraph>
        <LegalParagraph>
          Vous pouvez également contacter la Commission Nationale de
          l&apos;Informatique et des Libertés (CNIL) :
        </LegalParagraph>
        <LegalList
          items={[
            'Site web : www.cnil.fr',
            'Adresse : 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07',
            'Téléphone : 01 53 73 22 22',
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Acceptation */}
      <LegalAcceptanceBox
        message="En utilisant SmartPlanning, vous reconnaissez avoir pris connaissance de cette Politique de Confidentialité et acceptez le traitement de vos données personnelles conformément aux conditions décrites ci-dessus."
        lastUpdated="15 janvier 2026"
        version="1.0"
      />
    </LegalPageLayout>
  )
}
