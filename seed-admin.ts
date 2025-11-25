import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';

    // Hash password with bcrypt cost factor 10
    const passwordHash = await bcrypt.hash(password, 10);

    // Upsert admin user (delete existing, create new)
    await prisma.user.deleteMany({ where: { email } });
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    // Log success message with credentials
    console.log('✅ Admin user seeded successfully');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 User ID: ${user.id}`);

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedAdmin();