// # START OF Master Data Seed - Seed data for master data tables
// Purpose: Populate database with initial master data
// Dependencies: Prisma client
// Returns: Seed data for farmer groups, commodities, pest types, districts, villages

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMasterData() {
  console.log('🌱 Seeding master data...');

  // ================================================
  // SEED DISTRICTS
  // ================================================
  console.log('📍 Seeding districts...');
  
  const districts = [
    { name: 'Kecamatan Example', code: 'KEC001', province: 'Jawa Tengah' },
    { name: 'Kecamatan Sample', code: 'KEC002', province: 'Jawa Tengah' },
    { name: 'Kecamatan Demo', code: 'KEC003', province: 'Jawa Tengah' }
  ];

  for (const district of districts) {
    await prisma.district.upsert({
      where: { name: district.name },
      update: {},
      create: {
        ...district,
        createdBy: 'system'
      }
    });
  }

  // ================================================
  // SEED VILLAGES
  // ================================================
  console.log('🏘️ Seeding villages...');
  
  const villages = [
    { name: 'Desa Makmur', district: 'Kecamatan Example' },
    { name: 'Desa Sejahtera', district: 'Kecamatan Example' },
    { name: 'Desa Tani', district: 'Kecamatan Example' },
    { name: 'Desa Subur', district: 'Kecamatan Sample' },
    { name: 'Desa Hijau', district: 'Kecamatan Sample' },
    { name: 'Desa Lestari', district: 'Kecamatan Demo' }
  ];

  for (const village of villages) {
    await prisma.village.upsert({
      where: { 
        name_district: {
          name: village.name,
          district: village.district
        }
      },
      update: {},
      create: {
        ...village,
        createdBy: 'system'
      }
    });
  }

  // ================================================
  // SEED COMMODITIES
  // ================================================
  console.log('🌾 Seeding commodities...');
  
  const commodities = [
    {
      name: 'Padi',
      category: 'Pangan',
      description: 'Tanaman padi untuk konsumsi',
      commonPestTypes: ['Wereng Coklat', 'Penggerek Batang', 'Tikus Sawah']
    },
    {
      name: 'Jagung',
      category: 'Pangan',
      description: 'Tanaman jagung untuk konsumsi dan pakan',
      commonPestTypes: ['Penggerek Tongkol', 'Ulat Grayak', 'Tikus']
    },
    {
      name: 'Kedelai',
      category: 'Pangan',
      description: 'Tanaman kedelai untuk konsumsi',
      commonPestTypes: ['Ulat Grayak', 'Kutu Daun', 'Busuk Akar']
    },
    {
      name: 'Cabai',
      category: 'Hortikultura',
      description: 'Tanaman cabai untuk konsumsi',
      commonPestTypes: ['Thrips', 'Kutu Daun', 'Antraknosa']
    },
    {
      name: 'Tomat',
      category: 'Hortikultura',
      description: 'Tanaman tomat untuk konsumsi',
      commonPestTypes: ['Kutu Daun', 'Busuk Daun', 'Lalat Buah']
    },
    {
      name: 'Tebu',
      category: 'Perkebunan',
      description: 'Tanaman tebu untuk gula',
      commonPestTypes: ['Penggerek Batang', 'Ulat Grayak', 'Tikus']
    }
  ];

  for (const commodity of commodities) {
    await prisma.commodity.upsert({
      where: { name: commodity.name },
      update: {},
      create: {
        ...commodity,
        createdBy: 'system'
      }
    });
  }

  // ================================================
  // SEED PEST TYPES
  // ================================================
  console.log('🐛 Seeding pest types...');
  
  const pestTypes = [
    {
      name: 'Wereng Coklat',
      category: 'Hama',
      description: 'Hama utama tanaman padi yang menghisap cairan tanaman',
      affectedCommodities: ['Padi'],
      severity: 'HIGH'
    },
    {
      name: 'Penggerek Batang',
      category: 'Hama',
      description: 'Hama yang menggerek batang tanaman',
      affectedCommodities: ['Padi', 'Jagung', 'Tebu'],
      severity: 'HIGH'
    },
    {
      name: 'Tikus Sawah',
      category: 'Hama',
      description: 'Hama tikus yang merusak tanaman di sawah',
      affectedCommodities: ['Padi', 'Jagung'],
      severity: 'MEDIUM'
    },
    {
      name: 'Ulat Grayak',
      category: 'Hama',
      description: 'Hama ulat yang memakan daun tanaman',
      affectedCommodities: ['Jagung', 'Kedelai', 'Tebu'],
      severity: 'HIGH'
    },
    {
      name: 'Kutu Daun',
      category: 'Hama',
      description: 'Hama kutu yang menghisap cairan daun',
      affectedCommodities: ['Kedelai', 'Cabai', 'Tomat'],
      severity: 'MEDIUM'
    },
    {
      name: 'Thrips',
      category: 'Hama',
      description: 'Hama thrips yang merusak bunga dan buah',
      affectedCommodities: ['Cabai'],
      severity: 'MEDIUM'
    },
    {
      name: 'Antraknosa',
      category: 'Penyakit',
      description: 'Penyakit jamur yang menyebabkan busuk pada buah',
      affectedCommodities: ['Cabai'],
      severity: 'HIGH'
    },
    {
      name: 'Busuk Daun',
      category: 'Penyakit',
      description: 'Penyakit yang menyebabkan busuk pada daun',
      affectedCommodities: ['Tomat'],
      severity: 'MEDIUM'
    },
    {
      name: 'Lalat Buah',
      category: 'Hama',
      description: 'Hama lalat yang merusak buah',
      affectedCommodities: ['Tomat'],
      severity: 'MEDIUM'
    },
    {
      name: 'Busuk Akar',
      category: 'Penyakit',
      description: 'Penyakit yang menyebabkan busuk pada akar',
      affectedCommodities: ['Kedelai'],
      severity: 'HIGH'
    }
  ];

  for (const pestType of pestTypes) {
    await prisma.pestType.upsert({
      where: { name: pestType.name },
      update: {},
      create: {
        ...pestType,
        createdBy: 'system'
      }
    });
  }

  // ================================================
  // SEED FARMER GROUPS
  // ================================================
  console.log('👥 Seeding farmer groups...');
  
  const farmerGroups = [
    {
      name: 'Kelompok Tani Makmur',
      leader: 'Budi Santoso',
      district: 'Kecamatan Example',
      village: 'Desa Makmur',
      memberCount: 25,
      establishedDate: new Date('2020-01-15'),
      contactInfo: {
        phone: '081234567890',
        email: 'makmur@example.com'
      }
    },
    {
      name: 'Gapoktan Sejahtera',
      leader: 'Siti Aminah',
      district: 'Kecamatan Example',
      village: 'Desa Sejahtera',
      memberCount: 30,
      establishedDate: new Date('2019-03-20'),
      contactInfo: {
        phone: '081234567891',
        email: 'sejahtera@example.com'
      }
    },
    {
      name: 'Kelompok Tani Subur',
      leader: 'Ahmad Wijaya',
      district: 'Kecamatan Sample',
      village: 'Desa Subur',
      memberCount: 20,
      establishedDate: new Date('2021-06-10'),
      contactInfo: {
        phone: '081234567892'
      }
    },
    {
      name: 'Gapoktan Hijau',
      leader: 'Maria Sari',
      district: 'Kecamatan Sample',
      village: 'Desa Hijau',
      memberCount: 35,
      establishedDate: new Date('2018-09-05'),
      contactInfo: {
        phone: '081234567893',
        email: 'hijau@example.com'
      }
    },
    {
      name: 'Kelompok Tani Lestari',
      leader: 'Joko Susilo',
      district: 'Kecamatan Demo',
      village: 'Desa Lestari',
      memberCount: 28,
      establishedDate: new Date('2020-11-12'),
      contactInfo: {
        phone: '081234567894'
      }
    }
  ];

  for (const farmerGroup of farmerGroups) {
    await prisma.farmerGroup.upsert({
      where: { name: farmerGroup.name },
      update: {},
      create: {
        ...farmerGroup,
        createdBy: 'system'
      }
    });
  }

  console.log('✅ Master data seeding completed!');
}

// Run seeding if called directly
if (require.main === module) {
  seedMasterData()
    .catch((e) => {
      console.error('❌ Error seeding master data:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedMasterData };

// # END OF Master Data Seed
