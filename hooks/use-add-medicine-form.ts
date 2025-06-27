// # START OF useAddMedicineForm Hook - Custom hook for medicine form management
// Purpose: Manages form state, validation, and submission logic for add medicine form
// Props: None
// Returns: Form handlers, loading state, validation schema, and utility functions
// Dependencies: react-hook-form, zod, toast, router

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

// Types
import { UserRole } from "@/lib/types/inventory";

// Validation Schema
export const addMedicineSchema = z.object({
  name: z.string().min(1, "Nama obat wajib diisi").min(3, "Nama obat minimal 3 karakter"),
  producer: z.string().min(1, "Produsen wajib diisi"),
  content: z.string().min(1, "Kandungan wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  supplier: z.string().min(1, "Supplier wajib diisi"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  largePack: z.object({
    quantity: z.number().min(0, "Jumlah kemasan tidak boleh negatif"),
    unit: z.string().min(1, "Satuan kemasan wajib diisi"),
    itemsPerPack: z.number().min(1, "Jumlah per kemasan minimal 1"),
  }),
  entryDate: z.date({
    required_error: "Tanggal masuk wajib diisi",
  }),
  expiryDate: z.date({
    required_error: "Tanggal expired wajib diisi",
  }),
  pricePerUnit: z.number().min(0, "Harga tidak boleh negatif").optional(),
  targetPest: z.string().min(1, "Jenis OPT wajib diisi"),
  storageLocation: z.string().min(1, "Lokasi penyimpanan wajib diisi"),
  notes: z.string().optional(),
}).refine((data) => data.expiryDate > data.entryDate, {
  message: "Tanggal expired harus lebih dari tanggal masuk",
  path: ["expiryDate"],
});

export type AddMedicineFormData = z.infer<typeof addMedicineSchema>;

// API function for creating medicine
const createMedicine = async (data: AddMedicineFormData) => {
  // Prepare data for API
  const medicineData = {
    ...data,
    targetPest: data.targetPest.split(',').map(pest => pest.trim()),
    status: 'normal' as const,
    lastUpdated: new Date(),
    createdBy: 'Current User', // In real app, get from auth context
  };

  // In real app, make actual API call
  console.log('Adding medicine:', medicineData);
  
  // Simulate API call with proper error handling
  const response = await fetch('/api/medicines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(medicineData),
  });

  if (!response.ok) {
    throw new Error('Failed to create medicine');
  }

  return response.json();
};

interface UseAddMedicineFormOptions {
  userRole?: UserRole;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAddMedicineForm = (options: UseAddMedicineFormOptions = {}) => {
  const { userRole = 'admin', onSuccess, onError } = options;
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form setup
  const form = useForm<AddMedicineFormData>({
    resolver: zodResolver(addMedicineSchema),
    defaultValues: {
      name: '',
      producer: '',
      content: '',
      categoryId: '',
      supplier: '',
      stock: 0,
      unit: '',
      largePack: {
        quantity: 0,
        unit: '',
        itemsPerPack: 1,
      },
      entryDate: new Date(),
      pricePerUnit: 0,
      targetPest: '',
      storageLocation: '',
      notes: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: AddMedicineFormData) => {
    setLoading(true);
    
    try {
      // Check authorization
      if (userRole === 'ppl') {
        throw new Error('Unauthorized: PPL users cannot add medicine');
      }

      // Create medicine via API
      await createMedicine(data);
      
      // Success notification
      toast.success('Obat berhasil ditambahkan!', {
        description: `${data.name} telah disimpan ke dalam inventory`,
      });

      // Custom success callback
      if (onSuccess) {
        onSuccess();
      } else {
        // Default: redirect to inventory page
        router.push('/inventory');
      }
      
    } catch (error) {
      console.error('Error adding medicine:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast.error('Gagal menambahkan obat', {
        description: errorMessage === 'Unauthorized: PPL users cannot add medicine' 
          ? 'Anda tidak memiliki akses untuk menambah obat'
          : 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
      });

      // Custom error callback
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Reset form
  const resetForm = () => {
    form.reset();
  };

  // Check if user can access form
  const canAccessForm = userRole !== 'ppl';

  // Form validation utilities
  const validateField = (fieldName: keyof AddMedicineFormData) => {
    return form.formState.errors[fieldName];
  };

  const isFieldDirty = (fieldName: keyof AddMedicineFormData) => {
    return form.formState.dirtyFields[fieldName];
  };

  const getFieldValue = (fieldName: keyof AddMedicineFormData) => {
    return form.getValues(fieldName);
  };

  return {
    // Form instance
    form,
    
    // State
    loading,
    canAccessForm,
    
    // Handlers
    onSubmit: form.handleSubmit(onSubmit),
    handleBack,
    resetForm,
    
    // Validation utilities
    validateField,
    isFieldDirty,
    getFieldValue,
    
    // Form state
    isValid: form.formState.isValid,
    isDirty: form.formState.isDirty,
    errors: form.formState.errors,
  };
};

// # END OF useAddMedicineForm Hook 