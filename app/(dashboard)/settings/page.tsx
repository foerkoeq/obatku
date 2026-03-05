"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import PasswordSettings from '@/components/settings/password-settings';
import ProfileSettings from '@/components/settings/profile-settings';
import ApplicationPreferencesSettings from '@/components/settings/application-preferences-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteBreadcrumb from '@/components/site-breadcrumb';
import PageTitle from '@/components/page-title';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <SiteBreadcrumb />
      <PageTitle title="Pengaturan" />

      <Card>
        <CardHeader>
          <CardTitle>Pusat Pengaturan</CardTitle>
          <CardDescription>
            Kelola preferensi akun dan aplikasi untuk mendukung alur kerja yang rapi,
            konsisten, dan meminimalkan human error.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Halaman ini masih frontend-only dan siap dikembangkan lebih lanjut saat integrasi API.
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <TabsList className="col-span-12 flex h-auto w-full items-center justify-start gap-2 overflow-x-auto lg:col-span-3 lg:flex-col lg:items-stretch">
          <TabsTrigger value="profile" className="w-full min-w-[140px] justify-start">
            Profil
          </TabsTrigger>
          <TabsTrigger value="password" className="w-full min-w-[140px] justify-start">
            Password
          </TabsTrigger>
          <TabsTrigger value="preferences" className="w-full min-w-[140px] justify-start">
            Preferensi
          </TabsTrigger>
        </TabsList>
        <div className="col-span-12 lg:col-span-9">
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="password">
            <PasswordSettings />
          </TabsContent>
          <TabsContent value="preferences">
            <ApplicationPreferencesSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 