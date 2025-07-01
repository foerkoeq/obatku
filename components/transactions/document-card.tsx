"use client";

import { Transaction } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download, NotebookText } from "lucide-react";

export const DocumentCard = ({ transaction }: { transaction: Transaction }) => {
  const { submission } = transaction;

  if (!submission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dokumen & Permintaan</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Informasi pengajuan tidak lengkap.</p>
        </CardContent>
      </Card>
    );
  }

  const { letter, requestedDrugs, notes } = submission;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dokumen & Permintaan Obat</CardTitle>
        <CardDescription>
          Rincian surat pengajuan dan daftar obat yang diminta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Surat Pengajuan */}
        <div>
          <h4 className="font-semibold mb-3 text-base flex items-center gap-2">
            <FileText size={18} /> Surat Pengajuan
          </h4>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-semibold">{letter.filename}</p>
                <p className="text-sm text-muted-foreground">
                  Diunggah pada {new Date(letter.uploadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(letter.url, '_blank')}
            >
              <Download className="mr-2 h-4 w-4" />
              Lihat
            </Button>
          </div>
        </div>

        {/* Daftar Obat yang Diminta */}
        <div>
          <h4 className="font-semibold mb-3 text-base">Daftar Obat Diminta</h4>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Obat</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead>Tujuan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestedDrugs?.map((drug, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{drug.drugName}</TableCell>
                    <TableCell className="text-right">{drug.requestedQuantity} {drug.unit}</TableCell>
                    <TableCell className="text-muted-foreground">{drug.purpose}</TableCell>
                  </TableRow>
                ))}
                {!requestedDrugs?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Tidak ada obat yang diminta.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Catatan Pemohon */}
        {notes && (
          <div>
            <h4 className="font-semibold mb-2 text-base flex items-center gap-2">
              <NotebookText size={18}/> Catatan dari Pemohon
            </h4>
            <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg border">
              {notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
