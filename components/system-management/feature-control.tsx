"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { USER_ROLES, type UserRoleType } from "@/lib/types/user";
import { FEATURES, DEFAULT_ROLE_FEATURES } from "@/lib/data/feature-control";
import type { Feature, FeatureToggleMap } from "@/lib/types/feature-control";

// ─── Role metadata ──────────────────────────────────────────────────────────

const ROLE_META: Record<UserRoleType, { icon: string; color: string; description: string }> = {
  Admin: {
    icon: "heroicons-outline:shield-check",
    color: "text-red-600",
    description: "Akses penuh ke seluruh fitur sistem",
  },
  Kabid: {
    icon: "heroicons-outline:briefcase",
    color: "text-blue-600",
    description: "Kepala Bidang – supervisor & persetujuan",
  },
  Kasubbid: {
    icon: "heroicons-outline:user-group",
    color: "text-indigo-600",
    description: "Kepala Sub Bidang – koordinasi & monitoring",
  },
  "Staf Dinas": {
    icon: "heroicons-outline:building-office-2",
    color: "text-emerald-600",
    description: "Staf operasional – kelola inventori & transaksi",
  },
  BPP: {
    icon: "heroicons-outline:map-pin",
    color: "text-amber-600",
    description: "Balai Penyuluhan Pertanian – koordinator lapangan",
  },
  PPL: {
    icon: "heroicons-outline:user",
    color: "text-teal-600",
    description: "Penyuluh Pertanian Lapangan – pengajuan & poktan",
  },
  POPT: {
    icon: "heroicons-outline:eye",
    color: "text-purple-600",
    description: "Pengamat Organisme Pengganggu Tumbuhan",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function countEnabled(toggles: FeatureToggleMap, feature: Feature): { on: number; total: number } {
  if (feature.subFeatures.length === 0) return { on: toggles[feature.id] ? 1 : 0, total: 1 };
  const total = feature.subFeatures.length;
  const on = feature.subFeatures.filter((sf) => toggles[sf.id]).length;
  return { on, total };
}

function countAllEnabled(toggles: FeatureToggleMap): { on: number; total: number } {
  let on = 0;
  let total = 0;
  for (const f of FEATURES) {
    if (f.subFeatures.length === 0) {
      total += 1;
      if (toggles[f.id]) on += 1;
    } else {
      total += f.subFeatures.length;
      on += f.subFeatures.filter((sf) => toggles[sf.id]).length;
    }
  }
  return { on, total };
}

// ─── Feature item row ───────────────────────────────────────────────────────

function SubFeatureRow({
  name,
  enabled,
  onToggle,
}: {
  name: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-default-50 transition-colors group">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
            enabled ? "bg-success" : "bg-default-300"
          )}
        />
        <span
          className={cn(
            "text-sm transition-colors truncate",
            enabled ? "text-default-800" : "text-default-400"
          )}
        >
          {name}
        </span>
      </div>
      <Switch
        size="sm"
        color={enabled ? "success" : "default"}
        checked={enabled}
        onCheckedChange={onToggle}
      />
    </div>
  );
}

// ─── Feature accordion item ────────────────────────────────────────────────

function FeatureAccordionItem({
  feature,
  toggles,
  onToggleFeature,
  onToggleSubFeature,
}: {
  feature: Feature;
  toggles: FeatureToggleMap;
  onToggleFeature: (featureId: string) => void;
  onToggleSubFeature: (subFeatureId: string) => void;
}) {
  const parentEnabled = toggles[feature.id] ?? false;
  const { on, total } = countEnabled(toggles, feature);
  const hasChildren = feature.subFeatures.length > 0;

  // Determine partial state for parent when some but not all sub-features are on
  const isPartial = hasChildren && on > 0 && on < total;

  return (
    <AccordionItem value={feature.id} className="border border-default-200 dark:border-default-300 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 pr-4">
        {/* The accordion trigger is the left side; switch is on the right side outside trigger */}
        <AccordionTrigger className="flex-1 py-3 px-4 hover:no-underline bg-transparent hover:bg-default-50 rounded-none data-[state=open]:rounded-b-none">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-colors",
                parentEnabled
                  ? "bg-primary/10 text-primary"
                  : "bg-default-100 text-default-400"
              )}
            >
              <Icon icon={feature.icon} className="h-4 w-4" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "font-medium text-sm transition-colors",
                    parentEnabled ? "text-default-900" : "text-default-400"
                  )}
                >
                  {feature.name}
                </span>
                {hasChildren && (
                  <Badge
                    color={on === total ? "success" : on > 0 ? "warning" : "default"}
                    className="text-[10px] px-1.5 py-0 leading-4"
                  >
                    {on}/{total}
                  </Badge>
                )}
              </div>
              <p
                className={cn(
                  "text-xs mt-0.5 transition-colors hidden sm:block",
                  parentEnabled ? "text-default-500" : "text-default-300"
                )}
              >
                {feature.description}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    color={parentEnabled ? (isPartial ? "warning" : "success") : "default"}
                    checked={parentEnabled}
                    onCheckedChange={() => onToggleFeature(feature.id)}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{parentEnabled ? "Nonaktifkan" : "Aktifkan"} {hasChildren ? "semua" : ""} fitur</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {hasChildren && (
        <AccordionContent className="px-4 pb-3 pt-0">
          <div className="ml-2 border-l-2 border-default-200 pl-4 space-y-0.5">
            {feature.subFeatures.map((sf) => (
              <SubFeatureRow
                key={sf.id}
                name={sf.name}
                enabled={!!(toggles[sf.id] && parentEnabled)}
                onToggle={() => onToggleSubFeature(sf.id)}
              />
            ))}
          </div>
        </AccordionContent>
      )}
    </AccordionItem>
  );
}

