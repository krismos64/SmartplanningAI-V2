'use client'

/**
 * Page de démonstration du Design System - Cyber Glass 3D
 *
 * Référentiel visuel interactif pour la soutenance CDA.
 * Accessible uniquement en développement.
 *
 * @see SP-259 - Design Tokens Enhancement
 */

import { useState } from 'react'
import { notFound } from 'next/navigation'
import {
  AnimatedContainer,
  AnimatedItem,
} from '@/components/ui/animated-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw } from 'lucide-react'

export default function DesignSystemPage() {
  // Guard : accessible uniquement en développement
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  const [staggerKey, setStaggerKey] = useState(0)

  const replayStagger = () => setStaggerKey((k) => k + 1)

  return (
    <div className="bg-mesh min-h-screen bg-background p-8">
      <AnimatedContainer animation="fadeInDown" className="mx-auto max-w-7xl">
        <header className="mb-12">
          <h1 className="text-neon-primary mb-2 text-4xl font-bold">
            Design System - Cyber Glass 3D
          </h1>
          <p className="text-muted-foreground">
            SmartPlanning V2 - Référentiel visuel des composants
          </p>
          <div className="mt-4 flex gap-2">
            <Badge variant="outline">SP-259</Badge>
            <Badge variant="secondary">Soutenance CDA</Badge>
          </div>
        </header>

        {/* Section 1: Glass Morphism */}
        <Section title="🪟 Glass Morphism" id="glass">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DemoCard
              title="Glass Standard"
              className="glass"
              description="Effet verre dépoli subtil"
            />
            <DemoCard
              title="Glass Strong"
              className="glass-strong"
              description="Verre dépoli prononcé avec bordure"
            />
            <DemoCard
              title="Glass + Glow"
              className="glass glow-primary"
              description="Combinaison glass et halo lumineux"
            />
          </div>
        </Section>

        {/* Section 2: Effets 3D */}
        <Section title="🎲 Effets 3D" id="3d">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <DemoCard
              title="Card 3D"
              className="glass card-3d"
              description="Perspective au hover - Survole-moi !"
            />
            <DemoCard
              title="Hover Lift"
              className="glass hover-lift"
              description="Élévation subtile au survol"
            />
            <DemoCard
              title="3D + Glow"
              className="glass card-3d glow-accent"
              description="Effet complet premium"
            />
          </div>
        </Section>

        {/* Section 3: Glow Effects */}
        <Section title="✨ Glow Effects" id="glow">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DemoCard title="Glow Primary" className="glass glow-primary" />
            <DemoCard title="Glow Accent" className="glass glow-accent" />
            <DemoCard title="Glow Cyan" className="glass glow-cyan" />
          </div>

          <h3 className="mb-4 mt-8 text-xl font-semibold">
            Stat Cards avec Glow
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {(
              [
                { color: 'blue', value: 42 },
                { color: 'violet', value: 87 },
                { color: 'cyan', value: 156 },
                { color: 'emerald', value: 23 },
                { color: 'amber', value: 94 },
                { color: 'rose', value: 31 },
              ] as const
            ).map(({ color, value }) => (
              <div
                key={color}
                className={`glass rounded-xl p-4 shadow-stat-${color} transition-transform hover:scale-105`}
              >
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm capitalize text-muted-foreground">
                  {color}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 4: Text Neon */}
        <Section title="💡 Text Neon" id="neon">
          <div className="glass space-y-4 rounded-xl p-8">
            <h2 className="text-neon-primary text-3xl font-bold">
              Texte Neon Primary
            </h2>
            <h2 className="text-neon-accent text-3xl font-bold">
              Texte Neon Accent
            </h2>
            <h2 className="text-neon-cyan text-3xl font-bold">
              Texte Neon Cyan
            </h2>
            <p className="text-lg">
              Texte normal avec{' '}
              <span className="text-neon-primary font-semibold">
                highlight neon
              </span>{' '}
              intégré.
            </p>
          </div>
        </Section>

        {/* Section 5: Bordures animées */}
        <Section title="🌈 Bordures Animées" id="borders">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-gradient-primary rounded-xl p-6">
              <h3 className="mb-2 font-semibold">Border Gradient Static</h3>
              <p className="text-sm text-muted-foreground">
                Bordure dégradée fixe primary → accent
              </p>
            </div>
            <div className="border-gradient-animated rounded-xl p-6">
              <h3 className="mb-2 font-semibold">Border Gradient Animated</h3>
              <p className="text-sm text-muted-foreground">
                Bordure avec rotation de gradient infinie
              </p>
            </div>
          </div>
        </Section>

        {/* Section 6: Animations CSS */}
        <Section title="🎬 Animations CSS" id="animations">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="glass shimmer-premium rounded-xl p-6">
              <h3 className="font-semibold">Shimmer Premium</h3>
              <p className="text-sm text-muted-foreground">
                Effet de brillance
              </p>
            </div>
            <div className="glass pulse-glow rounded-xl p-6">
              <h3 className="font-semibold">Pulse Glow</h3>
              <p className="text-sm text-muted-foreground">
                Pulsation lumineuse
              </p>
            </div>
            <div className="glass float rounded-xl p-6">
              <h3 className="font-semibold">Float</h3>
              <p className="text-sm text-muted-foreground">Flottement doux</p>
            </div>
            <div className="glass hover-lift-glow cursor-pointer rounded-xl p-6">
              <h3 className="font-semibold">Hover Lift Glow</h3>
              <p className="text-sm text-muted-foreground">Survole-moi !</p>
            </div>
          </div>
        </Section>

        {/* Section 7: AnimatedContainer */}
        <Section title="🎭 AnimatedContainer (Framer Motion)" id="framer">
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 text-lg font-semibold">
                Animations d&apos;entrée
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {(
                  [
                    'fadeInUp',
                    'fadeInDown',
                    'fadeInLeft',
                    'fadeInRight',
                  ] as const
                ).map((anim) => (
                  <AnimatedContainer key={anim} animation={anim}>
                    <div className="glass rounded-lg p-4 text-center">
                      <code className="text-sm">{anim}</code>
                    </div>
                  </AnimatedContainer>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-4">
                <h3 className="text-lg font-semibold">Stagger Container</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={replayStagger}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Rejouer
                </Button>
              </div>
              <AnimatedContainer
                key={staggerKey}
                stagger
                className="grid grid-cols-4 gap-4"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <AnimatedItem key={i}>
                    <div className="glass rounded-lg p-4 text-center">
                      Item {i}
                    </div>
                  </AnimatedItem>
                ))}
              </AnimatedContainer>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold">Scale In</h3>
              <AnimatedContainer animation="scaleIn">
                <div className="glass rounded-lg p-6 text-center">
                  <code className="text-sm">scaleIn</code>
                </div>
              </AnimatedContainer>
            </div>
          </div>
        </Section>

        {/* Section 8: Boutons */}
        <Section title="🔘 Boutons avec effets" id="buttons">
          <div className="flex flex-wrap gap-4">
            <Button className="glow-primary">Glow Primary</Button>
            <Button variant="secondary" className="glow-accent">
              Glow Accent
            </Button>
            <Button variant="outline" className="hover-lift">
              Hover Lift
            </Button>
            <Button className="shimmer-premium">Shimmer</Button>
            <Button className="border-gradient-animated bg-transparent text-foreground hover:bg-transparent">
              Border Animated
            </Button>
          </div>
        </Section>

        {/* Section 9: Badges */}
        <Section title="🏷️ Badges avec effets" id="badges">
          <div className="flex flex-wrap gap-4">
            <Badge className="pulse-glow">Notification</Badge>
            <Badge variant="secondary" className="shimmer-premium">
              Nouveau
            </Badge>
            <Badge variant="success" className="glow-cyan">
              Actif
            </Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="destructive">Erreur</Badge>
          </div>
        </Section>

        {/* Section 10: Cards Shadcn */}
        <Section title="🃏 Cards avec effets" id="cards">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="glass hover-lift">
              <CardHeader>
                <CardTitle>Card Glass</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Combinaison Card Shadcn + glass + hover-lift
                </p>
              </CardContent>
            </Card>
            <Card className="glass-strong glow-primary">
              <CardHeader>
                <CardTitle>Card Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Glass strong avec glow primary
                </p>
              </CardContent>
            </Card>
            <Card className="glass card-3d border-gradient-primary">
              <CardHeader>
                <CardTitle>Card 3D Border</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Effet 3D avec bordure gradient
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Footer */}
        <footer className="mt-16 border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <p>
            Design System Cyber Glass 3D - SmartPlanning V2 - Soutenance CDA
            Avril 2026
          </p>
          <p className="mt-2">
            <code className="rounded bg-muted px-2 py-1">
              /app/dev/design-system
            </code>
          </p>
        </footer>
      </AnimatedContainer>
    </div>
  )
}

// =============================================================================
// COMPOSANTS HELPERS
// =============================================================================

function Section({
  title,
  id,
  children,
}: {
  title: string
  id: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-16">
      <h2 className="mb-6 border-b border-border/50 pb-2 text-2xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  )
}

function DemoCard({
  title,
  className,
  description,
}: {
  title: string
  className: string
  description?: string
}) {
  return (
    <div className={`rounded-xl p-6 ${className}`}>
      <h3 className="mb-2 font-semibold">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <code className="mt-4 block text-xs opacity-60">
        .{className.split(' ').join(' .')}
      </code>
    </div>
  )
}
