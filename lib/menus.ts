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
        {
          id: "qr_labels",
          href: "/qr-labels",
          label: "Label QR Code",
          active: pathname.includes("/qr-labels"),
          icon: "heroicons-outline:qr-code",
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
        {
          id: "qr_labels",
          href: "/qr-labels",
          label: "Label QR Code",
          active: pathname.includes("/qr-labels"),
          icon: "heroicons-outline:qr-code",
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