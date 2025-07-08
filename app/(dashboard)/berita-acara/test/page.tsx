'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BeritaAcaraTemplate } from '@/components/berita-acara/berita-acara-template';
import { BeritaAcaraData } from '@/lib/types/berita-acara';
import { FileText, Download, Printer, RefreshCw, Zap } from 'lucide-react';

// Test data variations
const testDataVariations: { [key: string]: BeritaAcaraData } = {
  'sample1': {
    kopSurat: {
      namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
      namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
      alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
      telepon: '(0356) 322086',
      laman: 'www.tubankab.go.id',
      email: 'pertanian@tubankab.go.id',
    },
    nomorSurat: '001/BA-ST/414.106.3/2025',
    namaHari: 'Senin',
    tanggal: 'Delapan',
    bulan: 'Juli',
    tahun: 'Dua Ribu Dua Puluh Lima',
    pihakPertama: {
      nama: 'Dr. Ahmad Santoso, S.P., M.P.',
      nip: '197501012005011001',
      jabatan: 'Kepala Bidang Sarana dan Prasarana Pertanian',
      instansi: 'Dinas Pertanian dan Ketahanan Pangan Kabupaten Tuban',
    },
    pihakKedua: {
      nama: 'Ir. Siti Aminah, S.P.',
      jabatan: 'Koordinator Penyuluh',
      instansi: 'BPP Kecamatan Tuban',
      namaKecamatan: 'Tuban',
      nip: '198203152010012002',
    },
    kategoriObat: 'pestisida',
    daftarBarang: [
      {
        nomor: 1,
        kategoriObat: 'Insektisida',
        opt: 'Wereng Batang Coklat',
        merekDagang: 'Buprofezin 25% EC',
        jumlah: '50 botol @ 250 ml',
        keterangan: 'Kondisi baik',
      },
      {
        nomor: 2,
        kategoriObat: 'Fungisida',
        opt: 'Blast Padi',
        merekDagang: 'Azoxystrobin 25% SC',
        jumlah: '30 botol @ 100 ml',
        keterangan: 'Kondisi baik',
      },
    ],
    suratPermintaan: {
      nomor: '005/BPP-TBN/VII/2025',
      tanggal: '5 Juli 2025',
    },
    kelompokTani: {
      nama: 'Tani Makmur',
      namaKetua: 'Bapak Sutrisno',
      lokasiLahan: 'Desa Sidorejo, Kecamatan Tuban (-6.8974, 112.0648)',
      luasLahanTerserang: '5,2 Ha',
      jenisKomoditas: 'Padi',
      jenisOPT: 'Wereng Batang Coklat dan Blast Padi',
    },
  },
  'sample2': {
    kopSurat: {
      namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
      namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
      alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
      telepon: '(0356) 322086',
      laman: 'www.tubankab.go.id',
      email: 'pertanian@tubankab.go.id',
    },
    nomorSurat: '002/BA-ST/414.106.3/2025',
    namaHari: 'Rabu',
    tanggal: 'Sepuluh',
    bulan: 'Juli',
    tahun: 'Dua Ribu Dua Puluh Lima',
    pihakPertama: {
      nama: 'Ir. Bambang Wijaya, M.Si.',
      nip: '196812051995031002',
      jabatan: 'Kepala Bidang Tanaman Pangan dan Hortikultura',
      instansi: 'Dinas Pertanian dan Ketahanan Pangan Kabupaten Tuban',
    },
    pihakKedua: {
      nama: 'Dr. Endah Sari, S.P., M.P.',
      jabatan: 'Koordinator Penyuluh',
      instansi: 'BPP Kecamatan Bangilan',
      namaKecamatan: 'Bangilan',
      nip: '198505102010012003',
    },
    kategoriObat: 'agen hayati',
    daftarBarang: [
      {
        nomor: 1,
        kategoriObat: 'Agen Hayati',
        opt: 'Ulat Grayak',
        merekDagang: 'Beauveria bassiana',
        jumlah: '25 kg',
        keterangan: 'Kondisi baik, disimpan di tempat sejuk',
      },
      {
        nomor: 2,
        kategoriObat: 'Agen Hayati',
        opt: 'Penggerek Batang',
        merekDagang: 'Trichoderma sp.',
        jumlah: '15 kg',
        keterangan: 'Kondisi baik',
      },
      {
        nomor: 3,
        kategoriObat: 'POC (Pupuk Organik Cair)',
        opt: 'Nutrisi Tanaman',
        merekDagang: 'Bio Organik Plus',
        jumlah: '100 botol @ 500 ml',
        keterangan: 'Kondisi baik, expired 2026',
      },
    ],
    suratPermintaan: {
      nomor: '007/BPP-BGL/VII/2025',
      tanggal: '8 Juli 2025',
    },
    kelompokTani: {
      nama: 'Harapan Jaya',
      namaKetua: 'Bapak Suparman',
      lokasiLahan: 'Desa Prunggahan, Kecamatan Bangilan (koordinat: -6.9123, 112.1456)',
      luasLahanTerserang: '8,5 Ha',
      jenisKomoditas: 'Jagung',
      jenisOPT: 'Ulat Grayak dan Penggerek Batang',
    },
    customNarrative: {
      pembukaan: 'Pada hari ini, Rabu, tanggal Sepuluh bulan Juli tahun Dua Ribu Dua Puluh Lima, di Kabupaten Tuban, kami yang bertanda tangan di bawah ini telah melaksanakan serah terima bantuan agen hayati:',
      penutup: 'Dengan selesainya serah terima ini, PIHAK KEDUA berkomitmen untuk mendistribusikan bantuan agen hayati ini secara tepat sasaran kepada kelompok tani yang membutuhkan. Bantuan ini diharapkan dapat membantu petani dalam mengatasi serangan OPT dengan pendekatan ramah lingkungan. PIHAK KEDUA bertanggung jawab penuh atas penyimpanan, distribusi, dan penggunaan bantuan sesuai dengan teknis aplikasi yang benar.',
      keterangan: 'Demikian Berita Acara Serah Terima bantuan agen hayati ini dibuat dengan sebenar-benarnya untuk dapat digunakan sebagaimana mestinya.',
    },
  },
  'sample3': {
    kopSurat: {
      namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
      namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
      alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
      telepon: '(0356) 322086',
      laman: 'www.tubankab.go.id',
      email: 'pertanian@tubankab.go.id',
    },
    nomorSurat: '003/BA-ST/414.106.3/2025',
    namaHari: 'Jumat',
    tanggal: 'Dua Belas',
    bulan: 'Juli',
    tahun: 'Dua Ribu Dua Puluh Lima',
    pihakPertama: {
      nama: 'Drs. Heru Prasetyo, M.M.',
      nip: '196503151990031001',
      jabatan: 'Sekretaris Dinas',
      instansi: 'Dinas Pertanian dan Ketahanan Pangan Kabupaten Tuban',
    },
    pihakKedua: {
      nama: 'Ir. Wahyu Santoso, S.P.',
      jabatan: 'Koordinator Penyuluh',
      instansi: 'BPP Kecamatan Semanding',
      namaKecamatan: 'Semanding',
      nip: '197808202003121001',
    },
    kategoriObat: 'pesnab',
    daftarBarang: [
      {
        nomor: 1,
        kategoriObat: 'Pesnab (Pestisida Nabati)',
        opt: 'Kutu Daun',
        merekDagang: 'Ekstrak Nimba',
        jumlah: '40 liter',
        keterangan: 'Kondisi baik, konsentrasi 5%',
      },
      {
        nomor: 2,
        kategoriObat: 'Pesnab (Pestisida Nabati)',
        opt: 'Thrips',
        merekDagang: 'Ekstrak Tembakau',
        jumlah: '30 liter',
        keterangan: 'Kondisi baik, konsentrasi 3%',
      },
      {
        nomor: 3,
        kategoriObat: 'Pesnab (Pestisida Nabati)',
        opt: 'Ulat Pemakan Daun',
        merekDagang: 'Ekstrak Biji Sirsak',
        jumlah: '20 liter',
        keterangan: 'Kondisi baik, konsentrasi 4%',
      },
      {
        nomor: 4,
        kategoriObat: 'Pesnab (Pestisida Nabati)',
        opt: 'Tungau',
        merekDagang: 'Ekstrak Serai Wangi',
        jumlah: '35 liter',
        keterangan: 'Kondisi baik, konsentrasi 2%',
      },
    ],
    suratPermintaan: {
      nomor: '012/BPP-SMD/VII/2025',
      tanggal: '10 Juli 2025',
    },
    kelompokTani: {
      nama: 'Sumber Rejeki',
      namaKetua: 'Ibu Siti Kholifah',
      lokasiLahan: 'Desa Sumurgung, Kecamatan Semanding (koordinat: -6.8756, 112.2134)',
      luasLahanTerserang: '12,3 Ha',
      jenisKomoditas: 'Cabai Rawit',
      jenisOPT: 'Kutu Daun, Thrips, dan Ulat Pemakan Daun',
    },
  },
};

export default function BeritaAcaraTestPage() {
  const [selectedData, setSelectedData] = useState<string>('sample1');
  const [currentData, setCurrentData] = useState<BeritaAcaraData>(testDataVariations.sample1);

  const handleDataChange = (dataKey: string) => {
    setSelectedData(dataKey);
    setCurrentData(testDataVariations[dataKey]);
  };

  const generateRandomData = () => {
    const randomKeys = Object.keys(testDataVariations);
    const randomKey = randomKeys[Math.floor(Math.random() * randomKeys.length)];
    handleDataChange(randomKey);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementasi download PDF akan ditambahkan nanti
    console.log('Download PDF functionality will be implemented');
  };

  const dataVariations = [
    { key: 'sample1', name: 'Sample 1 - Pestisida (2 items)', description: 'Contoh berita acara untuk bantuan pestisida dengan 2 jenis obat' },
    { key: 'sample2', name: 'Sample 2 - Agen Hayati (3 items)', description: 'Contoh berita acara untuk bantuan agen hayati dengan narasi kustom' },
    { key: 'sample3', name: 'Sample 3 - Pesnab (4 items)', description: 'Contoh berita acara untuk bantuan pestisida nabati dengan banyak item' },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Test & Preview Berita Acara</h1>
          <p className="text-muted-foreground">
            Halaman untuk testing dan preview template berita acara dengan berbagai variasi data
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateRandomData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Random Data
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Test
          </Button>
        </div>
      </div>

      <Tabs defaultValue="preview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Live Preview</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Test Data</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          {/* Data Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Pilih Data Test</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={selectedData} onValueChange={handleDataChange}>
                  <SelectTrigger className="w-80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataVariations.map((variation) => (
                      <SelectItem key={variation.key} value={variation.key}>
                        {variation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline">{currentData.kategoriObat}</Badge>
                <Badge variant="secondary">{currentData.daftarBarang.length} items</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {dataVariations.find(v => v.key === selectedData)?.description}
              </p>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="print:p-0">
                <style jsx global>{`
                  @media print {
                    body * {
                      visibility: hidden;
                    }
                    .print-area, .print-area * {
                      visibility: visible;
                    }
                    .print-area {
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 100%;
                    }
                    @page {
                      size: A4;
                      margin: 0.5in;
                    }
                  }
                `}</style>
                <div className="print-area">
                  <BeritaAcaraTemplate data={currentData} isPreview={true} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          {/* Data Variations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {dataVariations.map((variation) => (
              <Card 
                key={variation.key}
                className={`cursor-pointer transition-colors ${
                  selectedData === variation.key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => handleDataChange(variation.key)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {variation.name}
                    {selectedData === variation.key && <Badge>Selected</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {variation.description}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Kategori:</span>
                      <Badge variant="outline" className="text-xs">
                        {testDataVariations[variation.key].kategoriObat}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Jumlah Item:</span>
                      <span>{testDataVariations[variation.key].daftarBarang.length} items</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pihak Kedua:</span>
                      <span>{testDataVariations[variation.key].pihakKedua.namaKecamatan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Custom Narrative:</span>
                      <span>{testDataVariations[variation.key].customNarrative ? 'Ya' : 'Tidak'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Data Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Data: {dataVariations.find(v => v.key === selectedData)?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Informasi Umum</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Nomor Surat:</span>
                      <span>{currentData.nomorSurat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tanggal:</span>
                      <span>{currentData.namaHari}, {currentData.tanggal} {currentData.bulan} {currentData.tahun}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kategori Obat:</span>
                      <span>{currentData.kategoriObat}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Pihak yang Terlibat</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Pihak I:</span>
                      <span>{currentData.pihakPertama.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jabatan:</span>
                      <span className="text-right text-xs">{currentData.pihakPertama.jabatan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pihak II:</span>
                      <span>{currentData.pihakKedua.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kecamatan:</span>
                      <span>{currentData.pihakKedua.namaKecamatan}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Daftar Barang ({currentData.daftarBarang.length} items)</h4>
                <div className="space-y-2">
                  {currentData.daftarBarang.map((barang, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm">
                      <div>
                        <span className="font-medium">{barang.merekDagang}</span>
                        <span className="text-muted-foreground ml-2">({barang.opt})</span>
                      </div>
                      <Badge variant="outline">{barang.jumlah}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Kelompok Tani</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Nama Poktan:</span>
                      <span>{currentData.kelompokTani.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ketua:</span>
                      <span>{currentData.kelompokTani.namaKetua}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Komoditas:</span>
                      <span>{currentData.kelompokTani.jenisKomoditas}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Luas Terserang:</span>
                      <span>{currentData.kelompokTani.luasLahanTerserang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jenis OPT:</span>
                      <span className="text-right text-xs">{currentData.kelompokTani.jenisOPT}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Testing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Variasi Data Test:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Sample 1: Data standar dengan 2 item pestisida</li>
                <li>• Sample 2: Data dengan narasi kustom dan agen hayati</li>
                <li>• Sample 3: Data dengan banyak item pesnab</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Testing Print:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Format A4 portrait dengan margin standar</li>
                <li>• Font Times New Roman 12pt</li>
                <li>• Layout responsif untuk print dan screen</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features Test:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Kop surat dengan logo placeholder</li>
                <li>• Tabel dinamis sesuai jumlah barang</li>
                <li>• Narasi kustom dan default</li>
                <li>• Tanda tangan dua pihak</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
