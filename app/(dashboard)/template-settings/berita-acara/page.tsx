'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BADocumentPreview } from '@/components/berita-acara/ba-document-preview';
import { LogoUploader } from '@/components/berita-acara/logo-uploader';
import { TextFormatToolbar } from '@/components/berita-acara/text-format-toolbar';
import type { BATemplateConfig, BAPageView, BAPihakPertamaBiodata } from '@/lib/types/berita-acara';
import {
  DEFAULT_BA_TEMPLATES,
  SAMPLE_BA_PREVIEW,
  PAPER_SIZES,
  AVAILABLE_FONTS,
  createBlankBATemplate,
  DEFAULT_TEXT_FORMAT,
} from '@/lib/data/mock-berita-acara-templates';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Star,
  Edit3,
  Eye,
  Save,
  ChevronRight,
  FileText,
  ShieldCheck,
  Type,
  Layout,
  BookOpen,
  PenLine,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function BeritaAcaraSettingsPage() {
  // --- State ---
  const [templates, setTemplates] = useState<BATemplateConfig[]>(DEFAULT_BA_TEMPLATES);
  const [view, setView] = useState<BAPageView>('template-list');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<BATemplateConfig | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);


  // --- Derived ---
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) || null;
  const defaultTemplate = templates.find((t) => t.isDefault) || templates[0];

  // --- Navigation ---
  const goBack = useCallback(() => {
    switch (view) {
      case 'template-detail':
        setView('template-list');
        setSelectedTemplateId(null);
        break;
      case 'template-customize':
        setView('template-detail');
        setEditingTemplate(null);
        break;
      default:
        setView('template-list');
    }
  }, [view]);

  // --- CRUD ---
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setView('template-detail');
  };

  const handleSetDefault = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => ({ ...t, isDefault: t.id === id }))
    );
    toast({ title: 'Template default diperbarui', description: 'Template berhasil ditetapkan sebagai default.' });
  };

  const handleStartCreate = () => {
    const blank = createBlankBATemplate();
    blank.name = `BA-${String(templates.length + 1).padStart(2, '0')}`;
    blank.code = blank.name;
    blank.description = 'Template baru';
    setEditingTemplate(blank);
    setView('template-customize');
  };

  const handleStartEdit = (tpl: BATemplateConfig) => {
    setEditingTemplate({ ...tpl });
    setView('template-customize');
  };

  const handleDuplicate = (tpl: BATemplateConfig) => {
    const now = new Date().toISOString();
    const dup: BATemplateConfig = {
      ...tpl,
      id: `ba-${Date.now()}`,
      name: `${tpl.name} (Copy)`,
      code: `${tpl.code}-COPY`,
      isDefault: false,
      isProtected: false,
      createdAt: now,
      updatedAt: now,
    };
    setTemplates((prev) => [...prev, dup]);
    toast({ title: 'Template diduplikasi', description: `"${dup.name}" berhasil dibuat.` });
  };

  const handleConfirmDelete = (id: string) => {
    const tpl = templates.find((t) => t.id === id);
    if (tpl?.isProtected) {
      toast({ title: 'Tidak dapat menghapus', description: 'Template bawaan tidak bisa dihapus.', variant: 'destructive' });
      return;
    }
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!templateToDelete) return;
    setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete));
    if (selectedTemplateId === templateToDelete) {
      setSelectedTemplateId(null);
      setView('template-list');
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
    toast({ title: 'Template dihapus' });
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    const now = new Date().toISOString();
    const isExisting = templates.some((t) => t.id === editingTemplate.id);

    if (isExisting) {
      setTemplates((prev) =>
        prev.map((t) => (t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: now } : t))
      );
    } else {
      setTemplates((prev) => [...prev, { ...editingTemplate, createdAt: now, updatedAt: now }]);
    }

    setSelectedTemplateId(editingTemplate.id);
    setEditingTemplate(null);
    setView('template-detail');
    toast({ title: 'Template tersimpan', description: `"${editingTemplate.name}" berhasil disimpan.` });
  };

  // --- Breadcrumb ---
  const Breadcrumb = () => {
    const crumbs: { label: string; onClick?: () => void }[] = [
      {
        label: 'Berita Acara',
        onClick: () => {
          setView('template-list');
          setSelectedTemplateId(null);
          setEditingTemplate(null);
        },
      },
    ];
    if (view === 'template-detail' && selectedTemplate) {
      crumbs.push({ label: selectedTemplate.name });
    }
    if (view === 'template-customize') {
      if (selectedTemplate) {
        crumbs.push({
          label: selectedTemplate.name,
          onClick: () => {
            setView('template-detail');
            setEditingTemplate(null);
          },
        });
      }
      crumbs.push({ label: editingTemplate ? 'Sesuaikan' : 'Template Baru' });
    }

    return (
      <nav className="flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            {c.onClick && i < crumbs.length - 1 ? (
              <button onClick={c.onClick} className="hover:text-foreground transition-colors whitespace-nowrap">
                {c.label}
              </button>
            ) : (
              <span className={cn('whitespace-nowrap', i === crumbs.length - 1 && 'text-foreground font-medium')}>
                {c.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  // ============================================================================
  // VIEW: Template List
  // ============================================================================
  const renderTemplateList = () => (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center space-y-2 px-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <FileText className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Template Berita Acara</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Kelola template surat Berita Acara Serah Terima. Template default digunakan saat membuat dokumen baru.
        </p>
      </div>

      {/* Template Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <Card
            key={tpl.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md active:scale-[0.99] relative group',
              tpl.isDefault && 'ring-2 ring-primary/50'
            )}
            onClick={() => handleSelectTemplate(tpl.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 text-xs font-bold',
                    tpl.isDefault
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {tpl.code || 'BA'}
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{tpl.name}</CardTitle>
                    <CardDescription className="text-xs line-clamp-1">{tpl.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {tpl.isDefault && (
                    <Badge className="text-[10px] gap-0.5">
                      <Star className="h-2.5 w-2.5" /> Default
                    </Badge>
                  )}
                  {tpl.isProtected && (
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <Badge className="border bg-transparent text-foreground">
                  {PAPER_SIZES[tpl.paper.size]?.label.split(' ')[0] || tpl.paper.size}
                </Badge>
                <Badge className="border bg-transparent text-foreground">
                  {tpl.font.family}
                </Badge>
                <Badge className="border bg-transparent text-foreground">
                  {tpl.margins.top}cm margin
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Diperbarui: {new Date(tpl.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>
        ))}

        {/* Add New Button */}
        <button
          onClick={handleStartCreate}
          className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted p-6 text-muted-foreground transition-all hover:border-primary hover:text-primary active:scale-[0.98]"
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
      <div className="space-y-5">
        {/* Template Info Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
              {selectedTemplate.isDefault && (
                <Badge className="gap-0.5"><Star className="h-3 w-3" /> Default</Badge>
              )}
              {selectedTemplate.isProtected && (
                <Badge color="default" className="gap-0.5 border bg-transparent text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" /> Bawaan
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
          {!selectedTemplate.isDefault && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSetDefault(selectedTemplate.id)}
              className="gap-1.5"
            >
              <Star className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tetapkan</span> Default
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => handleStartEdit(selectedTemplate)}
            className="gap-1.5"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Sesuaikan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicate(selectedTemplate)}
            className="gap-1.5"
          >
            <Copy className="h-3.5 w-3.5" />
            Duplikasi
          </Button>
          {!selectedTemplate.isProtected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleConfirmDelete(selectedTemplate.id)}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus
            </Button>
          )}
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Kertas</p>
            <p className="text-sm font-semibold">{selectedTemplate.paper.size}</p>
            <p className="text-xs text-muted-foreground">{PAPER_SIZES[selectedTemplate.paper.size]?.label}</p>
          </div>
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Margin</p>
            <p className="text-sm font-semibold">{selectedTemplate.margins.top} cm</p>
            <p className="text-xs text-muted-foreground">Semua sisi</p>
          </div>
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Font</p>
            <p className="text-sm font-semibold">{selectedTemplate.font.family}</p>
            <p className="text-xs text-muted-foreground">{selectedTemplate.font.baseSizePt}pt</p>
          </div>
          <div className="rounded-lg border p-3 space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Orientasi</p>
            <p className="text-sm font-semibold capitalize">{selectedTemplate.paper.orientation}</p>
            <p className="text-xs text-muted-foreground">Tegak</p>
          </div>
        </div>

        {/* Preview */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" /> Preview Dokumen
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg bg-muted/30 p-4">
              <div className="min-w-[600px]" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', height: '700px' }}>
                <BADocumentPreview
                  template={selectedTemplate}
                  previewData={SAMPLE_BA_PREVIEW}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Struktur Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Kop Surat */}
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Kop Surat</p>
              <p className="text-sm">{selectedTemplate.kopSurat.namaInstansi}</p>
              <p className="text-sm font-semibold">{selectedTemplate.kopSurat.namaDinas}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedTemplate.kopSurat.alamat}</p>
            </div>

            {/* Judul */}
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Judul Surat</p>
              <p className="text-sm font-bold">{selectedTemplate.judul.text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Format nomor: {selectedTemplate.nomor.format}</p>
            </div>

            {/* Isi */}
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Isi Surat</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{selectedTemplate.narratives.pembukaan}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge color="default" className="border bg-transparent text-[10px]">Pihak Pertama</Badge>
                <Badge color="default" className="border bg-transparent text-[10px]">Pihak Kedua</Badge>
                <Badge color="default" className="border bg-transparent text-[10px]">Dasar Serah Terima</Badge>
                <Badge color="default" className="border bg-transparent text-[10px]">Ketentuan</Badge>
                <Badge color="default" className="border bg-transparent text-[10px]">Penutup</Badge>
              </div>
            </div>

            {/* Tanda Tangan */}
            <div className="rounded-lg border p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Tanda Tangan</p>
              <div className="flex gap-4 text-xs">
                <div>
                  <p className="font-medium">Pihak Kedua</p>
                  <p className="text-muted-foreground">{selectedTemplate.tandaTangan.pihakKedua.label}</p>
                </div>
                <div>
                  <p className="font-medium">Pihak Pertama</p>
                  <p className="text-muted-foreground">{selectedTemplate.tandaTangan.pihakPertama.label}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============================================================================
  // VIEW: Template Customize (2-column layout: accordion settings + live preview)
  // ============================================================================
  const renderTemplateCustomize = () => {
    if (!editingTemplate) return null;

    const updateField = <K extends keyof BATemplateConfig>(key: K, value: BATemplateConfig[K]) => {
      setEditingTemplate((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const updateKopSurat = (partial: Partial<BATemplateConfig['kopSurat']>) => {
      setEditingTemplate((prev) =>
        prev ? { ...prev, kopSurat: { ...prev.kopSurat, ...partial } } : prev
      );
    };

    const updateNarratives = (partial: Partial<BATemplateConfig['narratives']>) => {
      setEditingTemplate((prev) =>
        prev ? { ...prev, narratives: { ...prev.narratives, ...partial } } : prev
      );
    };

    const updateTandaTangan = (partial: Partial<BATemplateConfig['tandaTangan']>) => {
      setEditingTemplate((prev) =>
        prev ? { ...prev, tandaTangan: { ...prev.tandaTangan, ...partial } } : prev
      );
    };

    const updateBiodata = (partial: Partial<BAPihakPertamaBiodata>) => {
      setEditingTemplate((prev) =>
        prev
          ? {
              ...prev,
              narratives: {
                ...prev.narratives,
                biodataPihakPertama: { ...prev.narratives.biodataPihakPertama, ...partial },
              },
            }
          : prev
      );
    };

    const addDasarItem = () => {
      updateNarratives({ dasarItems: [...editingTemplate.narratives.dasarItems, ''] });
    };
    const removeDasarItem = (idx: number) => {
      updateNarratives({ dasarItems: editingTemplate.narratives.dasarItems.filter((_, i) => i !== idx) });
    };
    const addKetentuanItem = () => {
      updateNarratives({ ketentuanItems: [...editingTemplate.narratives.ketentuanItems, ''] });
    };
    const removeKetentuanItem = (idx: number) => {
      updateNarratives({ ketentuanItems: editingTemplate.narratives.ketentuanItems.filter((_, i) => i !== idx) });
    };

    return (
      <div className="space-y-4">
        {/* Save Bar */}
        <div className="sticky top-0 z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{editingTemplate.name || 'Template Baru'}</p>
            <p className="text-xs text-muted-foreground">Menyesuaikan template</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={goBack}>Batal</Button>
            <Button size="sm" onClick={handleSaveTemplate} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Simpan
            </Button>
          </div>
        </div>

        {/* Two-column layout: Settings (left) + Live Preview (right) */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ============================================================ */}
          {/* LEFT: Settings Panel with Accordion */}
          {/* ============================================================ */}
          <div className="w-full lg:w-1/2 xl:w-5/12 min-w-0">
            <Accordion type="multiple" defaultValue={['layout']}>
              {/* ============================== */}
              {/* SECTION: Tata Letak            */}
              {/* ============================== */}
              <AccordionItem value="layout">
                <AccordionTrigger>
                  <span className="flex items-center gap-2 text-sm">
                    <Layout className="h-4 w-4" /> Tata Letak
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Identitas Template */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identitas Template</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Kode</Label>
                          <Input
                            value={editingTemplate.code}
                            onChange={(e) => updateField('code', e.target.value)}
                            placeholder="BA-01"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Nama</Label>
                          <Input
                            value={editingTemplate.name}
                            onChange={(e) => updateField('name', e.target.value)}
                            placeholder="Nama template"
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Deskripsi</Label>
                        <Input
                          value={editingTemplate.description}
                          onChange={(e) => updateField('description', e.target.value)}
                          placeholder="Deskripsi singkat template"
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Ukuran Kertas & Margin */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ukuran Kertas & Margin</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Ukuran</Label>
                          <Select
                            value={editingTemplate.paper.size}
                            onValueChange={(v) =>
                              updateField('paper', { ...editingTemplate.paper, size: v as 'A4' | 'F4' })
                            }
                          >
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries(PAPER_SIZES).map(([key, val]) => (
                                <SelectItem key={key} value={key}>{val.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Orientasi</Label>
                          <Select
                            value={editingTemplate.paper.orientation}
                            onValueChange={(v) =>
                              updateField('paper', { ...editingTemplate.paper, orientation: v as 'portrait' | 'landscape' })
                            }
                          >
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="portrait">Portrait (Tegak)</SelectItem>
                              <SelectItem value="landscape">Landscape (Mendatar)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs mb-2 block">Margin (cm)</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                            <div key={side}>
                              <Label className="text-[10px] text-muted-foreground">
                                {side === 'top' ? 'Atas' : side === 'bottom' ? 'Bawah' : side === 'left' ? 'Kiri' : 'Kanan'}
                              </Label>
                              <Input
                                type="number"
                                step={0.05}
                                min={0}
                                value={editingTemplate.margins[side]}
                                onChange={(e) =>
                                  updateField('margins', { ...editingTemplate.margins, [side]: Number(e.target.value) })
                                }
                                className="h-8 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Font */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Font</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Jenis Font</Label>
                          <Select
                            value={editingTemplate.font.family}
                            onValueChange={(v) => updateField('font', { ...editingTemplate.font, family: v })}
                          >
                            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {AVAILABLE_FONTS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                  <span style={{ fontFamily: f.value }}>{f.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Ukuran Dasar (pt)</Label>
                          <Input
                            type="number"
                            min={8}
                            max={16}
                            value={editingTemplate.font.baseSizePt}
                            onChange={(e) => updateField('font', { ...editingTemplate.font, baseSizePt: Number(e.target.value) })}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ============================== */}
              {/* SECTION: Header (Kop Surat)    */}
              {/* ============================== */}
              <AccordionItem value="header">
                <AccordionTrigger>
                  <span className="flex items-center gap-2 text-sm">
                    <Type className="h-4 w-4" /> Header
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Logo */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo Instansi</p>
                      <LogoUploader
                        currentLogo={editingTemplate.kopSurat.logo.url}
                        onLogoChange={(url) =>
                          updateKopSurat({
                            logo: { ...editingTemplate.kopSurat.logo, url, enabled: true },
                          })
                        }
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Lebar (cm)</Label>
                          <Input
                            type="number"
                            step={0.01}
                            value={editingTemplate.kopSurat.logo.widthCm}
                            onChange={(e) =>
                              updateKopSurat({ logo: { ...editingTemplate.kopSurat.logo, widthCm: Number(e.target.value) } })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Tinggi (cm)</Label>
                          <Input
                            type="number"
                            step={0.01}
                            value={editingTemplate.kopSurat.logo.heightCm}
                            onChange={(e) =>
                              updateKopSurat({ logo: { ...editingTemplate.kopSurat.logo, heightCm: Number(e.target.value) } })
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Kop Surat Text Fields with RTF Controls */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kop Surat</p>
                        <div className="flex items-center gap-2">
                          <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Line Spacing</Label>
                          <Select
                            value={String(editingTemplate.kopSurat.lineSpacing)}
                            onValueChange={(v) => updateKopSurat({ lineSpacing: Number(v) })}
                          >
                            <SelectTrigger className="h-7 w-20 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1.0</SelectItem>
                              <SelectItem value="1.15">1.15</SelectItem>
                              <SelectItem value="1.5">1.5</SelectItem>
                              <SelectItem value="2">2.0</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Nama Instansi */}
                      <div>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <Label className="text-xs whitespace-nowrap">Nama Instansi</Label>
                          <div className="flex items-center gap-1.5">
                            <TextFormatToolbar
                              format={editingTemplate.kopSurat.namaInstansiFormat}
                              onChange={(fmt) => updateKopSurat({ namaInstansiFormat: fmt })}
                            />
                            <Input
                              type="number" min={8} max={20}
                              value={editingTemplate.kopSurat.namaInstansiFontSize}
                              onChange={(e) => updateKopSurat({ namaInstansiFontSize: Number(e.target.value) })}
                              className="h-7 w-14 text-xs"
                            />
                            <span className="text-[10px] text-muted-foreground">pt</span>
                          </div>
                        </div>
                        <Input
                          value={editingTemplate.kopSurat.namaInstansi}
                          onChange={(e) => updateKopSurat({ namaInstansi: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Nama Dinas */}
                      <div>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <Label className="text-xs whitespace-nowrap">Nama Dinas/OPD</Label>
                          <div className="flex items-center gap-1.5">
                            <TextFormatToolbar
                              format={editingTemplate.kopSurat.namaDinasFormat}
                              onChange={(fmt) => updateKopSurat({ namaDinasFormat: fmt })}
                            />
                            <Input
                              type="number" min={8} max={20}
                              value={editingTemplate.kopSurat.namaDinasFontSize}
                              onChange={(e) => updateKopSurat({ namaDinasFontSize: Number(e.target.value) })}
                              className="h-7 w-14 text-xs"
                            />
                            <span className="text-[10px] text-muted-foreground">pt</span>
                          </div>
                        </div>
                        <Input
                          value={editingTemplate.kopSurat.namaDinas}
                          onChange={(e) => updateKopSurat({ namaDinas: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Alamat */}
                      <div>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <Label className="text-xs whitespace-nowrap">Alamat</Label>
                          <div className="flex items-center gap-1.5">
                            <TextFormatToolbar
                              format={editingTemplate.kopSurat.alamatFormat}
                              onChange={(fmt) => updateKopSurat({ alamatFormat: fmt })}
                            />
                            <Input
                              type="number" min={8} max={16}
                              value={editingTemplate.kopSurat.alamatFontSize}
                              onChange={(e) => updateKopSurat({ alamatFontSize: Number(e.target.value) })}
                              className="h-7 w-14 text-xs"
                            />
                            <span className="text-[10px] text-muted-foreground">pt</span>
                          </div>
                        </div>
                        <Input
                          value={editingTemplate.kopSurat.alamat}
                          onChange={(e) => updateKopSurat({ alamat: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Kontak */}
                      <div>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <Label className="text-xs whitespace-nowrap">Kontak</Label>
                          <div className="flex items-center gap-1.5">
                            <TextFormatToolbar
                              format={editingTemplate.kopSurat.kontakFormat}
                              onChange={(fmt) => updateKopSurat({ kontakFormat: fmt })}
                            />
                            <Input
                              type="number" min={8} max={16}
                              value={editingTemplate.kopSurat.kontakFontSize}
                              onChange={(e) => updateKopSurat({ kontakFontSize: Number(e.target.value) })}
                              className="h-7 w-14 text-xs"
                            />
                            <span className="text-[10px] text-muted-foreground">pt</span>
                          </div>
                        </div>
                        <Input
                          value={editingTemplate.kopSurat.kontak}
                          onChange={(e) => updateKopSurat({ kontak: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Separator Line */}
                      <div>
                        <Label className="text-xs">Garis Separator (pt)</Label>
                        <Input
                          type="number" step={0.25} min={0} max={5}
                          value={editingTemplate.kopSurat.separatorThicknessPt}
                          onChange={(e) => updateKopSurat({ separatorThicknessPt: Number(e.target.value) })}
                          className="h-8 w-24 text-sm"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Judul & Nomor Surat */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Judul & Nomor Surat</p>
                      <div>
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <Label className="text-xs">Judul Surat</Label>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <TextFormatToolbar
                              format={{ bold: editingTemplate.judul.bold, italic: false, underline: editingTemplate.judul.underline }}
                              onChange={(fmt) => updateField('judul', { ...editingTemplate.judul, bold: fmt.bold, underline: fmt.underline })}
                            />
                            <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingTemplate.judul.allCaps}
                                onChange={(e) => updateField('judul', { ...editingTemplate.judul, allCaps: e.target.checked })}
                                className="h-3 w-3"
                              />
                              CAPS
                            </label>
                          </div>
                        </div>
                        <Input
                          value={editingTemplate.judul.text}
                          onChange={(e) => updateField('judul', { ...editingTemplate.judul, text: e.target.value })}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Format Nomor Surat</Label>
                        <Input
                          value={editingTemplate.nomor.format}
                          onChange={(e) => updateField('nomor', { ...editingTemplate.nomor, format: e.target.value })}
                          className="h-9 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Gunakan <code className="bg-muted px-1 rounded">{'{nomor}'}</code> dan <code className="bg-muted px-1 rounded">{'{tahun}'}</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ============================== */}
              {/* SECTION: Redaksi               */}
              {/* ============================== */}
              <AccordionItem value="content">
                <AccordionTrigger>
                  <span className="flex items-center gap-2 text-sm">
                    <PenLine className="h-4 w-4" /> Redaksi
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {/* Pembukaan */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redaksi Pembukaan</p>
                        <TextFormatToolbar
                          format={editingTemplate.narratives.pembukaanFormat}
                          onChange={(fmt) => updateNarratives({ pembukaanFormat: fmt })}
                        />
                      </div>
                      <Textarea
                        rows={3}
                        value={editingTemplate.narratives.pembukaan}
                        onChange={(e) => updateNarratives({ pembukaan: e.target.value })}
                        className="text-sm"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Placeholder: <code className="bg-muted px-1 rounded">{'{hari}'}</code>{' '}
                        <code className="bg-muted px-1 rounded">{'{tanggal}'}</code>{' '}
                        <code className="bg-muted px-1 rounded">{'{bulan}'}</code>{' '}
                        <code className="bg-muted px-1 rounded">{'{tahun}'}</code>
                      </p>
                    </div>

                    <Separator />

                    {/* Biodata Pihak Pertama */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Biodata Pihak Pertama</p>
                      <p className="text-[10px] text-muted-foreground -mt-1">
                        Data default pejabat yang akan digunakan sebagai penanda tangan pihak pertama.
                      </p>
                      <div className="grid gap-2">
                        {([
                          { key: 'nama' as const, label: 'Nama' },
                          { key: 'pangkat' as const, label: 'Pangkat' },
                          { key: 'golongan' as const, label: 'Golongan' },
                          { key: 'nip' as const, label: 'NIP' },
                          { key: 'jabatan' as const, label: 'Jabatan' },
                          { key: 'unitKerja' as const, label: 'Unit Kerja' },
                        ]).map(({ key, label }) => (
                          <div key={key} className="grid grid-cols-3 gap-2 items-center">
                            <Label className="text-xs col-span-1">{label}</Label>
                            <Input
                              value={editingTemplate.narratives.biodataPihakPertama[key]}
                              onChange={(e) => updateBiodata({ [key]: e.target.value })}
                              className="h-8 text-xs col-span-2"
                              placeholder={`Masukkan ${label.toLowerCase()}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Redaksi Pihak Pertama */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redaksi Pihak Pertama</p>
                        <TextFormatToolbar
                          format={editingTemplate.narratives.redaksiPihakPertamaFormat}
                          onChange={(fmt) => updateNarratives({ redaksiPihakPertamaFormat: fmt })}
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={editingTemplate.narratives.redaksiPihakPertama}
                        onChange={(e) => updateNarratives({ redaksiPihakPertama: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <Separator />

                    {/* Pihak Kedua - Format Only */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pihak Kedua</p>
                      <div className="rounded-lg border border-dashed p-3 bg-muted/30">
                        <p className="text-xs text-muted-foreground">
                          Data pihak kedua diisi otomatis dari data kelompok tani / petani saat pembuatan Berita Acara.
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {editingTemplate.narratives.fieldLabelsPihakKedua.map((label, i) => (
                            <Badge key={i} className="text-[10px] border bg-transparent text-foreground">{label}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs">Redaksi Pihak Kedua</Label>
                          <TextFormatToolbar
                            format={editingTemplate.narratives.redaksiPihakKeduaFormat}
                            onChange={(fmt) => updateNarratives({ redaksiPihakKeduaFormat: fmt })}
                          />
                        </div>
                        <Textarea
                          rows={2}
                          value={editingTemplate.narratives.redaksiPihakKedua}
                          onChange={(e) => updateNarratives({ redaksiPihakKedua: e.target.value })}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Dasar Serah Terima */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dasar Serah Terima</p>
                        <TextFormatToolbar
                          format={editingTemplate.narratives.redaksiDasarFormat}
                          onChange={(fmt) => updateNarratives({ redaksiDasarFormat: fmt })}
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={editingTemplate.narratives.redaksiDasar}
                        onChange={(e) => updateNarratives({ redaksiDasar: e.target.value })}
                        className="text-sm"
                      />
                      {editingTemplate.narratives.dasarItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="text-xs text-muted-foreground font-medium mt-2.5 flex-shrink-0 w-5 text-right">
                            {idx + 1}.
                          </span>
                          <Textarea
                            rows={2}
                            value={item}
                            onChange={(e) => {
                              const updated = [...editingTemplate.narratives.dasarItems];
                              updated[idx] = e.target.value;
                              updateNarratives({ dasarItems: updated });
                            }}
                            className="text-sm flex-1"
                          />
                          <Button
                            variant="ghost"
                            color="destructive"
                            size="sm"
                            onClick={() => removeDasarItem(idx)}
                            className="flex-shrink-0 h-8 w-8 p-0 mt-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addDasarItem} className="gap-1.5 w-full">
                        <Plus className="h-3.5 w-3.5" /> Tambah Dasar
                      </Button>
                    </div>

                    <Separator />

                    {/* Pernyataan Serah Terima */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pernyataan Serah Terima</p>
                        <TextFormatToolbar
                          format={editingTemplate.narratives.redaksiSerahTerimaFormat}
                          onChange={(fmt) => updateNarratives({ redaksiSerahTerimaFormat: fmt })}
                        />
                      </div>
                      <Textarea
                        rows={3}
                        value={editingTemplate.narratives.redaksiSerahTerima}
                        onChange={(e) => updateNarratives({ redaksiSerahTerima: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <Separator />

                    {/* Ketentuan Pihak Kedua */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ketentuan Pihak Kedua</p>
                        <TextFormatToolbar
                          format={editingTemplate.narratives.redaksiKetentuanFormat}
                          onChange={(fmt) => updateNarratives({ redaksiKetentuanFormat: fmt })}
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={editingTemplate.narratives.redaksiKetentuan}
                        onChange={(e) => updateNarratives({ redaksiKetentuan: e.target.value })}
                        className="text-sm"
                      />
                      {editingTemplate.narratives.ketentuanItems.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="text-xs text-muted-foreground font-medium mt-2.5 flex-shrink-0 w-5 text-right">
                            {idx + 1}.
                          </span>
                          <Textarea
                            rows={2}
                            value={item}
                            onChange={(e) => {
                              const updated = [...editingTemplate.narratives.ketentuanItems];
                              updated[idx] = e.target.value;
                              updateNarratives({ ketentuanItems: updated });
                            }}
                            className="text-sm flex-1"
                          />
                          <Button
                            variant="ghost"
                            color="destructive"
                            size="sm"
                            onClick={() => removeKetentuanItem(idx)}
                            className="flex-shrink-0 h-8 w-8 p-0 mt-0.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={addKetentuanItem} className="gap-1.5 w-full">
                        <Plus className="h-3.5 w-3.5" /> Tambah Ketentuan
                      </Button>
                    </div>

                    <Separator />

                    {/* Penutup */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Penutup</p>
                        <TextFormatToolbar
                          format={editingTemplate.narratives.penutupFormat}
                          onChange={(fmt) => updateNarratives({ penutupFormat: fmt })}
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={editingTemplate.narratives.penutup}
                        onChange={(e) => updateNarratives({ penutup: e.target.value })}
                        className="text-sm"
                      />
                    </div>

                    <Separator />

                    {/* Tanda Tangan */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tanda Tangan</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Pihak Kedua */}
                        <div className="space-y-2 rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium">Pihak Kedua</p>
                            <TextFormatToolbar
                              format={editingTemplate.tandaTangan.pihakKedua.labelFormat}
                              onChange={(fmt) =>
                                updateTandaTangan({
                                  pihakKedua: { ...editingTemplate.tandaTangan.pihakKedua, labelFormat: fmt },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Label</Label>
                            <Input
                              value={editingTemplate.tandaTangan.pihakKedua.label}
                              onChange={(e) =>
                                updateTandaTangan({
                                  pihakKedua: { ...editingTemplate.tandaTangan.pihakKedua, label: e.target.value },
                                })
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="rounded border border-dashed p-2 bg-muted/30">
                            <p className="text-[10px] text-muted-foreground">
                              Nama & jabatan diisi otomatis dari data petani/poktan
                            </p>
                          </div>
                        </div>

                        {/* Pihak Pertama */}
                        <div className="space-y-2 rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium">Pihak Pertama</p>
                            <TextFormatToolbar
                              format={editingTemplate.tandaTangan.pihakPertama.labelFormat}
                              onChange={(fmt) =>
                                updateTandaTangan({
                                  pihakPertama: { ...editingTemplate.tandaTangan.pihakPertama, labelFormat: fmt },
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Label</Label>
                            <Input
                              value={editingTemplate.tandaTangan.pihakPertama.label}
                              onChange={(e) =>
                                updateTandaTangan({
                                  pihakPertama: { ...editingTemplate.tandaTangan.pihakPertama, label: e.target.value },
                                })
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div className="rounded border border-dashed p-2 bg-muted/30">
                            <p className="text-[10px] text-muted-foreground">Data diambil dari biodata Pihak Pertama</p>
                            {editingTemplate.narratives.biodataPihakPertama.nama && (
                              <div className="mt-1.5 text-[10px] space-y-0.5">
                                <p className="font-medium">{editingTemplate.narratives.biodataPihakPertama.nama}</p>
                                {editingTemplate.narratives.biodataPihakPertama.pangkat && (
                                  <p className="text-muted-foreground">
                                    {editingTemplate.narratives.biodataPihakPertama.pangkat}
                                    {editingTemplate.narratives.biodataPihakPertama.golongan && ` (${editingTemplate.narratives.biodataPihakPertama.golongan})`}
                                  </p>
                                )}
                                {editingTemplate.narratives.biodataPihakPertama.nip && (
                                  <p className="text-muted-foreground">NIP. {editingTemplate.narratives.biodataPihakPertama.nip}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* ============================================================ */}
          {/* RIGHT: Live Preview (Desktop)                                */}
          {/* ============================================================ */}
          <div className="hidden lg:block lg:w-1/2 xl:w-7/12">
            <div className="sticky top-16">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" /> Live Preview
                  </CardTitle>
                  <CardDescription className="text-xs">Perubahan langsung terlihat di preview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="overflow-auto rounded-lg bg-muted/30 p-2"
                    style={{ maxHeight: 'calc(100vh - 180px)' }}
                  >
                    <div
                      className="origin-top-left"
                      style={{
                        transform: 'scale(0.48)',
                        transformOrigin: 'top left',
                        height: '1400px',
                        width: '210mm',
                      }}
                    >
                      <BADocumentPreview
                        template={editingTemplate}
                        previewData={SAMPLE_BA_PREVIEW}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mobile Preview FAB */}
        <button
          onClick={() => setShowMobilePreview(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg px-4 py-3 hover:bg-primary/90 transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Preview</span>
        </button>

        {/* Mobile Preview Overlay */}
        {showMobilePreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background flex flex-col">
            <div className="flex items-center justify-between p-3 border-b bg-background">
              <p className="text-sm font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" /> Preview Dokumen
              </p>
              <Button variant="ghost" size="sm" onClick={() => setShowMobilePreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-muted/30">
              <div
                className="origin-top-left"
                style={{
                  transform: 'scale(0.42)',
                  transformOrigin: 'top left',
                  height: '1400px',
                  width: '210mm',
                }}
              >
                <BADocumentPreview
                  template={editingTemplate}
                  previewData={SAMPLE_BA_PREVIEW}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return (
    <div className="container mx-auto py-4 sm:py-6 px-4 sm:px-6 max-w-5xl">
      {/* Top Navigation */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2">
          {view !== 'template-list' && (
            <Button variant="ghost" size="sm" onClick={goBack} className="gap-1 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>
          )}
          <Breadcrumb />
        </div>
      </div>

      {/* Views */}
      {view === 'template-list' && renderTemplateList()}
      {view === 'template-detail' && renderTemplateDetail()}
      {view === 'template-customize' && renderTemplateCustomize()}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Template?</AlertDialogTitle>
            <AlertDialogDescription>
              Template yang dihapus tidak bisa dikembalikan. Pastikan Anda sudah membuat backup jika diperlukan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
