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
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import AvatarUpload from './avatar-upload';

const formSchema = z.object({
  fullname: z.string().min(2, { message: 'Full name is required' }),
  position: z.string().min(2, { message: 'Position is required' }),
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
  avatar: z.any().optional(),
});

const ProfileSettings = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: 'John Doe',
      position: 'PPL',
      dob: new Date('1990-01-01'),
      avatar: '/images/avatar/avatar-1.png',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }
  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Pengaturan Profil</CardTitle>
            <CardDescription>Kelola informasi profil Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem className="flex items-center gap-6 space-y-0">
                  <AvatarUpload
                    value={field.value}
                    onChange={field.onChange}
                    className="w-20 h-20"
                  />

                  <div className="flex-1">
                    <FormLabel>Foto Profil</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Upload foto profil baru
                    </div>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan jabatan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Lahir</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ms-auto">
              Simpan
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
export default ProfileSettings; 