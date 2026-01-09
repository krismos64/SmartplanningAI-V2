/**
 * Script pour créer le compte Super Admin en production
 * Usage: ADMIN_EMAIL=xxx ADMIN_PASSWORD=xxx ADMIN_NAME=xxx npx tsx prisma/seed-admin.ts
 */
import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME || 'Super Admin'

  if (!email || !password) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required')
    console.log('Usage: ADMIN_EMAIL=xxx ADMIN_PASSWORD=xxx ADMIN_NAME=xxx npx tsx prisma/seed-admin.ts')
    process.exit(1)
  }

  console.log('Creating Super Admin account...\n')

  const hashedPassword = await bcrypt.hash(password, 10)

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    console.log('User already exists, updating...')
    await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
        role: UserRole.SYSTEM_ADMIN,
        isActive: true,
        isEmailVerified: true,
        emailVerified: new Date(),
      },
    })
    console.log('User updated successfully!')
  } else {
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(),
        role: UserRole.SYSTEM_ADMIN,
        companyId: null,
        isActive: true,
        isEmailVerified: true,
      },
    })
    console.log('Super Admin created successfully!')
  }

  console.log('\n========================================')
  console.log('SUPER ADMIN ACCOUNT CREATED')
  console.log('========================================')
  console.log(`Email: ${email}`)
  console.log('Password: [PROVIDED VIA ENV]')
  console.log('Role: SYSTEM_ADMIN')
  console.log('========================================\n')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
