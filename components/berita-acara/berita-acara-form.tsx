'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { BeritaAcaraData } from '@/lib/types/berita-acara';
import { LogoUploader } from './logo-uploader';

const beritaAcaraSchema = z.object({
  kopSurat: z.object({
    namaInstansi: z.string().min(1, 'Nama instansi harus diisi'),
    namaDinas: z.string().min(1, 'Nama dinas harus diisi'),
    alamat: z.string().min(1, 'Alamat harus diisi'),
    telepon: z.string().min(1, 'Telepon harus diisi'),
    laman: z.string().optional(),
    email: z.string().email('Format email tidak valid'),
    logo: z.string().optional(),
  }),
  nomorSurat: z.string().min(1, 'Nomor surat harus diisi'),
  namaHari: z.string().min(1, 'Nama hari harus diisi'),
  tanggal: z.string().min(1, 'Tanggal harus diisi'),
  bulan: z.string().min(1, 'Bulan harus diisi'),
  tahun: z.string().min(1, 'Tahun harus diisi'),
  pihakPertama: z.object({
    nama: z.string().min(1, 'Nama harus diisi'),
    nip: z.string().min(1, 'NIP harus diisi'),
    jabatan: z.string().min(1, 'Jabatan harus diisi'),
    instansi: z.string().min(1, 'Instansi harus diisi'),
  }),
  pihakKedua: z.object({
    nama: z.string().min(1, 'Nama harus diisi'),
    jabatan: z.string().min(1, 'Jabatan harus diisi'),
    instansi: z.string().min(1, 'Instansi harus diisi'),
    namaKecamatan: z.string().min(1, 'Nama kecamatan harus diisi'),
    nip: z.string().min(1, 'NIP harus diisi'),
  }),
  kategoriObat: z.string().min(1, 'Kategori obat harus diisi'),
  daftarBarang: z.array(z.object({
    nomor: z.number().min(1),
    kategoriObat: z.string().min(1, 'Kategori obat harus diisi'),
    opt: z.string().min(1, 'OPT harus diisi'),
    merekDagang: z.string().min(1, 'Merek dagang harus diisi'),
    jumlah: z.string().min(1, 'Jumlah harus diisi'),
    keterangan: z.string().optional(),
  })).min(1, 'Minimal harus ada 1 barang'),
  suratPermintaan: z.object({
    nomor: z.string().min(1, 'Nomor surat permintaan harus diisi'),
    tanggal: z.string().min(1, 'Tanggal surat permintaan harus diisi'),
  }),
  kelompokTani: z.object({
    nama: z.string().min(1, 'Nama kelompok tani harus diisi'),
    namaKetua: z.string().min(1, 'Nama ketua harus diisi'),
    lokasiLahan: z.string().min(1, 'Lokasi lahan harus diisi'),
    luasLahanTerserang: z.string().min(1, 'Luas lahan terserang harus diisi'),
    jenisKomoditas: z.string().min(1, 'Jenis komoditas harus diisi'),
    jenisOPT: z.string().min(1, 'Jenis OPT harus diisi'),
  }),
  customNarrative: z.object({
    pembukaan: z.string().optional(),
    penutup: z.string().optional(),
    keterangan: z.string().optional(),
  }).optional(),
});

type BeritaAcaraFormData = z.infer<typeof beritaAcaraSchema>;

interface BeritaAcaraFormProps {
  data?: Partial<BeritaAcaraData>;
  onSave: (data: BeritaAcaraFormData) => void;
  onCancel?: () => void;
}

