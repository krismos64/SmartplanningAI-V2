/**
 * Mentions Légales Page
 *
 * @description Page des mentions légales obligatoires conformément à la LCEN
 * (Loi pour la Confiance dans l'Économie Numérique)
 *
 * @see SP-284 - Page Mentions Légales : Éditeur, hébergeur
 * @ticket SP-284
 */

import { Metadata } from 'next'
import {
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
  title: 'Mentions Légales | SmartPlanning',
  description:
    "Mentions légales de SmartPlanning : informations sur l'éditeur, l'hébergeur, le directeur de publication et la propriété intellectuelle.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://smartplanning.fr'}/mentions-legales`,
  },
  openGraph: {
    title: 'Mentions Légales | SmartPlanning',
    description:
      'Informations légales obligatoires de la plateforme SmartPlanning.',
    type: 'website',
  },
}

// Table des matières
const tableOfContents: TableOfContentsItem[] = [
  { id: 'editeur', title: 'Éditeur du site', level: 1 },
  { id: 'hebergeur', title: 'Hébergeur', level: 1 },
  { id: 'directeur', title: 'Directeur de la publication', level: 1 },
  { id: 'propriete', title: 'Propriété intellectuelle', level: 1 },
  { id: 'donnees', title: 'Protection des données', level: 1 },
  { id: 'cookies', title: 'Cookies', level: 1 },
  { id: 'responsabilite', title: 'Limitation de responsabilité', level: 1 },
  { id: 'liens', title: 'Liens hypertextes', level: 1 },
  { id: 'droit', title: 'Droit applicable', level: 1 },
  { id: 'contact', title: 'Contact', level: 1 },
]

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout
      title="Mentions Légales"
      subtitle="Informations légales obligatoires conformément à la LCEN (Loi pour la Confiance dans l'Économie Numérique)."
      lastUpdated="15 janvier 2026"
      tableOfContents={tableOfContents}
    >
      {/* Section 1 - Éditeur du site */}
      <LegalSection id="editeur" title="Éditeur du site" number="1">
        <LegalParagraph>
          Le présent site SmartPlanning est édité par :
        </LegalParagraph>

        <LegalHighlight type="info">
          <div className="space-y-2">
            <p>
              <strong>Raison sociale :</strong> SmartPlanning
            </p>
            <p>
              <strong>Forme juridique :</strong> Auto-entrepreneur
            </p>
            <p>
              <strong>Nom du responsable :</strong> Christophe Mostefaoui
            </p>
            <p>
              <strong>Adresse du siège social :</strong> 64170 Artix, France
            </p>
            <p>
              <strong>SIRET :</strong> 937 719 177 00019
            </p>
            <p>
              <strong>Email :</strong>{' '}
              <LegalLink href="mailto:contact@smartplanning.fr">
                contact@smartplanning.fr
              </LegalLink>
            </p>
          </div>
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Section 2 - Hébergeur */}
      <LegalSection id="hebergeur" title="Hébergeur" number="2">
        <LegalParagraph>Le site SmartPlanning est hébergé par :</LegalParagraph>

        <LegalHighlight type="info">
          <div className="space-y-2">
            <p>
              <strong>Raison sociale :</strong> OVH SAS
            </p>
            <p>
              <strong>Adresse :</strong> 2 rue Kellermann, 59100 Roubaix, France
            </p>
            <p>
              <strong>Téléphone :</strong> 1007 (depuis la France)
            </p>
            <p>
              <strong>Site web :</strong>{' '}
              <LegalLink href="https://www.ovhcloud.com" external>
                www.ovhcloud.com
              </LegalLink>
            </p>
          </div>
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Section 3 - Directeur de la publication */}
      <LegalSection
        id="directeur"
        title="Directeur de la publication"
        number="3"
      >
        <LegalParagraph>
          Le directeur de la publication du site SmartPlanning est :
        </LegalParagraph>

        <LegalHighlight type="info">
          <div className="space-y-2">
            <p>
              <strong>Nom :</strong> Christophe Mostefaoui
            </p>
            <p>
              <strong>Qualité :</strong> Fondateur et dirigeant de SmartPlanning
            </p>
            <p>
              <strong>Email :</strong>{' '}
              <LegalLink href="mailto:contact@smartplanning.fr">
                contact@smartplanning.fr
              </LegalLink>
            </p>
          </div>
        </LegalHighlight>

        <LegalParagraph>
          En tant que directeur de la publication, il est responsable du contenu
          publié sur le site conformément à la loi n° 2004-575 du 21 juin 2004
          pour la confiance dans l&apos;économie numérique (LCEN).
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Section 4 - Propriété intellectuelle */}
      <LegalSection id="propriete" title="Propriété intellectuelle" number="4">
        <LegalParagraph>
          L&apos;ensemble du contenu présent sur le site SmartPlanning est
          protégé par les dispositions du Code de la Propriété Intellectuelle
          français et les conventions internationales relatives au droit
          d&apos;auteur.
        </LegalParagraph>

        <LegalParagraph>Sont notamment protégés :</LegalParagraph>

        <LegalList
          items={[
            'La structure générale du site',
            'Les textes, logos, images et graphismes',
            'Les photographies et illustrations',
            'Le code source et les logiciels',
            'Les bases de données',
            'La marque SmartPlanning et son logo',
            "L'interface utilisateur et le design",
          ]}
        />

        <LegalHighlight type="warning">
          <p>
            <strong>Important :</strong> Toute reproduction, représentation,
            modification, publication, adaptation de tout ou partie des éléments
            du site, quel que soit le moyen ou le procédé utilisé, est interdite
            sauf autorisation écrite préalable de SmartPlanning.
          </p>
        </LegalHighlight>

        <LegalParagraph>
          Toute exploitation non autorisée du site ou de l&apos;un quelconque
          des éléments qu&apos;il contient sera considérée comme constitutive
          d&apos;une contrefaçon et poursuivie conformément aux articles L.335-2
          et suivants du Code de la Propriété Intellectuelle.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Section 5 - Protection des données */}
      <LegalSection id="donnees" title="Protection des données" number="5">
        <LegalParagraph>
          SmartPlanning s&apos;engage à protéger les données personnelles de ses
          utilisateurs conformément au Règlement Général sur la Protection des
          Données (RGPD) et à la loi Informatique et Libertés.
        </LegalParagraph>

        <LegalParagraph>
          Pour plus d&apos;informations sur la collecte et le traitement de vos
          données personnelles, veuillez consulter notre{' '}
          <LegalLink href="/confidentialite">
            Politique de Confidentialité
          </LegalLink>
          .
        </LegalParagraph>

        <LegalHighlight type="info">
          <div className="space-y-2">
            <p>
              <strong>Contact DPO :</strong>{' '}
              <LegalLink href="mailto:contact@smartplanning.fr">
                contact@smartplanning.fr
              </LegalLink>
            </p>
            <p>
              <strong>Déclaration CNIL :</strong> Conformément au RGPD, la
              déclaration préalable à la CNIL n&apos;est plus obligatoire.
              SmartPlanning tient un registre des activités de traitement.
            </p>
          </div>
        </LegalHighlight>

        <LegalParagraph>
          Vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement, de limitation, de portabilité et d&apos;opposition
          sur vos données personnelles. Pour exercer ces droits, contactez-nous
          à l&apos;adresse{' '}
          <LegalLink href="mailto:contact@smartplanning.fr">
            contact@smartplanning.fr
          </LegalLink>
          .
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Section 6 - Cookies */}
      <LegalSection id="cookies" title="Cookies" number="6">
        <LegalParagraph>
          Le site SmartPlanning utilise des cookies pour améliorer
          l&apos;expérience utilisateur, réaliser des statistiques de visites et
          assurer le bon fonctionnement de certaines fonctionnalités.
        </LegalParagraph>

        <LegalParagraph>
          Pour plus d&apos;informations sur l&apos;utilisation des cookies et
          vos options de paramétrage, veuillez consulter notre{' '}
          <LegalLink href="/cookies">Politique Cookies</LegalLink>.
        </LegalParagraph>

        <LegalParagraph>Types de cookies utilisés :</LegalParagraph>

        <LegalList
          items={[
            'Cookies essentiels (fonctionnement du site)',
            'Cookies analytiques (statistiques de visite)',
            'Cookies fonctionnels (préférences utilisateur)',
            'Cookies marketing (avec votre consentement)',
          ]}
        />
      </LegalSection>

      <LegalDivider />

      {/* Section 7 - Limitation de responsabilité */}
      <LegalSection
        id="responsabilite"
        title="Limitation de responsabilité"
        number="7"
      >
        <LegalParagraph>
          SmartPlanning s&apos;efforce d&apos;assurer au mieux de ses
          possibilités l&apos;exactitude et la mise à jour des informations
          diffusées sur son site, dont il se réserve le droit de corriger, à
          tout moment et sans préavis, le contenu.
        </LegalParagraph>

        <LegalParagraph>
          SmartPlanning décline toute responsabilité :
        </LegalParagraph>

        <LegalList
          items={[
            'Pour toute interruption du site',
            'Pour toute survenance de bugs',
            'Pour toute inexactitude ou omission portant sur des informations disponibles sur le site',
            "Pour tous dommages résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des informations mises à disposition",
            "Pour tout dommage direct ou indirect résultant de l'utilisation du site",
          ]}
        />

        <LegalHighlight type="important">
          <p>
            <strong>Disponibilité du service :</strong> SmartPlanning met tout
            en œuvre pour offrir aux utilisateurs une disponibilité maximale de
            ses services. Toutefois, il ne saurait être tenu responsable des
            éventuelles indisponibilités liées à des opérations de maintenance,
            des mises à jour, ou des circonstances indépendantes de sa volonté
            (pannes, coupures de réseau, etc.).
          </p>
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Section 8 - Liens hypertextes */}
      <LegalSection id="liens" title="Liens hypertextes" number="8">
        <LegalParagraph>
          Le site SmartPlanning peut contenir des liens hypertextes vers
          d&apos;autres sites internet. SmartPlanning n&apos;exerce aucun
          contrôle sur ces sites externes et décline toute responsabilité quant
          à leur contenu.
        </LegalParagraph>

        <LegalParagraph>
          L&apos;insertion de liens hypertextes vers le site SmartPlanning est
          autorisée sous réserve de :
        </LegalParagraph>

        <LegalList
          items={[
            "Ne pas utiliser la technique du framing ou de l'inline linking",
            "Ne pas porter atteinte à l'image de SmartPlanning",
            'Ne pas reproduire le contenu sans autorisation',
            "Informer SmartPlanning de la création d'un lien",
          ]}
        />

        <LegalParagraph>
          SmartPlanning se réserve le droit de demander la suppression d&apos;un
          lien qu&apos;il estime non conforme à ses valeurs ou portant préjudice
          à son image.
        </LegalParagraph>
      </LegalSection>

      <LegalDivider />

      {/* Section 9 - Droit applicable */}
      <LegalSection id="droit" title="Droit applicable" number="9">
        <LegalParagraph>
          Les présentes mentions légales sont régies par le droit français.
        </LegalParagraph>

        <LegalParagraph>
          En cas de litige, et après une tentative de recherche d&apos;une
          solution amiable, compétence expresse est attribuée aux tribunaux
          français compétents, nonobstant pluralité de défendeurs ou appel en
          garantie, même pour les procédures d&apos;urgence ou les procédures
          conservatoires en référé ou par requête.
        </LegalParagraph>

        <LegalHighlight type="info">
          <div className="space-y-1 text-sm">
            <p>
              <strong>Textes de référence :</strong>
            </p>
            <p>
              • Loi n° 2004-575 du 21 juin 2004 pour la confiance dans
              l&apos;économie numérique (LCEN)
            </p>
            <p>
              • Règlement (UE) 2016/679 relatif à la protection des données
              personnelles (RGPD)
            </p>
            <p>
              • Loi n° 78-17 du 6 janvier 1978 relative à l&apos;informatique,
              aux fichiers et aux libertés
            </p>
            <p>• Code de la Propriété Intellectuelle</p>
            <p>• Code Civil</p>
          </div>
        </LegalHighlight>
      </LegalSection>

      <LegalDivider />

      {/* Section 10 - Contact */}
      <LegalSection id="contact" title="Contact" number="10">
        <LegalParagraph>
          Pour toute question concernant ces mentions légales ou pour exercer
          vos droits, vous pouvez nous contacter :
        </LegalParagraph>

        <LegalContact
          title="Coordonnées"
          email="contact@smartplanning.fr"
          address="SmartPlanning, 64170 Artix, France"
        />

        <LegalParagraph>
          Nous nous engageons à répondre à votre demande dans les meilleurs
          délais et au maximum sous 30 jours.
        </LegalParagraph>
      </LegalSection>
    </LegalPageLayout>
  )
}
