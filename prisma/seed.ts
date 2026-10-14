import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in the root .env file',
    )
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const adminRole = await prisma.role.upsert({
    where: { roleName: 'admin' },
    update: {},
    create: { roleName: 'admin'},
  })

  await prisma.role.upsert({
    where: { roleName: 'user' },
    update: {},
    create: { roleName: 'user'},
  })

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      username: 'Admin',
      email: adminEmail,
      password: hashedPassword,
      roleId: adminRole.id,
    },
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })