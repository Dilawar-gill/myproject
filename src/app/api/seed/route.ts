import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    
    // Delete ALL users first
    await prisma.user.deleteMany({});
    
    // Hash password with bcrypt cost factor 8 (faster)
    const passwordHash = await bcrypt.hash(password, 8);
    
    // Verify hash works immediately
    const testVerify = await bcrypt.compare(password, passwordHash);
    if (!testVerify) {
      throw new Error('Hash verification failed immediately after creation');
    }
    
    // Create admin user
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        name: 'Admin User', 
        role: 'ADMIN' 
      },
    });
    
    console.log('✅ Admin user created successfully');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('✓ Hash verified:', testVerify);

    // Seed default HVAC services
    const services = [
      { nameEn: 'Air duct cleaning', nameFr: 'Nettoyage de conduits d\'air', defaultPrice: 199, category: 'CORE' },
      { nameEn: 'Dryer vent cleaning', nameFr: 'Nettoyage de conduit de sécheuse', defaultPrice: 69, category: 'CORE' },
      { nameEn: 'Dryer vent cleaning (2nd floor)', nameFr: 'Nettoyage de conduit de sécheuse (2e étage)', defaultPrice: 199, category: 'CORE' },
      { nameEn: 'Furnace blower & A/C cleaning', nameFr: 'Nettoyage du ventilateur de fournaise et du climatiseur', defaultPrice: 220, category: 'CORE' },
      { nameEn: 'Air exchanger (HRV/ERV) cleaning', nameFr: 'Nettoyage d\'échangeur d\'air (VRC/VRE)', defaultPrice: 249, category: 'CORE' },
      { nameEn: 'Heat pump (split unit) cleaning', nameFr: 'Nettoyage de thermopompe (unité murale)', defaultPrice: 189, category: 'CORE' },
      { nameEn: 'Power cleaning with reverse sweeper', nameFr: 'Nettoyage en profondeur avec balayeuse inversée', defaultPrice: 299, category: 'ADDITIONAL' },
      { nameEn: 'Air filter replacement (any size)', nameFr: 'Remplacement de filtre à air (toute taille)', defaultPrice: 75, category: 'ADDITIONAL' },
    ];

    for (const service of services) {
      const existing = await prisma.service.findFirst({ where: { nameEn: service.nameEn } });
      if (!existing) {
        await prisma.service.create({ data: service as any });
      }
    }

    return { 
      message: 'Database seeded successfully',
      credentials: { email, password },
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    };
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
  }
}
