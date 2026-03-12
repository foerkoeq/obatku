'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/ui/date-picker';
import AvatarUpload from './avatar-upload';
import { User } from '@/lib/types/user';

const personalDataSchema = z.object({
  avatar: z.any().optional(),
  name: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
  nip: z.string().optional(),
  birthDate: z.date().optional().nullable(),
  pangkat: z.string().optional(),
  golongan: z.string().optional(),
  jabatan: z.string().optional(),
  address: z.string().optional(),
});

type PersonalDataFormValues = z.infer<typeof personalDataSchema>;

interface PersonalDataSettingsProps {
  user: User;
}

const PersonalDataSettings = ({ user }: PersonalDataSettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      avatar: user.avatar || '',
      name: user.name,
      nip: user.nip || '',
      birthDate: user.birthDate ? new Date(user.birthDate) : null,
      pangkat: user.pangkat || '',
      golongan: user.golongan || '',
      jabatan: user.jabatan || '',
      address: user.address || '',
    },
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(values: PersonalDataFormValues) {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success('Data pribadi berhasil diperbarui!', {
        description: 'Perubahan informasi pribadi telah disimpan.',
      });
      form.reset(values);
    } catch {
      toast.error('Gagal menyimpan perubahan', {
        description: 'Terjadi kesalahan. Silakan coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Data Pribadi</CardTitle>
            <CardDescription>
              Informasi kepegawaian dan identitas diri Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload Section */}
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6 space-y-0">
                  <AvatarUpload
                    value={field.value}
                    onChange={field.onChange}
                    className="h-24 w-24 shrink-0"
                  />
                  <div className="text-center sm:text-left">
                    <FormLabel className="text-base">Foto Profil</FormLabel>
                    <p className="text-xs text-muted-foreground mt-1">
                      Unggah foto profil Anda. Format: PNG, JPEG. Maks 5MB.
                    </p>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Nama Lengkap */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Lengkap <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nama lengkap beserta gelar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* NIP */}
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP / NIPPPK</FormLabel>
                    <FormControl>
                      <Input placeholder="199001012020121001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tanggal Lahir */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ?? undefined}
                        onChange={(date) => field.onChange(date ?? null)}
                        placeholder="Pilih tanggal lahir"
                        allowClear
                        displayFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pangkat */}
              <FormField
                control={form.control}
                name="pangkat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pangkat</FormLabel>
                    <FormControl>
                      <Input placeholder="cth: Penata Muda Tk. I" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Golongan */}
              <FormField
                control={form.control}
                name="golongan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Golongan</FormLabel>
                    <FormControl>
                      <Input placeholder="cth: III/b" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Jabatan */}
            <FormField
              control={form.control}
              name="jabatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <Input placeholder="cth: Penyuluh Pertanian Lapangan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Alamat */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Input placeholder="Alamat lengkap (opsional)" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Alamat domisili atau kantor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {isDirty && (
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Batal
              </Button>
            )}
            <Button type="submit" disabled={!isDirty || isSubmitting} className="gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PersonalDataSettings;
