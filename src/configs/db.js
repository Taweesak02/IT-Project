const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

let prisma = null;

const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
};

const getPrisma = () => {
  if (!prisma) {
    prisma = createPrismaClient();
  }

  return prisma;
};

module.exports = new Proxy({}, {
  get(_target, prop) {
    return getPrisma()[prop];
  },
  apply(_target, _thisArg, args) {
    return getPrisma().apply(args);
  },
});