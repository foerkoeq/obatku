'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LabelTemplateForm,
  LabelContentEditor,
  LabelPreview,
} from '@/components/qr-labels';
import type {
  LabelTemplateConfig,
  LabelCategory,
  PageView,
} from '@/lib/types/qr-label-template';
import {
  DEFAULT_TEMPLATES,
  createBlankTemplate,
  SAMPLE_RACK_DATA,
  SAMPLE_MEDICINE_DATA,
} from '@/lib/data/mock-qr-label-templates';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Plus,
  Settings,
  Star,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Check,
  QrCode,
  MapPin,
  Pill,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function QRLabelsSettingsPage() {
  // --- State ---
  const [templates, setTemplates] = useState<LabelTemplateConfig[]>(DEFAULT_TEMPLATES);
  const [view, setView] = useState<PageView>('category-select');
  const [selectedCategory, setSelectedCategory] = useState<LabelCategory | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplateConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formStep, setFormStep] = useState<'layout' | 'content'>('layout');

  // --- Derived ---
  const filteredTemplates = templates.filter(
    (t) => t.category === selectedCategory && !t.isArchived
  );
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

  // --- Navigation ---
  const goTo = useCallback((nextView: PageView) => setView(nextView), []);

  const goBack = useCallback(() => {
    switch (view) {
      case 'template-list':
        setView('category-select');
        setSelectedCategory(null);
        break;
      case 'template-detail':
        setView('template-list');
        setSelectedTemplateId(null);
        break;
      case 'template-form':
      case 'content-editor':
        if (formStep === 'content') {
          setFormStep('layout');
          setView('template-form');
        } else {
          setEditingTemplate(null);
          setIsEditing(false);
          setFormStep('layout');
          setView(selectedTemplateId ? 'template-detail' : 'template-list');
        }
        break;
      default:
        setView('category-select');
    }
  }, [view, formStep, selectedTemplateId]);

  // --- CRUD Operations ---
  const handleSelectCategory = (cat: LabelCategory) => {
    setSelectedCategory(cat);
    goTo('template-list');
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    goTo('template-detail');
  };

  const handleSetDefault = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => ({
        ...t,
        isDefault: t.category === selectedCategory ? t.id === id : t.isDefault,
      }))
    );
    toast({ title: 'Template default diperbarui', description: 'Template berhasil ditetapkan sebagai default.' });
  };

  const handleStartCreate = () => {
    if (!selectedCategory) return;
    const blank = createBlankTemplate(selectedCategory);
    setEditingTemplate(blank);
    setIsEditing(false);
    setFormStep('layout');
    goTo('template-form');
  };

  const handleStartEdit = (tpl: LabelTemplateConfig) => {
    setEditingTemplate({ ...tpl });
    setIsEditing(true);
    setFormStep('layout');
    goTo('template-form');
  };

  const handleDuplicate = (tpl: LabelTemplateConfig) => {
    const dup: LabelTemplateConfig = {
      ...tpl,
      id: `tpl-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, dup]);
    toast({ title: 'Template diduplikasi' });
  };

  const handleDelete = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (tpl?.isDefault) {
      toast({ title: 'Tidak dapat menghapus', description: 'Template default tidak bisa dihapus.', variant: 'destructive' });
      return;
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
      goTo('template-list');
    }
    toast({ title: 'Template dihapus' });
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    const now = new Date().toISOString();
    if (isEditing) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: now } : t))
      );
    } else {
      setTemplates((prev) => [...prev, { ...editingTemplate, createdAt: now, updatedAt: now }]);
    }
    setSelectedTemplateId(editingTemplate.id);
    setEditingTemplate(null);
    setIsEditing(false);
    setFormStep('layout');
    goTo('template-detail');
    toast({ title: 'Template tersimpan', description: `Template "${editingTemplate.name}" berhasil disimpan.` });
  };

  // --- Breadcrumb ---
  const Breadcrumb = () => {
    const crumbs: { label: string; onClick?: () => void }[] = [
      { label: 'Label QR Code', onClick: () => { setView('category-select'); setSelectedCategory(null); } },
    ];
    if (selectedCategory) {
      crumbs.push({
        label: selectedCategory === 'rak' ? 'Label Rak' : 'Label Obat',
        onClick: () => { setView('template-list'); setSelectedTemplateId(null); },
      });
    }
    if (view === 'template-detail' && selectedTemplate) {
      crumbs.push({ label: selectedTemplate.name });
    }
    if (view === 'template-form' || view === 'content-editor') {
      crumbs.push({ label: isEditing ? 'Edit Template' : 'Template Baru' });
    }

    return (
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3 w-3" />}
            {c.onClick && i < crumbs.length - 1 ? (
              <button onClick={c.onClick} className="hover:text-foreground transition-colors">
                {c.label}
              </button>
            ) : (
              <span className={i === crumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                {c.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  // ============================================================================
  // VIEW: Category Selection
  // ============================================================================
  const renderCategorySelect = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <QrCode className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Pilih Jenis Label</h2>
        <p className="text-sm text-muted-foreground">
          Pilih kategori label yang ingin Anda atur template-nya
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
        <button
          onClick={() => handleSelectCategory('rak')}
          className="group relative overflow-hidden rounded-xl border-2 border-muted p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
        >
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-blue-500/10 transition-transform group-hover:scale-150" />
          <div className="relative space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Label Rak</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Stiker label untuk rak penyimpanan gudang, berisi QR code lokasi rak
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge color="secondary" className="text-[10px]">No. 119</Badge>
              <span>{templates.filter((t) => t.category === 'rak' && !t.isArchived).length} template</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleSelectCategory('obat')}
          className="group relative overflow-hidden rounded-xl border-2 border-muted p-6 text-left transition-all hover:border-primary hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
        >
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/10 transition-transform group-hover:scale-150" />
          <div className="relative space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <Pill className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Label Obat</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Stiker label untuk obat/pestisida, berisi QR code identitas produk
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge color="secondary" className="text-[10px]">No. 101</Badge>
              <span>{templates.filter((t) => t.category === 'obat' && !t.isArchived).length} template</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // VIEW: Template List
  // ============================================================================
  const renderTemplateList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {selectedCategory === 'rak' ? 'Template Label Rak' : 'Template Label Obat'}
        </h2>
        <Button size="sm" onClick={handleStartCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Template
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((tpl) => (
          <Card
            key={tpl.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md active:scale-[0.99]',
              tpl.isDefault && 'ring-2 ring-primary/50'
            )}
            onClick={() => handleSelectTemplate(tpl.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{tpl.name}</CardTitle>
                {tpl.isDefault && (
                  <Badge className="text-[10px]">
                    <Star className="mr-0.5 h-2.5 w-2.5" /> Default
                  </Badge>
                )}
              </div>
              <CardDescription className="text-xs">{tpl.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <Badge className="border bg-transparent text-foreground">{tpl.paper.width}×{tpl.paper.height}cm</Badge>
                <Badge className="border bg-transparent text-foreground">{tpl.label.width}×{tpl.label.height}mm</Badge>
                <Badge className="border bg-transparent text-foreground">{tpl.labelsPerSheet} label</Badge>
                <Badge className="border bg-transparent text-foreground">No. {tpl.labelNumber}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        <button
          onClick={handleStartCreate}
          className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted p-6 text-muted-foreground transition-all hover:border-primary hover:text-primary"
        >
          <Plus className="h-8 w-8" />
          <span className="text-sm font-medium">Tambah Template Baru</span>
        </button>
      </div>
    </div>
  );

  // ============================================================================
  // VIEW: Template Detail
  // ============================================================================
  const renderTemplateDetail = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{selectedTemplate.name}</h2>
              {selectedTemplate.isDefault && (
                <Badge><Star className="mr-0.5 h-3 w-3" /> Default</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!selectedTemplate.isDefault && (
              <Button size="sm" variant="outline" onClick={() => handleSetDefault(selectedTemplate.id)}>
                <Check className="mr-1.5 h-3.5 w-3.5" /> Tetapkan Default
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => handleStartEdit(selectedTemplate)}>
              <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDuplicate(selectedTemplate)}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Duplikasi
            </Button>
            {!selectedTemplate.isDefault && (
              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(selectedTemplate.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Hapus
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Ukuran Kertas</div>
            <div className="text-sm font-medium">{selectedTemplate.paper.width} × {selectedTemplate.paper.height} cm</div>
            <div className="text-xs text-muted-foreground capitalize">{selectedTemplate.paper.orientation}</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Ukuran Label</div>
            <div className="text-sm font-medium">{selectedTemplate.label.width} × {selectedTemplate.label.height} mm</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Label per Lembar</div>
            <div className="text-sm font-medium">{selectedTemplate.labelsPerSheet}</div>
            <div className="text-xs text-muted-foreground">{selectedTemplate.columns} kol × {selectedTemplate.rows} baris</div>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <div className="text-xs text-muted-foreground">Margin</div>
            <div className="text-xs font-medium">
              A:{selectedTemplate.margins.top} B:{selectedTemplate.margins.bottom} Ki:{selectedTemplate.margins.left} Ka:{selectedTemplate.margins.right} cm
            </div>
          </CardContent></Card>
        </div>

        <Tabs defaultValue="preview">
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" /> Preview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Detail Konten
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-4">
            <LabelPreview
              template={selectedTemplate}
              rackData={SAMPLE_RACK_DATA}
              medicineData={SAMPLE_MEDICINE_DATA}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <ContentSummaryView template={selectedTemplate} />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  // ============================================================================
  // VIEW: Template Form
  // ============================================================================
  const renderTemplateForm = () => {
    if (!editingTemplate) return null;

    if (formStep === 'content') {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Pengaturan Konten</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Atur tampilan konten di setiap label — QR code, teks, warna, dan logo
          </p>

          <div className="grid gap-6 lg:grid-cols-[1fr,minmax(340px,420px)]">
            {/* Left: Content Editor */}
            <div className="min-w-0">
              <LabelContentEditor
                template={editingTemplate}
                onChange={setEditingTemplate}
                onSave={handleSaveTemplate}
                onBack={() => setFormStep('layout')}
              />
            </div>

            {/* Right: Sticky Live Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> Preview Langsung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-auto rounded border bg-gray-50 p-2 dark:bg-gray-900" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                      <div style={{ transform: 'scale(0.3)', transformOrigin: 'top left', width: `${editingTemplate.paper.width / 0.3}cm` }}>
                        <LabelPreview template={editingTemplate} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Mobile: Preview below (collapsible) */}
            <div className="lg:hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Preview Langsung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto rounded border bg-gray-50 p-2 dark:bg-gray-900">
                    <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: `${editingTemplate.paper.width / 0.25}cm` }}>
                      <LabelPreview template={editingTemplate} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Edit Template' : 'Template Baru'}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Atur ukuran kertas, ukuran label, margin, jarak, dan tata letak sel
        </p>

        <LabelTemplateForm
          value={editingTemplate}
          onChange={setEditingTemplate}
          onNext={() => setFormStep('content')}
          onCancel={goBack}
        />
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="container mx-auto max-w-6xl py-4 px-4 sm:py-6 space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {view !== 'category-select' && (
            <Button variant="ghost" size="sm" onClick={goBack} className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Pengaturan Template Label QR Code</h1>
            <Breadcrumb />
          </div>
        </div>
      </div>

      <Separator />

      {view === 'category-select' && renderCategorySelect()}
      {view === 'template-list' && renderTemplateList()}
      {view === 'template-detail' && renderTemplateDetail()}
      {(view === 'template-form' || view === 'content-editor') && renderTemplateForm()}
    </div>
  );
}

// ============================================================================
// Content Summary (read-only view)
// ============================================================================
function ContentSummaryView({ template }: { template: LabelTemplateConfig }) {
  const { content } = template;
  const isRak = template.category === 'rak';

  const StyleBadge = ({ style, label }: { style: { fontSize: number; bold: boolean; italic: boolean; underline: boolean; allCaps: boolean; color: string; align: string }; label: string }) => (
    <div className="flex items-center gap-2 rounded border p-2">
      <div className="h-4 w-4 rounded-sm border" style={{ backgroundColor: style.color }} />
      <div className="flex-1">
        <div className="text-xs font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground">
          {style.fontSize}pt{style.bold && ' • Bold'}{style.italic && ' • Italic'}{style.underline && ' • Underline'}{style.allCaps && ' • CAPS'}{' • '}
          {style.align === 'left' ? 'Kiri' : style.align === 'center' ? 'Tengah' : 'Kanan'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">QR Set</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs">QR Size: <strong>{content.qrSet.qrSize}cm</strong> | Posisi: <strong>{content.qrSet.qrPosition}</strong></div>
          <StyleBadge style={content.qrSet.idStyle} label="ID QR Code" />
        </CardContent>
      </Card>

      {isRak && content.rakCore && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Set Inti Rak</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <StyleBadge style={content.rakCore.lokasiRak} label="Lokasi Rak" />
            <StyleBadge style={content.rakCore.detailLokasi} label="Detail Lokasi" />
          </CardContent>
        </Card>
      )}

      {!isRak && content.obatCore && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Set Inti Obat</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <StyleBadge style={content.obatCore.jenisPestisida} label="Jenis Pestisida" />
            <StyleBadge style={content.obatCore.merekObat} label="Merek Obat" />
            <StyleBadge style={content.obatCore.kandungan} label="Kandungan" />
            <StyleBadge style={content.obatCore.kadaluarsa} label="Kadaluarsa" />
            <StyleBadge style={content.obatCore.sumberDana} label="Sumber Dana" />
            {content.obatCore.colorBlock.enabled && (
              <div className="mt-2">
                <div className="text-xs text-muted-foreground mb-1">Blok Warna Aktif ({content.obatCore.colorBlock.height}mm)</div>
                <div className="flex flex-wrap gap-1">
                  {content.obatCore.colorBlock.colors.slice(0, 12).map((c) => (
                    <div key={c.id} className="flex items-center gap-1 rounded border px-1.5 py-0.5">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: c.color }} />
                      <span className="text-[9px]">{c.jenis}</span>
                    </div>
                  ))}
                  {content.obatCore.colorBlock.colors.length > 12 && (
                    <Badge className="border bg-transparent text-foreground text-[9px]">+{content.obatCore.colorBlock.colors.length - 12} lainnya</Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Set Logo & Dinas</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="text-xs">
            Garis: <strong>{content.logoSet.separator.style}</strong> | Logo:{' '}
            <strong>{content.logoSet.logo.enabled ? 'Aktif' : 'Nonaktif'}</strong>
            {content.logoSet.logo.enabled && <> ({content.logoSet.logo.width}×{content.logoSet.logo.height}mm)</>}
          </div>
          <div className="text-xs mt-1 truncate">&ldquo;{content.logoSet.namaDinasText}&rdquo;</div>
          <StyleBadge style={content.logoSet.namaDinas} label="Nama Dinas" />
          <div className="text-xs mt-1 truncate">&ldquo;{content.logoSet.bidangText}&rdquo;</div>
          <StyleBadge style={content.logoSet.bidang} label="Bidang" />
          <div className="text-xs mt-1 truncate">&ldquo;{content.logoSet.alamatText}&rdquo;</div>
          <StyleBadge style={content.logoSet.alamat} label="Alamat" />
          {content.logoSet.catatanTambahan.lines.length > 0 && (
            <div className="text-xs text-muted-foreground">{content.logoSet.catatanTambahan.lines.length} catatan tambahan</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
