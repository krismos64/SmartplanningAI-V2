/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
// Note: Variables are created for their database side-effects in seed files
import { PrismaClient, UserRole, SubscriptionPlan, SubscriptionStatus, ScheduleType, ScheduleStatus, LeaveType, LeaveRequestStatus, NotificationType } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding de la base de données SmartPlanning v2.0...\n')

  // Hash du mot de passe pour tous les utilisateurs
  const hashedPassword = await bcrypt.hash('Password123!', 10)

  // ============================================================================
  // 1. CRÉER LES ORGANISATIONS
  // ============================================================================
  console.log('🏢 Création des organisations...')

  const techcorp = await prisma.company.create({
    data: {
      name: 'TechCorp',
      slug: 'techcorp',
      email: 'contact@techcorp.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Avenue des Champs-Élysées, 75008 Paris',
      workingHoursStart: '08:00',
      workingHoursEnd: '18:00',
      workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      timezone: 'Europe/Paris',
      subscriptionPlan: SubscriptionPlan.ENTERPRISE,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      defaultOpeningHours: {
        MONDAY: { start: '08:00', end: '18:00', break: '12:00-14:00' },
        TUESDAY: { start: '08:00', end: '18:00', break: '12:00-14:00' },
        WEDNESDAY: { start: '08:00', end: '18:00', break: '12:00-14:00' },
        THURSDAY: { start: '08:00', end: '18:00', break: '12:00-14:00' },
        FRIDAY: { start: '08:00', end: '17:00', break: '12:00-14:00' }
      }
    }
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
      subscriptionPlan: SubscriptionPlan.BUSINESS,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      defaultOpeningHours: {
        MONDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        TUESDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        WEDNESDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        THURSDAY: { start: '09:00', end: '17:00', break: '12:00-13:00' },
        FRIDAY: { start: '09:00', end: '16:00', break: '12:00-13:00' }
      }
    }
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
      subscriptionPlan: SubscriptionPlan.STARTER,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialEndsAt: new Date('2025-12-31'),
      defaultOpeningHours: {
        MONDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        TUESDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        WEDNESDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        THURSDAY: { start: '10:00', end: '19:00', break: '13:00-14:00' },
        FRIDAY: { start: '10:00', end: '18:00', break: '13:00-14:00' }
      }
    }
  })

  console.log('✅ 3 organisations créées\n')

  // ============================================================================
  // 2. CRÉER LES ABONNEMENTS STRIPE
  // ============================================================================
  console.log('💳 Création des abonnements Stripe...')

  const techcorpSub = await prisma.subscription.create({
    data: {
      companyId: techcorp.id,
      stripeCustomerId: `cus_techcorp_${Date.now()}`,
      stripeSubscriptionId: `sub_techcorp_${Date.now()}`,
      stripePriceId: 'price_enterprise',
      plan: SubscriptionPlan.ENTERPRISE,
      planPrice: 299.0,
      currency: 'EUR',
      billingInterval: 'month',
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date('2025-11-01'),
      currentPeriodEnd: new Date('2025-12-01'),
      cancelAtPeriodEnd: false
    }
  })

  const designstudioSub = await prisma.subscription.create({
    data: {
      companyId: designstudio.id,
      stripeCustomerId: `cus_designstudio_${Date.now()}`,
      stripeSubscriptionId: `sub_designstudio_${Date.now()}`,
      stripePriceId: 'price_business',
      plan: SubscriptionPlan.BUSINESS,
      planPrice: 99.0,
      currency: 'EUR',
      billingInterval: 'month',
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date('2025-11-01'),
      currentPeriodEnd: new Date('2025-12-01'),
      cancelAtPeriodEnd: false
    }
  })

  const startupincSub = await prisma.subscription.create({
    data: {
      companyId: startupinc.id,
      stripeCustomerId: `cus_startupinc_${Date.now()}`,
      plan: SubscriptionPlan.STARTER,
      planPrice: 29.0,
      currency: 'EUR',
      billingInterval: 'month',
      status: SubscriptionStatus.TRIAL,
      currentPeriodStart: new Date('2025-11-01'),
      currentPeriodEnd: new Date('2025-12-31')
    }
  })

  console.log(`✅ 3 abonnements créés: ${techcorpSub.plan}, ${designstudioSub.plan}, ${startupincSub.plan}\n`)

  // ============================================================================
  // 3. CRÉER LES PAIEMENTS
  // ============================================================================
  console.log('💰 Création des paiements...')

  await prisma.payment.create({
    data: {
      companyId: techcorp.id,
      subscriptionId: techcorpSub.id,
      stripePaymentId: `pi_techcorp_${Date.now()}`,
      stripeInvoiceId: `in_techcorp_${Date.now()}`,
      amount: 299.0,
      currency: 'EUR',
      status: 'succeeded',
      paymentMethod: 'card',
      paidAt: new Date('2025-11-01T10:00:00Z')
    }
  })

  await prisma.payment.create({
    data: {
      companyId: designstudio.id,
      subscriptionId: designstudioSub.id,
      stripePaymentId: `pi_designstudio_${Date.now()}`,
      stripeInvoiceId: `in_designstudio_${Date.now()}`,
      amount: 99.0,
      currency: 'EUR',
      status: 'succeeded',
      paymentMethod: 'sepa_debit',
      paidAt: new Date('2025-11-01T11:00:00Z')
    }
  })

  console.log('✅ 2 paiements créés\n')

  // ============================================================================
  // 4. CRÉER LES ÉQUIPES
  // ============================================================================
  console.log('👥 Création des équipes...')

  const engineering = await prisma.team.create({
    data: {
      name: 'Engineering',
      description: 'Équipe de développement logiciel',
      color: '#3B82F6',
      companyId: techcorp.id
    }
  })

  const product = await prisma.team.create({
    data: {
      name: 'Product',
      description: 'Équipe produit et product management',
      color: '#8B5CF6',
      companyId: techcorp.id
    }
  })

  const design = await prisma.team.create({
    data: {
      name: 'Design',
      description: 'Équipe design UI/UX',
      color: '#EC4899',
      companyId: techcorp.id
    }
  })

  const designers = await prisma.team.create({
    data: {
      name: 'Designers',
      description: 'Équipe des designers créatifs',
      color: '#F59E0B',
      companyId: designstudio.id
    }
  })

  const admin = await prisma.team.create({
    data: {
      name: 'Admin',
      description: 'Équipe administrative',
      color: '#10B981',
      companyId: designstudio.id
    }
  })

  const coreTeam = await prisma.team.create({
    data: {
      name: 'Core Team',
      description: 'Équipe principale startup',
      color: '#EF4444',
      companyId: startupinc.id
    }
  })

  console.log('✅ 6 équipes créées\n')

  // ============================================================================
  // 5. CRÉER LES UTILISATEURS ET EMPLOYÉS
  // ============================================================================
  console.log('👤 Création des utilisateurs et employés...')

  // ========== TECHCORP (10 users) ==========

  // DIRECTOR TechCorp
  const johnDoe = await prisma.user.create({
    data: {
      email: 'john.doe@techcorp.com',
      name: 'John Doe',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.DIRECTOR,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'John',
          lastName: 'Doe',
          jobTitle: 'CEO & Director',
          department: 'Management',
          phone: '+33 6 11 11 11 11',
          hireDate: new Date('2020-01-01'),
          weeklyHours: 40.0,
          companyId: techcorp.id,
          teamId: engineering.id,
          skills: ['Leadership', 'Strategy', 'Management']
        }
      }
    },
    include: { employee: true }
  })

  // MANAGER Engineering
  const janeSmith = await prisma.user.create({
    data: {
      email: 'jane.smith@techcorp.com',
      name: 'Jane Smith',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.MANAGER,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Jane',
          lastName: 'Smith',
          jobTitle: 'Engineering Manager',
          department: 'Engineering',
          phone: '+33 6 22 22 22 22',
          hireDate: new Date('2021-03-15'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: engineering.id,
          skills: ['JavaScript', 'TypeScript', 'React', 'Leadership']
        }
      }
    },
    include: { employee: true }
  })

  // Mettre à jour l'équipe Engineering avec le manager
  await prisma.team.update({
    where: { id: engineering.id },
    data: { managerId: janeSmith.employee!.id }
  })

  // EMPLOYEES Engineering (3)
  const bobWilson = await prisma.user.create({
    data: {
      email: 'bob.wilson@techcorp.com',
      name: 'Bob Wilson',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Bob',
          lastName: 'Wilson',
          jobTitle: 'Senior Developer',
          department: 'Engineering',
          phone: '+33 6 33 33 33 33',
          hireDate: new Date('2022-01-10'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: engineering.id,
          skills: ['React', 'Node.js', 'PostgreSQL']
        }
      }
    },
    include: { employee: true }
  })

  const evaGarcia = await prisma.user.create({
    data: {
      email: 'eva.garcia@techcorp.com',
      name: 'Eva Garcia',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Eva',
          lastName: 'Garcia',
          jobTitle: 'Full Stack Developer',
          department: 'Engineering',
          phone: '+33 6 44 44 44 44',
          hireDate: new Date('2022-06-01'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: engineering.id,
          skills: ['TypeScript', 'Next.js', 'MongoDB']
        }
      }
    },
    include: { employee: true }
  })

  const henryLopez = await prisma.user.create({
    data: {
      email: 'henry.lopez@techcorp.com',
      name: 'Henry Lopez',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Henry',
          lastName: 'Lopez',
          jobTitle: 'Junior Developer',
          department: 'Engineering',
          phone: '+33 6 55 55 55 55',
          hireDate: new Date('2024-09-01'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: engineering.id,
          skills: ['JavaScript', 'React', 'Git']
        }
      }
    },
    include: { employee: true }
  })

  // MANAGER Product
  const aliceBrown = await prisma.user.create({
    data: {
      email: 'alice.brown@techcorp.com',
      name: 'Alice Brown',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.MANAGER,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Alice',
          lastName: 'Brown',
          jobTitle: 'Product Manager',
          department: 'Product',
          phone: '+33 6 66 66 66 66',
          hireDate: new Date('2021-06-01'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: product.id,
          skills: ['Product Management', 'Agile', 'User Research']
        }
      }
    },
    include: { employee: true }
  })

  // Mettre à jour l'équipe Product avec le manager
  await prisma.team.update({
    where: { id: product.id },
    data: { managerId: aliceBrown.employee!.id }
  })

  // EMPLOYEES Product (2)
  const charlieDavis = await prisma.user.create({
    data: {
      email: 'charlie.davis@techcorp.com',
      name: 'Charlie Davis',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Charlie',
          lastName: 'Davis',
          jobTitle: 'Product Owner',
          department: 'Product',
          phone: '+33 6 77 77 77 77',
          hireDate: new Date('2022-03-01'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: product.id,
          skills: ['Scrum', 'Jira', 'Stakeholder Management']
        }
      }
    },
    include: { employee: true }
  })

  const davidMiller = await prisma.user.create({
    data: {
      email: 'david.miller@techcorp.com',
      name: 'David Miller',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'David',
          lastName: 'Miller',
          jobTitle: 'Product Analyst',
          department: 'Product',
          phone: '+33 6 88 88 88 88',
          hireDate: new Date('2023-01-15'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: product.id,
          skills: ['Analytics', 'SQL', 'Data Visualization']
        }
      }
    },
    include: { employee: true }
  })

  // MANAGER Design
  const frankMartinez = await prisma.user.create({
    data: {
      email: 'frank.martinez@techcorp.com',
      name: 'Frank Martinez',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.MANAGER,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Frank',
          lastName: 'Martinez',
          jobTitle: 'Design Lead',
          department: 'Design',
          phone: '+33 6 99 99 99 99',
          hireDate: new Date('2021-09-01'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: design.id,
          skills: ['Figma', 'UI/UX', 'Design Systems']
        }
      }
    },
    include: { employee: true }
  })

  // Mettre à jour l'équipe Design avec le manager
  await prisma.team.update({
    where: { id: design.id },
    data: { managerId: frankMartinez.employee!.id }
  })

  // EMPLOYEE Design (1)
  const graceRodriguez = await prisma.user.create({
    data: {
      email: 'grace.rodriguez@techcorp.com',
      name: 'Grace Rodriguez',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: techcorp.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Grace',
          lastName: 'Rodriguez',
          jobTitle: 'UI Designer',
          department: 'Design',
          phone: '+33 6 10 10 10 10',
          hireDate: new Date('2023-05-01'),
          weeklyHours: 35.0,
          companyId: techcorp.id,
          teamId: design.id,
          skills: ['Figma', 'Adobe XD', 'Illustration']
        }
      }
    },
    include: { employee: true }
  })

  // ========== DESIGNSTUDIO (6 users) ==========

  // DIRECTOR DesignStudio
  const emmaJones = await prisma.user.create({
    data: {
      email: 'emma.jones@designstudio.com',
      name: 'Emma Jones',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.DIRECTOR,
      companyId: designstudio.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Emma',
          lastName: 'Jones',
          jobTitle: 'Creative Director',
          department: 'Management',
          phone: '+33 6 21 21 21 21',
          hireDate: new Date('2019-06-01'),
          weeklyHours: 37.0,
          companyId: designstudio.id,
          teamId: designers.id,
          skills: ['Creative Direction', 'Branding', 'Strategy']
        }
      }
    },
    include: { employee: true }
  })

  // MANAGER Designers
  const liamWhite = await prisma.user.create({
    data: {
      email: 'liam.white@designstudio.com',
      name: 'Liam White',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.MANAGER,
      companyId: designstudio.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Liam',
          lastName: 'White',
          jobTitle: 'Senior Designer',
          department: 'Design',
          phone: '+33 6 32 32 32 32',
          hireDate: new Date('2020-03-01'),
          weeklyHours: 35.0,
          companyId: designstudio.id,
          teamId: designers.id,
          skills: ['Graphic Design', 'Motion Design', 'Art Direction']
        }
      }
    },
    include: { employee: true }
  })

  // Mettre à jour l'équipe Designers avec le manager
  await prisma.team.update({
    where: { id: designers.id },
    data: { managerId: liamWhite.employee!.id }
  })

  // EMPLOYEES Designers (2)
  const oliviaMartin = await prisma.user.create({
    data: {
      email: 'olivia.martin@designstudio.com',
      name: 'Olivia Martin',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: designstudio.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Olivia',
          lastName: 'Martin',
          jobTitle: 'Graphic Designer',
          department: 'Design',
          phone: '+33 6 43 43 43 43',
          hireDate: new Date('2021-09-01'),
          weeklyHours: 35.0,
          companyId: designstudio.id,
          teamId: designers.id,
          skills: ['Photoshop', 'Illustrator', 'Print Design']
        }
      }
    },
    include: { employee: true }
  })

  const noahThompson = await prisma.user.create({
    data: {
      email: 'noah.thompson@designstudio.com',
      name: 'Noah Thompson',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: designstudio.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Noah',
          lastName: 'Thompson',
          jobTitle: 'Web Designer',
          department: 'Design',
          phone: '+33 6 54 54 54 54',
          hireDate: new Date('2022-02-01'),
          weeklyHours: 35.0,
          companyId: designstudio.id,
          teamId: designers.id,
          skills: ['Webflow', 'CSS', 'Responsive Design']
        }
      }
    },
    include: { employee: true }
  })

  // MANAGER Admin
  const avaAnderson = await prisma.user.create({
    data: {
      email: 'ava.anderson@designstudio.com',
      name: 'Ava Anderson',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.MANAGER,
      companyId: designstudio.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Ava',
          lastName: 'Anderson',
          jobTitle: 'Office Manager',
          department: 'Administration',
          phone: '+33 6 65 65 65 65',
          hireDate: new Date('2020-08-01'),
          weeklyHours: 35.0,
          companyId: designstudio.id,
          teamId: admin.id,
          skills: ['Administration', 'HR', 'Communication']
        }
      }
    },
    include: { employee: true }
  })

  // Mettre à jour l'équipe Admin avec le manager
  await prisma.team.update({
    where: { id: admin.id },
    data: { managerId: avaAnderson.employee!.id }
  })

  // EMPLOYEE Admin (1)
  const williamTaylor = await prisma.user.create({
    data: {
      email: 'william.taylor@designstudio.com',
      name: 'William Taylor',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: designstudio.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'William',
          lastName: 'Taylor',
          jobTitle: 'Administrative Assistant',
          department: 'Administration',
          phone: '+33 6 76 76 76 76',
          hireDate: new Date('2023-03-01'),
          weeklyHours: 35.0,
          companyId: designstudio.id,
          teamId: admin.id,
          skills: ['Office Suite', 'Planning', 'Customer Service']
        }
      }
    },
    include: { employee: true }
  })

  // ========== STARTUPINC (4 users) ==========

  // DIRECTOR StartupInc
  const oliverGreen = await prisma.user.create({
    data: {
      email: 'oliver.green@startupinc.com',
      name: 'Oliver Green',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.DIRECTOR,
      companyId: startupinc.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Oliver',
          lastName: 'Green',
          jobTitle: 'Founder & CEO',
          department: 'Management',
          phone: '+33 6 87 87 87 87',
          hireDate: new Date('2024-01-01'),
          weeklyHours: 45.0,
          companyId: startupinc.id,
          teamId: coreTeam.id,
          skills: ['Entrepreneurship', 'Vision', 'Fundraising']
        }
      }
    },
    include: { employee: true }
  })

  // MANAGER Core Team
  const jamesWalker = await prisma.user.create({
    data: {
      email: 'james.walker@startupinc.com',
      name: 'James Walker',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.MANAGER,
      companyId: startupinc.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'James',
          lastName: 'Walker',
          jobTitle: 'CTO',
          department: 'Engineering',
          phone: '+33 6 98 98 98 98',
          hireDate: new Date('2024-02-01'),
          weeklyHours: 40.0,
          companyId: startupinc.id,
          teamId: coreTeam.id,
          skills: ['Full Stack', 'Architecture', 'DevOps']
        }
      }
    },
    include: { employee: true }
  })

  // Mettre à jour l'équipe Core Team avec le manager
  await prisma.team.update({
    where: { id: coreTeam.id },
    data: { managerId: jamesWalker.employee!.id }
  })

  // EMPLOYEES Core Team (2)
  const sophiaClark = await prisma.user.create({
    data: {
      email: 'sophia.clark@startupinc.com',
      name: 'Sophia Clark',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: startupinc.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Sophia',
          lastName: 'Clark',
          jobTitle: 'Full Stack Developer',
          department: 'Engineering',
          phone: '+33 6 19 19 19 19',
          hireDate: new Date('2024-03-01'),
          weeklyHours: 35.0,
          companyId: startupinc.id,
          teamId: coreTeam.id,
          skills: ['React', 'Python', 'AWS']
        }
      }
    },
    include: { employee: true }
  })

  const isabellaHall = await prisma.user.create({
    data: {
      email: 'isabella.hall@startupinc.com',
      name: 'Isabella Hall',
      password: hashedPassword,
      emailVerified: new Date(),
      role: UserRole.EMPLOYEE,
      companyId: startupinc.id,
      isActive: true,
      isEmailVerified: true,
      employee: {
        create: {
          firstName: 'Isabella',
          lastName: 'Hall',
          jobTitle: 'Product Designer',
          department: 'Design',
          phone: '+33 6 29 29 29 29',
          hireDate: new Date('2024-04-01'),
          weeklyHours: 35.0,
          companyId: startupinc.id,
          teamId: coreTeam.id,
          skills: ['Figma', 'User Research', 'Prototyping']
        }
      }
    },
    include: { employee: true }
  })

  console.log('✅ 20 utilisateurs et employés créés')
  console.log('   - 3 DIRECTOR (1 par organisation)')
  console.log('   - 6 MANAGER')
  console.log('   - 11 EMPLOYEE')
  console.log('   - 0 SYSTEM_ADMIN (réservé à Christophe)\n')

  // ============================================================================
  // 6. CRÉER LES PLANNINGS (SCHEDULES)
  // ============================================================================
  console.log('📅 Création des plannings...')

  // TechCorp - Engineering (5 schedules)
  const schedule1 = await prisma.schedule.create({
    data: {
      title: 'Development Sprint',
      startDate: new Date('2025-11-04T08:00:00Z'),
      endDate: new Date('2025-11-04T17:00:00Z'),
      startTime: '08:00',
      endTime: '17:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: bobWilson.employee!.id,
      teamId: engineering.id,
      companyId: techcorp.id,
      createdById: janeSmith.id,
      location: 'Bureau Paris',
      color: '#3B82F6'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'Code Review Session',
      startDate: new Date('2025-11-05T09:00:00Z'),
      endDate: new Date('2025-11-05T11:00:00Z'),
      startTime: '09:00',
      endTime: '11:00',
      type: ScheduleType.MEETING,
      status: ScheduleStatus.CONFIRMED,
      employeeId: evaGarcia.employee!.id,
      teamId: engineering.id,
      companyId: techcorp.id,
      createdById: janeSmith.id,
      location: 'Salle de réunion A',
      color: '#8B5CF6'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'Remote Work Day',
      startDate: new Date('2025-11-06T08:00:00Z'),
      endDate: new Date('2025-11-06T17:00:00Z'),
      startTime: '08:00',
      endTime: '17:00',
      type: ScheduleType.REMOTE,
      status: ScheduleStatus.CONFIRMED,
      employeeId: henryLopez.employee!.id,
      teamId: engineering.id,
      companyId: techcorp.id,
      createdById: janeSmith.id,
      location: 'Télétravail',
      color: '#10B981'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'Team Building',
      startDate: new Date('2025-11-07T14:00:00Z'),
      endDate: new Date('2025-11-07T18:00:00Z'),
      startTime: '14:00',
      endTime: '18:00',
      type: ScheduleType.TRAINING,
      status: ScheduleStatus.CONFIRMED,
      employeeId: janeSmith.employee!.id,
      teamId: engineering.id,
      companyId: techcorp.id,
      createdById: johnDoe.id,
      location: 'Offsite',
      color: '#F59E0B'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'On-Call Duty',
      startDate: new Date('2025-11-08T21:00:00Z'),
      endDate: new Date('2025-11-09T05:00:00Z'),
      startTime: '21:00',
      endTime: '05:00',
      type: ScheduleType.ON_CALL,
      status: ScheduleStatus.CONFIRMED,
      employeeId: bobWilson.employee!.id,
      teamId: engineering.id,
      companyId: techcorp.id,
      createdById: janeSmith.id,
      location: 'Astreinte',
      color: '#EF4444'
    }
  })

  // TechCorp - Product (3 schedules)
  await prisma.schedule.create({
    data: {
      title: 'Product Strategy Meeting',
      startDate: new Date('2025-11-04T10:00:00Z'),
      endDate: new Date('2025-11-04T12:00:00Z'),
      startTime: '10:00',
      endTime: '12:00',
      type: ScheduleType.MEETING,
      status: ScheduleStatus.CONFIRMED,
      employeeId: aliceBrown.employee!.id,
      teamId: product.id,
      companyId: techcorp.id,
      createdById: johnDoe.id,
      location: 'Salle de réunion B',
      color: '#8B5CF6'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'User Research',
      startDate: new Date('2025-11-05T08:00:00Z'),
      endDate: new Date('2025-11-05T17:00:00Z'),
      startTime: '08:00',
      endTime: '17:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: charlieDavis.employee!.id,
      teamId: product.id,
      companyId: techcorp.id,
      createdById: aliceBrown.id,
      location: 'Bureau Paris',
      color: '#3B82F6'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'Data Analysis',
      startDate: new Date('2025-11-06T08:00:00Z'),
      endDate: new Date('2025-11-06T17:00:00Z'),
      startTime: '08:00',
      endTime: '17:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: davidMiller.employee!.id,
      teamId: product.id,
      companyId: techcorp.id,
      createdById: aliceBrown.id,
      location: 'Bureau Paris',
      color: '#3B82F6'
    }
  })

  // TechCorp - Design (2 schedules)
  await prisma.schedule.create({
    data: {
      title: 'Design System Workshop',
      startDate: new Date('2025-11-04T09:00:00Z'),
      endDate: new Date('2025-11-04T17:00:00Z'),
      startTime: '09:00',
      endTime: '17:00',
      type: ScheduleType.TRAINING,
      status: ScheduleStatus.CONFIRMED,
      employeeId: frankMartinez.employee!.id,
      teamId: design.id,
      companyId: techcorp.id,
      createdById: johnDoe.id,
      location: 'Bureau Paris',
      color: '#F59E0B'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'UI Design',
      startDate: new Date('2025-11-05T08:00:00Z'),
      endDate: new Date('2025-11-05T17:00:00Z'),
      startTime: '08:00',
      endTime: '17:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: graceRodriguez.employee!.id,
      teamId: design.id,
      companyId: techcorp.id,
      createdById: frankMartinez.id,
      location: 'Bureau Paris',
      color: '#EC4899'
    }
  })

  // DesignStudio - Designers (3 schedules)
  await prisma.schedule.create({
    data: {
      title: 'Client Presentation',
      startDate: new Date('2025-11-04T14:00:00Z'),
      endDate: new Date('2025-11-04T16:00:00Z'),
      startTime: '14:00',
      endTime: '16:00',
      type: ScheduleType.MEETING,
      status: ScheduleStatus.CONFIRMED,
      employeeId: liamWhite.employee!.id,
      teamId: designers.id,
      companyId: designstudio.id,
      createdById: emmaJones.id,
      location: 'Salle de réunion principale',
      color: '#8B5CF6'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'Creative Brainstorming',
      startDate: new Date('2025-11-05T09:00:00Z'),
      endDate: new Date('2025-11-05T17:00:00Z'),
      startTime: '09:00',
      endTime: '17:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: oliviaMartin.employee!.id,
      teamId: designers.id,
      companyId: designstudio.id,
      createdById: liamWhite.id,
      location: 'Bureau Paris',
      color: '#F59E0B'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'Web Design Project',
      startDate: new Date('2025-11-06T09:00:00Z'),
      endDate: new Date('2025-11-06T16:00:00Z'),
      startTime: '09:00',
      endTime: '16:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: noahThompson.employee!.id,
      teamId: designers.id,
      companyId: designstudio.id,
      createdById: liamWhite.id,
      location: 'Bureau Paris',
      color: '#3B82F6'
    }
  })

  // StartupInc - Core Team (2 schedules)
  await prisma.schedule.create({
    data: {
      title: 'Product Development',
      startDate: new Date('2025-11-04T10:00:00Z'),
      endDate: new Date('2025-11-04T19:00:00Z'),
      startTime: '10:00',
      endTime: '19:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: sophiaClark.employee!.id,
      teamId: coreTeam.id,
      companyId: startupinc.id,
      createdById: jamesWalker.id,
      location: 'Bureau Paris',
      color: '#3B82F6'
    }
  })

  await prisma.schedule.create({
    data: {
      title: 'Design Sprint',
      startDate: new Date('2025-11-05T10:00:00Z'),
      endDate: new Date('2025-11-05T18:00:00Z'),
      startTime: '10:00',
      endTime: '18:00',
      type: ScheduleType.WORK,
      status: ScheduleStatus.CONFIRMED,
      employeeId: isabellaHall.employee!.id,
      teamId: coreTeam.id,
      companyId: startupinc.id,
      createdById: jamesWalker.id,
      location: 'Bureau Paris',
      color: '#EC4899'
    }
  })

  console.log('✅ 15 plannings créés\n')

  // ============================================================================
  // 7. CRÉER LES DEMANDES DE CONGÉS
  // ============================================================================
  console.log('🏖️  Création des demandes de congés...')

  // APPROVED
  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-12-20'),
      endDate: new Date('2025-12-27'),
      days: 6,
      type: LeaveType.PAID_LEAVE,
      status: LeaveRequestStatus.APPROVED,
      reason: 'Vacances de Noël en famille',
      employeeId: aliceBrown.employee!.id,
      companyId: techcorp.id,
      reviewedById: johnDoe.id,
      reviewedAt: new Date('2025-11-01T14:00:00Z'),
      reviewComment: 'Approuvé. Bonnes vacances !'
    }
  })

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-11-15'),
      endDate: new Date('2025-11-16'),
      days: 2,
      type: LeaveType.SICK_LEAVE,
      status: LeaveRequestStatus.APPROVED,
      reason: 'Grippe',
      employeeId: bobWilson.employee!.id,
      companyId: techcorp.id,
      reviewedById: janeSmith.id,
      reviewedAt: new Date('2025-11-14T09:00:00Z'),
      reviewComment: 'Approuvé. Rétablissement rapide.'
    }
  })

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-03'),
      days: 3,
      type: LeaveType.RTT,
      status: LeaveRequestStatus.APPROVED,
      reason: 'RTT de fin d\'année',
      employeeId: evaGarcia.employee!.id,
      companyId: techcorp.id,
      reviewedById: janeSmith.id,
      reviewedAt: new Date('2025-11-02T10:00:00Z'),
      reviewComment: 'Approuvé.'
    }
  })

  // PENDING
  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-11-25'),
      endDate: new Date('2025-11-26'),
      days: 2,
      type: LeaveType.UNPAID_LEAVE,
      status: LeaveRequestStatus.PENDING,
      reason: 'Rendez-vous personnel',
      employeeId: oliviaMartin.employee!.id,
      companyId: designstudio.id
    }
  })

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-12-15'),
      endDate: new Date('2025-12-17'),
      days: 3,
      type: LeaveType.PAID_LEAVE,
      status: LeaveRequestStatus.PENDING,
      reason: 'Préparation fêtes de fin d\'année',
      employeeId: henryLopez.employee!.id,
      companyId: techcorp.id
    }
  })

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-11-20'),
      endDate: new Date('2025-11-20'),
      days: 1,
      type: LeaveType.OTHER,
      status: LeaveRequestStatus.PENDING,
      reason: 'Déménagement',
      employeeId: sophiaClark.employee!.id,
      companyId: startupinc.id
    }
  })

  // REJECTED
  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-11-10'),
      endDate: new Date('2025-11-12'),
      days: 3,
      type: LeaveType.PAID_LEAVE,
      status: LeaveRequestStatus.REJECTED,
      reason: 'Congés dernière minute',
      employeeId: charlieDavis.employee!.id,
      companyId: techcorp.id,
      reviewedById: aliceBrown.id,
      reviewedAt: new Date('2025-11-03T11:00:00Z'),
      reviewComment: 'Refusé - délai trop court et période critique projet.'
    }
  })

  await prisma.leaveRequest.create({
    data: {
      startDate: new Date('2025-11-18'),
      endDate: new Date('2025-11-22'),
      days: 5,
      type: LeaveType.PAID_LEAVE,
      status: LeaveRequestStatus.REJECTED,
      reason: 'Vacances',
      employeeId: noahThompson.employee!.id,
      companyId: designstudio.id,
      reviewedById: liamWhite.id,
      reviewedAt: new Date('2025-11-02T15:00:00Z'),
      reviewComment: 'Refusé - deadline client importante cette semaine.'
    }
  })

  console.log('✅ 8 demandes de congés créées\n')

  // ============================================================================
  // 8. CRÉER LES NOTIFICATIONS
  // ============================================================================
  console.log('🔔 Création des notifications...')

  // Notifications pour les demandes de congés approuvées
  await prisma.notification.create({
    data: {
      title: 'Demande de congés approuvée',
      message: 'Votre demande de congés du 20/12/2025 au 27/12/2025 a été approuvée par John Doe.',
      type: NotificationType.SUCCESS,
      userId: aliceBrown.id,
      companyId: techcorp.id,
      relatedType: 'LeaveRequest',
      isRead: true,
      readAt: new Date('2025-11-01T15:00:00Z'),
      createdAt: new Date('2025-11-01T14:05:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Demande de congés approuvée',
      message: 'Votre demande de congés maladie du 15/11/2025 au 16/11/2025 a été approuvée.',
      type: NotificationType.SUCCESS,
      userId: bobWilson.id,
      companyId: techcorp.id,
      relatedType: 'LeaveRequest',
      isRead: true,
      readAt: new Date('2025-11-14T10:00:00Z'),
      createdAt: new Date('2025-11-14T09:05:00Z')
    }
  })

  // Notifications pour les demandes rejetées
  await prisma.notification.create({
    data: {
      title: 'Demande de congés refusée',
      message: 'Votre demande de congés du 10/11/2025 au 12/11/2025 a été refusée. Raison: délai trop court et période critique projet.',
      type: NotificationType.WARNING,
      userId: charlieDavis.id,
      companyId: techcorp.id,
      relatedType: 'LeaveRequest',
      isRead: false,
      createdAt: new Date('2025-11-03T11:05:00Z')
    }
  })

  // Notifications plannings
  await prisma.notification.create({
    data: {
      title: 'Nouveau planning assigné',
      message: 'Vous avez été assigné au planning "Development Sprint" le 04/11/2025.',
      type: NotificationType.INFO,
      userId: bobWilson.id,
      companyId: techcorp.id,
      relatedType: 'Schedule',
      relatedId: schedule1.id,
      isRead: false,
      createdAt: new Date('2025-11-03T15:00:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Rappel planning',
      message: 'Rappel: Planning "Code Review Session" demain à 9h00.',
      type: NotificationType.INFO,
      userId: evaGarcia.id,
      companyId: techcorp.id,
      relatedType: 'Schedule',
      isRead: false,
      createdAt: new Date('2025-11-04T18:00:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Astreinte programmée',
      message: 'Vous êtes d\'astreinte le 08/11/2025 de 21h00 à 05h00.',
      type: NotificationType.WARNING,
      userId: bobWilson.id,
      companyId: techcorp.id,
      relatedType: 'Schedule',
      isRead: true,
      readAt: new Date('2025-11-02T11:00:00Z'),
      createdAt: new Date('2025-11-02T10:00:00Z')
    }
  })

  // Notifications système
  await prisma.notification.create({
    data: {
      title: 'Bienvenue sur SmartPlanning',
      message: 'Bienvenue ! Découvrez toutes les fonctionnalités de SmartPlanning.',
      type: NotificationType.INFO,
      userId: henryLopez.id,
      companyId: techcorp.id,
      isRead: false,
      createdAt: new Date('2024-09-01T09:00:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Mise à jour du système',
      message: 'Une nouvelle version de SmartPlanning est disponible avec des améliorations de performance.',
      type: NotificationType.SYSTEM,
      userId: johnDoe.id,
      companyId: techcorp.id,
      isRead: true,
      readAt: new Date('2025-11-01T10:00:00Z'),
      createdAt: new Date('2025-11-01T08:00:00Z')
    }
  })

  // Notifications équipe
  await prisma.notification.create({
    data: {
      title: 'Nouveau membre dans l\'équipe',
      message: 'Henry Lopez a rejoint l\'équipe Engineering.',
      type: NotificationType.SUCCESS,
      userId: janeSmith.id,
      companyId: techcorp.id,
      isRead: true,
      readAt: new Date('2024-09-01T11:00:00Z'),
      createdAt: new Date('2024-09-01T09:30:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Réunion d\'équipe',
      message: 'Réunion d\'équipe Product Strategy prévue demain à 10h00.',
      type: NotificationType.INFO,
      userId: charlieDavis.id,
      companyId: techcorp.id,
      isRead: false,
      createdAt: new Date('2025-11-03T16:00:00Z')
    }
  })

  // DesignStudio notifications
  await prisma.notification.create({
    data: {
      title: 'Client meeting confirmé',
      message: 'La présentation client du 04/11/2025 à 14h00 est confirmée.',
      type: NotificationType.SUCCESS,
      userId: liamWhite.id,
      companyId: designstudio.id,
      isRead: true,
      readAt: new Date('2025-11-03T12:00:00Z'),
      createdAt: new Date('2025-11-03T11:00:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Feedback client reçu',
      message: 'Le client a partagé ses retours sur le dernier projet.',
      type: NotificationType.INFO,
      userId: oliviaMartin.id,
      companyId: designstudio.id,
      isRead: false,
      createdAt: new Date('2025-11-04T10:00:00Z')
    }
  })

  // StartupInc notifications
  await prisma.notification.create({
    data: {
      title: 'Sprint planning',
      message: 'Sprint planning prévu pour demain matin à 10h00.',
      type: NotificationType.INFO,
      userId: sophiaClark.id,
      companyId: startupinc.id,
      isRead: false,
      createdAt: new Date('2025-11-03T17:00:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Investisseur meeting',
      message: 'Pitch investisseur prévu le 15/11/2025.',
      type: NotificationType.WARNING,
      userId: oliverGreen.id,
      companyId: startupinc.id,
      isRead: true,
      readAt: new Date('2025-11-02T14:00:00Z'),
      createdAt: new Date('2025-11-02T13:00:00Z')
    }
  })

  await prisma.notification.create({
    data: {
      title: 'Nouvelle feature déployée',
      message: 'La nouvelle fonctionnalité a été déployée avec succès en production.',
      type: NotificationType.SUCCESS,
      userId: jamesWalker.id,
      companyId: startupinc.id,
      isRead: true,
      readAt: new Date('2025-11-03T09:00:00Z'),
      createdAt: new Date('2025-11-03T08:00:00Z')
    }
  })

  console.log('✅ 15 notifications créées\n')

  // ============================================================================
  // RÉSUMÉ FINAL
  // ============================================================================
  console.log('🎉 Seeding terminé avec succès !\n')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('📊 RÉCAPITULATIF DES DONNÉES CRÉÉES')
  console.log('═══════════════════════════════════════════════════════════════\n')

  console.log('🏢 ORGANISATIONS (3) :')
  console.log('   • TechCorp (ENTERPRISE, 10 employés)')
  console.log('   • DesignStudio (BUSINESS, 6 employés)')
  console.log('   • StartupInc (STARTER, 4 employés)\n')

  console.log('👥 ÉQUIPES (6) :')
  console.log('   TechCorp :')
  console.log('   • Engineering (Manager: Jane Smith)')
  console.log('   • Product (Manager: Alice Brown)')
  console.log('   • Design (Manager: Frank Martinez)')
  console.log('   DesignStudio :')
  console.log('   • Designers (Manager: Liam White)')
  console.log('   • Admin (Manager: Ava Anderson)')
  console.log('   StartupInc :')
  console.log('   • Core Team (Manager: James Walker)\n')

  console.log('👤 UTILISATEURS & EMPLOYÉS (20) :')
  console.log('   Rôles :')
  console.log('   • 3 DIRECTOR (1 par organisation)')
  console.log('   • 6 MANAGER')
  console.log('   • 11 EMPLOYEE')
  console.log('   • 0 SYSTEM_ADMIN (réservé à Christophe)\n')

  console.log('💳 ABONNEMENTS & PAIEMENTS :')
  console.log('   • 3 abonnements Stripe créés')
  console.log('   • 2 paiements enregistrés\n')

  console.log('📅 PLANNINGS (15) :')
  console.log('   • TechCorp: 10 plannings (Engineering, Product, Design)')
  console.log('   • DesignStudio: 3 plannings (Designers)')
  console.log('   • StartupInc: 2 plannings (Core Team)\n')

  console.log('🏖️  DEMANDES DE CONGÉS (8) :')
  console.log('   • 3 APPROVED (Alice Brown, Bob Wilson, Eva Garcia)')
  console.log('   • 3 PENDING (Olivia Martin, Henry Lopez, Sophia Clark)')
  console.log('   • 2 REJECTED (Charlie Davis, Noah Thompson)\n')

  console.log('🔔 NOTIFICATIONS (15) :')
  console.log('   • 8 READ')
  console.log('   • 7 UNREAD\n')

  console.log('═══════════════════════════════════════════════════════════════')
  console.log('✅ BASE DE DONNÉES PRÊTE POUR LE DÉVELOPPEMENT !')
  console.log('═══════════════════════════════════════════════════════════════\n')

  console.log('🔐 COMPTES DE TEST (mot de passe: Password123!) :\n')
  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║                          TECHCORP                              ║')
  console.log('╠═══════════════════════════════════════════════════════════════╣')
  console.log('║ 📧 john.doe@techcorp.com       | 👔 DIRECTOR                  ║')
  console.log('║ 📧 jane.smith@techcorp.com     | 👨‍💼 MANAGER (Engineering)     ║')
  console.log('║ 📧 alice.brown@techcorp.com    | 👨‍💼 MANAGER (Product)         ║')
  console.log('║ 📧 frank.martinez@techcorp.com | 👨‍💼 MANAGER (Design)          ║')
  console.log('║ 📧 bob.wilson@techcorp.com     | 👤 EMPLOYEE (Engineering)    ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝\n')

  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║                       DESIGNSTUDIO                             ║')
  console.log('╠═══════════════════════════════════════════════════════════════╣')
  console.log('║ 📧 emma.jones@designstudio.com   | 👔 DIRECTOR                ║')
  console.log('║ 📧 liam.white@designstudio.com   | 👨‍💼 MANAGER (Designers)     ║')
  console.log('║ 📧 ava.anderson@designstudio.com | 👨‍💼 MANAGER (Admin)         ║')
  console.log('║ 📧 olivia.martin@designstudio.com| 👤 EMPLOYEE (Designers)    ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝\n')

  console.log('╔═══════════════════════════════════════════════════════════════╗')
  console.log('║                        STARTUPINC                              ║')
  console.log('╠═══════════════════════════════════════════════════════════════╣')
  console.log('║ 📧 oliver.green@startupinc.com  | 👔 DIRECTOR                 ║')
  console.log('║ 📧 james.walker@startupinc.com  | 👨‍💼 MANAGER (Core Team)      ║')
  console.log('║ 📧 sophia.clark@startupinc.com  | 👤 EMPLOYEE (Core Team)     ║')
  console.log('╚═══════════════════════════════════════════════════════════════╝\n')

  console.log('🎯 PROCHAINES ÉTAPES :')
  console.log('   1. Vérifier les données dans DBeaver ou Prisma Studio')
  console.log('   2. Commencer le développement de l\'architecture Next.js')
  console.log('   3. Configurer NextAuth v5 avec les utilisateurs créés')
  console.log('   4. Développer les interfaces (dashboards, planning, congés)\n')

  console.log('💡 COMMANDES UTILES :')
  console.log('   • npx prisma studio    → Visualiser les données')
  console.log('   • npm run db:seed      → Réexécuter le seed')
  console.log('   • npx prisma db push   → Synchroniser le schéma\n')
}

main()
  .catch((e) => {
    console.error('\n❌ ERREUR PENDANT LE SEEDING:')
    console.error('═══════════════════════════════════════════════════════════════')
    console.error(e)
    console.error('═══════════════════════════════════════════════════════════════\n')
    process.exit(1)
  })
  .finally(async () => {
    console.log('🔌 Déconnexion de Prisma...\n')
    await prisma.$disconnect()
  })
