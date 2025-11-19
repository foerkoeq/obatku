// # START OF Add Medicine Page with Form Wizard - Modern Multi-Step Form
// Purpose: Provides comprehensive wizard form for adding new drug inventory items
// Features: 4-step wizard, validation, breadcrumb, modern UI, responsive design
// Returns: Complete add medicine form wizard interface
// Dependencies: Form components, validation, toast, router, types

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Pill,
  Package,
  Bug,
  FileImage,
  Info,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Custom Components
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { TagInput } from "@/components/form/tag-input";
import { ImageUpload } from "@/components/form/image-upload";
import {
  FormWizardStepper,
  FormWizardStepperCompact,
  type WizardStep,
} from "@/components/form/form-wizard-stepper";
import {
  MultiDateExpiryManager,
  type ExpiryBatch,
} from "@/components/form/multi-date-expiry-manager";
import {
  CommodityDosageManager,
  type CommodityDosage,
} from "@/components/form/commodity-dosage-manager";
import {
  MultiLocationStorageManager,
  type StorageLocation,
} from "@/components/form/multi-location-storage-manager";

// Services
import { inventoryService } from "@/lib/services/inventory.service";

// Types
import { UserRole } from "@/lib/types/inventory";

// Fixed Options
const DRUG_CATEGORIES = [
  "Insektisida",
  "Moluskisida",
  "Herbisida",
  "Rodentisida",
  "Fungisida",
  "Pestisida Nabati",
  "Agen Hayati (Antagonis)",
  "Agen Hayati (Predator)",
  "Lainnya",
];

const SUMBER_OPTIONS = [
  "APBD",
  "APBD I",
  "APBD II",
  "APBN",
  "Dinas Pertanian Prov. Jatim",
  "Dinas Perkebunan Prov. Jatim",
  "Kementerian Pertanian",
  "CSR",
];

const UNIT_OPTIONS = [
  "kg",
  "liter",
  "botol",
  "sachet",
  "pack",
  "jurigen",
  "kotak",
  "pcs",
];

const LARGE_PACK_UNITS = [
  "Dus",
  "Box",
  "Karton",
  "Drum",
  "Pack",
  "Bundle",
  "Krat",
];

// Validation Schema
const addMedicineSchema = z.object({
  // Step 1: Basic Info
  producer: z.string().min(1, "Produsen obat wajib diisi"),
  name: z.string().min(1, "Merek obat wajib diisi").min(3, "Merek obat minimal 3 karakter"),
  content: z.string().min(1, "Kandungan/Bahan aktif wajib diisi"),
  category: z.string().min(1, "Kategori obat wajib dipilih"),
  sumber: z.string().min(1, "Sumber wajib dipilih"),

  // Step 2: QTY
  entryDate: z.date({
    required_error: "Tanggal masuk wajib diisi",
  }),
  batches: z
    .array(
      z.object({
        id: z.string(),
        expiryDate: z.date({
          required_error: "Tanggal kadaluarsa wajib diisi",
        }).nullable(),
        quantity: z.number().min(1, "Jumlah stok minimal 1"),
        unit: z.string().min(1, "Satuan wajib dipilih"),
        largePackQuantity: z.number().optional(),
        largePackUnit: z.string().optional(),
        itemsPerLargePack: z.number().optional(),
        pricePerUnit: z.number().optional(),
      })
    )
    .min(1, "Minimal 1 batch wajib diisi"),

  // Step 3: OPT
  targetPest: z.array(z.string()).min(1, "Minimal 1 jenis OPT wajib diisi"),
  commodities: z
    .array(
      z.object({
        commodity: z.string(),
        selected: z.boolean(),
        dosageAmount: z.number(),
        dosageUnit: z.string(),
        landArea: z.number(),
      })
    )
    .refine((commodities) => commodities.some((c) => c.selected), {
      message: "Minimal 1 komoditas harus dipilih",
    }),

  // Step 4: Additional
  storageLocations: z
    .array(
      z.object({
        id: z.string(),
        warehouse: z.string().min(1, "Lokasi gudang wajib dipilih"),
        storageArea: z.string().min(1, "Tempat penyimpanan wajib dipilih"),
        rack: z.string().min(1, "Rak penyimpanan wajib dipilih"),
      })
    )
    .min(1, "Minimal 1 lokasi penyimpanan wajib diisi"),
  notes: z.string().optional(),
  images: z.array(z.any()).optional(),
});

type AddMedicineFormData = z.infer<typeof addMedicineSchema>;

