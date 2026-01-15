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
  title: 'Politique Cookies | SmartPlanning',
  description:
    'Découvrez comment SmartPlanning utilise les cookies et traceurs. Informations sur les types de cookies, leurs finalités et comment gérer vos préférences.',
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

        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Nom
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Finalité
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Durée
                </th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">
                  next-auth.session-token
                </td>
                <td className="px-4 py-3">
                  Authentification et session utilisateur
                </td>
                <td className="px-4 py-3">Session</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">
                  next-auth.csrf-token
                </td>
                <td className="px-4 py-3">
                  Protection contre les attaques CSRF
                </td>
                <td className="px-4 py-3">Session</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">
                  next-auth.callback-url
                </td>
                <td className="px-4 py-3">
                  Redirection après authentification
                </td>
                <td className="px-4 py-3">Session</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">
                  cookie-consent
                </td>
                <td className="px-4 py-3">
                  Mémorisation de vos choix de cookies
                </td>
                <td className="px-4 py-3">12 mois</td>
              </tr>
            </tbody>
          </table>
        </div>
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

        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Nom
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Fournisseur
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Finalité
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Durée
                </th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">_ga</td>
                <td className="px-4 py-3">Google Analytics</td>
                <td className="px-4 py-3">
                  Distinction des utilisateurs uniques
                </td>
                <td className="px-4 py-3">2 ans</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">_ga_*</td>
                <td className="px-4 py-3">Google Analytics</td>
                <td className="px-4 py-3">
                  Conservation de l&apos;état de session
                </td>
                <td className="px-4 py-3">2 ans</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">_gid</td>
                <td className="px-4 py-3">Google Analytics</td>
                <td className="px-4 py-3">Distinction des utilisateurs</td>
                <td className="px-4 py-3">24 heures</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">_gat</td>
                <td className="px-4 py-3">Google Analytics</td>
                <td className="px-4 py-3">Limitation du taux de requêtes</td>
                <td className="px-4 py-3">1 minute</td>
              </tr>
            </tbody>
          </table>
        </div>

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

        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Nom
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Finalité
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Durée
                </th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">theme</td>
                <td className="px-4 py-3">
                  Préférence de thème (clair/sombre)
                </td>
                <td className="px-4 py-3">12 mois</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">locale</td>
                <td className="px-4 py-3">Préférence de langue</td>
                <td className="px-4 py-3">12 mois</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">
                  sidebar-state
                </td>
                <td className="px-4 py-3">État de la barre latérale</td>
                <td className="px-4 py-3">Session</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-mono text-cyan-400">
                  calendar-view
                </td>
                <td className="px-4 py-3">
                  Préférence d&apos;affichage du calendrier
                </td>
                <td className="px-4 py-3">12 mois</td>
              </tr>
            </tbody>
          </table>
        </div>

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

        <div className="my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Service
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Finalité
                </th>
                <th className="px-4 py-3 text-left font-semibold text-white">
                  Politique de confidentialité
                </th>
              </tr>
            </thead>
            <tbody className="text-white/70">
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-semibold text-white">Stripe</td>
                <td className="px-4 py-3">Traitement sécurisé des paiements</td>
                <td className="px-4 py-3">
                  <a
                    href="https://stripe.com/fr/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    stripe.com/privacy
                  </a>
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-4 py-3 font-semibold text-white">Google</td>
                <td className="px-4 py-3">
                  Analytics et mesure d&apos;audience
                </td>
                <td className="px-4 py-3">
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline"
                  >
                    policies.google.com/privacy
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

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
              <a
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                support.google.com/chrome/answer/95647
              </a>
            </span>,
            <span key="firefox">
              <strong>Mozilla Firefox :</strong>{' '}
              <a
                href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                support.mozilla.org/fr/kb/activer-desactiver-cookies
              </a>
            </span>,
            <span key="safari">
              <strong>Safari :</strong>{' '}
              <a
                href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                support.apple.com/fr-fr/guide/safari
              </a>
            </span>,
            <span key="edge">
              <strong>Microsoft Edge :</strong>{' '}
              <a
                href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline"
              >
                support.microsoft.com/fr-fr/microsoft-edge
              </a>
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
          <a href="/confidentialite" className="text-cyan-400 hover:underline">
            Politique de Confidentialité
          </a>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Acceptation */}
      <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-6">
        <p className="text-center text-sm text-white/60">
          En continuant à naviguer sur SmartPlanning après avoir été informé de
          l&apos;utilisation des cookies, vous acceptez leur utilisation
          conformément à cette politique.
        </p>
        <p className="mt-4 text-center text-xs text-white/40">
          Dernière mise à jour : 15 janvier 2026 | Version 1.0
        </p>
      </div>
    </LegalPageLayout>
  )
}
