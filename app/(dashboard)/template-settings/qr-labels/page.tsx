'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import QRLabelTemplate, { MedicineData } from '@/components/print/qr-label-template';
import { Save, Plus, Trash2, Copy, Settings, QrCode, Palette, Eye } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Template settings type
interface QRLabelSettings {
  id: string;
  name: string;
  description: string;
  labelSize: {
    width: number;
    height: number;
    unit: 'mm' | 'in';
  };
  qrCodeSize: number;
  fontSize: {
    medicineName: number;
    producer: number;
    details: number;
    footer: number;
  };
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  showGrid: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mock data
const mockTemplates: QRLabelSettings[] = [
  {
    id: '1',
    name: 'Template Standard',
    description: 'Template standar untuk label QR Code obat',
    labelSize: {
      width: 70,
      height: 35,
      unit: 'mm',
    },
    qrCodeSize: 80,
    fontSize: {
      medicineName: 9,
      producer: 7,
      details: 6,
      footer: 5,
    },
    margins: {
      top: 2,
      bottom: 2,
      left: 2,
      right: 2,
    },
    showGrid: false,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const sampleMedicines: MedicineData[] = [
  {
    id: 'MED-2025-001',
    name: 'Buprofezin 25% EC',
    producer: 'PT. Agro Kimia Indonesia',
    activeIngredient: 'Buprofezin 250 g/L',
    source: 'APBN-2025',
    entryDate: '2025-01-15',
    expiryDate: '2026-01-15',
    location: 'Gudang A-1',
  },
  {
    id: 'MED-2025-002',
    name: 'Chlorpyrifos 20% EC',
    producer: 'PT. Pestisida Nusantara',
    activeIngredient: 'Chlorpyrifos 200 g/L',
    source: 'APBD-2025',
    entryDate: '2025-01-20',
    expiryDate: '2026-01-20',
    location: 'Gudang B-2',
  },
];

export default function QRLabelsSettingsPage() {
  const [templates, setTemplates] = useState<QRLabelSettings[]>(mockTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<QRLabelSettings>(mockTemplates[0]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  const handleSaveTemplate = () => {
    if (isEditingTemplate) {
      // Update existing template
      const updatedTemplates = templates.map(t => 
        t.id === selectedTemplate.id ? { ...selectedTemplate, updatedAt: new Date() } : t
      );
      setTemplates(updatedTemplates);
    } else {
      // Create new template
      const template: QRLabelSettings = {
        ...selectedTemplate,
        id: Date.now().toString(),
        name: selectedTemplate.name || 'Template Baru',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTemplates([...templates, template]);
    }
    setIsEditingTemplate(false);
    toast({
      title: "Template tersimpan",
      description: "Template QR Label berhasil disimpan.",
    });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (templates.length <= 1) {
      toast({
        title: "Tidak dapat menghapus",
        description: "Minimal harus ada satu template.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    
    if (selectedTemplate.id === templateId) {
      setSelectedTemplate(updatedTemplates[0]);
    }
    
    toast({
      title: "Template dihapus",
      description: "Template berhasil dihapus.",
    });
  };

  const handleDuplicateTemplate = (template: QRLabelSettings) => {
    const duplicatedTemplate: QRLabelSettings = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates([...templates, duplicatedTemplate]);
    toast({
      title: "Template diduplikasi",
      description: "Template berhasil diduplikasi.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pengaturan Template QR Label</h1>
          <p className="text-muted-foreground">
            Kelola template dan format label QR Code untuk obat
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
            <QrCode className="h-4 w-4" />
            <span>Template</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Pengaturan</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
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
                {templates.map((template) => (
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
                      Size: {template.labelSize.width}×{template.labelSize.height} {template.labelSize.unit}
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
                    <Label>Ukuran Label</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <Label htmlFor="width" className="text-sm">Lebar</Label>
                        <Input
                          id="width"
                          type="number"
                          value={selectedTemplate.labelSize.width}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            labelSize: { ...selectedTemplate.labelSize, width: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-sm">Tinggi</Label>
                        <Input
                          id="height"
                          type="number"
                          value={selectedTemplate.labelSize.height}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            labelSize: { ...selectedTemplate.labelSize, height: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit" className="text-sm">Unit</Label>
                        <Select
                          value={selectedTemplate.labelSize.unit}
                          onValueChange={(value: 'mm' | 'in') => setSelectedTemplate({
                            ...selectedTemplate,
                            labelSize: { ...selectedTemplate.labelSize, unit: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mm">mm</SelectItem>
                            <SelectItem value="in">inch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="qr-size">Ukuran QR Code (%)</Label>
                    <Input
                      id="qr-size"
                      type="number"
                      value={selectedTemplate.qrCodeSize}
                      onChange={(e) => setSelectedTemplate({ ...selectedTemplate, qrCodeSize: Number(e.target.value) })}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label>Ukuran Font (px)</Label>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="font-medicine" className="text-sm">Nama Obat</Label>
                        <Input
                          id="font-medicine"
                          type="number"
                          value={selectedTemplate.fontSize.medicineName}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            fontSize: { ...selectedTemplate.fontSize, medicineName: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="font-producer" className="text-sm">Produsen</Label>
                        <Input
                          id="font-producer"
                          type="number"
                          value={selectedTemplate.fontSize.producer}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            fontSize: { ...selectedTemplate.fontSize, producer: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="font-details" className="text-sm">Detail</Label>
                        <Input
                          id="font-details"
                          type="number"
                          value={selectedTemplate.fontSize.details}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            fontSize: { ...selectedTemplate.fontSize, details: Number(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="font-footer" className="text-sm">Footer</Label>
                        <Input
                          id="font-footer"
                          type="number"
                          value={selectedTemplate.fontSize.footer}
                          onChange={(e) => setSelectedTemplate({
                            ...selectedTemplate,
                            fontSize: { ...selectedTemplate.fontSize, footer: Number(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-grid"
                      checked={selectedTemplate.showGrid}
                      onCheckedChange={(checked) => setSelectedTemplate({ ...selectedTemplate, showGrid: checked })}
                    />
                    <Label htmlFor="show-grid">Tampilkan grid (untuk debug)</Label>
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
              <CardTitle>Pengaturan Global</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template Default</Label>
                <Select value={selectedTemplate.id}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button>
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
                      const template = templates.find(t => t.id === value);
                      if (template) setSelectedTemplate(template);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
                  <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                    <QRLabelTemplate 
                      medicines={sampleMedicines} 
                      showGrid={selectedTemplate.showGrid}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
