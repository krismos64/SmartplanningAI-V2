/**
 * Page de test Shadcn/ui - SmartPlanning
 *
 * ✅ Source : SP-106 - Installation Shadcn/ui
 *
 * OBJECTIF (CDA) :
 * Page de démonstration pour valider l'installation de Shadcn/ui
 * et la personnalisation du thème SmartPlanning.
 *
 * COMPOSANTS TESTÉS :
 * - Button (5 variants)
 * - Card (structure complète)
 * - Input (formulaires)
 * - Label (accessibilité)
 * - Badge (statuts)
 * - Avatar (utilisateurs)
 * - Tabs (navigation)
 * - Table (données)
 *
 * VALIDATION :
 * - Couleurs SmartPlanning (#2979f8, #1c62e3, #ed5151)
 * - Font Rajdhani pour titres
 * - Animations custom (fade-in, slide-up, scale-in)
 * - Dark mode (si activé)
 * - Responsive design
 */

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function TestUIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container-custom mx-auto max-w-6xl space-y-8">
        {/* Hero Section avec animation */}
        <div className="animate-fade-in text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 bg-clip-text font-rajdhani text-5xl font-bold text-transparent">
            Test Shadcn/ui - SmartPlanning
          </h1>
          <p className="text-muted-foreground text-lg">
            Validation des composants UI et du thème personnalisé
          </p>
        </div>

        {/* Tabs Navigation */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="font-rajdhani text-2xl">Navigation par onglets</CardTitle>
            <CardDescription>Composant Tabs pour organiser le contenu</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="components" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="components">Composants</TabsTrigger>
                <TabsTrigger value="forms">Formulaires</TabsTrigger>
                <TabsTrigger value="data">Données</TabsTrigger>
              </TabsList>

              {/* Tab 1: Composants */}
              <TabsContent value="components" className="space-y-4">
                {/* Section Buttons */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-rajdhani">Buttons</CardTitle>
                    <CardDescription>Différentes variantes de boutons</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </CardContent>
                </Card>

                {/* Section Badges & Avatars */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-rajdhani">Badges & Avatars</CardTitle>
                    <CardDescription>Statuts et profils utilisateurs</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Badges */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Badges</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge className="bg-green-500 hover:bg-green-600">Approuvé</Badge>
                        <Badge className="bg-orange-500 hover:bg-orange-600">En attente</Badge>
                      </div>
                    </div>

                    {/* Avatars */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Avatars</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-rajdhani text-sm font-semibold">Christophe</p>
                            <p className="text-xs text-muted-foreground">Directeur</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              JD
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-rajdhani text-sm font-semibold">John Doe</p>
                            <p className="text-xs text-muted-foreground">Manager</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              JS
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-rajdhani text-sm font-semibold">Jane Smith</p>
                            <p className="text-xs text-muted-foreground">Employé</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: Formulaires */}
              <TabsContent value="forms" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-rajdhani">Formulaire de connexion</CardTitle>
                    <CardDescription>
                      Exemple d&apos;utilisation des inputs et labels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input id="password" type="password" className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" type="text" placeholder="John Doe" className="w-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Annuler</Button>
                    <Button>Se connecter</Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Tab 3: Données */}
              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-rajdhani">Table de données</CardTitle>
                    <CardDescription>
                      Exemple de tableau avec les employés SmartPlanning
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Liste des employés - Données de test</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">ID</TableHead>
                          <TableHead>Nom</TableHead>
                          <TableHead>Rôle</TableHead>
                          <TableHead>Équipe</TableHead>
                          <TableHead className="text-right">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">EMP-001</TableCell>
                          <TableCell className="font-rajdhani">Christophe M.</TableCell>
                          <TableCell>Directeur</TableCell>
                          <TableCell>Direction</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-green-500">Actif</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">EMP-002</TableCell>
                          <TableCell className="font-rajdhani">John Doe</TableCell>
                          <TableCell>Manager</TableCell>
                          <TableCell>Engineering</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-green-500">Actif</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">EMP-003</TableCell>
                          <TableCell className="font-rajdhani">Jane Smith</TableCell>
                          <TableCell>Manager</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-orange-500">Congés</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">EMP-004</TableCell>
                          <TableCell className="font-rajdhani">Bob Wilson</TableCell>
                          <TableCell>Employé</TableCell>
                          <TableCell>Engineering</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-green-500">Actif</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">EMP-005</TableCell>
                          <TableCell className="font-rajdhani">Alice Brown</TableCell>
                          <TableCell>Employé</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell className="text-right">
                            <Badge className="bg-red-500">Absent</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer avec animations */}
        <Card className="animate-scale-in">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-center sm:text-left">
                <p className="font-rajdhani text-sm font-semibold">
                  🎨 Thème SmartPlanning personnalisé
                </p>
                <p className="text-xs text-muted-foreground">
                  Couleurs : #2979f8 (Primary) • #1c62e3 (Secondary) • #ed5151 (Destructive)
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Documentation
                </Button>
                <Button size="sm">Valider</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Metadata SEO
 *
 * robots: { index: false } - Page de test non indexée par Google
 */
export const metadata = {
  title: 'Test UI Components - SmartPlanning',
  description: 'Page de test pour valider l\'installation de Shadcn/ui',
  robots: { index: false, follow: false },
}
