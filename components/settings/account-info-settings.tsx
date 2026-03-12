'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';

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
import { User } from '@/lib/types/user';

const accountInfoSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Nama pengguna minimal 3 karakter.' })
    .regex(/^[a-zA-Z0-9._-]+$/, {
      message: 'Hanya boleh huruf, angka, titik, underscore, atau dash.',
    }),
  email: z.string().email({ message: 'Format surel tidak valid.' }),
  phone: z
    .string()
    .min(10, { message: 'No. HP minimal 10 digit.' })
    .regex(/^[0-9+\-\s]+$/, {
      message: 'No. HP hanya boleh angka, +, -, atau spasi.',
    }),
  currentPasswordVerify: z.string().min(1, {
    message: 'Masukkan password saat ini untuk mengkonfirmasi perubahan.',
  }),
});

type AccountInfoFormValues = z.infer<typeof accountInfoSchema>;

interface AccountInfoSettingsProps {
  user: User;
}

const AccountInfoSettings = ({ user }: AccountInfoSettingsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AccountInfoFormValues>({
    resolver: zodResolver(accountInfoSchema),
    defaultValues: {
      username: user.username,
      email: user.email || '',
      phone: user.phone,
      currentPasswordVerify: '',
    },
  });

  const isDirty = form.formState.isDirty;

  async function onSubmit(values: AccountInfoFormValues) {
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      toast.success('Informasi akun berhasil diperbarui!', {
        description: 'Perubahan data akun telah disimpan.',
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
            <CardTitle>Informasi Akun</CardTitle>
            <CardDescription>
              Kelola kredensial login dan kontak yang terhubung dengan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nama Pengguna <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="contoh: ppl.palang01"
                      {...field}
                      autoComplete="username"
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Digunakan untuk login. Huruf kecil, angka, titik, underscore, atau dash.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Surel <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      No. HP <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="081234567890"
                        {...field}
                        autoComplete="tel"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isDirty && (
              <FormField
                control={form.control}
                name="currentPasswordVerify"
                render={({ field }) => (
                  <FormItem className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                    <FormLabel>
                      Konfirmasi Password <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Masukkan password saat ini"
                          {...field}
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Verifikasi identitas Anda untuk menyimpan perubahan akun.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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

export default AccountInfoSettings;
