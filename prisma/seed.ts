/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// Note: Variables are created for their database side-effects in seed files
import {
  PrismaClient,
  UserRole,
  SubscriptionPlan,
  SubscriptionStatus,
  PaymentStatus,
  ScheduleType,
  ScheduleStatus,
  LeaveType,
  LeaveRequestStatus,
  NotificationType,
} from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import Stripe from 'stripe'
import {
  TECHCORP_TEAMS,
  SHIFT_PATTERNS,
  LEAVE_REQUESTS,
  INCIDENTS,
  PERSONAL_TASKS,
  NOTIFICATIONS,
} from './seed-data'

const prisma = new PrismaClient()

// ============================================================================
// HELPERS
// ============================================================================

interface EmployeeRecord {
  userId: string
  employeeId: string
  firstName: string
  lastName: string
  teamIndex: number
  isManager: boolean
}

async function createUserWithEmployee(
  data: {
    email: string
    name: string
    password: string
    role: UserRole
    companyId: string
    firstName: string
    lastName: string
    jobTitle: string
    weeklyHours: number
    hireDate: Date
    teamId: string
    department: string
  }
) {
  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
      emailVerified: new Date(),
      role: data.role,
      companyId: data.companyId,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle,
          department: data.department,
          hireDate: data.hireDate,
          weeklyHours: data.weeklyHours,
          companyId: data.companyId,
          teamId: data.teamId,
        },
      },
    },
    include: { employee: true },
  })
  return user
}

function generateEmail(firstName: string, lastName: string): string {
  const clean = (s: string) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '')
  return `${clean(firstName)}.${clean(lastName)}@techcorp.com`
}

function getShiftForDay(
  dayOfWeek: number,
  weeklyHours: number,
  empIndex: number
): { start: string; end: string } | null {
  // Dimanche (0) = pas de travail, Samedi (6) = travail
  if (dayOfWeek === 0) return null

  // Déterminer le nombre de jours travaillés par semaine
  const daysPerWeek = weeklyHours >= 35 ? 6 : 5
  // Les 30h travaillent du lun au ven (pas samedi)
  if (weeklyHours <= 30 && dayOfWeek === 6) return null

  const shifts = [SHIFT_PATTERNS.matin, SHIFT_PATTERNS.journee, SHIFT_PATTERNS.apresMidi, SHIFT_PATTERNS.miJournee]
  // Rotation basée sur l'index employé + jour pour varier
  const shiftIdx = (empIndex + dayOfWeek) % shifts.length
  return shifts[shiftIdx]!
}