export const BeritaAcaraForm: React.FC<BeritaAcaraFormProps> = ({
  data,
  onSave,
  onCancel
}) => {
  const form = useForm<BeritaAcaraFormData>({
    resolver: zodResolver(beritaAcaraSchema),
    defaultValues: {
      kopSurat: {
        namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
        namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
        alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
        telepon: '(0356) 322086',
        laman: '',
        email: '@tubankab.go.id',
        logo: '',
        ...data?.kopSurat,
      },
      nomorSurat: '.../..../414.106.3/2025',
      namaHari: 'Senin',
      tanggal: 'Satu',
      bulan: 'Januari',
      tahun: 'Dua Ribu Dua Puluh Lima',
      pihakPertama: {
        nama: '',
        nip: '',
        jabatan: 'Kepala Bidang Sarana dan Prasarana Pertanian',
        instansi: 'Dinas Pertanian dan Ketahanan Pangan Kabupaten Tuban',
        ...data?.pihakPertama,
      },
      pihakKedua: {
        nama: '',
        jabatan: 'Koordinator Penyuluh',
        instansi: 'BPP Kecamatan',
        namaKecamatan: '',
        nip: '',
        ...data?.pihakKedua,
      },
      kategoriObat: 'pestisida',
      daftarBarang: data?.daftarBarang || [{
        nomor: 1,
        kategoriObat: '',
        opt: '',
        merekDagang: '',
        jumlah: '',
        keterangan: '',
      }],
      suratPermintaan: {
        nomor: '',
        tanggal: '',
        ...data?.suratPermintaan,
      },
      kelompokTani: {
        nama: '',
        namaKetua: '',
        lokasiLahan: '',
        luasLahanTerserang: '',
        jenisKomoditas: '',
        jenisOPT: '',
        ...data?.kelompokTani,
      },
      customNarrative: {
        pembukaan: '',
        penutup: '',
        keterangan: '',
        ...data?.customNarrative,
      },
      ...data,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'daftarBarang',
  });

  const addBarang = () => {
    const newNomor = fields.length + 1;
    append({
      nomor: newNomor,
      kategoriObat: '',
      opt: '',
      merekDagang: '',
      jumlah: '',
      keterangan: '',
    });
  };

  const removeBarang = (index: number) => {
    remove(index);
    // Update nomor urut
    const currentValues = form.getValues('daftarBarang');
    currentValues.forEach((_, idx) => {
      form.setValue(`daftarBarang.${idx}.nomor`, idx + 1);
    });
  };

  const onSubmit = (formData: BeritaAcaraFormData) => {
    onSave(formData);
  };

  const hariOptions = [
    'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
  ];

  const bulanOptions = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const kategoriObatOptions = [
    { value: 'pestisida', label: 'Pestisida' },
    { value: 'agen hayati', label: 'Agen Hayati' },
    { value: 'pesnab', label: 'Pesnab' },
    { value: 'poc', label: 'POC' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Kop Surat */}
        <Card>
          <CardHeader>
            <CardTitle>Kop Surat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Uploader */}
            <LogoUploader
              currentLogo={form.watch('kopSurat.logo')}
              onLogoChange={(logoUrl) => form.setValue('kopSurat.logo', logoUrl)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kopSurat.namaInstansi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Instansi</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kopSurat.namaDinas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Dinas</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="kopSurat.alamat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="kopSurat.telepon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telepon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kopSurat.laman"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laman (Opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kopSurat.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informasi Dokumen */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="nomorSurat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor Surat</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="namaHari"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hari</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih hari" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hariOptions.map((hari) => (
                          <SelectItem key={hari} value={hari}>
                            {hari}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal (teks)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Satu, Dua, dst" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bulan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bulan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bulan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bulanOptions.map((bulan) => (
                          <SelectItem key={bulan} value={bulan}>
                            {bulan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tahun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tahun (teks)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Dua Ribu Dua Puluh Lima" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pihak Pertama */}
        <Card>
          <CardHeader>
            <CardTitle>Pihak Pertama (Dinas)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pihakPertama.nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pihakPertama.nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pihakPertama.jabatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pihakPertama.instansi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instansi</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pihak Kedua */}
        <Card>
          <CardHeader>
            <CardTitle>Pihak Kedua (BPP)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pihakKedua.nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pihakKedua.nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pihakKedua.namaKecamatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kecamatan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pihakKedua.jabatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kategori Obat dan Daftar Barang */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Barang Bantuan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="kategoriObat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Obat</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori obat" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kategoriObatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Barang #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeBarang(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name={`daftarBarang.${index}.kategoriObat`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori Obat</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`daftarBarang.${index}.opt`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OPT</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`daftarBarang.${index}.merekDagang`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merek Dagang/Bahan Aktif</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`daftarBarang.${index}.jumlah`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`daftarBarang.${index}.keterangan`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Keterangan (Opsional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addBarang} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Barang
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Surat Permintaan */}
        <Card>
          <CardHeader>
            <CardTitle>Surat Permintaan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="suratPermintaan.nomor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Surat Permintaan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="suratPermintaan.tanggal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Surat Permintaan</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kelompok Tani */}
        <Card>
          <CardHeader>
            <CardTitle>Kelompok Tani</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kelompokTani.nama"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kelompok Tani</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kelompokTani.namaKetua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Ketua Kelompok Tani</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="kelompokTani.lokasiLahan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi Lahan</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="kelompokTani.luasLahanTerserang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Luas Lahan Terserang (Ha)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kelompokTani.jenisKomoditas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Komoditas</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kelompokTani.jenisOPT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis OPT</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Custom Narrative */}
        <Card>
          <CardHeader>
            <CardTitle>Narasi Kustom (Opsional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="customNarrative.pembukaan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paragraf Pembukaan</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Kosongkan untuk menggunakan teks default"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customNarrative.penutup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paragraf Penutup</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={4}
                      placeholder="Kosongkan untuk menggunakan teks default"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customNarrative.keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan Tambahan</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={2}
                      placeholder="Keterangan tambahan jika diperlukan"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Batal
            </Button>
          )}
          <Button type="submit">
            Simpan
          </Button>
        </div>
      </form>
    </Form>
  );
};
