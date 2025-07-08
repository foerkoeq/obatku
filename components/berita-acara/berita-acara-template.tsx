import React from 'react';
import { BeritaAcaraData } from '@/lib/types/berita-acara';
import { cn } from '@/lib/utils';

interface BeritaAcaraTemplateProps {
  data: BeritaAcaraData;
  className?: string;
  isPreview?: boolean;
}

export const BeritaAcaraTemplate: React.FC<BeritaAcaraTemplateProps> = ({
  data,
  className,
  isPreview = false
}) => {
  const {
    kopSurat,
    nomorSurat,
    namaHari,
    tanggal,
    bulan,
    tahun,
    pihakPertama,
    pihakKedua,
    kategoriObat,
    daftarBarang,
    suratPermintaan,
    kelompokTani,
    customNarrative
  } = data;

  return (
    <div 
      className={cn(
        "bg-white text-black font-serif text-sm leading-relaxed",
        "w-[210mm] min-h-[297mm] mx-auto p-8",
        "print:p-6 print:shadow-none print:bg-white",
        isPreview ? "shadow-lg border" : "",
        className
      )}
      style={{
        fontFamily: 'Times New Roman, serif',
        fontSize: '12pt',
        lineHeight: '1.5'
      }}
    >
      {/* Kop Surat */}
      <header className="border-b-2 border-black pb-4 mb-6">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="w-16 h-16 flex-shrink-0">
            {kopSurat.logo ? (
              <img 
                src={kopSurat.logo} 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                LOGO
              </div>
            )}
          </div>
          
          {/* Header Text */}
          <div className="flex-1 text-center">
            <h1 className="font-bold text-lg leading-tight">
              {kopSurat.namaInstansi}
            </h1>
            <h2 className="font-bold text-base leading-tight mt-1">
              {kopSurat.namaDinas}
            </h2>
            <div className="text-sm mt-2 leading-tight">
              <p>{kopSurat.alamat}</p>
              <p>
                Telepon: {kopSurat.telepon}
                {kopSurat.laman && (
                  <span className="ml-2">Laman: {kopSurat.laman}</span>
                )}
              </p>
              <p>Pos-el: {kopSurat.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Title Section */}
      <div className="text-center mb-6">
        <h1 className="font-bold text-lg mb-2 underline">
          BERITA ACARA SERAH TERIMA
        </h1>
        <p className="text-sm">
          Nomor: {nomorSurat}
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-4 text-justify">
        {/* Opening Paragraph */}
        <p>
          {customNarrative?.pembukaan || `Pada hari ini, ${namaHari}, tanggal ${tanggal} bulan ${bulan} tahun ${tahun}, Kabupaten Tuban, kami yang bertanda tangan di bawah ini:`}
        </p>

        {/* Pihak Pertama */}
        <div className="ml-8 space-y-1">
          <p><strong>Nama</strong> : {pihakPertama.nama}</p>
          <p><strong>NIP</strong> : {pihakPertama.nip}</p>
          <p><strong>Jabatan</strong> : {pihakPertama.jabatan}</p>
          <p><strong>Instansi</strong> : {pihakPertama.instansi}</p>
        </div>

        <p>
          Dalam hal ini bertindak untuk dan atas nama Dinas Pertanian dan Ketahanan Pangan Kabupaten Tuban, yang selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
        </p>

        {/* Pihak Kedua */}
        <div className="ml-8 space-y-1">
          <p><strong>Nama</strong> : {pihakKedua.nama}</p>
          <p><strong>Jabatan</strong> : {pihakKedua.jabatan}</p>
          <p><strong>Instansi</strong> : {pihakKedua.instansi}</p>
        </div>

        <p>
          Dalam hal ini bertindak untuk dan atas nama Balai Penyuluhan Pertanian Kecamatan {pihakKedua.namaKecamatan}, yang selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
        </p>

        <p>
          Dengan ini menyatakan bahwa <strong>PIHAK PERTAMA</strong> telah menyerahkan {kategoriObat} kepada <strong>PIHAK KEDUA</strong>, dan <strong>PIHAK KEDUA</strong> telah menerima barang bantuan tersebut dari <strong>PIHAK PERTAMA</strong>.
        </p>

        <p>
          Adapun rincian barang bantuan yang diserahterimakan adalah sebagai berikut:
        </p>

        {/* Tabel Barang */}
        <div className="my-6">
          <table className="w-full border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 text-center w-8">No.</th>
                <th className="border border-black p-2 text-center">{kategoriObat}</th>
                <th className="border border-black p-2 text-center">OPT</th>
                <th className="border border-black p-2 text-center">Merek Dagang/Bahan Aktif</th>
                <th className="border border-black p-2 text-center">Jumlah</th>
                <th className="border border-black p-2 text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {daftarBarang.map((barang, index) => (
                <tr key={index}>
                  <td className="border border-black p-2 text-center">{barang.nomor}</td>
                  <td className="border border-black p-2">{barang.kategoriObat}</td>
                  <td className="border border-black p-2">{barang.opt}</td>
                  <td className="border border-black p-2">{barang.merekDagang}</td>
                  <td className="border border-black p-2 text-center">{barang.jumlah}</td>
                  <td className="border border-black p-2">{barang.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Referensi Surat */}
        <p>
          Penyerahan ini merupakan tindak lanjut dari Surat Permintaan Bantuan dari Koordinator BPP Kecamatan {pihakKedua.namaKecamatan} Nomor: {suratPermintaan.nomor} tanggal {suratPermintaan.tanggal}, serta dilakukan dalam rangka penanggulangan bencana pada:
        </p>

        {/* Detail Kelompok Tani */}
        <div className="ml-8 space-y-1">
          <p><strong>Nama Kelompok Tani</strong> : {kelompokTani.nama}</p>
          <p><strong>Nama Ketua Kelompok Tani</strong> : {kelompokTani.namaKetua}</p>
          <p><strong>Lokasi Lahan</strong> : {kelompokTani.lokasiLahan}</p>
          <p><strong>Luas Lahan Terserang</strong> : {kelompokTani.luasLahanTerserang}</p>
          <p><strong>Jenis Komoditas</strong> : {kelompokTani.jenisKomoditas}</p>
          <p><strong>Jenis OPT</strong> : {kelompokTani.jenisOPT}</p>
        </div>

        {/* Closing Paragraph */}
        <p>
          {customNarrative?.penutup || `Dengan ditandatanganinya berita acara ini, PIHAK KEDUA menyatakan telah menerima seluruh bantuan tersebut dalam kondisi baik dan jumlah yang sesuai. Bantuan ini akan segera disalurkan oleh PIHAK KEDUA kepada kelompok tani yang terdampak bencana untuk dimanfaatkan sesuai peruntukannya dan tidak untuk diperjualbelikan. Sejak saat ini, tanggung jawab atas pengelolaan, penyimpanan, dan penyaluran bantuan beralih sepenuhnya kepada PIHAK KEDUA.`}
        </p>

        <p>
          Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
        </p>
      </div>

      {/* Signature Section */}
      <div className="mt-8 flex justify-between">
        {/* Pihak Kedua */}
        <div className="text-center w-64">
          <p className="mb-1"><strong>PIHAK KEDUA</strong></p>
          <p className="mb-16 text-sm">
            Koordinator BPP Kec. {pihakKedua.namaKecamatan}
          </p>
          <div className="border-b border-black w-48 mx-auto mb-1"></div>
          <p className="font-bold">{pihakKedua.nama}</p>
          <p className="text-sm">NIP. {pihakKedua.nip}</p>
        </div>

        {/* Pihak Pertama */}
        <div className="text-center w-64">
          <p className="mb-1"><strong>PIHAK PERTAMA</strong></p>
          <p className="mb-2 text-sm">
            a.n. Kepala Dinas Ketahanan Pangan,<br />
            Pertanian dan Perikanan Kabupaten Tuban
          </p>
          <p className="mb-12 text-sm">{pihakPertama.jabatan}</p>
          <div className="border-b border-black w-48 mx-auto mb-1"></div>
          <p className="font-bold">{pihakPertama.nama}</p>
          <p className="text-sm">NIP. {pihakPertama.nip}</p>
        </div>
      </div>
    </div>
  );
};
