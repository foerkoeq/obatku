import { PrismaClient, UserRole } from '@prisma/client';
import { TUBAN_DATA } from '../../lib/data/tuban-data';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding process started...');

  // 1. Get or create a default user for 'createdBy' relations
  let adminUser = await prisma.user.findUnique({
    where: { nip: 'admin' },
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    adminUser = await prisma.user.create({
      data: {
        nip: 'admin',
        name: 'Super Admin',
        email: 'admin@obatku.com',
        phone: '081234567890',
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
        birthDate: new Date('1990-01-01'),
        status: 'ACTIVE',
      },
    });
    console.log('Default admin user created.');
  } else {
    console.log('Admin user already exists.');
  }

  const creatorId = adminUser.id;

  // 2. Clear existing master data
  // The order is important due to foreign key constraints
  console.log('Deleting existing master data...');
  await prisma.farmerGroup.deleteMany({});
  await prisma.village.deleteMany({});
  await prisma.district.deleteMany({});
  console.log('Existing master data deleted.');

  // 3. Seed Districts
  console.log('Seeding districts...');
  const districtCreations = TUBAN_DATA.map(district => 
    prisma.district.create({
      data: {
        name: district.name,
        province: 'Jawa Timur',
        createdBy: creatorId,
      },
    })
  );
  await Promise.all(districtCreations);
  console.log(`${TUBAN_DATA.length} districts seeded.`);

  // 4. Seed Villages
  console.log('Seeding villages...');
  const allVillages = TUBAN_DATA.flatMap(district => 
    district.villages.map(village => ({
      name: village.name,
      district: district.name,
      createdBy: creatorId,
    }))
  );
  
  // Prisma doesn't support `createMany` for MySQL with relations, so we do it one by one
  // However, for this model the relation is not direct, so we can try batching
  await prisma.village.createMany({
    data: allVillages,
    skipDuplicates: true, // In case a village name is repeated in another district
  });
  console.log(`${allVillages.length} villages seeded.`);

  // 5. Seed Farmer Groups
  console.log('Seeding dummy farmer groups...');
  let farmerGroupCount = 0;
  for (const district of TUBAN_DATA) {
    for (const village of district.villages) {
      const groupName = `Tani Maju ${village.name}`;
      await prisma.farmerGroup.create({
        data: {
          name: groupName,
          leader: `Bapak ${village.name}`,
          district: district.name,
          village: village.name,
          memberCount: Math.floor(Math.random() * 50) + 10, // 10-60 members
          establishedDate: new Date('2020-01-01'),
          contactInfo: {
            phone: `08${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          },
          createdBy: creatorId,
        },
      });
      farmerGroupCount++;
    }
  }
  console.log(`${farmerGroupCount} dummy farmer groups seeded.`);

  console.log('Seeding process finished successfully!');
}

main()
  .catch(e => {
    console.error('An error occurred during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });