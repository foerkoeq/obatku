'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BeritaAcaraTemplate } from '@/components/berita-acara/berita-acara-template';
import { BeritaAcaraForm } from '@/components/berita-acara/berita-acara-form';
import { BeritaAcaraData } from '@/lib/types/berita-acara';
import { FileText, Download, Printer, Eye, Edit } from 'lucide-react';

const defaultBeritaAcaraData: BeritaAcaraData = {
  kopSurat: {
    namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
    namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
    alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
    telepon: '(0356) 322086',
    laman: 'www.tubankab.go.id',
    email: 'pertanian@tubankab.go.id',
    logo: '',
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
};

export default function BeritaAcaraPage() {
  const [currentData, setCurrentData] = useState<BeritaAcaraData>(defaultBeritaAcaraData);
  const [activeTab, setActiveTab] = useState('preview');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (formData: any) => {
    setCurrentData(formData as BeritaAcaraData);
    setIsEditing(false);
    setActiveTab('preview');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementasi download PDF akan ditambahkan nanti
    console.log('Download PDF functionality will be implemented');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setActiveTab('form');
  };

  const handleNewDocument = () => {
    setCurrentData(defaultBeritaAcaraData);
    setIsEditing(true);
    setActiveTab('form');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Berita Acara Serah Terima</h1>
          <p className="text-muted-foreground">
            Kelola dan buat berita acara serah terima bantuan pertanian
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleNewDocument} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Dokumen Baru
          </Button>
          {!isEditing && (
            <>
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Preview</span>
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Form Edit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Berita Acara</CardTitle>
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

        <TabsContent value="form" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Input Berita Acara</CardTitle>
            </CardHeader>
            <CardContent>
              <BeritaAcaraForm
                data={currentData}
                onSave={handleSave}
                onCancel={() => {
                  setIsEditing(false);
                  setActiveTab('preview');
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Petunjuk Penggunaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Preview Mode:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Lihat hasil akhir berita acara</li>
                <li>• Format siap untuk dicetak atau didownload</li>
                <li>• Layout mengikuti standar kertas A4</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Form Edit Mode:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Edit semua informasi dalam berita acara</li>
                <li>• Tambah atau hapus barang bantuan</li>
                <li>• Kustomisasi narasi sesuai kebutuhan</li>
              </ul>
            </div>
          </div>
          <div className="pt-3 border-t">
            <h4 className="font-medium mb-2">Tips:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Gunakan tombol "Print" untuk mencetak langsung</li>
              <li>• Pastikan semua data sudah benar sebelum mencetak</li>
              <li>• Narasi kustom bersifat opsional, jika kosong akan menggunakan template default</li>
              <li>• Format tanggal menggunakan penulisan lengkap (contoh: "Delapan Juli")</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
