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

export function getMenuList(pathname: string, t: any): Group[] {

  return [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/",
          label: t("dashboard"),
          active: pathname.includes("/"),
          icon: "heroicons-outline:home",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("inventory"),
      id: "inventory",
      menus: [
        {
          id: "stock_data",
          href: "/inventory/stock-data",
          label: t("stock_data"),
          active: pathname.includes("/inventory"),
          icon: "heroicons-outline:cube",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("transactions"),
      id: "transactions",
      menus: [
        {
          id: "transactions",
          href: "/transactions",
          label: t("transactions"),
          active: pathname.includes("/transactions"),
          icon: "heroicons-outline:document-text",
          submenus: [
            {
              href: "/transactions/list",
              label: t("transaction_list"),
              active: pathname.includes("/transactions/list"),
              icon: "heroicons-outline:list-bullet",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/request",
              label: t("transaction_request"),
              active: pathname.includes("/transactions/request"),
              icon: "heroicons-outline:document-plus",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/approval",
              label: t("transaction_approval"),
              active: pathname.includes("/transactions/approval"),
              icon: "heroicons-outline:check-circle",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/out",
              label: t("transaction_out"),
              active: pathname.includes("/transactions/out"),
              icon: "heroicons-outline:arrow-right",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("users"),
      id: "users",
      menus: [
        {
          id: "users",
          href: "/users",
          label: t("users"),
          active: pathname.includes("/users"),
          icon: "heroicons-outline:users",
          submenus: [
            {
              href: "/users/management",
              label: t("user_management"),
              active: pathname.includes("/users/management"),
              icon: "heroicons-outline:user-group",
              submenus: [],
              children: [],
            },
            {
              href: "/users/roles",
              label: t("user_roles"),
              active: pathname.includes("/users/roles"),
              icon: "heroicons-outline:shield-check",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("settings"),
      id: "settings",
      menus: [
        {
          id: "settings",
          href: "/settings",
          label: t("settings"),
          active: pathname.includes("/settings"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [],
        },
        {
          id: "logout",
          href: "/auth/logout",
          label: t("sign_out"),
          active: pathname.includes("/auth/logout"),
          icon: "heroicons-outline:arrow-right-on-rectangle",
          submenus: [],
        },
      ],
    },
  ];
}

export function getHorizontalMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/",
          label: t("dashboard"),
          active: pathname.includes("/"),
          icon: "heroicons-outline:home",
          submenus:[],
        },
      ],
    },
    {
      groupLabel: t("inventory"),
      id: "inventory",
      menus: [
        {
          id: "stock_data",
          href: "/inventory/stock-data",
          label: t("stock_data"),
          active: pathname.includes("/inventory"),
          icon: "heroicons-outline:cube",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("transactions"),
      id: "transactions",
      menus: [
        {
          id: "transactions",
          href: "/transactions",
          label: t("transactions"),
          active: pathname.includes("/transactions"),
          icon: "heroicons-outline:document-text",
          submenus: [
            {
              href: "/transactions/list",
              label: t("transaction_list"),
              active: pathname.includes("/transactions/list"),
              icon: "heroicons-outline:list-bullet",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/request",
              label: t("transaction_request"),
              active: pathname.includes("/transactions/request"),
              icon: "heroicons-outline:document-plus",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/approval",
              label: t("transaction_approval"),
              active: pathname.includes("/transactions/approval"),
              icon: "heroicons-outline:check-circle",
              submenus: [],
              children: [],
            },
            {
              href: "/transactions/out",
              label: t("transaction_out"),
              active: pathname.includes("/transactions/out"),
              icon: "heroicons-outline:arrow-right",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("users"),
      id: "users",
      menus: [
        {
          id: "users",
          href: "/users",
          label: t("users"),
          active: pathname.includes("/users"),
          icon: "heroicons-outline:users",
          submenus: [
            {
              href: "/users/management",
              label: t("user_management"),
              active: pathname.includes("/users/management"),
              icon: "heroicons-outline:user-group",
              submenus: [],
              children: [],
            },
            {
              href: "/users/roles",
              label: t("user_roles"),
              active: pathname.includes("/users/roles"),
              icon: "heroicons-outline:shield-check",
              submenus: [],
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: t("settings"),
      id: "settings",
      menus: [
        {
          id: "settings",
          href: "/settings",
          label: t("settings"),
          active: pathname.includes("/settings"),
          icon: "heroicons-outline:cog-6-tooth",
          submenus: [],
        },
        {
          id: "logout",
          href: "/auth/logout",
          label: t("sign_out"),
          active: pathname.includes("/auth/logout"),
          icon: "heroicons-outline:arrow-right-on-rectangle",
          submenus: [],
        },
      ],
    },
  ];
}