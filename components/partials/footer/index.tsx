"use client";
import React from "react";
import FooterContent from "./footer-content";
import { Link } from "@/components/navigation";
import { Icon } from "@/components/ui/icon";
import { getMenuList } from "@/lib/menus";
import { usePathname } from "@/components/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DashCodeFooter = () => {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  // Get main menu items for bottom nav
  const mainMenuItems = menuList.map(group => group.menus).flat().slice(0, 4);

  return (
    <FooterContent>
      <div className="md:flex justify-between text-default-600 hidden">
        <div className="text-center md:ltr:text-start md:rtl:text-right text-sm">
          COPYRIGHT &copy; {new Date().getFullYear()} ObatKu, Semua hak dilindungi
        </div>
        <div className="md:ltr:text-right md:rtl:text-end text-center text-sm">
          Dibuat dengan ❤️ untuk pertanian Indonesia
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="flex md:hidden justify-around items-center py-2">
        {mainMenuItems.map((item, index) => {
          if (item.submenus.length > 0) {
            // Menu dengan submenu menggunakan popover
            return (
              <Popover key={item.id}>
                <PopoverTrigger asChild>
                  <button className="flex flex-col items-center justify-center p-2 min-w-[60px]">
                    <div className={`p-2 rounded-lg ${item.active ? 'bg-primary text-primary-foreground' : 'text-default-600'}`}>
                      <Icon icon={item.icon} className="h-5 w-5" />
                    </div>
                    <span className="text-xs mt-1 text-center leading-tight">{item.label}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" side="top">
                  <div className="space-y-1">
                    {item.submenus.map((submenu) => (
                      <Link
                        key={submenu.href}
                        href={submenu.href}
                        className={`flex items-center gap-2 p-2 rounded text-sm hover:bg-secondary ${
                          submenu.active ? 'bg-primary text-primary-foreground' : 'text-default-700'
                        }`}
                      >
                        <Icon icon={submenu.icon} className="h-4 w-4" />
                        {submenu.label}
                      </Link>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            );
          } else {
            // Menu tanpa submenu langsung link
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex flex-col items-center justify-center p-2 min-w-[60px]"
              >
                <div className={`p-2 rounded-lg ${item.active ? 'bg-primary text-primary-foreground' : 'text-default-600'}`}>
                  <Icon icon={item.icon} className="h-5 w-5" />
                </div>
                <span className="text-xs mt-1 text-center leading-tight">{item.label}</span>
              </Link>
            );
          }
        })}
      </div>
    </FooterContent>
  );
};

export default DashCodeFooter;
