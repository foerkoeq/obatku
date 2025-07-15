export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Dashboard",
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/",
          label: "Dashboard",
          active: pathname === "/" || pathname.includes("/dashboard"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Inventori",
      id: "inventory",
      menus: [
        {
          id: "stock_data",
          href: "/inventory",
          label: "Data Stok Obat",
          active: pathname.includes("/inventory"),
          icon: "heroicons-outline:cube",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Transaksi",
      id: "transactions",
      menus: [
        {
          id: "transactions",
          href: "/transactions",
          label: "Transaksi",
          active: pathname.includes("/transactions"),
          icon: "heroicons-outline:document-text",
          submenus: [
            {
              href: "/transactions/list",
              label: "Daftar Transaksi",
              active: pathname.includes("/transactions/list"),
              icon: "heroicons-outline:list-bullet",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/submission",
              label: "Pengajuan",
              active: pathname.includes("/transactions/submission"),
              icon: "heroicons-outline:document-plus",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/approval",
              label: "Persetujuan",
              active: pathname.includes("/transactions/approval"),
              icon: "heroicons-outline:check-circle",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/outgoing",
              label: "Transaksi Keluar",
              active: pathname.includes("/transactions/outgoing"),
              icon: "heroicons-outline:check-circle",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    
    
    {
      groupLabel: "Pengaturan Template",
      id: "template-settings",
      menus: [
        {
          id: "template-settings",
          href: "/template-settings",
          label: "Pengaturan Template",
          active: pathname.includes("/template-settings"),
          icon: "heroicons-outline:document-duplicate",
          submenus: [
            {
              href: "/template-settings/qr-labels",
              label: "Label QR Code",
              active: pathname.includes("/template-settings/qr-labels"),
              icon: "heroicons-outline:qr-code",
              submenus: [],
              children: [],
            },
            {
              href: "/template-settings/berita-acara",
              label: "Berita Acara",
              active: pathname.includes("/template-settings/berita-acara"),
              icon: "heroicons-outline:document-text",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Pengguna",
      id: "users",
      menus: [
        {
          id: "users",
          href: "/users",
          label: "Manajemen Pengguna",
          active: pathname.includes("/users"),
          icon: "heroicons-outline:user-group",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Manajemen Data",
      id: "data-management",
      menus: [
        {
          id: "data-management",
          href: "/data-management",
          label: "Manajemen Data",
          active: pathname.includes("/data-management"),
          icon: "heroicons-outline:archive-box",
          submenus: [
            {
              href: "/data-management/history",
              label: "History Data",
              active: pathname.includes("/data-management/history"),
              icon: "heroicons-outline:clock",
              submenus: [],
              children: [],
            },
            {
              href: "/data-management/backup",
              label: "Backup & Restore",
              active: pathname.includes("/data-management/backup"),
              icon: "heroicons-outline:server",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Manajemen Sistem",
      id: "system-management",
      menus: [
        {
          id: "system-management",
          href: "/system-management",
          label: "Manajemen Sistem",
          active: pathname.includes("/system-management"),
          icon: "heroicons-outline:cpu-chip",
          submenus: [
            {
              href: "/system-management/features",
              label: "Kontrol Fitur",
              active: pathname.includes("/system-management/features"),
              icon: "heroicons-outline:squares-plus",
              submenus: [],
              children: [],
            },
            {
              href: "/system-management/maintenance",
              label: "Mode Maintenance",
              active: pathname.includes("/system-management/maintenance"),
              icon: "heroicons-outline:wrench-screwdriver",
              submenus: [],
              children: [],
            },
            {
              href: "/system-management/system-pages",
              label: "Halaman Sistem",
              active: pathname.includes("/system-management/system-pages"),
              icon: "heroicons-outline:document-duplicate",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Pengaturan",
      id: "settings",
      menus: [
        {
          id: "settings",
          href: "/settings",
          label: "Pengaturan",
          active: pathname.includes("/settings"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [],
        },
        {
          id: "logout",
          href: "/auth/logout",
          label: "Keluar",
          active: pathname.includes("/auth/logout"),
          icon: "heroicons-outline:arrow-right-on-rectangle",
          submenus: [],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Dashboard",
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/",
          label: "Dashboard",
          active: pathname === "/" || pathname.includes("/dashboard"),
          icon: "heroicons-outline:home",
          submenus:[],
        },
      ],
    },
    {
      groupLabel: "Inventori",
      id: "inventory",
      menus: [
        {
          id: "stock_data",
          href: "/inventory",
          label: "Data Stok Obat",
          active: pathname.includes("/inventory"),
          icon: "heroicons-outline:cube",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Transaksi",
      id: "transactions",
      menus: [
        {
          id: "transactions",
          href: "/transactions",
          label: "Transaksi",
          active: pathname.includes("/transactions"),
          icon: "heroicons-outline:document-text",
          submenus: [
            {
              href: "/transactions/list",
              label: "Daftar Transaksi",
              active: pathname.includes("/transactions/list"),
              icon: "heroicons-outline:list-bullet",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/submission",
              label: "Pengajuan",
              active: pathname.includes("/transactions/submission"),
              icon: "heroicons-outline:document-plus",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/approval",
              label: "Persetujuan",
              active: pathname.includes("/transactions/approval"),
              icon: "heroicons-outline:check-circle",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Manajemen Data",
      id: "data-management",
      menus: [
        {
          id: "data-management",
          href: "/data-management",
          label: "Manajemen Data",
          active: pathname.includes("/data-management"),
          icon: "heroicons-outline:archive-box",
          submenus: [
            {
              href: "/data-management/history",
              label: "History Data",
              active: pathname.includes("/data-management/history"),
              icon: "heroicons-outline:clock",
              submenus: [],
              children: [],
            },
            {
              href: "/data-management/backup",
              label: "Backup & Restore",
              active: pathname.includes("/data-management/backup"),
              icon: "heroicons-outline:server",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Manajemen Sistem",
      id: "system-management",
      menus: [
        {
          id: "system-management",
          href: "/system-management",
          label: "Manajemen Sistem",
          active: pathname.includes("/system-management"),
          icon: "heroicons-outline:cpu-chip",
          submenus: [
            {
              href: "/system-management/features",
              label: "Kontrol Fitur",
              active: pathname.includes("/system-management/features"),
              icon: "heroicons-outline:squares-plus",
              submenus: [],
              children: [],
            },
            {
              href: "/system-management/maintenance",
              label: "Mode Maintenance",
              active: pathname.includes("/system-management/maintenance"),
              icon: "heroicons-outline:wrench-screwdriver",
              submenus: [],
              children: [],
            },
            {
              href: "/system-management/system-pages",
              label: "Halaman Sistem",
              active: pathname.includes("/system-management/system-pages"),
              icon: "heroicons-outline:document-duplicate",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Pengguna",
      id: "users",
      menus: [
        {
          id: "users",
          href: "/users",
          label: "Pengguna",
          active: pathname.includes("/users"),
          icon: "heroicons-outline:users",
          submenus: [
            {
              href: "/users",
              label: "Manajemen Pengguna",
              active: pathname.includes("/users"),
              icon: "heroicons-outline:user-group",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Pengaturan Template",
      id: "template-settings",
      menus: [
        {
          id: "template-settings",
          href: "/template-settings",
          label: "Pengaturan Template",
          active: pathname.includes("/template-settings"),
          icon: "heroicons-outline:document-duplicate",
          submenus: [
            {
              href: "/template-settings/qr-labels",
              label: "Label QR Code",
              active: pathname.includes("/template-settings/qr-labels"),
              icon: "heroicons-outline:qr-code",
              submenus: [],
              children: [],
            },
            {
              href: "/template-settings/berita-acara",
              label: "Berita Acara",
              active: pathname.includes("/template-settings/berita-acara"),
              icon: "heroicons-outline:document-text",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "Pengaturan",
      id: "settings",
      menus: [
        {
          id: "settings",
          href: "/settings",
          label: "Pengaturan",
          active: pathname.includes("/settings"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [],
        },
        {
          id: "logout",
          href: "/auth/logout",
          label: "Keluar",
          active: pathname.includes("/auth/logout"),
          icon: "heroicons-outline:arrow-right-on-rectangle",
          submenus: [],
        },
      ],
    },
  ];
}