'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BeritaAcaraTemplate as BeritaAcaraTemplateComponent } from '@/components/berita-acara/berita-acara-template';
import { BeritaAcaraTemplate, BeritaAcaraSettings, BeritaAcaraData } from '@/lib/types/berita-acara';
import { Save, Plus, Trash2, Copy, Settings, FileText, Palette } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Mock data untuk template
const mockTemplates: BeritaAcaraTemplate[] = [
  {
    id: '1',
    name: 'Template Default',
    description: 'Template standar untuk berita acara serah terima',
    kopSurat: {
      namaInstansi: 'PEMERINTAH KABUPATEN TUBAN',
      namaDinas: 'DINAS KETAHANAN PANGAN, PERTANIAN DAN PERIKANAN',
      alamat: 'Jalan Mastrip No. 5, Sidorejo, Tuban, Jawa Timur 62315',
      telepon: '(0356) 322086',
      laman: 'www.tubankab.go.id',
      email: 'pertanian@tubankab.go.id',
    },
    defaultNarrative: {
      pembukaan: 'Pada hari ini, [Nama Hari], tanggal [penyebutan tanggal bukan angka] bulan [Nama Bulan] tahun Dua Ribu Dua Puluh Lima, Kabupaten Tuban, kami yang bertanda tangan di bawah ini:',
      penutup: 'Dengan ditandatanganinya berita acara ini, PIHAK KEDUA menyatakan telah menerima seluruh bantuan tersebut dalam kondisi baik dan jumlah yang sesuai. Bantuan ini akan segera disalurkan oleh PIHAK KEDUA kepada kelompok tani yang terdampak bencana untuk dimanfaatkan sesuai peruntukannya dan tidak untuk diperjualbelikan. Sejak saat ini, tanggung jawab atas pengelolaan, penyimpanan, dan penyaluran bantuan beralih sepenuhnya kepada PIHAK KEDUA.',
      keterangan: 'Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
    },
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockSettings: BeritaAcaraSettings = {
  templates: mockTemplates,
  defaultTemplateId: '1',
  printSettings: {
    pageSize: 'A4',
    margin: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20,
    },
    orientation: 'portrait',
  },
};

export default function BeritaAcaraSettingsPage() {
  const [settings, setSettings] = useState<BeritaAcaraSettings>(mockSettings);
  const [selectedTemplate, setSelectedTemplate] = useState<BeritaAcaraTemplate>(mockTemplates[0]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<BeritaAcaraTemplate>>({});

  const handleSaveTemplate = () => {
    if (isEditingTemplate) {
      // Update existing template
      const updatedTemplates = settings.templates.map(t => 
        t.id === selectedTemplate.id ? { ...selectedTemplate, updatedAt: new Date() } : t
      );
      setSettings({ ...settings, templates: updatedTemplates });
    } else {
      // Create new template
      const template: BeritaAcaraTemplate = {
        id: Date.now().toString(),
        name: newTemplate.name || 'Template Baru',
        description: newTemplate.description || '',
        kopSurat: newTemplate.kopSurat || selectedTemplate.kopSurat,
        defaultNarrative: newTemplate.defaultNarrative || selectedTemplate.defaultNarrative,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSettings({ ...settings, templates: [...settings.templates, template] });
      setNewTemplate({});
    }
    setIsEditingTemplate(false);
    toast({
      title: "Template tersimpan",
      description: "Template berhasil disimpan.",
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (settings.templates.length <= 1) {
      toast({
        title: "Tidak dapat menghapus",
        description: "Minimal harus ada satu template.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedTemplates = settings.templates.filter(t => t.id !== templateId);
    let newDefaultId = settings.defaultTemplateId;
    
    if (templateId === settings.defaultTemplateId) {
      newDefaultId = updatedTemplates[0].id;
    }
    
    setSettings({ 
      ...settings, 
      templates: updatedTemplates,
      defaultTemplateId: newDefaultId 
    });
    
    toast({
      title: "Template dihapus",
      description: "Template berhasil dihapus.",
    });
  };

  const handleDuplicateTemplate = (template: BeritaAcaraTemplate) => {
    const duplicatedTemplate: BeritaAcaraTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSettings({ ...settings, templates: [...settings.templates, duplicatedTemplate] });
    toast({
      title: "Template diduplikasi",
      description: "Template berhasil diduplikasi.",
    });
  };

  const handleSetDefaultTemplate = (templateId: string) => {
    setSettings({ ...settings, defaultTemplateId: templateId });
    toast({
      title: "Template default diubah",
      description: "Template default berhasil diubah.",
    });
  };

  const sampleData: BeritaAcaraData = {
    kopSurat: selectedTemplate.kopSurat,
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
    ],
    suratPermintaan: {
      nomor: '005/BPP-TBN/VII/2025',
      tanggal: '5 Juli 2025',
    },
    kelompokTani: {
      nama: 'Tani Makmur',
      namaKetua: 'Bapak Sutrisno',
      lokasiLahan: 'Desa Sidorejo, Kecamatan Tuban',
      luasLahanTerserang: '5,2 Ha',
      jenisKomoditas: 'Padi',
      jenisOPT: 'Wereng Batang Coklat',
    },
    customNarrative: {
      pembukaan: selectedTemplate.defaultNarrative.pembukaan,
      penutup: selectedTemplate.defaultNarrative.penutup,
      keterangan: selectedTemplate.defaultNarrative.keterangan,
    },
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Template Berita Acara</h1>
          <p className="text-muted-foreground">
            Kelola template dan format berita acara serah terima
          </p>
        </div>
        <Button onClick={() => setIsEditingTemplate(false)}>
          <Plus className="h-4 w-4 mr-2" />
          Template Baru
        </Button>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Template</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Pengaturan</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Preview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings.templates.map((template) => (
                  <div 
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate.id === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {template.name}
                          {template.isDefault && <Badge>Default</Badge>}
                        </h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateTemplate(template);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!template.isDefault && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(template.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dibuat: {template.createdAt.toLocaleDateString('id-ID')}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Template Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Edit Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Nama Template</Label>
                    <Input
                      id="template-name"
                      value={selectedTemplate.name}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="template-desc">Deskripsi</Label>
                    <Input
                      id="template-desc"
                      value={selectedTemplate.description || ''}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, description: e.target.value })}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="instansi">Nama Instansi</Label>
                    <Input
                      id="instansi"
                      value={selectedTemplate.kopSurat.namaInstansi}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        kopSurat: { ...selectedTemplate.kopSurat, namaInstansi: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dinas">Nama Dinas</Label>
                    <Input
                      id="dinas"
                      value={selectedTemplate.kopSurat.namaDinas}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        kopSurat: { ...selectedTemplate.kopSurat, namaDinas: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="alamat">Alamat</Label>
                    <Textarea
                      id="alamat"
                      value={selectedTemplate.kopSurat.alamat}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        kopSurat: { ...selectedTemplate.kopSurat, alamat: e.target.value }
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telepon">Telepon</Label>
                      <Input
                        id="telepon"
                        value={selectedTemplate.kopSurat.telepon}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          kopSurat: { ...selectedTemplate.kopSurat, telepon: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={selectedTemplate.kopSurat.email}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          kopSurat: { ...selectedTemplate.kopSurat, email: e.target.value }
                        })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="pembukaan">Narasi Pembukaan</Label>
                    <Textarea
                      id="pembukaan"
                      rows={3}
                      value={selectedTemplate.defaultNarrative.pembukaan}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        defaultNarrative: { ...selectedTemplate.defaultNarrative, pembukaan: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="penutup">Narasi Penutup</Label>
                    <Textarea
                      id="penutup"
                      rows={4}
                      value={selectedTemplate.defaultNarrative.penutup}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        defaultNarrative: { ...selectedTemplate.defaultNarrative, penutup: e.target.value }
                      })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="keterangan">Keterangan</Label>
                    <Textarea
                      id="keterangan"
                      rows={2}
                      value={selectedTemplate.defaultNarrative.keterangan}
                      onChange={(e) => setSelectedTemplate({
                        ...selectedTemplate,
                        defaultNarrative: { ...selectedTemplate.defaultNarrative, keterangan: e.target.value }
                      })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is-default"
                      checked={selectedTemplate.id === settings.defaultTemplateId}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSetDefaultTemplate(selectedTemplate.id);
                        }
                      }}
                    />
                    <Label htmlFor="is-default">Jadikan template default</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSaveTemplate} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Template
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Cetak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="page-size">Ukuran Kertas</Label>
                  <Select
                    value={settings.printSettings.pageSize}
                    onValueChange={(value: 'A4' | 'Letter') => 
                      setSettings({
                        ...settings,
                        printSettings: { ...settings.printSettings, pageSize: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4 (210 x 297 mm)</SelectItem>
                      <SelectItem value="Letter">Letter (216 x 279 mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="orientation">Orientasi</Label>
                  <Select
                    value={settings.printSettings.orientation}
                    onValueChange={(value: 'portrait' | 'landscape') => 
                      setSettings({
                        ...settings,
                        printSettings: { ...settings.printSettings, orientation: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Margin (mm)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <Label htmlFor="margin-top" className="text-sm">Atas</Label>
                    <Input
                      id="margin-top"
                      type="number"
                      value={settings.printSettings.margin.top}
                      onChange={(e) => setSettings({
                        ...settings,
                        printSettings: {
                          ...settings.printSettings,
                          margin: { ...settings.printSettings.margin, top: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-bottom" className="text-sm">Bawah</Label>
                    <Input
                      id="margin-bottom"
                      type="number"
                      value={settings.printSettings.margin.bottom}
                      onChange={(e) => setSettings({
                        ...settings,
                        printSettings: {
                          ...settings.printSettings,
                          margin: { ...settings.printSettings.margin, bottom: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-left" className="text-sm">Kiri</Label>
                    <Input
                      id="margin-left"
                      type="number"
                      value={settings.printSettings.margin.left}
                      onChange={(e) => setSettings({
                        ...settings,
                        printSettings: {
                          ...settings.printSettings,
                          margin: { ...settings.printSettings.margin, left: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-right" className="text-sm">Kanan</Label>
                    <Input
                      id="margin-right"
                      type="number"
                      value={settings.printSettings.margin.right}
                      onChange={(e) => setSettings({
                        ...settings,
                        printSettings: {
                          ...settings.printSettings,
                          margin: { ...settings.printSettings.margin, right: Number(e.target.value) }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => toast({ title: "Pengaturan tersimpan", description: "Pengaturan cetak berhasil disimpan." })}>
                <Save className="h-4 w-4 mr-2" />
                Simpan Pengaturan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Template yang dipilih:</Label>
                  <Select
                    value={selectedTemplate.id}
                    onValueChange={(value) => {
                      const template = settings.templates.find(t => t.id === value);
                      if (template) setSelectedTemplate(template);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <BeritaAcaraTemplateComponent data={sampleData} isPreview={true} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
