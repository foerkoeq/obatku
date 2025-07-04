import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ColorSchema from '@/components/partials/customizer/color-schema';
import FooterStyle from '@/components/partials/customizer/footer-style';
import HeaderColor from '@/components/partials/customizer/header-color';
import HeaderStyle from '@/components/partials/customizer/header-style';
import SetContentWidth from '@/components/partials/customizer/set-content-width';
import SetLayout from '@/components/partials/customizer/set-layout';
import SetSidebar from '@/components/partials/customizer/set-sidebar';
import SetSkin from '@/components/partials/customizer/set-skin';
import SidebarColor from '@/components/partials/customizer/sidebar-color';

import PasswordSettings from '@/components/settings/password-settings';
import ProfileSettings from '@/components/settings/profile-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteBreadcrumb from '@/components/site-breadcrumb';
import PageTitle from '@/components/page-title';

const SettingsPage = () => {
  const breadcrumb = [
    {
      href: '/dashboard',
      label: 'Dashboard',
    },
    {
      label: 'Pengaturan',
    },
  ];

  return (
    <div className="space-y-6">
      <SiteBreadcrumb items={breadcrumb} />
      <PageTitle title="Pengaturan" />

      <Tabs defaultValue="profile" className="grid grid-cols-12 gap-6">
        <TabsList className="col-span-12 lg:col-span-3 flex lg:flex-col lg:h-auto overflow-x-auto items-start">
          <TabsTrigger value="profile" className="w-full justify-start">
            Profil
          </TabsTrigger>
          <TabsTrigger value="password" className="w-full justify-start">
            Password
          </TabsTrigger>
          <TabsTrigger value="theme" className="w-full justify-start">
            Tema
          </TabsTrigger>
        </TabsList>
        <div className="col-span-12 lg:col-span-9">
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="password">
            <PasswordSettings />
          </TabsContent>
          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Tema</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-8 p-4">
                    <SetLayout />
                    <SetSkin />
                    <ColorSchema />
                    <SetSidebar />
                    <SidebarColor />
                    <HeaderStyle />
                    <HeaderColor />
                    <SetContentWidth />
                    <FooterStyle />
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 