// Wizard Steps Configuration
const wizardSteps: WizardStep[] = [
  {
    id: 1,
    title: "Informasi Dasar",
    description: "Data obat & kategori",
    icon: <Pill className="w-6 h-6" />,
  },
  {
    id: 2,
    title: "Kuantitas & Stok",
    description: "Jumlah & kadaluarsa",
    icon: <Package className="w-6 h-6" />,
  },
  {
    id: 3,
    title: "OPT & Komoditas",
    description: "Target & dosis",
    icon: <Bug className="w-6 h-6" />,
  },
  {
    id: 4,
    title: "Lokasi & Foto",
    description: "Penyimpanan & gambar",
    icon: <FileImage className="w-6 h-6" />,
  },
];

const AddMedicinePage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [userRole] = useState<UserRole>("admin");

  // Unit options with ability to add more
  const [unitOptions, setUnitOptions] = useState(UNIT_OPTIONS);
  const [largePackUnitOptions, setLargePackUnitOptions] = useState(LARGE_PACK_UNITS);

  // Check authorization
  useEffect(() => {
    if (userRole === "ppl") {
      toast.error("Anda tidak memiliki akses untuk menambah obat");
      router.push("/inventory");
      return;
    }
  }, [userRole, router]);

  // Form setup
  const form = useForm<AddMedicineFormData>({
    resolver: zodResolver(addMedicineSchema),
    defaultValues: {
      producer: "",
      name: "",
      content: "",
      category: "",
      sumber: "",
      entryDate: new Date(),
      batches: [
        {
          id: `batch-${Date.now()}`,
          expiryDate: null,
          quantity: 0,
          unit: "",
          largePackQuantity: 0,
          largePackUnit: "",
          itemsPerLargePack: 1,
          pricePerUnit: 0,
        },
      ],
      targetPest: [],
      commodities: [],
      storageLocations: [
        {
          id: `location-${Date.now()}`,
          warehouse: "",
          storageArea: "",
          rack: "",
        },
      ],
      notes: "",
      images: [],
    },
  });

  // Navigation functions
  const handleNext = async () => {
    let fieldsToValidate: (keyof AddMedicineFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = ["producer", "name", "content", "category", "sumber"];
        break;
      case 2:
        fieldsToValidate = ["entryDate", "batches"];
        break;
      case 3:
        fieldsToValidate = ["targetPest", "commodities"];
        break;
      case 4:
        fieldsToValidate = ["storageLocations"];
        break;
    }

    const isStepValid = await form.trigger(fieldsToValidate);

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, wizardSteps.length));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Mohon lengkapi semua field yang wajib diisi");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.back();
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Form submission handler
  const onSubmit = async (data: AddMedicineFormData) => {
    setLoading(true);

    try {
      // Prepare medicine data
      const medicineData = {
        name: data.name,
        genericName: data.producer,
        categoryId: data.category,
        supplierId: data.sumber,
        description: data.notes || "",
        activeIngredient: data.content,
        dosageForm: data.batches[0]?.unit || "",
        strength: data.content,
        unit: data.batches[0]?.unit || "",
        barcode: "",
        sku: `${data.name.substring(0, 3).toUpperCase()}-${Date.now()}`,
        requiresPrescription: false,
      };

      // Create medicine
      const response = await inventoryService.createMedicine(medicineData);

      // Upload images if any
      if (data.images && data.images.length > 0 && response.data) {
        for (const image of data.images) {
          if (image instanceof File) {
            await inventoryService.uploadMedicineImage(response.data.id, image);
          }
        }
      }

      // Create stock entries for each batch
      if (response.data) {
        for (const batch of data.batches) {
          await inventoryService.createStock({
            medicineId: response.data.id,
            batchNumber: batch.id,
            quantity: batch.quantity,
            unitPrice: batch.pricePerUnit || 0,
            sellingPrice: batch.pricePerUnit || 0,
            expiryDate: batch.expiryDate?.toISOString() || new Date().toISOString(),
            manufacturingDate: data.entryDate.toISOString(),
            supplierId: data.sumber,
            location: data.storageLocations
              .map((loc) => `${loc.warehouse} - ${loc.storageArea} - ${loc.rack}`)
              .join("; "),
          });
        }
      }

      // Success notification
      toast.success("Obat berhasil ditambahkan!", {
        description: `${data.name} telah ditambahkan ke inventory`,
        icon: <CheckCircle2 className="w-5 h-5" />,
      });

      // Redirect to inventory page
      setTimeout(() => {
        router.push("/inventory");
      }, 1000);
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast.error("Gagal menambahkan obat", {
        description: "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-primary mb-1">
                  Informasi Dasar Obat
                </h4>
                <p className="text-xs text-muted-foreground">
                  Isi informasi dasar obat pertanian yang akan ditambahkan ke inventory. Semua field
                  bertanda (*) wajib diisi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Produsen */}
              <FormField
                control={form.control}
                name="producer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Produsen Obat *
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Nama perusahaan yang memproduksi obat</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: PT. Syngenta Indonesia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Merek Obat */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Merek Obat *
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Nama merek/brand obat</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Decis 2.5 EC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kandungan */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      Kandungan / Bahan Aktif *
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Kandungan bahan aktif dan konsentrasinya</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Deltamethrin 25 g/l" {...field} />
                    </FormControl>
                    <FormDescription>
                      Sebutkan bahan aktif beserta konsentrasi atau kadarnya
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Kategori */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Kategori Obat *
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Jenis kategori pestisida</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori obat" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DRUG_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sumber */}
              <FormField
                control={form.control}
                name="sumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Sumber *
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sumber pendanaan atau asal obat</p>
                        </TooltipContent>
                      </Tooltip>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih sumber" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUMBER_OPTIONS.map((sumber) => (
                          <SelectItem key={sumber} value={sumber}>
                            {sumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-primary mb-1">
                  Informasi Kuantitas & Stok
                </h4>
                <p className="text-xs text-muted-foreground">
                  Masukkan jumlah stok, satuan, harga, dan tanggal kadaluarsa. Anda dapat menambahkan
                  beberapa batch dengan tanggal kadaluarsa berbeda.
                </p>
              </div>
            </div>

            {/* Entry Date */}
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Tanggal Masuk *
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tanggal obat masuk ke gudang/inventory</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Batches */}
            <FormField
              control={form.control}
              name="batches"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiDateExpiryManager
                      batches={field.value}
                      onChange={field.onChange}
                      unitOptions={unitOptions}
                      largePackUnitOptions={largePackUnitOptions}
                      onAddUnit={(unit) => setUnitOptions([...unitOptions, unit])}
                      onAddLargePackUnit={(unit) =>
                        setLargePackUnitOptions([...largePackUnitOptions, unit])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-primary mb-1">
                  OPT & Sasaran Komoditas
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tentukan jenis OPT yang dapat dikendalikan dan komoditas sasaran beserta informasi
                  dosisnya.
                </p>
              </div>
            </div>

            {/* Target Pest */}
            <FormField
              control={form.control}
              name="targetPest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Jenis OPT yang Dikendalikan *
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Organisme Pengganggu Tumbuhan yang dapat dikendalikan</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Ketik jenis OPT dan tekan Enter atau koma (,)"
                      maxTags={20}
                    />
                  </FormControl>
                  <FormDescription>
                    Contoh: Wereng Batang Coklat, Penggerek Batang Padi, Ulat Grayak, dll.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Commodities */}
            <FormField
              control={form.control}
              name="commodities"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CommodityDosageManager commodities={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-primary mb-1">
                  Lokasi Penyimpanan & Dokumentasi
                </h4>
                <p className="text-xs text-muted-foreground">
                  Tentukan lokasi penyimpanan obat dan upload foto untuk dokumentasi.
                </p>
              </div>
            </div>

            {/* Storage Locations */}
            <FormField
              control={form.control}
              name="storageLocations"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <MultiLocationStorageManager locations={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Catatan Tambahan
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Catatan khusus atau instruksi penyimpanan</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tambahkan catatan khusus, instruksi penyimpanan, atau informasi penting lainnya..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Opsional - Informasi tambahan yang perlu diketahui</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Images */}
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Foto Obat
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload foto obat untuk dokumentasi visual</p>
                      </TooltipContent>
                    </Tooltip>
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={5}
                      maxSize={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Format yang didukung: JPG, PNG, GIF. Maksimal 5 foto, 5MB per file.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Breadcrumb */}
      <SiteBreadcrumb>
        <Button variant="outline" size="sm" onClick={() => router.push("/inventory")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Inventory
        </Button>
      </SiteBreadcrumb>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Tambah Obat Baru</h1>
        <p className="text-muted-foreground">
          Gunakan form wizard di bawah untuk menambahkan obat pertanian baru ke dalam sistem inventory
        </p>
      </div>

      {/* Wizard Stepper - Desktop */}
      <div className="hidden md:block mb-8">
        <FormWizardStepper
          steps={wizardSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          allowStepClick={true}
        />
      </div>

      {/* Wizard Stepper - Mobile */}
      <div className="block md:hidden mb-6">
        <FormWizardStepperCompact steps={wizardSteps} currentStep={currentStep} />
      </div>

      {/* Form Card */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            {wizardSteps[currentStep - 1].icon}
            {wizardSteps[currentStep - 1].title}
          </CardTitle>
          <CardDescription className="text-base">
            {wizardSteps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Step Content */}
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {currentStep === 1 ? "Batal" : "Kembali"}
                </Button>

                <div className="flex gap-2">
                  {currentStep < wizardSteps.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="gap-2 min-w-[120px]"
                    >
                      Selanjutnya
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="gap-2 min-w-[140px] bg-success hover:bg-success/90"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Obat
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMedicinePage;
// # END OF Add Medicine Page with Form Wizard
