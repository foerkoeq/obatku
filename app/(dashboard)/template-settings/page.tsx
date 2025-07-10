'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, FileText, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';

export default function TemplateSettingsPage() {
  const templateTypes = [
    {
      id: 'qr-labels',
      title: 'Label QR Code',
      description: 'Kelola template untuk label QR Code obat dan inventori',
      icon: QrCode,
      href: '/template-settings/qr-labels',
      color: 'bg-blue-500',
      features: ['Template Label', 'Format Cetak', 'QR Code Settings'],
    },
    {
      id: 'berita-acara',
      title: 'Berita Acara',
      description: 'Kelola template untuk berita acara serah terima',
      icon: FileText,
      href: '/template-settings/berita-acara',
      color: 'bg-green-500',
      features: ['Kop Surat', 'Format Narasi', 'Template Default'],
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Pengaturan Template</h1>
        <p className="text-muted-foreground">
          Kelola template dokumen dan label untuk sistem inventori obat
        </p>
      </div>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templateTypes.map((template) => {
          const IconComponent = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${template.color} text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{template.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature) => (
                    <Badge key={feature} color="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Akses: Admin & Dinas
                  </div>
                  <Link href={template.href}>
                    <Button className="group">
                      <Settings className="h-4 w-4 mr-2" />
                      Kelola Template
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Informasi Template</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Template yang Anda buat di sini akan digunakan untuk:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
              <div className="space-y-2">
                <h4 className="font-medium">Label QR Code:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cetak label untuk obat baru</li>
                  <li>• Label untuk transaksi keluar</li>
                  <li>• Label untuk inventori</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Berita Acara:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Serah terima obat</li>
                  <li>• Dokumentasi transaksi</li>
                  <li>• Laporan resmi</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
