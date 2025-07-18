import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password untuk semua user
  const hashedPassword = await bcrypt.hash('password123', 12);

  // ================================================
  // SEED USERS
  // ================================================
  console.log('👤 Seeding users...');

  const adminUser = await prisma.user.upsert({
    where: { nip: 'ADMIN001' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@obatku.local',
      nip: 'ADMIN001',
      phone: '081234567890',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      birthDate: new Date('1990-01-01'),
      avatarUrl: null,
    },
  });

  const pplUser = await prisma.user.upsert({
    where: { nip: 'PPL001' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'budi@obatku.local',
      nip: 'PPL001',
      phone: '081234567891',
      passwordHash: hashedPassword,
      role: 'PPL',
      status: 'ACTIVE',
      birthDate: new Date('1985-05-15'),
      avatarUrl: null,
      createdBy: adminUser.id,
    },
  });

  const dinasUser = await prisma.user.upsert({
    where: { nip: 'DINAS001' },
    update: {},
    create: {
      name: 'Siti Rahayu',
      email: 'siti@obatku.local',
      nip: 'DINAS001',
      phone: '081234567892',
      passwordHash: hashedPassword,
      role: 'DINAS',
      status: 'ACTIVE',
      birthDate: new Date('1987-08-20'),
      avatarUrl: null,
      createdBy: adminUser.id,
    },
  });

  const poptUser = await prisma.user.upsert({
    where: { nip: 'POPT001' },
    update: {},
    create: {
      name: 'Ahmad Wijaya',
      email: 'ahmad@obatku.local',
      nip: 'POPT001',
      phone: '081234567893',
      passwordHash: hashedPassword,
      role: 'POPT',
      status: 'ACTIVE',
      birthDate: new Date('1992-12-10'),
      avatarUrl: null,
      createdBy: adminUser.id,
    },
  });

  console.log('✅ Users seeded successfully');

  // ================================================
  // SEED MEDICINES
  // ================================================
  console.log('💊 Seeding medicines...');

  const medicine1 = await prisma.medicine.upsert({
    where: { qrCode: 'MED001' },
    update: {},
    create: {
      name: 'Insektisida Cypermethrin 25 EC',
      producer: 'PT. Pestisida Nusantara',
      activeIngredient: 'Cypermethrin 25 g/l',
      category: 'Insektisida',
      supplier: 'CV. Agro Sejahtera',
      unit: 'liter',
      packUnit: 'botol',
      quantityPerPack: 1,
      pricePerUnit: 45000,
      pestTypes: JSON.stringify(['ulat grayak', 'wereng coklat', 'thrips']),
      storageLocation: 'Gudang A - Rak 1',
      description: 'Insektisida kontak dan lambung untuk mengendalikan hama penghisap dan pengunyah',
      qrCode: 'MED001',
      status: 'ACTIVE',
      createdBy: adminUser.id,
    },
  });

  const medicine2 = await prisma.medicine.upsert({
    where: { qrCode: 'MED002' },
    update: {},
    create: {
      name: 'Fungisida Mankozeb 80 WP',
      producer: 'PT. Bayer Indonesia',
      activeIngredient: 'Mankozeb 800 g/kg',
      category: 'Fungisida',
      supplier: 'CV. Agro Sejahtera',
      unit: 'kg',
      packUnit: 'kemasan',
      quantityPerPack: 1,
      pricePerUnit: 35000,
      pestTypes: JSON.stringify(['blas', 'busuk batang', 'antraknosa']),
      storageLocation: 'Gudang A - Rak 2',
      description: 'Fungisida kontak untuk mengendalikan penyakit jamur pada tanaman',
      qrCode: 'MED002',
      status: 'ACTIVE',
      createdBy: adminUser.id,
    },
  });

  const medicine3 = await prisma.medicine.upsert({
    where: { qrCode: 'MED003' },
    update: {},
    create: {
      name: 'Herbisida Glifosat 486 SL',
      producer: 'PT. Syngenta Indonesia',
      activeIngredient: 'Glifosat 486 g/l',
      category: 'Herbisida',
      supplier: 'PT. Distributor Pertanian',
      unit: 'liter',
      packUnit: 'jerigen',
      quantityPerPack: 5,
      pricePerUnit: 65000,
      pestTypes: JSON.stringify(['gulma berdaun lebar', 'gulma berdaun sempit', 'alang-alang']),
      storageLocation: 'Gudang B - Rak 1',
      description: 'Herbisida sistemik non-selektif untuk mengendalikan gulma',
      qrCode: 'MED003',
      status: 'ACTIVE',
      createdBy: adminUser.id,
    },
  });

  console.log('✅ Medicines seeded successfully');

  // ================================================
  // SEED MEDICINE STOCKS
  // ================================================
  console.log('📦 Seeding medicine stocks...');

  await prisma.medicineStock.upsert({
    where: { id: 'stock-001' },
    update: {},
    create: {
      id: 'stock-001',
      medicineId: medicine1.id,
      batchNumber: 'CYPER2024001',
      currentStock: 100,
      initialStock: 100,
      minStock: 20,
      entryDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-15'),
      supplier: 'CV. Agro Sejahtera',
      notes: 'Stok awal tahun 2024',
    },
  });

  await prisma.medicineStock.upsert({
    where: { id: 'stock-002' },
    update: {},
    create: {
      id: 'stock-002',
      medicineId: medicine2.id,
      batchNumber: 'MANKO2024001',
      currentStock: 50,
      initialStock: 50,
      minStock: 10,
      entryDate: new Date('2024-01-20'),
      expiryDate: new Date('2025-01-20'),
      supplier: 'CV. Agro Sejahtera',
      notes: 'Stok awal tahun 2024',
    },
  });

  await prisma.medicineStock.upsert({
    where: { id: 'stock-003' },
    update: {},
    create: {
      id: 'stock-003',
      medicineId: medicine3.id,
      batchNumber: 'GLIFO2024001',
      currentStock: 25,
      initialStock: 30,
      minStock: 5,
      entryDate: new Date('2024-01-10'),
      expiryDate: new Date('2025-01-10'),
      supplier: 'PT. Distributor Pertanian',
      notes: 'Stok awal tahun 2024',
    },
  });

  console.log('✅ Medicine stocks seeded successfully');

  // ================================================
  // SEED SAMPLE SUBMISSION
  // ================================================
  console.log('📝 Seeding sample submission...');

  const submission1 = await prisma.submission.upsert({
    where: { submissionNumber: 'SUB2024001' },
    update: {},
    create: {
      submissionNumber: 'SUB2024001',
      district: 'Karawang',
      village: 'Cikampek',
      farmerGroup: 'Tani Makmur',
      groupLeader: 'Pak Joko',
      commodity: 'Padi',
      totalArea: 10.5,
      affectedArea: 3.2,
      pestTypes: JSON.stringify(['ulat grayak', 'wereng coklat']),
      letterNumber: 'SURAT/001/2024',
      letterDate: new Date('2024-01-25'),
      letterFileUrl: '/uploads/surat_001_2024.pdf',
      status: 'PENDING',
      priority: 'MEDIUM',
      submitterId: pplUser.id,
    },
  });

  // ================================================
  // SEED SUBMISSION ITEMS
  // ================================================
  console.log('📋 Seeding submission items...');

  await prisma.submissionItem.upsert({
    where: { id: 'subitem-001' },
    update: {},
    create: {
      id: 'subitem-001',
      submissionId: submission1.id,
      medicineId: medicine1.id,
      requestedQuantity: 5,
      approvedQuantity: 0,
      distributedQuantity: 0,
      unit: 'liter',
      notes: 'Untuk mengatasi ulat grayak pada padi',
    },
  });

  await prisma.submissionItem.upsert({
    where: { id: 'subitem-002' },
    update: {},
    create: {
      id: 'subitem-002',
      submissionId: submission1.id,
      medicineId: medicine2.id,
      requestedQuantity: 3,
      approvedQuantity: 0,
      distributedQuantity: 0,
      unit: 'kg',
      notes: 'Untuk pencegahan penyakit blas',
    },
  });

  console.log('✅ Submission items seeded successfully');

  // ================================================
  // SEED ACTIVITY LOG
  // ================================================
  console.log('📊 Seeding activity logs...');

  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      action: 'CREATE',
      resourceType: 'USER',
      resourceId: pplUser.id,
      details: JSON.stringify({
        message: 'Created new PPL user',
        userRole: 'PPL',
        userName: 'Budi Santoso',
      }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seeder Script',
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: pplUser.id,
      action: 'CREATE',
      resourceType: 'SUBMISSION',
      resourceId: submission1.id,
      details: JSON.stringify({
        message: 'Created new submission',
        submissionNumber: 'SUB2024001',
        district: 'Karawang',
        village: 'Cikampek',
      }),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  console.log('✅ Activity logs seeded successfully');

  // ================================================
  // SEED QR CODE MASTERS
  // ================================================
  console.log('🔢 Seeding QR code masters...');

  // Funding Source Codes
  const fundingSources = [
    { code: '1', name: 'APBN' },
    { code: '2', name: 'APBD Provinsi' },
    { code: '3', name: 'APBD Kabupaten' },
    { code: '4', name: 'CSR/Bantuan Swasta' },
  ];

  // Medicine Type Codes
  const medicineTypes = [
    { code: 'F', name: 'Fungisida' },
    { code: 'I', name: 'Insektisida' },
    { code: 'H', name: 'Herbisida' },
    { code: 'A', name: 'Agen Hayati Antagonis' },
    { code: 'B', name: 'Bakterisida' },
    { code: 'N', name: 'Nematisida' },
  ];

  // Active Ingredient Codes
  const activeIngredients = [
    { code: '111', name: 'Mankozeb' },
    { code: '112', name: 'Karbendazim' },
    { code: '113', name: 'Difenokonazol' },
    { code: '201', name: 'Klorprifos' },
    { code: '202', name: 'Deltametrin' },
    { code: '203', name: 'Imidakloprid' },
    { code: '301', name: 'Glifosat' },
    { code: '302', name: 'Parakuat' },
    { code: '303', name: 'Atrazin' },
  ];

  // Producer Codes
  const producers = [
    { code: 'A', name: 'Syngenta' },
    { code: 'B', name: 'Bayer' },
    { code: 'C', name: 'BASF' },
    { code: 'D', name: 'Dow AgroSciences' },
    { code: 'E', name: 'Nufarm' },
    { code: 'F', name: 'PT. Petrokimia Gresik' },
    { code: 'G', name: 'PT. Pupuk Kalimantan Timur' },
  ];

  // Package Type Codes
  const packageTypes = [
    { code: 'I', name: 'Item' },
    { code: 'B', name: 'Box' },
    { code: 'K', name: 'Karton' },
    { code: 'S', name: 'Sak' },
    { code: 'J', name: 'Jerigen' },
    { code: 'D', name: 'Dus' },
  ];

  // Create QR Code Masters (sample combinations)
  const qrCodeMasters = [
    // APBN - Fungisida - Mankozeb - Syngenta
    {
      fundingSourceCode: '1',
      fundingSourceName: 'APBN',
      medicineTypeCode: 'F',
      medicineTypeName: 'Fungisida',
      activeIngredientCode: '111',
      activeIngredientName: 'Mankozeb',
      producerCode: 'A',
      producerName: 'Syngenta',
      packageTypeCode: 'I', // I = Individual item
      packageTypeName: 'Item',
    },
    // APBN - Fungisida - Mankozeb - Syngenta - Box
    {
      fundingSourceCode: '1',
      fundingSourceName: 'APBN',
      medicineTypeCode: 'F',
      medicineTypeName: 'Fungisida',
      activeIngredientCode: '111',
      activeIngredientName: 'Mankozeb',
      producerCode: 'A',
      producerName: 'Syngenta',
      packageTypeCode: 'B',
      packageTypeName: 'Box',
    },
    // APBN - Insektisida - Klorprifos - Bayer
    {
      fundingSourceCode: '1',
      fundingSourceName: 'APBN',
      medicineTypeCode: 'I',
      medicineTypeName: 'Insektisida',
      activeIngredientCode: '201',
      activeIngredientName: 'Klorprifos',
      producerCode: 'B',
      producerName: 'Bayer',
      packageTypeCode: 'I',
      packageTypeName: 'Item',
    },
    // APBN - Herbisida - Glifosat - Syngenta
    {
      fundingSourceCode: '1',
      fundingSourceName: 'APBN',
      medicineTypeCode: 'H',
      medicineTypeName: 'Herbisida',
      activeIngredientCode: '301',
      activeIngredientName: 'Glifosat',
      producerCode: 'A',
      producerName: 'Syngenta',
      packageTypeCode: 'I',
      packageTypeName: 'Item',
    },
    // APBD Provinsi - Fungisida - Mankozeb - Syngenta
    {
      fundingSourceCode: '2',
      fundingSourceName: 'APBD Provinsi',
      medicineTypeCode: 'F',
      medicineTypeName: 'Fungisida',
      activeIngredientCode: '111',
      activeIngredientName: 'Mankozeb',
      producerCode: 'A',
      producerName: 'Syngenta',
      packageTypeCode: 'I',
      packageTypeName: 'Item',
    },
    // CSR - Insektisida - Imidakloprid - BASF
    {
      fundingSourceCode: '4',
      fundingSourceName: 'CSR/Bantuan Swasta',
      medicineTypeCode: 'I',
      medicineTypeName: 'Insektisida',
      activeIngredientCode: '203',
      activeIngredientName: 'Imidakloprid',
      producerCode: 'C',
      producerName: 'BASF',
      packageTypeCode: 'I',
      packageTypeName: 'Item',
    },
  ];

  for (const masterData of qrCodeMasters) {
    await prisma.qRCodeMaster.upsert({
      where: {
        unique_master_code: {
          fundingSourceCode: masterData.fundingSourceCode,
          medicineTypeCode: masterData.medicineTypeCode,
          activeIngredientCode: masterData.activeIngredientCode,
          producerCode: masterData.producerCode,
          packageTypeCode: masterData.packageTypeCode,
        },
      },
      update: {},
      create: {
        ...masterData,
        status: 'ACTIVE',
        createdBy: adminUser.id,
      },
    });
  }

  console.log('✅ QR code masters seeded successfully');

  // ================================================
  // SEED SAMPLE QR CODE SEQUENCES
  // ================================================
  console.log('🔢 Seeding sample QR code sequences...');

  const currentYear = new Date().getFullYear().toString().slice(-2); // 25 for 2025
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0'); // 01-12

  // Sample sequences for current year/month
  const sampleSequences = [
    {
      year: currentYear,
      month: currentMonth,
      fundingSourceCode: '1',
      medicineTypeCode: 'F',
      activeIngredientCode: '111',
      producerCode: 'A',
      packageTypeCode: 'I',
      currentSequence: '0001',
      sequenceType: 'NUMERIC' as const,
    },
    {
      year: currentYear,
      month: currentMonth,
      fundingSourceCode: '1',
      medicineTypeCode: 'I',
      activeIngredientCode: '201',
      producerCode: 'B',
      packageTypeCode: 'I',
      currentSequence: '0001',
      sequenceType: 'NUMERIC' as const,
    },
  ];

  for (const seqData of sampleSequences) {
    await prisma.qRCodeSequence.upsert({
      where: {
        unique_sequence: {
          year: seqData.year,
          month: seqData.month,
          fundingSourceCode: seqData.fundingSourceCode,
          medicineTypeCode: seqData.medicineTypeCode,
          activeIngredientCode: seqData.activeIngredientCode,
          producerCode: seqData.producerCode,
          packageTypeCode: seqData.packageTypeCode,
        },
      },
      update: {},
      create: seqData,
    });
  }

  console.log('✅ QR code sequences seeded successfully');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('✅ 4 Users created (Admin, PPL, Dinas, POPT)');
  console.log('✅ 3 Medicines created');
  console.log('✅ 3 Medicine stocks created');
  console.log('✅ 1 Sample submission created');
  console.log('✅ 2 Submission items created');
  console.log('✅ 2 Activity logs created');
  console.log('✅ 6 QR code masters created');
  console.log('✅ 2 QR code sequences created');
  console.log('\n🔑 Default login credentials:');
  console.log('Admin: admin@obatku.local / password123');
  console.log('PPL: budi@obatku.local / password123');
  console.log('Dinas: siti@obatku.local / password123');
  console.log('POPT: ahmad@obatku.local / password123');
  console.log('\nAll passwords: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
