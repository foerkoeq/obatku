import { BeritaAcaraData } from '@/lib/types/berita-acara';

// Utility functions for Berita Acara operations

/**
 * Format tanggal menjadi text yang sesuai dengan format Indonesia
 */
export const formatTanggalIndonesia = (date: Date): { 
  namaHari: string; 
  tanggal: string; 
  bulan: string; 
  tahun: string; 
} => {
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const angkaKeTeks = (num: number): string => {
    const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
    const belasan = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
    const puluhan = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Delapan Puluh', 'Sembilan Puluh'];

    if (num < 10) return satuan[num];
    if (num < 20) return belasan[num - 10];
    if (num < 100) {
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      return puluhan[tens] + (ones > 0 ? ' ' + satuan[ones] : '');
    }
    return num.toString(); // fallback untuk angka >= 100
  };

  return {
    namaHari: hari[date.getDay()],
    tanggal: angkaKeTeks(date.getDate()),
    bulan: bulan[date.getMonth()],
    tahun: 'Dua Ribu Dua Puluh Lima' // Bisa dibuat dinamis jika perlu
  };
};

/**
 * Generate nomor surat otomatis
 */
export const generateNomorSurat = (urutan: number, tahun: number = new Date().getFullYear()): string => {
  const nomorUrut = urutan.toString().padStart(3, '0');
  return `${nomorUrut}/BA-ST/414.106.3/${tahun}`;
};

/**
 * Validasi data berita acara
 */
