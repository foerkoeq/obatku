// src/types/stokObat.ts

export type SumberDana = '01' | '02' | '03' | '04' | '05';

export interface StokKardus {
  idKardus: string;
  idJenis: number;
  kandungan: string;
  idKandungan: string;
  merek: string;
  idMerek: string;
  tahun: string;
  sumberDana: SumberDana;
  kadaluarsa: string;      // Ditambahkan dari data riil
  jumlahIsiSatuan: number; 
  statusBuka: boolean;   
}

export interface StokSatuan {
  idSatuan: string;
  idKardus: string;
  statusPakai: 'TERSEDIA' | 'DIDISTRIBUSIKAN' | 'KADALUWARSA';
}