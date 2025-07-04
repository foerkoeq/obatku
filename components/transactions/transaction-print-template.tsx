'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';

// # START OF TransactionPrintTemplate - Komponen template print untuk bukti transaksi keluar
// Purpose: Menyediakan template yang dapat dicetak untuk bukti transaksi keluar obat pertanian
// Props: transactionData (data transaksi), onPrint (fungsi print)
// Returns: JSX element template print
// Dependencies: React, UI components, Print API

interface TransactionItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  batchNumber?: string;
  expiredDate?: string;
}

interface TransactionData {
  id: string;
  transactionNumber: string;
  date: string;
  recipient: {
    name: string;
    organization: string;
    address: string;
    phone?: string;
  };
  items: TransactionItem[];
  requestLetter: {
    number: string;
    date: string;
  };
  notes?: string;
  approvedBy: {
    name: string;
    position: string;
    signature?: string;
  };
  handedBy: {
    name: string;
    position: string;
    signature?: string;
  };
}

interface TransactionPrintTemplateProps {
  transactionData: TransactionData;
  onPrint?: () => void;
}

const TransactionPrintTemplate: React.FC<TransactionPrintTemplateProps> = ({ 
  transactionData,
  onPrint 
}) => {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Print Button - Hidden when printing */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Icon icon="heroicons-outline:printer" className="h-4 w-4" />
          Cetak Bukti Transaksi
        </Button>
      </div>

      {/* Print Template */}
      <div className="bg-white p-8 shadow-lg print:shadow-none print:p-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            BUKTI SERAH TERIMA OBAT PERTANIAN
          </h1>
          <div className="text-sm text-gray-600">
            <p>Dinas Pertanian dan Pangan</p>
            <p>Kabupaten/Kota</p>
          </div>
        </div>

        {/* Transaction Info */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-3">Informasi Transaksi</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-32 text-gray-600">No. Transaksi:</span>
                <span className="font-medium">{transactionData.transactionNumber}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Tanggal:</span>
                <span>{new Date(transactionData.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">No. Surat:</span>
                <span>{transactionData.requestLetter.number}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Tgl. Surat:</span>
                <span>{new Date(transactionData.requestLetter.date).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Penerima</h3>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="w-32 text-gray-600">Nama:</span>
                <span className="font-medium">{transactionData.recipient.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Organisasi:</span>
                <span>{transactionData.recipient.organization}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-600">Alamat:</span>
                <span>{transactionData.recipient.address}</span>
              </div>
              {transactionData.recipient.phone && (
                <div className="flex">
                  <span className="w-32 text-gray-600">Telepon:</span>
                  <span>{transactionData.recipient.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Items Table */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Daftar Obat yang Diserahkan</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left border-b">No</th>
                  <th className="px-4 py-3 text-left border-b">Nama Obat</th>
                  <th className="px-4 py-3 text-center border-b">Jumlah</th>
                  <th className="px-4 py-3 text-center border-b">Satuan</th>
                  <th className="px-4 py-3 text-center border-b">No. Batch</th>
                  <th className="px-4 py-3 text-center border-b">Exp. Date</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.items.map((item, index) => (
                  <tr key={item.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-center">{item.quantity.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-center">{item.unit}</td>
                    <td className="px-4 py-3 text-center">{item.batchNumber || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {item.expiredDate ? new Date(item.expiredDate).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        {transactionData.notes && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Catatan</h3>
            <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded border">
              {transactionData.notes}
            </p>
          </div>
        )}

        <Separator className="my-6" />

        {/* Signatures */}
        <div className="grid grid-cols-3 gap-8 mt-8">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">Penerima</p>
            <div className="h-20 mb-2 border-b border-gray-300"></div>
            <div className="text-sm">
              <p className="font-medium">{transactionData.recipient.name}</p>
              <p className="text-gray-600">{transactionData.recipient.organization}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium mb-2">Yang Menyerahkan</p>
            <div className="h-20 mb-2 border-b border-gray-300"></div>
            <div className="text-sm">
              <p className="font-medium">{transactionData.handedBy.name}</p>
              <p className="text-gray-600">{transactionData.handedBy.position}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm font-medium mb-2">Mengetahui</p>
            <div className="h-20 mb-2 border-b border-gray-300"></div>
            <div className="text-sm">
              <p className="font-medium">{transactionData.approvedBy.name}</p>
              <p className="text-gray-600">{transactionData.approvedBy.position}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Dokumen ini dicetak secara otomatis oleh Sistem Manajemen Obat Pertanian</p>
          <p>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

// # END OF TransactionPrintTemplate

export default TransactionPrintTemplate; 