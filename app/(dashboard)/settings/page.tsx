"use client"

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

// Import date picker components for demo
import { DatePicker, DateRangePicker } from '@/components/ui';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

  // Demo state for date pickers
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

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
          <TabsTrigger value="demo" className="w-full justify-start">
            Demo Components
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
          <TabsContent value="demo">
            <Card>
              <CardHeader>
                <CardTitle>Demo Komponen Date Picker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {/* Single Date Picker Demo */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Single Date Picker</Label>
                      <p className="text-sm text-muted-foreground">Pilih satu tanggal</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Default Size</Label>
                        <DatePicker
                          value={selectedDate}
                          onChange={setSelectedDate}
                          placeholder="Pilih tanggal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Small Size</Label>
                        <DatePicker
                          value={selectedDate}
                          onChange={setSelectedDate}
                          placeholder="Pilih tanggal"
                          size="sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Large Size</Label>
                        <DatePicker
                          value={selectedDate}
                          onChange={setSelectedDate}
                          placeholder="Pilih tanggal"
                          size="lg"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                        Set Hari Ini
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedDate(undefined)}>
                        Clear
                      </Button>
                    </div>
                    {selectedDate && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedDate.toLocaleDateString('id-ID')}
                      </p>
                    )}
                  </div>

                  {/* Date Range Picker Demo */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Date Range Picker</Label>
                      <p className="text-sm text-muted-foreground">Pilih rentang tanggal</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Default Range Picker</Label>
                        <DateRangePicker
                          value={dateRange}
                          onChange={setDateRange}
                          placeholder="Pilih rentang tanggal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Single Month View</Label>
                        <DateRangePicker
                          value={dateRange}
                          onChange={setDateRange}
                          placeholder="Pilih rentang tanggal"
                          monthsShown={1}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const now = new Date();
                          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                          setDateRange({ startDate: now, endDate: nextWeek });
                        }}
                      >
                        Set Minggu Ini
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setDateRange({ startDate: null, endDate: null })}
                      >
                        Clear
                      </Button>
                    </div>
                    {(dateRange.startDate || dateRange.endDate) && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {dateRange.startDate?.toLocaleDateString('id-ID')} - {dateRange.endDate?.toLocaleDateString('id-ID') || '...'}
                      </p>
                    )}
                  </div>

                  {/* Disabled State Demo */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Disabled State</Label>
                      <p className="text-sm text-muted-foreground">Komponen dalam keadaan disabled</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Disabled Single Date</Label>
                        <DatePicker
                          value={selectedDate}
                          onChange={setSelectedDate}
                          placeholder="Disabled date picker"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Disabled Range Date</Label>
                        <DateRangePicker
                          value={dateRange}
                          onChange={setDateRange}
                          placeholder="Disabled range picker"
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 