// ─── Role tab button ────────────────────────────────────────────────────────

function RoleTabButton({
  role,
  active,
  toggles,
  onClick,
}: {
  role: UserRoleType;
  active: boolean;
  toggles: FeatureToggleMap;
  onClick: () => void;
}) {
  const meta = ROLE_META[role];
  const { on, total } = countAllEnabled(toggles);

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all",
        "hover:bg-default-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active
          ? "bg-primary/5 border border-primary/30 shadow-sm"
          : "border border-transparent"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center h-9 w-9 rounded-lg shrink-0",
          active ? "bg-primary/10" : "bg-default-100"
        )}
      >
        <Icon
          icon={meta.icon}
          className={cn("h-5 w-5", active ? "text-primary" : meta.color)}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium text-sm truncate",
              active ? "text-primary" : "text-default-800"
            )}
          >
            {role}
          </span>
          <Badge
            color={on === total ? "success" : on > 0 ? "warning" : "default"}
            className="text-[10px] px-1.5 py-0 leading-4 shrink-0"
          >
            {on}/{total}
          </Badge>
        </div>
        <p className="text-xs text-default-400 truncate hidden lg:block">{meta.description}</p>
      </div>
    </button>
  );
}

// ─── Mobile role selector ───────────────────────────────────────────────────

