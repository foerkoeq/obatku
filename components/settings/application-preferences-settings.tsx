'use client';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  applicationPreferenceDefaults,
  settingsDateFormatOptions,
  settingsLanguageOptions,
  settingsTimezoneOptions,
} from '@/lib/data/settings-demo';

const formSchema = z.object({
  language: z.string().min(1, { message: 'Bahasa wajib dipilih.' }),
  timezone: z.string().min(1, { message: 'Zona waktu wajib dipilih.' }),
  dateFormat: z.string().min(1, { message: 'Format tanggal wajib dipilih.' }),
  compactMode: z.boolean(),
  autoSaveDraft: z.boolean(),
  stockAlert: z.boolean(),
  transactionAlert: z.boolean(),
});

const ApplicationPreferencesSettings = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: applicationPreferenceDefaults,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('application-preferences', values);
    toast.success('Pengaturan tersimpan', {
      description: 'Preferensi aplikasi berhasil diperbarui (frontend demo).',
    });
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Preferensi Aplikasi</CardTitle>
            <CardDescription>
              Atur preferensi untuk membantu mengurangi human error saat input data.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bahasa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bahasa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {settingsLanguageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona Waktu</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih zona waktu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {settingsTimezoneOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="dateFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Format Tanggal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih format tanggal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {settingsDateFormatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <FormField
                control={form.control}
                name="compactMode"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Tampilan Ringkas</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Menampilkan layout lebih padat di layar kecil.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoSaveDraft"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Simpan Draft Otomatis</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Menyimpan perubahan sementara agar tidak hilang.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockAlert"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Notifikasi Stok Kritis</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Memberi pengingat stok menipis untuk mencegah kekeliruan operasional.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionAlert"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Notifikasi Validasi Transaksi</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Menampilkan konfirmasi sebelum submit data transaksi.
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(applicationPreferenceDefaults)}
            >
              Reset
            </Button>
            <Button type="submit">Simpan Preferensi</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default ApplicationPreferencesSettings;