function createDateUTC(dateStr: string, time: string): Date {
  return new Date(`${dateStr}T${time}:00Z`)
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🌱 Début du seeding SmartPlanning v2.0 — Grande Distribution...\n')

  const hashedPassword = await bcrypt.hash('Password123!', 10)

  // ============================================================================
  // 1. ORGANISATIONS
  // ============================================================================
  console.log('🏢 Création des organisations...')

  const techcorp = await prisma.company.create({
    data: {
      name: 'TechCorp',
      slug: 'techcorp',
      email: 'contact@techcorp.com',
      phone: '+33 4 72 00 00 00',
      address: 'Centre Commercial Les Halles, 45 Rue du Commerce, 69003 Lyon',
      workingHoursStart: '06:00',
      workingHoursEnd: '21:00',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      timezone: 'Europe/Paris',
      defaultOpeningHours: {
        MONDAY: { start: '06:00', end: '21:00', break: '12:00-14:00' },
        TUESDAY: { start: '06:00', end: '21:00', break: '12:00-14:00' },
        WEDNESDAY: { start: '06:00', end: '21:00', break: '12:00-14:00' },
        THURSDAY: { start: '06:00', end: '21:00', break: '12:00-14:00' },
        FRIDAY: { start: '06:00', end: '21:00', break: '12:00-14:00' },
        SATURDAY: { start: '06:00', end: '21:00', break: '12:00-14:00' },
      },
    },
  })

  const designstudio = await prisma.company.create({
    data: {
      name: 'DesignStudio',
      slug: 'designstudio',
      email: 'hello@designstudio.com',
      phone: '+33 1 98 76 54 32',
      address: '42 Rue du Faubourg Saint-Antoine, 75012 Paris',
      workingHoursStart: '09:00',
      workingHoursEnd: '17:00',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      timezone: 'Europe/Paris',
      defaultOpeningHours: {
        MONDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        TUESDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        WEDNESDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        THURSDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        FRIDAY: { start: '09:00', end: '16:00', break: '12:00-13:00' },
      },
    },
  })

  const startupinc = await prisma.company.create({
    data: {
      name: 'StartupInc',
      slug: 'startupinc',
      email: 'team@startupinc.com',
      phone: '+33 6 12 34 56 78',
      address: '15 Rue de Rivoli, 75001 Paris',
      workingHoursStart: '10:00',
      workingHoursEnd: '19:00',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      timezone: 'Europe/Paris',
      trialEndsAt: new Date('2025-12-31'),
      defaultOpeningHours: {
        MONDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        TUESDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        WEDNESDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        THURSDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        FRIDAY: { start: '10:00', end: '18:00', break: '13:00-14:00' },
      },
    },
  })

  console.log('✅ 3 organisations créées\n')

  // ============================================================================
  // 2. ABONNEMENTS STRIPE (vrais clients Stripe Test)
  // ============================================================================
  console.log('💳 Création des abonnements Stripe...')

  const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!
  let useRealStripe = false
  let stripe: Stripe | null = null

  // Initialiser Stripe si la clé est disponible
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      // Test rapide de connexion
      await stripe.customers.list({ limit: 1 })
      useRealStripe = true
      console.log('  ✅ Connexion Stripe OK — création de vrais clients test')
    } catch (err) {
      console.warn('  ⚠️ Stripe indisponible, fallback sur faux IDs:', (err as Error).message)
      stripe = null
    }
  } else {
    console.warn('  ⚠️ STRIPE_SECRET_KEY non défini, fallback sur faux IDs')
  }

  // Cleanup : supprimer les anciens clients seed
  if (useRealStripe && stripe) {
    console.log('  🧹 Nettoyage des anciens clients seed Stripe...')
    let hasMore = true
    let startingAfter: string | undefined
    let deletedCount = 0
    while (hasMore) {
      const listParams: Stripe.CustomerListParams = { limit: 100 }
      if (startingAfter) listParams.starting_after = startingAfter
      const customers = await stripe.customers.list(listParams)
      for (const cust of customers.data) {
        if (cust.metadata?.source === 'smartplanning-seed') {
          // Annuler les subscriptions avant de supprimer le customer
          const subs = await stripe.subscriptions.list({ customer: cust.id, status: 'active' })
          for (const sub of subs.data) {
            await stripe.subscriptions.cancel(sub.id)
          }
          await stripe.customers.del(cust.id)
          deletedCount++
        }
      }
      hasMore = customers.has_more
      if (customers.data.length > 0) {
        startingAfter = customers.data[customers.data.length - 1]!.id
      }
    }
    if (deletedCount > 0) console.log(`  🗑️  ${deletedCount} ancien(s) client(s) seed supprimé(s)`)
  }

  // Helper : créer un client Stripe avec abonnement
  async function createStripeCustomerWithSub(
    stripeInstance: Stripe,
    params: { email: string; name: string; quantity: number }
  ) {
    // 1. Créer le customer
    const customer = await stripeInstance.customers.create({
      email: params.email,
      name: params.name,
      metadata: { source: 'smartplanning-seed' },
    })

    // 2. Créer et attacher un payment method (tok_visa)
    const pm = await stripeInstance.paymentMethods.create({
      type: 'card',
      card: { token: 'tok_visa' },
    })
    await stripeInstance.paymentMethods.attach(pm.id, { customer: customer.id })
    await stripeInstance.customers.update(customer.id, {
      invoice_settings: { default_payment_method: pm.id },
    })

    // 3. Créer la subscription
    const subscription = await stripeInstance.subscriptions.create({
      customer: customer.id,
      items: [{ price: STRIPE_PRICE_ID, quantity: params.quantity }],
      default_payment_method: pm.id,
    })

    // 4. Extraire les dates de période depuis les items (Stripe SDK v20+)
    const subItem = subscription.items.data[0]
    const periodStart = subItem?.current_period_start ?? subscription.created
    const periodEnd = subItem?.current_period_end ?? subscription.created

    // 5. Récupérer la facture
    const invoices = await stripeInstance.invoices.list({
      customer: customer.id,
      limit: 1,
    })
    const invoice = invoices.data[0] ?? null

    return { customer, subscription, invoice, periodStart, periodEnd }
  }

  let techcorpSub: Awaited<ReturnType<typeof prisma.subscription.create>>
  let designstudioSub: Awaited<ReturnType<typeof prisma.subscription.create>>
  let startupincSub: Awaited<ReturnType<typeof prisma.subscription.create>>

  if (useRealStripe && stripe) {
    // ===== TECHCORP (PER_SEAT, 110 employés) =====
    console.log('  📦 TechCorp — création client + abonnement Stripe...')
    const tc = await createStripeCustomerWithSub(stripe, {
      email: 'john.doe@techcorp.com', name: 'TechCorp', quantity: 110,
    })
    techcorpSub = await prisma.subscription.create({
      data: {
        companyId: techcorp.id,
        stripeCustomerId: tc.customer.id,
        stripeSubscriptionId: tc.subscription.id,
        stripePriceId: STRIPE_PRICE_ID,
        plan: SubscriptionPlan.PER_SEAT,
        quantity: 110,
        pricePerEmployee: 290,
        planPrice: 31900,
        currency: 'EUR',
        billingInterval: 'month',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(tc.periodStart * 1000),
        currentPeriodEnd: new Date(tc.periodEnd * 1000),
        cancelAtPeriodEnd: false,
      },
    })
    // Payment TechCorp
    await prisma.payment.create({
      data: {
        companyId: techcorp.id,
        subscriptionId: techcorpSub.id,
        stripePaymentId: tc.invoice?.payment_intent as string ?? `pi_techcorp_${Date.now()}`,
        stripeInvoiceId: tc.invoice?.id ?? null,
        amount: tc.invoice?.amount_paid ?? 31900,
        currency: 'EUR',
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: 'card',
        paidAt: new Date(),
        metadata: tc.invoice?.hosted_invoice_url ? { invoiceUrl: tc.invoice.hosted_invoice_url } : undefined,
      },
    })

    // ===== DESIGNSTUDIO (PER_SEAT, 6 employés) =====
    console.log('  📦 DesignStudio — création client + abonnement Stripe...')
    const ds = await createStripeCustomerWithSub(stripe, {
      email: 'emma.jones@designstudio.com', name: 'DesignStudio', quantity: 6,
    })
    designstudioSub = await prisma.subscription.create({
      data: {
        companyId: designstudio.id,
        stripeCustomerId: ds.customer.id,
        stripeSubscriptionId: ds.subscription.id,
        stripePriceId: STRIPE_PRICE_ID,
        plan: SubscriptionPlan.PER_SEAT,
        quantity: 6,
        pricePerEmployee: 290,
        planPrice: 1740,
        currency: 'EUR',
        billingInterval: 'month',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date(ds.periodStart * 1000),
        currentPeriodEnd: new Date(ds.periodEnd * 1000),
        cancelAtPeriodEnd: false,
      },
    })
    // Payment DesignStudio
    await prisma.payment.create({
      data: {
        companyId: designstudio.id,
        subscriptionId: designstudioSub.id,
        stripePaymentId: ds.invoice?.payment_intent as string ?? `pi_designstudio_${Date.now()}`,
        stripeInvoiceId: ds.invoice?.id ?? null,
        amount: ds.invoice?.amount_paid ?? 1740,
        currency: 'EUR',
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: 'card',
        paidAt: new Date(),
        metadata: ds.invoice?.hosted_invoice_url ? { invoiceUrl: ds.invoice.hosted_invoice_url } : undefined,
      },
    })

    // ===== STARTUPINC (TRIAL, pas de carte) =====
    console.log('  📦 StartupInc — création client Stripe (trial, sans carte)...')
    const startupCustomer = await stripe.customers.create({
      email: 'oliver.green@startupinc.com',
      name: 'StartupInc',
      metadata: { source: 'smartplanning-seed' },
    })
    startupincSub = await prisma.subscription.create({
      data: {
        companyId: startupinc.id,
        stripeCustomerId: startupCustomer.id,
        plan: SubscriptionPlan.FREE,
        quantity: 4,
        pricePerEmployee: 290,
        planPrice: 0,
        currency: 'EUR',
        billingInterval: 'month',
        status: SubscriptionStatus.TRIAL,
        currentPeriodStart: new Date('2026-01-01'),
        currentPeriodEnd: new Date('2026-06-30'),
      },
    })

    console.log('✅ 3 abonnements Stripe réels créés\n')
    console.log('💰 2 paiements réels créés\n')
  } else {
    // ===== FALLBACK : faux IDs (Stripe indisponible) =====
    techcorpSub = await prisma.subscription.create({
      data: {
        companyId: techcorp.id,
        stripeCustomerId: `cus_techcorp_${Date.now()}`,
        stripeSubscriptionId: `sub_techcorp_${Date.now()}`,
        stripePriceId: 'price_per_seat',
        plan: SubscriptionPlan.PER_SEAT,
        quantity: 110,
        pricePerEmployee: 290,
        planPrice: 31900,
        currency: 'EUR',
        billingInterval: 'month',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date('2026-02-01'),
        currentPeriodEnd: new Date('2026-03-01'),
        cancelAtPeriodEnd: false,
      },
    })
    designstudioSub = await prisma.subscription.create({
      data: {
        companyId: designstudio.id,
        stripeCustomerId: `cus_designstudio_${Date.now()}`,
        stripeSubscriptionId: `sub_designstudio_${Date.now()}`,
        stripePriceId: 'price_per_seat',
        plan: SubscriptionPlan.PER_SEAT,
        quantity: 6,
        pricePerEmployee: 290,
        planPrice: 1740,
        currency: 'EUR',
        billingInterval: 'month',
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: new Date('2026-02-01'),
        currentPeriodEnd: new Date('2026-03-01'),
        cancelAtPeriodEnd: false,
      },
    })
    startupincSub = await prisma.subscription.create({
      data: {
        companyId: startupinc.id,
        stripeCustomerId: `cus_startupinc_${Date.now()}`,
        plan: SubscriptionPlan.FREE,
        quantity: 4,
        pricePerEmployee: 290,
        planPrice: 0,
        currency: 'EUR',
        billingInterval: 'month',
        status: SubscriptionStatus.TRIAL,
        currentPeriodStart: new Date('2026-01-01'),
        currentPeriodEnd: new Date('2026-06-30'),
      },
    })

    console.log('✅ 3 abonnements créés (faux IDs)\n')

    // Fallback payments
    await prisma.payment.create({
      data: {
        companyId: techcorp.id,
        subscriptionId: techcorpSub.id,
        stripePaymentId: `pi_techcorp_${Date.now()}`,
        stripeInvoiceId: `in_techcorp_${Date.now()}`,
        amount: 31900,
        currency: 'EUR',
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: 'card',
        paidAt: new Date('2026-02-01T10:00:00Z'),
      },
    })
    await prisma.payment.create({
      data: {
        companyId: designstudio.id,
        subscriptionId: designstudioSub.id,
        stripePaymentId: `pi_designstudio_${Date.now()}`,
        stripeInvoiceId: `in_designstudio_${Date.now()}`,
        amount: 1740,
        currency: 'EUR',
        status: PaymentStatus.SUCCEEDED,
        paymentMethod: 'sepa_debit',
        paidAt: new Date('2026-02-01T11:00:00Z'),
      },
    })

    console.log('💰 2 paiements créés (faux IDs)\n')
  }

  // ============================================================================
  // 4. ÉQUIPES TECHCORP (12 équipes grande distribution)
  // ============================================================================
  console.log('👥 Création des 12 équipes TechCorp...')

  const teamIds: string[] = []
  for (const teamDef of TECHCORP_TEAMS) {
    const team = await prisma.team.create({
      data: {
        name: teamDef.name,
        description: `Rayon ${teamDef.name}`,
        color: teamDef.color,
        companyId: techcorp.id,
      },
    })
    teamIds.push(team.id)
  }

  // DesignStudio & StartupInc teams
  const designers = await prisma.team.create({
    data: { name: 'Designers', description: 'Équipe des designers créatifs', color: '#F59E0B', companyId: designstudio.id },
  })
  const adminTeam = await prisma.team.create({
    data: { name: 'Admin', description: 'Équipe administrative', color: '#10B981', companyId: designstudio.id },
  })
  const coreTeam = await prisma.team.create({
    data: { name: 'Core Team', description: 'Équipe principale startup', color: '#EF4444', companyId: startupinc.id },
  })

  console.log('✅ 15 équipes créées\n')

  // ============================================================================
  // 5. UTILISATEURS & EMPLOYÉS
  // ============================================================================
  console.log('👤 Création des utilisateurs TechCorp...')

  // SYSTEM ADMIN
  const systemAdmin = await prisma.user.create({
    data: {
      email: 'contact@smartplanning.fr',
      name: 'Super Admin',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.SYSTEM_ADMIN,
      companyId: null,
      isActive: true,
      isEmailVerified: true,
    },
  })

  // DIRECTOR — John Doe (E2E)
  const johnDoe = await createUserWithEmployee({
    email: 'john.doe@techcorp.com',
    name: 'John Doe',
    password: hashedPassword,
    role: UserRole.DIRECTOR,
    companyId: techcorp.id,
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Directeur de magasin',
    department: 'Direction',
    weeklyHours: 39,
    hireDate: new Date('2018-01-15'),
    teamId: teamIds[0]!,
  })

  // Tracking all employees for leave balances, schedules, etc.
  const allTechcorpEmployees: EmployeeRecord[] = []

  // Pour chaque équipe, créer manager + employés
  for (let tIdx = 0; tIdx < TECHCORP_TEAMS.length; tIdx++) {
    const teamDef = TECHCORP_TEAMS[tIdx]!
    const teamId = teamIds[tIdx]!

    // MANAGER
    let managerUser
    if (teamDef.manager.email === 'jane.smith@techcorp.com') {
      // E2E user Jane Smith
      managerUser = await createUserWithEmployee({
        email: 'jane.smith@techcorp.com',
        name: 'Jane Smith',
        password: hashedPassword,
        role: UserRole.MANAGER,
        companyId: techcorp.id,
        firstName: 'Jane',
        lastName: 'Smith',
        jobTitle: teamDef.manager.jobTitle,
        department: teamDef.name,
        weeklyHours: 39,
        hireDate: new Date('2019-03-01'),
        teamId,
      })
    } else {
      managerUser = await createUserWithEmployee({
        email: generateEmail(teamDef.manager.firstName, teamDef.manager.lastName),
        name: `${teamDef.manager.firstName} ${teamDef.manager.lastName}`,
        password: hashedPassword,
        role: UserRole.MANAGER,
        companyId: techcorp.id,
        firstName: teamDef.manager.firstName,
        lastName: teamDef.manager.lastName,
        jobTitle: teamDef.manager.jobTitle,
        department: teamDef.name,
        weeklyHours: 39,
        hireDate: new Date('2019-01-15'),
        teamId,
      })
    }

    // Set team manager
    await prisma.team.update({
      where: { id: teamId },
      data: { managerId: managerUser.employee!.id },
    })

    allTechcorpEmployees.push({
      userId: managerUser.id,
      employeeId: managerUser.employee!.id,
      firstName: teamDef.manager.firstName,
      lastName: teamDef.manager.lastName,
      teamIndex: tIdx,
      isManager: true,
    })

    // EMPLOYEES
    for (let eIdx = 0; eIdx < teamDef.employees.length; eIdx++) {
      const empDef = teamDef.employees[eIdx]!

      let empUser
      // Bob Wilson = E2E user (team 0, first employee = index 0)
      if (tIdx === 0 && eIdx === 0 && empDef.firstName === 'Bob' && empDef.lastName === 'Wilson') {
        empUser = await createUserWithEmployee({
          email: 'bob.wilson@techcorp.com',
          name: 'Bob Wilson',
          password: hashedPassword,
          role: UserRole.EMPLOYEE,
          companyId: techcorp.id,
          firstName: 'Bob',
          lastName: 'Wilson',
          jobTitle: empDef.jobTitle,
          department: teamDef.name,
          weeklyHours: empDef.weeklyHours,
          hireDate: new Date(empDef.hireDate),
          teamId,
        })
      } else {
        empUser = await createUserWithEmployee({
          email: generateEmail(empDef.firstName, empDef.lastName),
          name: `${empDef.firstName} ${empDef.lastName}`,
          password: hashedPassword,
          role: UserRole.EMPLOYEE,
          companyId: techcorp.id,
          firstName: empDef.firstName,
          lastName: empDef.lastName,
          jobTitle: empDef.jobTitle,
          department: teamDef.name,
          weeklyHours: empDef.weeklyHours,
          hireDate: new Date(empDef.hireDate),
          teamId,
        })
      }

      allTechcorpEmployees.push({
        userId: empUser.id,
        employeeId: empUser.employee!.id,
        firstName: empDef.firstName,
        lastName: empDef.lastName,
        teamIndex: tIdx,
        isManager: false,
      })
    }
  }

  console.log(`✅ ${allTechcorpEmployees.length + 1} utilisateurs TechCorp créés (1 directeur + ${allTechcorpEmployees.length} managers/employés)`)

  // ========== DESIGNSTUDIO (6 users) ==========
  const emmaJones = await createUserWithEmployee({
    email: 'emma.jones@designstudio.com', name: 'Emma Jones', password: hashedPassword,
    role: UserRole.DIRECTOR, companyId: designstudio.id,
    firstName: 'Emma', lastName: 'Jones', jobTitle: 'Creative Director',
    department: 'Management', weeklyHours: 37, hireDate: new Date('2019-06-01'), teamId: designers.id,
  })

  const liamWhite = await createUserWithEmployee({
    email: 'liam.white@designstudio.com', name: 'Liam White', password: hashedPassword,
    role: UserRole.MANAGER, companyId: designstudio.id,
    firstName: 'Liam', lastName: 'White', jobTitle: 'Senior Designer',
    department: 'Design', weeklyHours: 35, hireDate: new Date('2020-03-01'), teamId: designers.id,
  })
  await prisma.team.update({ where: { id: designers.id }, data: { managerId: liamWhite.employee!.id } })

  const oliviaMartin = await createUserWithEmployee({
    email: 'olivia.martin@designstudio.com', name: 'Olivia Martin', password: hashedPassword,
    role: UserRole.EMPLOYEE, companyId: designstudio.id,
    firstName: 'Olivia', lastName: 'Martin', jobTitle: 'Graphic Designer',
    department: 'Design', weeklyHours: 35, hireDate: new Date('2021-09-01'), teamId: designers.id,
  })
  const noahThompson = await createUserWithEmployee({
    email: 'noah.thompson@designstudio.com', name: 'Noah Thompson', password: hashedPassword,
    role: UserRole.EMPLOYEE, companyId: designstudio.id,
    firstName: 'Noah', lastName: 'Thompson', jobTitle: 'Web Designer',
    department: 'Design', weeklyHours: 35, hireDate: new Date('2022-02-01'), teamId: designers.id,
  })

  const avaAnderson = await createUserWithEmployee({
    email: 'ava.anderson@designstudio.com', name: 'Ava Anderson', password: hashedPassword,
    role: UserRole.MANAGER, companyId: designstudio.id,
    firstName: 'Ava', lastName: 'Anderson', jobTitle: 'Office Manager',
    department: 'Administration', weeklyHours: 35, hireDate: new Date('2020-08-01'), teamId: adminTeam.id,
  })
  await prisma.team.update({ where: { id: adminTeam.id }, data: { managerId: avaAnderson.employee!.id } })

  const williamTaylor = await createUserWithEmployee({
    email: 'william.taylor@designstudio.com', name: 'William Taylor', password: hashedPassword,
    role: UserRole.EMPLOYEE, companyId: designstudio.id,
    firstName: 'William', lastName: 'Taylor', jobTitle: 'Administrative Assistant',
    department: 'Administration', weeklyHours: 35, hireDate: new Date('2023-03-01'), teamId: adminTeam.id,
  })

  // ========== STARTUPINC (4 users) ==========
  const oliverGreen = await createUserWithEmployee({
    email: 'oliver.green@startupinc.com', name: 'Oliver Green', password: hashedPassword,
    role: UserRole.DIRECTOR, companyId: startupinc.id,
    firstName: 'Oliver', lastName: 'Green', jobTitle: 'Founder & CEO',
    department: 'Management', weeklyHours: 45, hireDate: new Date('2024-01-01'), teamId: coreTeam.id,
  })
  const jamesWalker = await createUserWithEmployee({
    email: 'james.walker@startupinc.com', name: 'James Walker', password: hashedPassword,
    role: UserRole.MANAGER, companyId: startupinc.id,
    firstName: 'James', lastName: 'Walker', jobTitle: 'CTO',
    department: 'Engineering', weeklyHours: 40, hireDate: new Date('2024-02-01'), teamId: coreTeam.id,
  })
  await prisma.team.update({ where: { id: coreTeam.id }, data: { managerId: jamesWalker.employee!.id } })

  const sophiaClark = await createUserWithEmployee({
    email: 'sophia.clark@startupinc.com', name: 'Sophia Clark', password: hashedPassword,
    role: UserRole.EMPLOYEE, companyId: startupinc.id,
    firstName: 'Sophia', lastName: 'Clark', jobTitle: 'Full Stack Developer',
    department: 'Engineering', weeklyHours: 35, hireDate: new Date('2024-03-01'), teamId: coreTeam.id,
  })
  const isabellaHall = await createUserWithEmployee({
    email: 'isabella.hall@startupinc.com', name: 'Isabella Hall', password: hashedPassword,
    role: UserRole.EMPLOYEE, companyId: startupinc.id,
    firstName: 'Isabella', lastName: 'Hall', jobTitle: 'Product Designer',
    department: 'Design', weeklyHours: 35, hireDate: new Date('2024-04-01'), teamId: coreTeam.id,
  })

  console.log('✅ DesignStudio (6) + StartupInc (4) créés\n')

  // ============================================================================
  // 6. PLANNINGS TECHCORP — 2 semaines (3-8 mars + 10-15 mars 2026)
  // ============================================================================
  console.log('📅 Création des plannings TechCorp (2 semaines)...')

  const week1Dates = ['2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08'] // Lun-Sam
  const week2Dates = ['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14', '2026-03-15']
  const allDates = [...week1Dates, ...week2Dates]

  let scheduleCount = 0

  for (const emp of allTechcorpEmployees) {
    const teamDef = TECHCORP_TEAMS[emp.teamIndex]!
    const empDef = emp.isManager ? teamDef.manager : teamDef.employees.find((_, i) => {
      const nonManagerEmps = allTechcorpEmployees.filter(e => e.teamIndex === emp.teamIndex && !e.isManager)
      return nonManagerEmps.indexOf(emp) === i
    })

    // Trouver l'index de cet employé dans son équipe pour varier les shifts
    const teamEmps = allTechcorpEmployees.filter(e => e.teamIndex === emp.teamIndex)
    const empIdxInTeam = teamEmps.indexOf(emp)

    const weeklyHours = emp.isManager ? 39 : (teamDef.employees[
      allTechcorpEmployees.filter(e => e.teamIndex === emp.teamIndex && !e.isManager).indexOf(emp)
    ]?.weeklyHours ?? 35)

    // Quelques TRAINING (1 par semaine pour quelques employés)
    const hasTraining = empIdxInTeam === 1 && emp.teamIndex < 6

    for (const dateStr of allDates) {
      const date = new Date(dateStr)
      const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

      const shift = getShiftForDay(dayOfWeek, weeklyHours, empIdxInTeam)
      if (!shift) continue

      let schedType = ScheduleType.WORK
      // 1 TRAINING par semaine pour certains
      if (hasTraining && (dateStr === '2026-03-04' || dateStr === '2026-03-11')) {
        schedType = ScheduleType.TRAINING
      }

      await prisma.schedule.create({
        data: {
          title: schedType === ScheduleType.TRAINING ? 'Formation' : teamDef.name,
          startDate: createDateUTC(dateStr, shift.start),
          endDate: createDateUTC(dateStr, shift.end),
          startTime: shift.start,
          endTime: shift.end,
          type: schedType,
          status: ScheduleStatus.CONFIRMED,
          employeeId: emp.employeeId,
          teamId: teamIds[emp.teamIndex]!,
          companyId: techcorp.id,
          createdById: johnDoe.id,
          color: teamDef.color,
        },
      })
      scheduleCount++
    }
  }

  // Quelques plannings DesignStudio & StartupInc
  for (const dateStr of ['2026-03-03', '2026-03-04', '2026-03-05']) {
    await prisma.schedule.create({
      data: {
        title: 'Design Session', startDate: createDateUTC(dateStr, '09:00'), endDate: createDateUTC(dateStr, '17:00'),
        startTime: '09:00', endTime: '17:00', type: ScheduleType.WORK, status: ScheduleStatus.CONFIRMED,
        employeeId: liamWhite.employee!.id, teamId: designers.id, companyId: designstudio.id,
        createdById: emmaJones.id, color: '#F59E0B',
      },
    })
    await prisma.schedule.create({
      data: {
        title: 'Development', startDate: createDateUTC(dateStr, '10:00'), endDate: createDateUTC(dateStr, '19:00'),
        startTime: '10:00', endTime: '19:00', type: ScheduleType.WORK, status: ScheduleStatus.CONFIRMED,
        employeeId: sophiaClark.employee!.id, teamId: coreTeam.id, companyId: startupinc.id,
        createdById: jamesWalker.id, color: '#3B82F6',
      },
    })
  }

  console.log(`✅ ${scheduleCount + 6} plannings créés\n`)

  // ============================================================================
  // 7. CONGÉS
  // ============================================================================
  console.log('🏖️  Création des congés...')

  // Helper to resolve employee from leave def
  function resolveEmployee(leaveDef: typeof LEAVE_REQUESTS[0]) {
    const teamEmps = allTechcorpEmployees.filter(e => e.teamIndex === leaveDef.teamIndex)
    const managers = teamEmps.filter(e => e.isManager)
    const employees = teamEmps.filter(e => !e.isManager)

    if (leaveDef.employeeIndex === -1) return managers[0]!
    return employees[leaveDef.employeeIndex]!
  }

  function resolveManager(teamIndex: number) {
    return allTechcorpEmployees.find(e => e.teamIndex === teamIndex && e.isManager)!
  }

  const leaveTypeMap = {
    PAID_LEAVE: LeaveType.PAID_LEAVE,
    SICK_LEAVE: LeaveType.SICK_LEAVE,
    RTT: LeaveType.RTT,
    FAMILY_EVENT: LeaveType.FAMILY_EVENT,
    OTHER: LeaveType.OTHER,
  }
  const leaveStatusMap = {
    APPROVED: LeaveRequestStatus.APPROVED,
    PENDING: LeaveRequestStatus.PENDING,
    REJECTED: LeaveRequestStatus.REJECTED,
  }

  for (const lr of LEAVE_REQUESTS) {
    const emp = resolveEmployee(lr)
    const manager = resolveManager(lr.teamIndex)

    await prisma.leaveRequest.create({
      data: {
        startDate: new Date(lr.startDate),
        endDate: new Date(lr.endDate),
        days: lr.days,
        type: leaveTypeMap[lr.type]!,
        status: leaveStatusMap[lr.status]!,
        reason: lr.reason,
        employeeId: emp.employeeId,
        companyId: techcorp.id,
        ...(lr.status === 'APPROVED' ? {
          reviewedById: manager.userId,
          reviewedAt: new Date('2026-02-25T10:00:00Z'),
          reviewComment: lr.reviewComment,
        } : {}),
      },
    })
  }

  // Quelques congés DesignStudio/StartupInc
  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2026-03-09'), endDate: new Date('2026-03-13'), days: 5,
      type: LeaveType.PAID_LEAVE, status: LeaveRequestStatus.PENDING,
      reason: 'Vacances printemps',
      employeeId: oliviaMartin.employee!.id, companyId: designstudio.id,
    },
  })
  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2026-03-06'), endDate: new Date('2026-03-06'), days: 1,
      type: LeaveType.OTHER, status: LeaveRequestStatus.PENDING,
      reason: 'Déménagement',
      employeeId: sophiaClark.employee!.id, companyId: startupinc.id,
    },
  })

  console.log(`✅ ${LEAVE_REQUESTS.length + 2} congés créés\n`)

  // ============================================================================
  // 8. INCIDENTS
  // ============================================================================
  console.log('📝 Création des notes d\'incidents...')

  const visibilityMap = {
    DIRECTOR_ONLY: 'DIRECTOR_ONLY' as const,
    MANAGER_DIRECTOR: 'MANAGER_DIRECTOR' as const,
    ALL: 'ALL' as const,
  }

  for (const inc of INCIDENTS) {
    const emp = (() => {
      const teamEmps = allTechcorpEmployees.filter(e => e.teamIndex === inc.teamIndex && !e.isManager)
      return teamEmps[inc.employeeIndex]!
    })()

    const author = inc.authorIsDirector
      ? johnDoe
      : resolveManager(inc.authorTeamIndex === -1 ? inc.teamIndex : inc.authorTeamIndex)

    await prisma.incidentNote.create({
      data: {
        title: inc.title,
        content: inc.content,
        date: new Date(inc.date),
        visibility: visibilityMap[inc.visibility]!,
        subjectId: emp.employeeId,
        authorId: inc.authorIsDirector ? johnDoe.id : author.userId,
        companyId: techcorp.id,
      },
    })
  }

  console.log(`✅ ${INCIDENTS.length} incidents créés\n`)

  // ============================================================================
  // 9. NOTES PERSONNELLES
  // ============================================================================
  console.log('📋 Création des notes personnelles...')

  for (const task of PERSONAL_TASKS) {
    let userId: string

    if (task.userType === 'director') {
      userId = johnDoe.id
    } else if (task.userType === 'manager') {
      userId = resolveManager(task.teamIndex!).userId
    } else {
      const teamEmps = allTechcorpEmployees.filter(e => e.teamIndex === task.teamIndex! && !e.isManager)
      userId = teamEmps[task.employeeIndex!]!.userId
    }

    await prisma.personalTask.create({
      data: {
        title: task.title,
        description: task.description ?? null,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        completed: task.completed,
        order: task.order,
        userId,
      },
    })
  }

  console.log(`✅ ${PERSONAL_TASKS.length} notes personnelles créées\n`)

  // ============================================================================
  // 10. SOLDES DE CONGÉS
  // ============================================================================
  console.log('💰 Création des soldes de congés...')

  // TechCorp employees + John Doe
  const allTechcorpForBalance = [
    { employeeId: johnDoe.employee!.id, companyId: techcorp.id },
    ...allTechcorpEmployees.map(e => ({ employeeId: e.employeeId, companyId: techcorp.id })),
  ]

  for (let i = 0; i < allTechcorpForBalance.length; i++) {
    const { employeeId, companyId } = allTechcorpForBalance[i]!
    const paidLeaveUsed = (i * 3) % 13 // 0 to 12, varies
    const rttUsed = (i * 2) % 7 // 0 to 6, varies

    await prisma.leaveBalance.upsert({
      where: { employeeId_year: { employeeId, year: 2026 } },
      update: { paidLeaveUsed, rttUsed },
      create: {
        employeeId, companyId, year: 2026,
        paidLeaveTotal: 25, paidLeaveUsed, rttTotal: 10, rttUsed,
      },
    })
  }

  // DesignStudio + StartupInc
  const otherEmployees = [
    { emp: emmaJones.employee!, co: designstudio },
    { emp: liamWhite.employee!, co: designstudio },
    { emp: oliviaMartin.employee!, co: designstudio },
    { emp: noahThompson.employee!, co: designstudio },
    { emp: avaAnderson.employee!, co: designstudio },
    { emp: williamTaylor.employee!, co: designstudio },
    { emp: oliverGreen.employee!, co: startupinc },
    { emp: jamesWalker.employee!, co: startupinc },
    { emp: sophiaClark.employee!, co: startupinc },
    { emp: isabellaHall.employee!, co: startupinc },
  ]

  for (let i = 0; i < otherEmployees.length; i++) {
    const { emp, co } = otherEmployees[i]!
    await prisma.leaveBalance.upsert({
      where: { employeeId_year: { employeeId: emp.id, year: 2026 } },
      update: {},
      create: {
        employeeId: emp.id, companyId: co.id, year: 2026,
        paidLeaveTotal: 25, paidLeaveUsed: (i * 2) % 8, rttTotal: 10, rttUsed: i % 4,
      },
    })
  }

  const totalBalances = allTechcorpForBalance.length + otherEmployees.length
  console.log(`✅ ${totalBalances} soldes de congés créés\n`)

  // ============================================================================
  // 11. NOTIFICATIONS
  // ============================================================================
  console.log('🔔 Création des notifications...')

  const notifTypeMap: Record<string, NotificationType> = {
    PLANNING: NotificationType.PLANNING,
    LEAVE: NotificationType.LEAVE,
    INCIDENT: NotificationType.INCIDENT,
    INFO: NotificationType.INFO,
    SUCCESS: NotificationType.SUCCESS,
    WARNING: NotificationType.WARNING,
    SYSTEM: NotificationType.SYSTEM,
  }

  for (const notif of NOTIFICATIONS) {
    let userId: string
    let companyId: string = techcorp.id

    if (notif.userType === 'director') {
      userId = johnDoe.id
    } else if (notif.userType === 'manager') {
      userId = resolveManager(notif.teamIndex!).userId
    } else {
      const teamEmps = allTechcorpEmployees.filter(e => e.teamIndex === notif.teamIndex! && !e.isManager)
      userId = teamEmps[notif.employeeIndex!]!.userId
    }

    await prisma.notification.create({
      data: {
        title: notif.title,
        message: notif.message,
        type: notifTypeMap[notif.type]!,
        userId,
        companyId,
        isRead: notif.isRead,
        readAt: notif.isRead ? new Date(notif.createdAt) : null,
        createdAt: new Date(notif.createdAt),
      },
    })
  }

  console.log(`✅ ${NOTIFICATIONS.length} notifications créées\n`)

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  console.log('🎉 Seeding terminé avec succès !\n')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📊 RÉCAPITULATIF')
  console.log('═══════════════════════════════════════════════════════════════\n')
  console.log('🏢 ORGANISATIONS : TechCorp (grande distribution), DesignStudio, StartupInc')
  console.log(`👥 ÉQUIPES : 12 TechCorp + 2 DesignStudio + 1 StartupInc = 15`)
  console.log(`👤 UTILISATEURS : ~${allTechcorpEmployees.length + 1} TechCorp + 6 DesignStudio + 4 StartupInc + 1 Admin`)
  console.log(`📅 PLANNINGS : ${scheduleCount + 6} créneaux (2 semaines mars 2026)`)
  console.log(`🏖️  CONGÉS : ${LEAVE_REQUESTS.length + 2}`)
  console.log(`📝 INCIDENTS : ${INCIDENTS.length}`)
  console.log(`📋 NOTES PERSO : ${PERSONAL_TASKS.length}`)
  console.log(`💰 SOLDES : ${totalBalances}`)
  console.log(`🔔 NOTIFICATIONS : ${NOTIFICATIONS.length}\n`)

  console.log('🔐 COMPTES DE TEST (mot de passe: Password123!) :')
  console.log('  📧 john.doe@techcorp.com     → DIRECTOR (Directeur magasin)')
  console.log('  📧 jane.smith@techcorp.com   → MANAGER (Responsable Bazar)')
  console.log('  📧 bob.wilson@techcorp.com   → EMPLOYEE (Employé Bazar)')
  console.log('  📧 contact@smartplanning.fr    → SYSTEM_ADMIN\n')
}

main()
  .catch((e) => {
    console.error('\n❌ ERREUR PENDANT LE SEEDING:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('🔌 Déconnexion de Prisma...\n')
    await prisma.$disconnect()
  })
