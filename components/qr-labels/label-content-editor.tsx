'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TextStyleEditor from './text-style-editor';
import type {
  LabelTemplateConfig,
  LabelContentConfig,
  TextStyle,
  SeparatorStyle,
  PesticideColorEntry,
} from '@/lib/types/qr-label-template';
import { PESTICIDE_COLORS } from '@/lib/data/mock-qr-label-templates';
import {
  QrCode,
  MapPin,
  Pill,
  Building2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabelContentEditorProps {
  template: LabelTemplateConfig;
  onChange: (template: LabelTemplateConfig) => void;
  onSave: () => void;
  onBack: () => void;
}

// --- Collapsible Section ---
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, icon, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none pb-2"
        onClick={() => setOpen(!open)}
      >
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {icon}
            {title}
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>
      {open && <CardContent className="space-y-4 pt-0">{children}</CardContent>}
    </Card>
  );
};

const LabelContentEditor: React.FC<LabelContentEditorProps> = ({
  template,
  onChange,
  onSave,
  onBack,
}) => {
  const content = template.content;
  const isRak = template.category === 'rak';
  const isObat = template.category === 'obat';

  const updateContent = (partial: Partial<LabelContentConfig>) => {
    onChange({ ...template, content: { ...content, ...partial } });
  };

  const updateTextStyle = (
    section: string,
    field: string,
    style: TextStyle
  ) => {
    if (section === 'qrSet') {
      updateContent({
        qrSet: { ...content.qrSet, idStyle: style },
      });
    } else if (section === 'rakCore' && content.rakCore) {
      updateContent({
        rakCore: { ...content.rakCore, [field]: style },
      });
    } else if (section === 'obatCore' && content.obatCore) {
      updateContent({
        obatCore: { ...content.obatCore, [field]: style },
      });
    } else if (section === 'logoSet') {
      updateContent({
        logoSet: { ...content.logoSet, [field]: style },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* QR Set */}
      <Section title="QR Set" icon={<QrCode className="h-4 w-4" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Ukuran QR Code (cm)</Label>
            <Input
              type="number"
              step="0.1"
              value={content.qrSet.qrSize}
              onChange={(e) =>
                updateContent({
                  qrSet: { ...content.qrSet, qrSize: Number(e.target.value) },
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Posisi QR Code</Label>
            <Select
              value={content.qrSet.qrPosition}
              onValueChange={(v: 'left' | 'center' | 'right') =>
                updateContent({
                  qrSet: { ...content.qrSet, qrPosition: v },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Rata Kiri</SelectItem>
                <SelectItem value="center">Tengah</SelectItem>
                <SelectItem value="right">Rata Kanan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TextStyleEditor
          label="ID QR Code"
          value={content.qrSet.idStyle}
          onChange={(s) => updateTextStyle('qrSet', 'idStyle', s)}
        />
      </Section>

      {/* Rak Core */}
      {isRak && content.rakCore && (
        <Section title="Set Inti Rak" icon={<MapPin className="h-4 w-4" />}>
          <TextStyleEditor
            label="Lokasi Rak (Nama Rak)"
            value={content.rakCore.lokasiRak}
            onChange={(s) => updateTextStyle('rakCore', 'lokasiRak', s)}
          />
          <TextStyleEditor
            label="Detail Lokasi Gudang"
            value={content.rakCore.detailLokasi}
            onChange={(s) => updateTextStyle('rakCore', 'detailLokasi', s)}
          />
        </Section>
      )}

      {/* Obat Core */}
      {isObat && content.obatCore && (
        <Section title="Set Inti Obat" icon={<Pill className="h-4 w-4" />}>
          <TextStyleEditor
            label="Jenis Pestisida"
            value={content.obatCore.jenisPestisida}
            onChange={(s) => updateTextStyle('obatCore', 'jenisPestisida', s)}
          />
          <TextStyleEditor
            label="Merek Obat"
            value={content.obatCore.merekObat}
            onChange={(s) => updateTextStyle('obatCore', 'merekObat', s)}
          />
          <TextStyleEditor
            label="Kandungan"
            value={content.obatCore.kandungan}
            onChange={(s) => updateTextStyle('obatCore', 'kandungan', s)}
          />
          <TextStyleEditor
            label="Kadaluarsa"
            value={content.obatCore.kadaluarsa}
            onChange={(s) => updateTextStyle('obatCore', 'kadaluarsa', s)}
          />
          <TextStyleEditor
            label="Sumber Dana"
            value={content.obatCore.sumberDana}
            onChange={(s) => updateTextStyle('obatCore', 'sumberDana', s)}
          />

          {/* Color Block */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Blok Warna Jenis Pestisida</Label>
              <Switch
                checked={content.obatCore.colorBlock.enabled}
                onCheckedChange={(checked) =>
                  updateContent({
                    obatCore: {
                      ...content.obatCore!,
                      colorBlock: { ...content.obatCore!.colorBlock, enabled: checked },
                    },
                  })
                }
              />
            </div>
            {content.obatCore.colorBlock.enabled && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Tinggi Blok (mm)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={content.obatCore.colorBlock.height}
                    className="w-24"
                    onChange={(e) =>
                      updateContent({
                        obatCore: {
                          ...content.obatCore!,
                          colorBlock: {
                            ...content.obatCore!.colorBlock,
                            height: Number(e.target.value),
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Daftar Warna</Label>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {(content.obatCore.colorBlock.colors.length > 0
                      ? content.obatCore.colorBlock.colors
                      : PESTICIDE_COLORS
                    ).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2 rounded-md border p-2"
                      >
                        <input
                          type="color"
                          value={entry.color}
                          onChange={(e) => {
                            const newColors = (content.obatCore!.colorBlock.colors.length > 0
                              ? content.obatCore!.colorBlock.colors
                              : [...PESTICIDE_COLORS]
                            ).map((c) =>
                              c.id === entry.id ? { ...c, color: e.target.value } : c
                            );
                            updateContent({
                              obatCore: {
                                ...content.obatCore!,
                                colorBlock: {
                                  ...content.obatCore!.colorBlock,
                                  colors: newColors,
                                },
                              },
                            });
                          }}
                          className="h-7 w-7 cursor-pointer rounded border-0"
                        />
                        <div className="flex-1 truncate text-xs">
                          {entry.jenis}
                        </div>
                        <Badge
                          className="border text-[10px]"
                          style={{ backgroundColor: entry.color, color: '#fff', borderColor: entry.color }}
                        >
                          {entry.id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Section>
      )}

      {/* Logo Set */}
      <Section title="Set Logo & Dinas" icon={<Building2 className="h-4 w-4" />}>
        {/* Separator */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Garis Pemisah</Label>
            <Select
              value={content.logoSet.separator.style}
              onValueChange={(v: SeparatorStyle) =>
                updateContent({
                  logoSet: {
                    ...content.logoSet,
                    separator: { ...content.logoSet.separator, style: v },
                  },
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak Ada</SelectItem>
                <SelectItem value="solid">Garis</SelectItem>
                <SelectItem value="dashed">Putus-putus</SelectItem>
                <SelectItem value="dotted">Titik-titik</SelectItem>
                <SelectItem value="double">Ganda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Warna Garis</Label>
            <input
              type="color"
              value={content.logoSet.separator.color}
              onChange={(e) =>
                updateContent({
                  logoSet: {
                    ...content.logoSet,
                    separator: { ...content.logoSet.separator, color: e.target.value },
                  },
                })
              }
              className="h-9 w-full cursor-pointer rounded border"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Ketebalan (px)</Label>
            <Input
              type="number"
              min={0}
              max={5}
              value={content.logoSet.separator.thickness}
              onChange={(e) =>
                updateContent({
                  logoSet: {
                    ...content.logoSet,
                    separator: { ...content.logoSet.separator, thickness: Number(e.target.value) },
                  },
                })
              }
            />
          </div>
        </div>

        <Separator />

        {/* Logo */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Logo Dinas</Label>
            <Switch
              checked={content.logoSet.logo.enabled}
              onCheckedChange={(checked) =>
                updateContent({
                  logoSet: {
                    ...content.logoSet,
                    logo: { ...content.logoSet.logo, enabled: checked },
                  },
                })
              }
            />
          </div>
          {content.logoSet.logo.enabled && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Lebar (mm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={content.logoSet.logo.width}
                  onChange={(e) =>
                    updateContent({
                      logoSet: {
                        ...content.logoSet,
                        logo: { ...content.logoSet.logo, width: Number(e.target.value) },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tinggi (mm)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={content.logoSet.logo.height}
                  onChange={(e) =>
                    updateContent({
                      logoSet: {
                        ...content.logoSet,
                        logo: { ...content.logoSet.logo, height: Number(e.target.value) },
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Posisi</Label>
                <Select
                  value={content.logoSet.logo.position}
                  onValueChange={(v: 'left' | 'center' | 'right') =>
                    updateContent({
                      logoSet: {
                        ...content.logoSet,
                        logo: { ...content.logoSet.logo, position: v },
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Kiri</SelectItem>
                    <SelectItem value="center">Tengah</SelectItem>
                    <SelectItem value="right">Kanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Institution Text */}
        <div className="space-y-1.5">
          <Label className="text-xs">Teks Nama Dinas</Label>
          <Input
            value={content.logoSet.namaDinasText}
            onChange={(e) =>
              updateContent({
                logoSet: { ...content.logoSet, namaDinasText: e.target.value },
              })
            }
            placeholder="Nama Dinas / Instansi"
          />
        </div>
        <TextStyleEditor
          label="Style Nama Dinas"
          value={content.logoSet.namaDinas}
          onChange={(s) => updateTextStyle('logoSet', 'namaDinas', s)}
        />

        <div className="space-y-1.5">
          <Label className="text-xs">Teks Bidang</Label>
          <Input
            value={content.logoSet.bidangText}
            onChange={(e) =>
              updateContent({
                logoSet: { ...content.logoSet, bidangText: e.target.value },
              })
            }
            placeholder="Nama Bidang"
          />
        </div>
        <TextStyleEditor
          label="Style Bidang"
          value={content.logoSet.bidang}
          onChange={(s) => updateTextStyle('logoSet', 'bidang', s)}
        />

        <div className="space-y-1.5">
          <Label className="text-xs">Teks Alamat</Label>
          <Input
            value={content.logoSet.alamatText}
            onChange={(e) =>
              updateContent({
                logoSet: { ...content.logoSet, alamatText: e.target.value },
              })
            }
            placeholder="Alamat instansi"
          />
        </div>
        <TextStyleEditor
          label="Style Alamat"
          value={content.logoSet.alamat}
          onChange={(s) => updateTextStyle('logoSet', 'alamat', s)}
        />

        <Separator />

        {/* Additional Notes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Catatan Tambahan</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                updateContent({
                  logoSet: {
                    ...content.logoSet,
                    catatanTambahan: {
                      lines: [
                        ...content.logoSet.catatanTambahan.lines,
                        {
                          text: '',
                          style: {
                            fontSize: 9,
                            bold: false,
                            italic: false,
                            underline: false,
                            color: '#000000',
                            align: 'center',
                            allCaps: false,
                          },
                        },
                      ],
                    },
                  },
                });
              }}
            >
              <Plus className="mr-1 h-3 w-3" /> Tambah Baris
            </Button>
          </div>
          {content.logoSet.catatanTambahan.lines.map((line, idx) => (
            <div key={idx} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs">Teks Baris {idx + 1}</Label>
                  <Input
                    value={line.text}
                    onChange={(e) => {
                      const newLines = [...content.logoSet.catatanTambahan.lines];
                      newLines[idx] = { ...newLines[idx], text: e.target.value };
                      updateContent({
                        logoSet: {
                          ...content.logoSet,
                          catatanTambahan: { lines: newLines },
                        },
                      });
                    }}
                    placeholder="Teks catatan..."
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-5 text-destructive"
                  onClick={() => {
                    const newLines = content.logoSet.catatanTambahan.lines.filter(
                      (_, i) => i !== idx
                    );
                    updateContent({
                      logoSet: {
                        ...content.logoSet,
                        catatanTambahan: { lines: newLines },
                      },
                    });
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <TextStyleEditor
                label=""
                value={line.style}
                compact
                onChange={(s) => {
                  const newLines = [...content.logoSet.catatanTambahan.lines];
                  newLines[idx] = { ...newLines[idx], style: s };
                  updateContent({
                    logoSet: {
                      ...content.logoSet,
                      catatanTambahan: { lines: newLines },
                    },
                  });
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button onClick={onSave}>
          Simpan Template
        </Button>
      </div>
    </div>
  );
};

export default LabelContentEditor;