function MobileRoleSelector({
  roles,
  activeRole,
  onSelect,
  allToggles,
}: {
  roles: readonly UserRoleType[];
  activeRole: UserRoleType;
  onSelect: (role: UserRoleType) => void;
  allToggles: Record<string, FeatureToggleMap>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin lg:hidden">
      {roles.map((role) => {
        const active = role === activeRole;
        const meta = ROLE_META[role];
        const { on, total } = countAllEnabled(allToggles[role] ?? {});
        return (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-all shrink-0",
              "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              active
                ? "bg-primary/5 border-primary/30 text-primary font-medium"
                : "border-default-200 text-default-600 hover:bg-default-50"
            )}
          >
            <Icon icon={meta.icon} className={cn("h-4 w-4", active ? "text-primary" : meta.color)} />
            <span>{role}</span>
            <Badge
              color={on === total ? "success" : on > 0 ? "warning" : "default"}
              className="text-[9px] px-1 py-0 leading-3"
            >
              {on}/{total}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function FeatureControlPanel() {
  const [activeRole, setActiveRole] = useState<UserRoleType>("Admin");

  // Deep clone the default config into state
  const [roleToggles, setRoleToggles] = useState<Record<string, FeatureToggleMap>>(() => {
    const clone: Record<string, FeatureToggleMap> = {};
    for (const role of USER_ROLES) {
      clone[role] = { ...(DEFAULT_ROLE_FEATURES[role] ?? {}) };
    }
    return clone;
  });

  const currentToggles = roleToggles[activeRole] ?? {};

  // Toggle a parent feature: if turning OFF → also turn off all children
  // If turning ON → also turn on all children
  const handleToggleFeature = useCallback(
    (featureId: string) => {
      setRoleToggles((prev) => {
        const current = { ...(prev[activeRole] ?? {}) };
        const newVal = !current[featureId];
        current[featureId] = newVal;

        // Find feature's children
        const feature = FEATURES.find((f) => f.id === featureId);
        if (feature) {
          for (const sf of feature.subFeatures) {
            current[sf.id] = newVal;
          }
        }
        return { ...prev, [activeRole]: current };
      });
    },
    [activeRole]
  );

  // Toggle a sub-feature; if all sub-features become OFF → parent goes OFF
  // If any sub-feature is ON → parent stays ON
  const handleToggleSubFeature = useCallback(
    (subFeatureId: string) => {
      setRoleToggles((prev) => {
        const current = { ...(prev[activeRole] ?? {}) };
        current[subFeatureId] = !current[subFeatureId];

        // Find parent
        const parent = FEATURES.find((f) =>
          f.subFeatures.some((sf) => sf.id === subFeatureId)
        );
        if (parent) {
          const anyOn = parent.subFeatures.some((sf) => current[sf.id]);
          current[parent.id] = anyOn;
        }
        return { ...prev, [activeRole]: current };
      });
    },
    [activeRole]
  );

  // Bulk actions
  const handleEnableAll = useCallback(() => {
    setRoleToggles((prev) => {
      const current = { ...(prev[activeRole] ?? {}) };
      for (const f of FEATURES) {
        current[f.id] = true;
        for (const sf of f.subFeatures) current[sf.id] = true;
      }
      return { ...prev, [activeRole]: current };
    });
  }, [activeRole]);

  const handleDisableAll = useCallback(() => {
    setRoleToggles((prev) => {
      const current = { ...(prev[activeRole] ?? {}) };
      for (const f of FEATURES) {
        current[f.id] = false;
        for (const sf of f.subFeatures) current[sf.id] = false;
      }
      return { ...prev, [activeRole]: current };
    });
  }, [activeRole]);

  const handleResetRole = useCallback(() => {
    setRoleToggles((prev) => ({
      ...prev,
      [activeRole]: { ...(DEFAULT_ROLE_FEATURES[activeRole] ?? {}) },
    }));
  }, [activeRole]);

  // Stats
  const stats = useMemo(() => countAllEnabled(currentToggles), [currentToggles]);
  const isDirty = useMemo(() => {
    const defaults = DEFAULT_ROLE_FEATURES[activeRole] ?? {};
    return Object.keys(currentToggles).some((k) => currentToggles[k] !== defaults[k]);
  }, [currentToggles, activeRole]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-default-900">Kontrol Fitur</h1>
        <p className="text-default-600">Atur akses fitur untuk setiap role pengguna</p>
      </div>

      <Alert color="info" variant="soft">
        <Icon icon="heroicons-outline:information-circle" className="h-5 w-5 shrink-0" />
        <AlertDescription>
          Perubahan pada halaman ini mengatur fitur mana yang dapat diakses oleh masing-masing role. 
          Fitur dasar seperti pengaturan akun & logout tidak dapat dinonaktifkan.
        </AlertDescription>
      </Alert>

      {/* Mobile role selector */}
      <MobileRoleSelector
        roles={USER_ROLES}
        activeRole={activeRole}
        onSelect={setActiveRole}
        allToggles={roleToggles}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left sidebar: role list (desktop) */}
        <div className="hidden lg:block w-72 shrink-0">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Role Pengguna</CardTitle>
              <CardDescription>Pilih role untuk mengatur aksesnya</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {USER_ROLES.map((role) => (
                <RoleTabButton
                  key={role}
                  role={role}
                  active={role === activeRole}
                  toggles={roleToggles[role] ?? {}}
                  onClick={() => setActiveRole(role)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: feature list */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Role header card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                    <Icon icon={ROLE_META[activeRole].icon} className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-default-900">{activeRole}</h2>
                    <p className="text-xs text-default-500">{ROLE_META[activeRole].description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-default-500">Fitur aktif:</span>
                    <Badge
                      color={stats.on === stats.total ? "success" : stats.on > 0 ? "warning" : "default"}
                    >
                      {stats.on} / {stats.total}
                    </Badge>
                  </div>
                  {isDirty && (
                    <Badge color="warning" className="animate-pulse">
                      Belum disimpan
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleEnableAll}>
              <Icon icon="heroicons-outline:check" className="h-4 w-4 mr-1.5" />
              Aktifkan Semua
            </Button>
            <Button variant="outline" size="sm" onClick={handleDisableAll}>
              <Icon icon="heroicons-outline:x-mark" className="h-4 w-4 mr-1.5" />
              Nonaktifkan Semua
            </Button>
            {isDirty && (
              <Button variant="outline" size="sm" onClick={handleResetRole}>
                <Icon icon="heroicons-outline:arrow-uturn-left" className="h-4 w-4 mr-1.5" />
                Reset ke Default
              </Button>
            )}
          </div>

          {/* Feature accordion */}
          <Accordion type="multiple" className="space-y-2">
            {FEATURES.map((feature) => (
              <FeatureAccordionItem
                key={feature.id}
                feature={feature}
                toggles={currentToggles}
                onToggleFeature={handleToggleFeature}
                onToggleSubFeature={handleToggleSubFeature}
              />
            ))}
          </Accordion>

          {/* Save area */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-2">
                  <Icon icon="heroicons-outline:exclamation-triangle" className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-default-700">Perubahan membutuhkan penyimpanan</p>
                    <p className="text-xs text-default-500">
                      Klik &quot;Simpan Perubahan&quot; untuk menerapkan konfigurasi fitur role {activeRole}.
                      Fitur dasar (pengaturan akun, logout) tetap aktif untuk semua role.
                    </p>
                  </div>
                </div>
                <Button
                  color="primary"
                  disabled={!isDirty}
                  className="shrink-0 w-full sm:w-auto"
                >
                  <Icon icon="heroicons-outline:check-circle" className="h-4 w-4 mr-1.5" />
                  Simpan Perubahan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
