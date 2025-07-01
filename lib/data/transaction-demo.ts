// # START OF Transaction Demo Data - Sample data for transaction management
// Purpose: Provide comprehensive demo data for testing and development
// Contains: Various transaction types, statuses, and scenarios
// Dependencies: Transaction types

import { Transaction, TransactionStatus, Priority, ApprovalStatus, DistributionStatus } from "@/lib/types/transaction";

export const mockTransactionData: Transaction[] = [
  {
    id: 'TXN-001',
    letterNumber: 'SURAT/001/PPL-SRAGEN/2024',
    submissionDate: new Date('2024-01-15'),
    bppOfficer: {
      id: 'PPL-001',
      name: 'Budi Santoso',
      nip: '197803251999031001',
      position: 'Penyuluh Pertanian Ahli Madya'
    },
    farmerGroup: {
      id: 'POKTAN-001',
      name: 'Tani Makmur',
      leader: 'Slamet Riyadi',
      district: 'Sragen',
      subDistrict: 'Kalijambe',
      village: 'Beruk'
    },
    farmingDetails: {
      commodity: 'Padi',
      affectedArea: 5.5,
      totalArea: 10.0,
      pestType: ['Wereng Batang Coklat', 'Penggerek Batang'],
      pestDescription: 'Serangan wereng dan penggerek pada fase vegetatif, intensitas tinggi'
    },
    submission: {
      letter: {
        filename: 'surat_pengajuan_001.pdf',
        url: '/uploads/letters/surat_pengajuan_001.pdf',
        uploadDate: new Date('2024-01-15')
      },
      requestedDrugs: [
        {
          drugId: 'DRUG-001',
          drugName: 'Virtako 40 WG',
          requestedQuantity: 10,
          unit: 'kg',
          purpose: 'Pengendalian wereng batang coklat'
        },
        {
          drugId: 'DRUG-002',
          drugName: 'Lannate 40 SP',
          requestedQuantity: 5,
          unit: 'kg',
          purpose: 'Pengendalian penggerek batang'
        }
      ],
      notes: 'Mohon segera diproses karena serangan sudah memasuki fase kritis'
    },
    approval: {
      approvedBy: 'Dr. Ahmad Fauzi',
      approvedDate: new Date('2024-01-17'),
      approvedDrugs: [
        {
          drugId: 'DRUG-001',
          drugName: 'Virtako 40 WG',
          approvedQuantity: 8,
          unit: 'kg',
          condition: 'Sesuai dosis anjuran'
        },
        {
          drugId: 'DRUG-002',
          drugName: 'Lannate 40 SP',
          approvedQuantity: 5,
          unit: 'kg'
        }
      ],
      noteToSubmitter: 'Disetujui dengan penyesuaian jumlah Virtako sesuai ketersediaan stok',
      noteToWarehouse: 'Mohon diprioritaskan distribusi karena tingkat serangan tinggi',
      status: 'partially_approved'
    },
    distribution: {
      distributedBy: 'Warehouse Staff',
      distributedDate: new Date('2024-01-18'),
      actualDrugs: [
        {
          drugId: 'DRUG-001',
          drugName: 'Virtako 40 WG',
          distributedQuantity: 8,
          unit: 'kg',
          batchNumber: 'VTK-2023-11-001',
          expiryDate: new Date('2025-11-15')
        },
        {
          drugId: 'DRUG-002',
          drugName: 'Lannate 40 SP',
          distributedQuantity: 5,
          unit: 'kg',
          batchNumber: 'LAN-2023-12-002',
          expiryDate: new Date('2025-12-20')
        }
      ],
      receivedBy: 'Slamet Riyadi',
      notes: 'Obat diterima dalam kondisi baik',
      status: 'completed'
    },
    status: 'completed',
    priority: 'high',
    createdBy: 'Budi Santoso',
    updatedBy: 'System',
    createdAt: new Date('2024-01-15T08:30:00Z'),
    updatedAt: new Date('2024-01-18T14:20:00Z')
  },
  {
    id: 'TXN-002',
    letterNumber: 'SURAT/002/PPL-BOYOLALI/2024',
    submissionDate: new Date('2024-01-20'),
    bppOfficer: {
      id: 'PPL-002',
      name: 'Sri Wahyuni',
      nip: '198505141999032001',
      position: 'Penyuluh Pertanian Ahli Muda'
    },
    farmerGroup: {
      id: 'POKTAN-002',
      name: 'Subur Jaya',
      leader: 'Agus Purnomo',
      district: 'Boyolali',
      subDistrict: 'Mojosongo',
      village: 'Kraguman'
    },
    farmingDetails: {
      commodity: 'Jagung',
      affectedArea: 3.2,
      totalArea: 7.5,
      pestType: ['Ulat Grayak', 'Belalang Kembara'],
      pestDescription: 'Serangan ulat grayak pada daun jagung muda'
    },
    submission: {
      letter: {
        filename: 'surat_pengajuan_002.pdf',
        url: '/uploads/letters/surat_pengajuan_002.pdf',
        uploadDate: new Date('2024-01-20')
      },
      requestedDrugs: [
        {
          drugId: 'DRUG-003',
          drugName: 'Curacon 550 EC',
          requestedQuantity: 3,
          unit: 'liter',
          purpose: 'Pengendalian ulat grayak'
        }
      ]
    },
    status: 'under_review',
    priority: 'medium',
    createdBy: 'Sri Wahyuni',
    createdAt: new Date('2024-01-20T09:15:00Z'),
    updatedAt: new Date('2024-01-20T09:15:00Z')
  },
  {
    id: 'TXN-003',
    letterNumber: 'SURAT/003/PPL-KARANGANYAR/2024',
    submissionDate: new Date('2024-01-22'),
    bppOfficer: {
      id: 'PPL-003',
      name: 'Dwi Hartono',
      nip: '199002101999031002',
      position: 'Penyuluh Pertanian Ahli Pertama'
    },
    farmerGroup: {
      id: 'POKTAN-003',
      name: 'Maju Bersama',
      leader: 'Bambang Sutrisno',
      district: 'Karanganyar',
      subDistrict: 'Tasikmadu',
      village: 'Blumbang'
    },
    farmingDetails: {
      commodity: 'Cabai',
      affectedArea: 1.8,
      totalArea: 2.5,
      pestType: ['Thrips', 'Kutu Daun'],
      pestDescription: 'Serangan thrips dan kutu daun pada tanaman cabai'
    },
    submission: {
      letter: {
        filename: 'surat_pengajuan_003.pdf',
        url: '/uploads/letters/surat_pengajuan_003.pdf',
        uploadDate: new Date('2024-01-22')
      },
      requestedDrugs: [
        {
          drugId: 'DRUG-004',
          drugName: 'Pegasus 500 SC',
          requestedQuantity: 2,
          unit: 'liter',
          purpose: 'Pengendalian thrips dan kutu daun'
        }
      ]
    },
    approval: {
      approvedBy: 'Dr. Ahmad Fauzi',
      approvedDate: new Date('2024-01-23'),
      approvedDrugs: [
        {
          drugId: 'DRUG-004',
          drugName: 'Pegasus 500 SC',
          approvedQuantity: 2,
          unit: 'liter'
        }
      ],
      noteToSubmitter: 'Disetujui sesuai pengajuan',
      noteToWarehouse: 'Distribusi normal',
      status: 'approved'
    },
    status: 'ready_distribution',
    priority: 'medium',
    createdBy: 'Dwi Hartono',
    updatedBy: 'Dr. Ahmad Fauzi',
    createdAt: new Date('2024-01-22T10:45:00Z'),
    updatedAt: new Date('2024-01-23T16:30:00Z')
  },
  {
    id: 'TXN-004',
    letterNumber: 'SURAT/004/PPL-SUKOHARJO/2024',
    submissionDate: new Date('2024-01-24'),
    bppOfficer: {
      id: 'PPL-004',
      name: 'Retno Wulandari',
      nip: '199506201999032003',
      position: 'Penyuluh Pertanian Ahli Pertama'
    },
    farmerGroup: {
      id: 'POKTAN-004',
      name: 'Harapan Baru',
      leader: 'Sugeng Rianto',
      district: 'Sukoharjo',
      subDistrict: 'Grogol',
      village: 'Makamhaji'
    },
    farmingDetails: {
      commodity: 'Kedelai',
      affectedArea: 4.0,
      totalArea: 6.0,
      pestType: ['Ulat Penggulung Daun'],
      pestDescription: 'Serangan ulat penggulung daun pada kedelai fase pembungaan'
    },
    submission: {
      letter: {
        filename: 'surat_pengajuan_004.pdf',
        url: '/uploads/letters/surat_pengajuan_004.pdf',
        uploadDate: new Date('2024-01-24')
      },
      requestedDrugs: [
        {
          drugId: 'DRUG-005',
          drugName: 'Demolish 18 EC',
          requestedQuantity: 4,
          unit: 'liter',
          purpose: 'Pengendalian ulat penggulung daun'
        }
      ]
    },
    status: 'submitted',
    priority: 'low',
    createdBy: 'Retno Wulandari',
    createdAt: new Date('2024-01-24T11:20:00Z'),
    updatedAt: new Date('2024-01-24T11:20:00Z')
  },
  {
    id: 'TXN-005',
    letterNumber: 'SURAT/005/PPL-KLATEN/2024',
    submissionDate: new Date('2024-01-25'),
    bppOfficer: {
      id: 'PPL-005',
      name: 'Muhammad Iqbal',
      nip: '199208151999031003',
      position: 'Penyuluh Pertanian Ahli Muda'
    },
    farmerGroup: {
      id: 'POKTAN-005',
      name: 'Sejahtera Makmur',
      leader: 'Hadi Pramono',
      district: 'Klaten',
      subDistrict: 'Delanggu',
      village: 'Segaran'
    },
    farmingDetails: {
      commodity: 'Padi',
      affectedArea: 8.5,
      totalArea: 12.0,
      pestType: ['Blast', 'Hawar Daun Bakteri'],
      pestDescription: 'Penyakit blast dan hawar daun bakteri menyerang luas'
    },
    submission: {
      letter: {
        filename: 'surat_pengajuan_005.pdf',
        url: '/uploads/letters/surat_pengajuan_005.pdf',
        uploadDate: new Date('2024-01-25')
      },
      requestedDrugs: [
        {
          drugId: 'DRUG-006',
          drugName: 'Score 250 EC',
          requestedQuantity: 6,
          unit: 'liter',
          purpose: 'Pengendalian blast'
        },
        {
          drugId: 'DRUG-007',
          drugName: 'Kasumin 3/20 WP',
          requestedQuantity: 8,
          unit: 'kg',
          purpose: 'Pengendalian hawar daun bakteri'
        }
      ],
      notes: 'Serangan sudah meluas, mohon diprioritaskan'
    },
    approval: {
      approvedBy: 'Dr. Ahmad Fauzi',
      approvedDate: new Date('2024-01-26'),
      approvedDrugs: [],
      noteToSubmitter: 'Pengajuan ditolak karena stok obat habis dan musim tanam sudah terlambat',
      status: 'rejected'
    },
    status: 'rejected',
    priority: 'urgent',
    createdBy: 'Muhammad Iqbal',
    updatedBy: 'Dr. Ahmad Fauzi',
    createdAt: new Date('2024-01-25T14:10:00Z'),
    updatedAt: new Date('2024-01-26T09:45:00Z')
  }
];

