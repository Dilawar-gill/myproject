const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  const email = 'info.itgims@gmail.com';
  const password = '@dmin@1415';
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  
  console.log('✅ User created:', user.email);
  await prisma.$disconnect();
}

createUser().catch(console.error);
