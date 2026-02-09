/**
 * Tests du mock Prisma Client
 *
 * Ces tests valident que vitest-mock-extended fonctionne correctement
 * avec le PrismaClient de SmartPlanning.
 *
 * Les modèles testés correspondent au schéma réel :
 * - User (authentification)
 * - Company (multi-tenant)
 * - Employee (RH)
 * - Team (organisation)
 *
 * @ticket SP-132
 */

import { describe, it, expect } from 'vitest'
import { prismaMock } from '../mocks/prisma'
import type { User, Company, Employee, Team } from '@prisma/client'

describe('Prisma Mock - User Model', () => {
  /**
   * Test findMany avec des utilisateurs mockés
   */
  it('should mock user.findMany', async () => {
    const mockUsers: User[] = [
      {
        id: 'user-1',
        email: 'admin@smartplanning.fr',
        emailVerified: null,
        name: 'Admin User',
        password: 'hashed_password',
        image: null,
        role: 'DIRECTOR',
        companyId: 'company-1',
        isActive: true,
        isEmailVerified: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    prismaMock.user.findMany.mockResolvedValue(mockUsers)

    const users = await prismaMock.user.findMany()

    expect(users).toEqual(mockUsers)
    expect(users).toHaveLength(1)
    expect(users[0]?.email).toBe('admin@smartplanning.fr')
    expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1)
  })

  /**
   * Test findUnique retournant null (utilisateur non trouvé)
   */
  it('should mock user.findUnique returning null', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const result = await prismaMock.user.findUnique({
      where: { id: 'non-existent-id' },
    })

    expect(result).toBeNull()
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existent-id' },
    })
  })

  /**
   * Test create avec type-safety
   */
  it('should mock user.create with type safety', async () => {
    const newUser: User = {
      id: 'user-2',
      email: 'new@example.com',
      emailVerified: null,
      name: 'New User',
      password: 'hashed_password',
      image: null,
      role: 'EMPLOYEE',
      companyId: 'company-1',
      isActive: true,
      isEmailVerified: false,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.user.create.mockResolvedValue(newUser)

    const created = await prismaMock.user.create({
      data: {
        email: 'new@example.com',
        name: 'New User',
        password: 'hashed_password',
        role: 'EMPLOYEE',
        companyId: 'company-1',
      },
    })

    expect(created.email).toBe('new@example.com')
    expect(created.role).toBe('EMPLOYEE')
  })
})

describe('Prisma Mock - Company Model', () => {
  /**
   * Test Company avec relations (multi-tenant)
   */
  it('should mock company.findUnique with full data', async () => {
    const mockCompany: Company = {
      id: 'company-1',
      name: 'SmartPlanning Demo',
      slug: 'smartplanning-demo',
      logo: null,
      email: 'contact@demo.smartplanning.fr',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue de la Tech, 75001 Paris',
      workingHoursStart: '09:00',
      workingHoursEnd: '18:00',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      timezone: 'Europe/Paris',
      defaultOpeningHours: null,
      trialEndsAt: null,
      subscriptionEndsAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.company.findUnique.mockResolvedValue(mockCompany)

    const company = await prismaMock.company.findUnique({
      where: { slug: 'smartplanning-demo' },
    })

    expect(company).not.toBeNull()
    expect(company?.name).toBe('SmartPlanning Demo')
    expect(company?.isActive).toBe(true)
  })
})

describe('Prisma Mock - Employee Model', () => {
  /**
   * Test Employee avec données RH
   */
  it('should mock employee.findMany with filters', async () => {
    const mockEmployees: Employee[] = [
      {
        id: 'emp-1',
        userId: 'user-1',
        firstName: 'Jean',
        lastName: 'Dupont',
        jobTitle: 'Développeur Full-Stack',
        department: 'Tech',
        phone: '+33 6 12 34 56 78',
        hireDate: new Date('2023-01-15'),
        weeklyHours: 35.0,
        skills: ['React', 'TypeScript', 'Node.js'],
        preferences: null,
        companyId: 'company-1',
        teamId: 'team-1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    prismaMock.employee.findMany.mockResolvedValue(mockEmployees)

    const employees = await prismaMock.employee.findMany({
      where: { companyId: 'company-1', isActive: true },
    })

    expect(employees).toHaveLength(1)
    expect(employees[0]?.firstName).toBe('Jean')
    expect(employees[0]?.skills).toContain('TypeScript')
  })
})

describe('Prisma Mock - Team Model', () => {
  /**
   * Test Team
   */
  it('should mock team.create', async () => {
    const mockTeam: Team = {
      id: 'team-1',
      name: 'Équipe Dev',
      description: 'Équipe de développement SmartPlanning',
      color: '#3B82F6',
      managerId: 'emp-1',
      companyId: 'company-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    prismaMock.team.create.mockResolvedValue(mockTeam)

    const team = await prismaMock.team.create({
      data: {
        name: 'Équipe Dev',
        description: 'Équipe de développement SmartPlanning',
        companyId: 'company-1',
      },
    })

    expect(team.name).toBe('Équipe Dev')
    expect(team.color).toBe('#3B82F6')
  })
})

describe('Prisma Mock - Error Handling', () => {
  /**
   * Test simulation d'erreur Prisma
   */
  it('should mock rejected promise for error scenarios', async () => {
    const dbError = new Error('Database connection failed')

    prismaMock.user.findMany.mockRejectedValue(dbError)

    await expect(prismaMock.user.findMany()).rejects.toThrow(
      'Database connection failed'
    )
  })

  /**
   * Test mock reset entre les tests
   */
  it('should have clean mock state (reset working)', async () => {
    // Ce test vérifie que mockReset fonctionne
    // Le mock ne devrait pas avoir les valeurs du test précédent
    expect(prismaMock.user.findMany).not.toHaveBeenCalled()
  })
})