// Helper functions for demo data
export const getTransactionsByStatus = (status: TransactionStatus): Transaction[] => {
  return mockTransactionData.filter(transaction => transaction.status === status);
};

export const getTransactionsByRole = (role: string, userId?: string): Transaction[] => {
  switch (role) {
    case 'ppl':
      return mockTransactionData.filter(transaction => 
        transaction.bppOfficer.id === userId || transaction.createdBy === userId
      );
    case 'dinas':
    case 'popt':
    case 'staff':
    case 'admin':
    default:
      return mockTransactionData;
  }
};

export const getTransactionsByPriority = (priority: Priority): Transaction[] => {
  return mockTransactionData.filter(transaction => transaction.priority === priority);
};

export const getTransactionsByDistrict = (district: string): Transaction[] => {
  return mockTransactionData.filter(transaction => 
    transaction.farmerGroup.district.toLowerCase().includes(district.toLowerCase())
  );
};

export const getPendingApprovals = (): Transaction[] => {
  return mockTransactionData.filter(transaction => 
    ['submitted', 'under_review'].includes(transaction.status)
  );
};

export const getPendingDistributions = (): Transaction[] => {
  return mockTransactionData.filter(transaction => 
    ['approved', 'ready_distribution'].includes(transaction.status)
  );
};

export const getTransactionStats = () => {
  return {
    total: mockTransactionData.length,
    pendingApprovals: getPendingApprovals().length,
    pendingDistributions: getPendingDistributions().length,
    completed: mockTransactionData.filter(t => t.status === 'completed').length,
  };
};

export const getTransactionById = (id: string): Transaction | undefined => {
  console.log(`Searching for transaction with ID: ${id}`);
  const transaction = mockTransactionData.find(t => t.id === id);
  console.log('Found transaction:', transaction);
  return transaction;
};

// # END OF Transaction Demo Data 