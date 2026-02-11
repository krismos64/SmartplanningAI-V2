/**
 * Cookies Page - Politique relative aux Cookies
 *
 * @description Document légal détaillant l'utilisation des cookies
 * et traceurs conformément au RGPD et à la directive ePrivacy
 *
 * @see SP-282 - Page Cookies : Politique cookies détaillée
 * @ticket SP-282
 */

import { Cookie } from 'lucide-react'
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
  LegalTable,
  type TableOfContentsItem,
} from '../components'

// SEO Metadata
export const metadata: Metadata = {
  title: 'Politique Cookies | SmartPlanning',
  description:
    'Découvrez comment SmartPlanning utilise les cookies et traceurs. Informations sur les types de cookies, leurs finalités et comment gérer vos préférences.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'}/cookies`,
  },
  openGraph: {
    title: 'Politique Cookies | SmartPlanning',
    description: 'Gestion des cookies et traceurs sur SmartPlanning.',
    type: 'website',
  },
}

// Table des matières
const tableOfContents: TableOfContentsItem[] = [
  { id: 'definition', title: "Qu'est-ce qu'un cookie ?", level: 1 },
  {
    id: 'utilisation',
    title: 'Comment utilisons-nous les cookies ?',
    level: 1,
  },
  { id: 'cookies-essentiels', title: 'Cookies essentiels', level: 1 },
  { id: 'cookies-analytiques', title: 'Cookies analytiques', level: 1 },
  { id: 'cookies-fonctionnels', title: 'Cookies fonctionnels', level: 1 },
  { id: 'cookies-marketing', title: 'Cookies marketing', level: 1 },
  { id: 'cookies-tiers', title: 'Cookies tiers', level: 1 },
  { id: 'duree', title: 'Durée de conservation', level: 1 },
  { id: 'gestion', title: 'Gérer vos préférences', level: 1 },
  { id: 'navigateur', title: 'Paramètres du navigateur', level: 1 },
  { id: 'modifications', title: 'Modifications', level: 1 },
  { id: 'contact', title: 'Contact', level: 1 },
]

export default function CookiesPage() {
  return (
    <LegalPageLayout
      title="Politique relative aux Cookies"
      subtitle="Cette politique explique comment SmartPlanning utilise les cookies et technologies similaires pour améliorer votre expérience sur notre plateforme, conformément à la réglementation européenne."
      lastUpdated="15 janvier 2026"
      version="1.0"
      icon={<Cookie className="h-5 w-5" />}
      tableOfContents={tableOfContents}
    >
      {/* Définition */}
      <LegalSection id="definition" title="Qu'est-ce qu'un cookie ?" number="1">
        <LegalParagraph>
          Un cookie est un petit fichier texte déposé sur votre terminal
          (ordinateur, tablette, smartphone) lors de votre visite sur un site
          web. Il permet au site de mémoriser des informations sur votre visite,
          comme votre langue préférée et d&apos;autres paramètres.
        </LegalParagraph>
        <LegalParagraph>
          Les cookies peuvent être déposés par le site que vous visitez
          (&quot;cookies propriétaires&quot; ou &quot;first-party&quot;) ou par
          des tiers (&quot;cookies tiers&quot; ou &quot;third-party&quot;).
        </LegalParagraph>
        <LegalHighlight type="info">
          <strong>Technologies similaires :</strong> En plus des cookies, nous
          pouvons utiliser d&apos;autres technologies de traçage comme le
          stockage local (localStorage), les pixels espions ou les identifiants
          d&apos;appareil. Cette politique couvre l&apos;ensemble de ces
          technologies.
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Utilisation */}
      <LegalSection
        id="utilisation"
        title="Comment utilisons-nous les cookies ?"
        number="2"
      >
        <LegalParagraph>
          SmartPlanning utilise les cookies pour plusieurs finalités :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="fonctionnement">
              <strong>Assurer le bon fonctionnement</strong> du site et de
              l&apos;application (cookies essentiels)
            </span>,
            <span key="preferences">
              <strong>Mémoriser vos préférences</strong> et personnaliser votre
              expérience (cookies fonctionnels)
            </span>,
            <span key="analyse">
              <strong>Analyser l&apos;utilisation</strong> de notre plateforme
              pour l&apos;améliorer (cookies analytiques)
            </span>,
            <span key="marketing">
              <strong>Mesurer l&apos;efficacité</strong> de nos campagnes
              marketing (cookies marketing)
            </span>,
          ]}
        />
        <LegalParagraph>
          Certains cookies sont indispensables au fonctionnement du site et ne
          peuvent pas être désactivés. D&apos;autres nécessitent votre
          consentement préalable.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Cookies essentiels */}
      <LegalSection
        id="cookies-essentiels"
        title="Cookies essentiels (strictement nécessaires)"
        number="3"
      >
        <LegalHighlight type="important">
          <strong>Pas de consentement requis :</strong> Ces cookies sont
          indispensables au fonctionnement du site. Ils ne peuvent pas être
          désactivés car ils sont nécessaires pour fournir le service que vous
          avez demandé.
        </LegalHighlight>

        <LegalParagraph>
          Les cookies essentiels utilisés par SmartPlanning :
        </LegalParagraph>

        <LegalTable
          columns={[
            { header: 'Nom', key: 'name', mono: true },
            { header: 'Finalité', key: 'purpose' },
            { header: 'Durée', key: 'duration' },
          ]}
          rows={[
            {
              name: 'next-auth.session-token',
              purpose: 'Authentification et session utilisateur',
              duration: 'Session',
            },
            {
              name: 'next-auth.csrf-token',
              purpose: 'Protection contre les attaques CSRF',
              duration: 'Session',
            },
            {
              name: 'next-auth.callback-url',
              purpose: 'Redirection après authentification',
              duration: 'Session',
            },
            {
              name: 'cookie-consent',
              purpose: 'Mémorisation de vos choix de cookies',
              duration: '12 mois',
            },
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Cookies analytiques */}
      <LegalSection
        id="cookies-analytiques"
        title="Cookies analytiques (mesure d'audience)"
        number="4"
      >
        <LegalParagraph>
          Ces cookies nous permettent de mesurer l&apos;audience de notre site
          et de comprendre comment les visiteurs l&apos;utilisent. Les données
          collectées sont anonymisées et utilisées uniquement à des fins
          statistiques.
        </LegalParagraph>

        <LegalHighlight type="warning">
          <strong>Consentement requis :</strong> Ces cookies ne sont déposés
          qu&apos;après avoir obtenu votre consentement via notre bandeau de
          gestion des cookies.
        </LegalHighlight>

        <LegalTable
          columns={[
            { header: 'Nom', key: 'name', mono: true },
            { header: 'Fournisseur', key: 'provider' },
            { header: 'Finalité', key: 'purpose' },
            { header: 'Durée', key: 'duration' },
          ]}
          rows={[
            {
              name: '_ga',
              provider: 'Google Analytics',
              purpose: 'Distinction des utilisateurs uniques',
              duration: '2 ans',
            },
            {
              name: '_ga_*',
              provider: 'Google Analytics',
              purpose: "Conservation de l'état de session",
              duration: '2 ans',
            },
            {
              name: '_gid',
              provider: 'Google Analytics',
              purpose: 'Distinction des utilisateurs',
              duration: '24 heures',
            },
            {
              name: '_gat',
              provider: 'Google Analytics',
              purpose: 'Limitation du taux de requêtes',
              duration: '1 minute',
            },
          ]}
        />

        <LegalParagraph>
          <strong>Note :</strong> Nous avons configuré Google Analytics en mode
          &quot;anonymisation IP&quot; pour renforcer la protection de votre vie
          privée. Aucune donnée personnelle identifiante n&apos;est transmise à
          Google.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Cookies fonctionnels */}
      <LegalSection
        id="cookies-fonctionnels"
        title="Cookies fonctionnels (préférences)"
        number="5"
      >
        <LegalParagraph>
          Ces cookies permettent de mémoriser vos préférences et de
          personnaliser votre expérience sur SmartPlanning.
        </LegalParagraph>

        <LegalTable
          columns={[
            { header: 'Nom', key: 'name', mono: true },
            { header: 'Finalité', key: 'purpose' },
            { header: 'Durée', key: 'duration' },
          ]}
          rows={[
            {
              name: 'theme',
              purpose: 'Préférence de thème (clair/sombre)',
              duration: '12 mois',
            },
            {
              name: 'locale',
              purpose: 'Préférence de langue',
              duration: '12 mois',
            },
            {
              name: 'sidebar-state',
              purpose: 'État de la barre latérale',
              duration: 'Session',
            },
            {
              name: 'calendar-view',
              purpose: "Préférence d'affichage du calendrier",
              duration: '12 mois',
            },
          ]}
        />

        <LegalParagraph>
          Si vous refusez ces cookies, certaines fonctionnalités de
          personnalisation pourraient ne pas être disponibles.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Cookies marketing */}
      <LegalSection
        id="cookies-marketing"
        title="Cookies marketing (publicité)"
        number="6"
      >
        <LegalParagraph>
          Ces cookies sont utilisés pour mesurer l&apos;efficacité de nos
          campagnes publicitaires et pour vous proposer des publicités
          pertinentes sur d&apos;autres sites.
        </LegalParagraph>

        <LegalHighlight type="warning">
          <strong>Consentement requis :</strong> Ces cookies ne sont déposés
          qu&apos;avec votre consentement explicite.
        </LegalHighlight>

        <LegalParagraph>
          <strong>Note :</strong> À ce jour, SmartPlanning n&apos;utilise pas de
          cookies publicitaires pour le ciblage. Si cela devait changer, cette
          politique serait mise à jour et votre consentement serait
          préalablement recueilli.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Cookies tiers */}
      <LegalSection id="cookies-tiers" title="Cookies tiers" number="7">
        <LegalParagraph>
          Certains services tiers intégrés à notre plateforme peuvent déposer
          leurs propres cookies :
        </LegalParagraph>

        <LegalTable
          columns={[
            { header: 'Service', key: 'service' },
            { header: 'Finalité', key: 'purpose' },
            { header: 'Politique de confidentialité', key: 'policy' },
          ]}
          rows={[
            {
              service: <strong>Stripe</strong>,
              purpose: 'Traitement sécurisé des paiements',
              policy: (
                <LegalLink href="https://stripe.com/fr/privacy" external>
                  stripe.com/privacy
                </LegalLink>
              ),
            },
            {
              service: <strong>Google</strong>,
              purpose: "Analytics et mesure d'audience",
              policy: (
                <LegalLink href="https://policies.google.com/privacy" external>
                  policies.google.com/privacy
                </LegalLink>
              ),
            },
          ]}
        />

        <LegalParagraph>
          Nous vous invitons à consulter les politiques de confidentialité de
          ces services tiers pour plus d&apos;informations sur leurs pratiques.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Durée de conservation */}
      <LegalSection
        id="duree"
        title="Durée de conservation des cookies"
        number="8"
      >
        <LegalParagraph>
          Conformément à la réglementation, les cookies ne peuvent pas avoir une
          durée de vie supérieure à 13 mois. Voici un récapitulatif des durées
          de conservation :
        </LegalParagraph>
        <LegalList
          items={[
            <span key="session">
              <strong>Cookies de session :</strong> Supprimés à la fermeture du
              navigateur
            </span>,
            <span key="essentiels">
              <strong>Cookies essentiels :</strong> Jusqu&apos;à 12 mois
            </span>,
            <span key="analytiques">
              <strong>Cookies analytiques :</strong> Jusqu&apos;à 13 mois
              maximum
            </span>,
            <span key="fonctionnels">
              <strong>Cookies fonctionnels :</strong> Jusqu&apos;à 12 mois
            </span>,
            <span key="consentement">
              <strong>Cookie de consentement :</strong> 12 mois (pour mémoriser
              vos choix)
            </span>,
          ]}
        />
        <LegalParagraph>
          À l&apos;expiration de ces délais, les cookies sont automatiquement
          supprimés ou votre consentement vous sera redemandé.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Gestion des préférences */}
      <LegalSection
        id="gestion"
        title="Gérer vos préférences de cookies"
        number="9"
      >
        <LegalParagraph>
          Vous pouvez à tout moment modifier vos préférences en matière de
          cookies :
        </LegalParagraph>

        <LegalParagraph>
          <strong>9.1 Via notre bandeau de gestion des cookies</strong>
        </LegalParagraph>
        <LegalParagraph>
          Lors de votre première visite, un bandeau vous permet de choisir les
          catégories de cookies que vous acceptez. Vous pouvez modifier ces
          choix à tout moment en cliquant sur le lien &quot;Gérer les
          cookies&quot; en bas de chaque page.
        </LegalParagraph>

        <LegalParagraph>
          <strong>9.2 Vos options</strong>
        </LegalParagraph>
        <LegalList
          items={[
            <span key="accepter">
              <strong>Tout accepter :</strong> Vous acceptez tous les cookies
            </span>,
            <span key="refuser">
              <strong>Tout refuser :</strong> Seuls les cookies essentiels sont
              activés
            </span>,
            <span key="personnaliser">
              <strong>Personnaliser :</strong> Vous choisissez catégorie par
              catégorie
            </span>,
          ]}
        />

        <LegalHighlight type="info">
          <strong>Rappel :</strong> Le refus des cookies non essentiels
          n&apos;affecte pas votre accès au Service. Seules certaines
          fonctionnalités de personnalisation ou de mesure d&apos;audience
          seront désactivées.
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Paramètres navigateur */}
      <LegalSection
        id="navigateur"
        title="Paramètres de votre navigateur"
        number="10"
      >
        <LegalParagraph>
          Vous pouvez également configurer votre navigateur pour accepter,
          refuser ou supprimer les cookies. Voici les liens vers les
          instructions des principaux navigateurs :
        </LegalParagraph>

        <LegalList
          items={[
            <span key="chrome">
              <strong>Google Chrome :</strong>{' '}
              <LegalLink
                href="https://support.google.com/chrome/answer/95647"
                external
              >
                support.google.com/chrome/answer/95647
              </LegalLink>
            </span>,
            <span key="firefox">
              <strong>Mozilla Firefox :</strong>{' '}
              <LegalLink
                href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies"
                external
              >
                support.mozilla.org/fr/kb/activer-desactiver-cookies
              </LegalLink>
            </span>,
            <span key="safari">
              <strong>Safari :</strong>{' '}
              <LegalLink
                href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
                external
              >
                support.apple.com/fr-fr/guide/safari
              </LegalLink>
            </span>,
            <span key="edge">
              <strong>Microsoft Edge :</strong>{' '}
              <LegalLink
                href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                external
              >
                support.microsoft.com/fr-fr/microsoft-edge
              </LegalLink>
            </span>,
          ]}
        />

        <LegalHighlight type="warning">
          <strong>Attention :</strong> Si vous configurez votre navigateur pour
          refuser tous les cookies, vous pourriez ne pas être en mesure
          d&apos;utiliser certaines fonctionnalités du site nécessitant une
          authentification.
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Modifications */}
      <LegalSection
        id="modifications"
        title="Modifications de cette politique"
        number="11"
      >
        <LegalParagraph>
          Nous pouvons mettre à jour cette Politique Cookies pour refléter les
          évolutions de nos pratiques ou de la réglementation. En cas de
          modification substantielle, nous vous en informerons via le bandeau de
          cookies.
        </LegalParagraph>
        <LegalParagraph>
          Nous vous encourageons à consulter régulièrement cette page pour
          rester informé de nos pratiques en matière de cookies.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Contact */}
      <LegalSection id="contact" title="Nous contacter" number="12">
        <LegalParagraph>
          Pour toute question relative à cette Politique Cookies ou à la gestion
          de vos préférences, vous pouvez nous contacter :
        </LegalParagraph>

        <LegalContact
          title="SmartPlanning - Gestion des cookies"
          email="contact@smartplanning.fr"
          address="64170 Artix, France"
        />

        <LegalParagraph className="mt-6">
          Pour plus d&apos;informations sur la protection de vos données
          personnelles, consultez notre{' '}
          <LegalLink href="/confidentialite">
            Politique de Confidentialité
          </LegalLink>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Acceptation */}
      <LegalAcceptanceBox
        message="En continuant à naviguer sur SmartPlanning après avoir été informé de l'utilisation des cookies, vous acceptez leur utilisation conformément à cette politique."
        lastUpdated="15 janvier 2026"
        version="1.0"
      />
    </LegalPageLayout>
  )
}