export const validateBeritaAcaraData = (data: BeritaAcaraData): { 
  isValid: boolean; 
  errors: string[]; 
} => {
  const errors: string[] = [];

  // Validasi kop surat
  if (!data.kopSurat.namaInstansi?.trim()) {
    errors.push('Nama instansi harus diisi');
  }
  if (!data.kopSurat.namaDinas?.trim()) {
    errors.push('Nama dinas harus diisi');
  }
  if (!data.kopSurat.alamat?.trim()) {
    errors.push('Alamat harus diisi');
  }
  if (!data.kopSurat.email?.trim()) {
    errors.push('Email harus diisi');
  }

  // Validasi nomor surat
  if (!data.nomorSurat?.trim()) {
    errors.push('Nomor surat harus diisi');
  }

  // Validasi tanggal
  if (!data.namaHari?.trim()) {
    errors.push('Nama hari harus diisi');
  }
  if (!data.tanggal?.trim()) {
    errors.push('Tanggal harus diisi');
  }
  if (!data.bulan?.trim()) {
    errors.push('Bulan harus diisi');
  }

  // Validasi pihak pertama
  if (!data.pihakPertama.nama?.trim()) {
    errors.push('Nama pihak pertama harus diisi');
  }
  if (!data.pihakPertama.nip?.trim()) {
    errors.push('NIP pihak pertama harus diisi');
  }
  if (!data.pihakPertama.jabatan?.trim()) {
    errors.push('Jabatan pihak pertama harus diisi');
  }

  // Validasi pihak kedua
  if (!data.pihakKedua.nama?.trim()) {
    errors.push('Nama pihak kedua harus diisi');
  }
  if (!data.pihakKedua.nip?.trim()) {
    errors.push('NIP pihak kedua harus diisi');
  }
  if (!data.pihakKedua.namaKecamatan?.trim()) {
    errors.push('Nama kecamatan harus diisi');
  }

  // Validasi kategori obat
  if (!data.kategoriObat?.trim()) {
    errors.push('Kategori obat harus diisi');
  }

  // Validasi daftar barang
  if (!data.daftarBarang || data.daftarBarang.length === 0) {
    errors.push('Minimal harus ada 1 barang');
  } else {
    data.daftarBarang.forEach((barang, index) => {
      if (!barang.kategoriObat?.trim()) {
        errors.push(`Kategori obat barang #${index + 1} harus diisi`);
      }
      if (!barang.opt?.trim()) {
        errors.push(`OPT barang #${index + 1} harus diisi`);
      }
      if (!barang.merekDagang?.trim()) {
        errors.push(`Merek dagang barang #${index + 1} harus diisi`);
      }
      if (!barang.jumlah?.trim()) {
        errors.push(`Jumlah barang #${index + 1} harus diisi`);
      }
    });
  }

  // Validasi surat permintaan
  if (!data.suratPermintaan.nomor?.trim()) {
    errors.push('Nomor surat permintaan harus diisi');
  }
  if (!data.suratPermintaan.tanggal?.trim()) {
    errors.push('Tanggal surat permintaan harus diisi');
  }

  // Validasi kelompok tani
  if (!data.kelompokTani.nama?.trim()) {
    errors.push('Nama kelompok tani harus diisi');
  }
  if (!data.kelompokTani.namaKetua?.trim()) {
    errors.push('Nama ketua kelompok tani harus diisi');
  }
  if (!data.kelompokTani.lokasiLahan?.trim()) {
    errors.push('Lokasi lahan harus diisi');
  }
  if (!data.kelompokTani.luasLahanTerserang?.trim()) {
    errors.push('Luas lahan terserang harus diisi');
  }
  if (!data.kelompokTani.jenisKomoditas?.trim()) {
    errors.push('Jenis komoditas harus diisi');
  }
  if (!data.kelompokTani.jenisOPT?.trim()) {
    errors.push('Jenis OPT harus diisi');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Print berita acara dengan styling yang optimal
 */
export const printBeritaAcara = () => {
  const printStyle = `
    <style>
      @media print {
        @page {
          size: A4;
          margin: 0.5in;
        }
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: black;
          background: white;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        .print-break {
          page-break-after: always;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid black;
          padding: 6px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5 !important;
          font-weight: bold;
        }
      }
    </style>
  `;

  // Inject print styles
  const existingStyle = document.querySelector('#print-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'print-styles';
  styleElement.innerHTML = printStyle;
  document.head.appendChild(styleElement);

  // Trigger print
  window.print();

  // Clean up styles after print
  setTimeout(() => {
    styleElement.remove();
  }, 1000);
};

/**
 * Export berita acara as JSON
 */
export const exportAsJSON = (data: BeritaAcaraData, filename?: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `berita-acara-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Import berita acara from JSON
 */
export const importFromJSON = (file: File): Promise<BeritaAcaraData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as BeritaAcaraData;
        resolve(data);
      } catch (error) {
        reject(new Error('File JSON tidak valid'));
      }
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
};

/**
 * Generate default template data
 */
export const generateDefaultTemplate = (): BeritaAcaraData => {
  const today = new Date();
  const dateInfo = formatTanggalIndonesia(today);

  return {
    kopSurat: {
      namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
      namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
      alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
      telepon: '(0356) 322086',
      laman: 'www.tubankab.go.id',
      email: 'pertanian@tubankab.go.id',
    },
    nomorSurat: generateNomorSurat(1),
    namaHari: dateInfo.namaHari,
    tanggal: dateInfo.tanggal,
    bulan: dateInfo.bulan,
    tahun: dateInfo.tahun,
    pihakPertama: {
      nama: '',
      nip: '',
      jabatan: 'Kepala Bidang Sarana dan Prasarana Pertanian',
      instansi: 'Dinas Pertanian dan Ketahanan Pangan Kabupaten Tuban',
    },
    pihakKedua: {
      nama: '',
      jabatan: 'Koordinator Penyuluh',
      instansi: 'BPP Kecamatan',
      namaKecamatan: '',
      nip: '',
    },
    kategoriObat: 'pestisida',
    daftarBarang: [
      {
        nomor: 1,
        kategoriObat: '',
        opt: '',
        merekDagang: '',
        jumlah: '',
        keterangan: '',
      },
    ],
    suratPermintaan: {
      nomor: '',
      tanggal: '',
    },
    kelompokTani: {
      nama: '',
      namaKetua: '',
      lokasiLahan: '',
      luasLahanTerserang: '',
      jenisKomoditas: '',
      jenisOPT: '',
    },
  };
};

/**
 * Clean and format text for proper display
 */
export const cleanText = (text: string): string => {
  return text?.trim().replace(/\s+/g, ' ') || '';
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format number for display
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('id-ID').format(num);
};
