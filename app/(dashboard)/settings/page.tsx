"use client"

import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import AccountInfoSettings from '@/components/settings/account-info-settings';
import PersonalDataSettings from '@/components/settings/personal-data-settings';
import PasswordSettings from '@/components/settings/password-settings';
import RoleInfoSettings from '@/components/settings/role-info-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteBreadcrumb from '@/components/site-breadcrumb';
import PageTitle from '@/components/page-title';
import { currentUserMock } from '@/lib/data/settings-demo';
import { User as UserIcon, KeyRound, Shield, UserCircle } from 'lucide-react';

const SettingsPage = () => {
  const user = currentUserMock;

  return (
    <div className="space-y-6">
      <SiteBreadcrumb />
      <PageTitle title="Pengaturan" />

      {/* User Summary Card */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-16 w-16 shrink-0 sm:h-20 sm:w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge color="primary" className="text-xs">
                  {user.role}
                </Badge>
                <Badge
                  color={user.isActive ? 'success' : 'default'}
                  className="text-xs"
                >
                  {user.isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
                {user.lokasi && (
                  <span className="text-xs text-muted-foreground">
                    {user.role === 'Admin'
                      ? 'Administrator Sistem'
                      : ['Kabid', 'Kasubbid', 'Staf Dinas'].includes(user.role)
                        ? 'Dinas Pertanian Kab. Tuban'
                        : `Kec. ${user.lokasi}`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <TabsList className="col-span-12 flex h-auto w-full items-center justify-start gap-1 overflow-x-auto rounded-lg border bg-card p-1.5 lg:col-span-3 lg:flex-col lg:items-stretch">
          <TabsTrigger
            value="personal"
            className="w-full min-w-[140px] justify-start gap-2 rounded-md px-3 py-2.5 text-sm"
          >
            <UserCircle className="h-4 w-4 shrink-0" />
            <span className="truncate">Data Pribadi</span>
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="w-full min-w-[140px] justify-start gap-2 rounded-md px-3 py-2.5 text-sm"
          >
            <UserIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">Info Akun</span>
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="w-full min-w-[140px] justify-start gap-2 rounded-md px-3 py-2.5 text-sm"
          >
            <KeyRound className="h-4 w-4 shrink-0" />
            <span className="truncate">Password</span>
          </TabsTrigger>
          <TabsTrigger
            value="role"
            className="w-full min-w-[140px] justify-start gap-2 rounded-md px-3 py-2.5 text-sm"
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span className="truncate">Role & Penugasan</span>
          </TabsTrigger>
        </TabsList>

        <div className="col-span-12 lg:col-span-9">
          <TabsContent value="personal">
            <PersonalDataSettings user={user} />
          </TabsContent>
          <TabsContent value="account">
            <AccountInfoSettings user={user} />
          </TabsContent>
          <TabsContent value="password">
            <PasswordSettings />
          </TabsContent>
          <TabsContent value="role">
            <RoleInfoSettings user={user} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsPage; 