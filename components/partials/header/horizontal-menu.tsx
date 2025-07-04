'use client'
import React from "react";
import { ChevronDown } from "lucide-react";
import { Link, usePathname } from "@/components/navigation";
import { useConfig } from '@/hooks/use-config'
import { getHorizontalMenuList } from "@/lib/menus";
import { Icon } from "@/components/ui/icon";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { useMediaQuery } from "@/hooks/use-media-query";

export default function HorizontalMenu() {

  const [config] = useConfig()

  const pathname = usePathname();

  const menuList = getHorizontalMenuList(pathname)

  const [openDropdown, setOpenDropdown] = React.useState<boolean>(false);

  const isDesktop = useMediaQuery('(min-width: 1280px)')

  if (config.layout !== 'horizontal' || !isDesktop) return null

  return (
    <div className="bg-card dark:bg-default-300 border-b border-default-200">
      <div className="container mx-auto px-6">
        <Menubar className="border-none bg-transparent">
          {menuList.flatMap(group => 
            group.menus.map(menu => (
              <MenubarMenu key={menu.id}>
                {menu.submenus.length > 0 ? (
                  <>
                    <MenubarTrigger className="cursor-pointer hover:bg-default-100">
                      {menu.icon && <Icon icon={menu.icon} className="h-4 w-4 mr-2" />}
                      {menu.label}
                    </MenubarTrigger>
                    <MenubarContent>
                      {menu.submenus.map((submenu, index) => (
                        <MenubarItem key={index} asChild>
                          <Link href={submenu.href} className="flex items-center">
                            {submenu.icon && <Icon icon={submenu.icon} className="h-4 w-4 mr-2" />}
                            {submenu.label}
                          </Link>
                        </MenubarItem>
                      ))}
                    </MenubarContent>
                  </>
                ) : (
                  <MenubarTrigger asChild>
                    <Link href={menu.href} className="cursor-pointer hover:bg-default-100 flex items-center">
                      {menu.icon && <Icon icon={menu.icon} className="h-4 w-4 mr-2" />}
                      {menu.label}
                    </Link>
                  </MenubarTrigger>
                )}
              </MenubarMenu>
            ))
          )}
        </Menubar>
      </div>
    </div>
  )
}


