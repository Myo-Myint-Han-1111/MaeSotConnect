// inspect-prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Log all available properties on the prisma client
console.log('Available properties on prisma client:');
console.log(Object.keys(prisma));

// Log models specifically
console.log('\nPrisma models:');
const models = Object.keys(prisma).filter(key => 
  !key.startsWith('_') && 
  typeof prisma[key] === 'object' && 
  prisma[key] !== null &&
  Object.prototype.hasOwnProperty.call(prisma[key], 'findUnique')
);
console.log(models);

// Exit when done
process.exit(0);