'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

type UserRole = 'SUPER_ADMIN' | 'DIRECTOR' | 'MANAGER' | 'EMPLOYEE'

const mockUsers: Record<
  UserRole,
  {
    id: string
    name: string
    email: string
    role: UserRole
    organizationId?: string
  }
> = {
  SUPER_ADMIN: {
    id: '1',
    name: 'Christophe Mostefaoui',
    email: 'admin@smartplanning.com',
    role: 'SUPER_ADMIN',
  },
  DIRECTOR: {
    id: '2',
    name: 'Marie Dupont',
    email: 'marie.dupont@entreprise.fr',
    role: 'DIRECTOR',
    organizationId: 'org-123',
  },
  MANAGER: {
    id: '3',
    name: 'Thomas Martin',
    email: 'thomas.martin@entreprise.fr',
    role: 'MANAGER',
    organizationId: 'org-123',
  },
  EMPLOYEE: {
    id: '4',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@entreprise.fr',
    role: 'EMPLOYEE',
    organizationId: 'org-123',
  },
}

export default function TestLayoutPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('DIRECTOR')

  return (
    <DashboardLayout user={mockUsers[selectedRole]} notificationsCount={3}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Layout System - SP-118</CardTitle>
            <CardDescription>
              Testez les 4 rôles utilisateur et vérifiez les menus dynamiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="SUPER_ADMIN">Super Admin</TabsTrigger>
                <TabsTrigger value="DIRECTOR">Directeur</TabsTrigger>
                <TabsTrigger value="MANAGER">Manager</TabsTrigger>
                <TabsTrigger value="EMPLOYEE">Employé</TabsTrigger>
              </TabsList>

              {/* SUPER_ADMIN */}
              <TabsContent value="SUPER_ADMIN" className="space-y-4">
                <RoleDescription
                  role="SUPER_ADMIN"
                  description="Propriétaire du SaaS (Christophe)"
                  features={[
                    'Dashboard SaaS global',
                    'Gestion des organisations clientes',
                    'Monitoring système',
                    "Logs d'accès (RGPD)",
                    'Mode impersonate (Phase 5)',
                  ]}
                  menuItems={[
                    'Dashboard SaaS',
                    'Organisations',
                    'Monitoring',
                    'Logs système',
                  ]}
                />
              </TabsContent>

              {/* DIRECTOR */}
              <TabsContent value="DIRECTOR" className="space-y-4">
                <RoleDescription
                  role="DIRECTOR"
                  description="Directeur d'une entreprise cliente"
                  features={[
                    "Vue d'ensemble de l'organisation",
                    'Gestion des collaborateurs',
                    'Gestion des équipes',
                    'Validation des plannings',
                    'Statistiques complètes',
                    'Paramètres entreprise',
                  ]}
                  menuItems={[
                    'Dashboard',
                    'Collaborateurs',
                    'Plannings',
                    'Congés',
                    'Tâches',
                    'Statistiques',
                    'Incidents',
                    'IA Planning',
                    'Paramètres',
                  ]}
                />
              </TabsContent>

              {/* MANAGER */}
              <TabsContent value="MANAGER" className="space-y-4">
                <RoleDescription
                  role="MANAGER"
                  description="Manager d'une équipe"
                  features={[
                    "Vue d'ensemble de l'équipe",
                    'Gestion des plannings équipe',
                    'Validation des congés',
                    'Gestion des incidents',
                    'IA Planning Assistant',
                    'Statistiques équipe',
                  ]}
                  menuItems={[
                    'Dashboard',
                    'Plannings',
                    'Congés',
                    'Tâches',
                    'Statistiques',
                    'Incidents',
                    'IA Planning',
                  ]}
                />
              </TabsContent>

              {/* EMPLOYEE */}
              <TabsContent value="EMPLOYEE" className="space-y-4">
                <RoleDescription
                  role="EMPLOYEE"
                  description="Employé d'une équipe"
                  features={[
                    'Vue de ses propres plannings',
                    'Demandes de congés',
                    'Gestion de ses tâches',
                    'Consultation du profil',
                  ]}
                  menuItems={['Dashboard', 'Plannings', 'Congés', 'Tâches']}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Test Content */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Carte 1</CardTitle>
              <CardDescription>Exemple de contenu</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carte 2</CardTitle>
              <CardDescription>Exemple de contenu</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris nisi ut aliquip ex ea commodo consequat.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carte 3</CardTitle>
              <CardDescription>Exemple de contenu</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

interface RoleDescriptionProps {
  role: string
  description: string
  features: string[]
  menuItems: string[]
}

function RoleDescription({
  role,
  description,
  features,
  menuItems,
}: RoleDescriptionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Rôle : {role}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="mb-2 font-semibold">Fonctionnalités</h4>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {features.map((feature, index) => (
              <li key={index} className="text-muted-foreground">
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menu Sidebar</CardTitle>
          <CardDescription>
            Items visibles dans la barre latérale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h4 className="mb-2 font-semibold">
            {menuItems.length} éléments de menu
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm">
            {menuItems.map((item, index) => (
              <li key={index} className="text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
