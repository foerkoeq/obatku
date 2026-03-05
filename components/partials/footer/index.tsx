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
import { useQrScanner } from "@/hooks/use-qr-scanner";

const FoerKoeqFooter = () => {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);
  const { openScanner } = useQrScanner();

  // Get main menu items for bottom nav (2 kiri + scan + 2 kanan)
  const allMenuItems = menuList.map(group => group.menus).flat();
  const leftItems = allMenuItems.slice(0, 2);
  const rightItems = allMenuItems.slice(2, 4);

  const renderMenuItem = (item: (typeof allMenuItems)[0]) => {
    if (item.submenus.length > 0) {
      return (
        <Popover key={item.id}>
          <PopoverTrigger asChild>
            <button className="flex flex-col items-center justify-center p-1.5 min-w-[52px]">
              <div className={`p-1.5 rounded-lg transition-colors ${item.active ? 'bg-primary text-primary-foreground' : 'text-default-600'}`}>
                <Icon icon={item.icon} className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5 text-center leading-tight text-default-600">{item.label}</span>
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
    }
    return (
      <Link
        key={item.id}
        href={item.href}
        className="flex flex-col items-center justify-center p-1.5 min-w-[52px]"
      >
        <div className={`p-1.5 rounded-lg transition-colors ${item.active ? 'bg-primary text-primary-foreground' : 'text-default-600'}`}>
          <Icon icon={item.icon} className="h-5 w-5" />
        </div>
        <span className="text-[10px] mt-0.5 text-center leading-tight text-default-600">{item.label}</span>
      </Link>
    );
  };

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
      
      {/* Mobile Bottom Navigation with center scan button */}
      <div className="flex md:hidden justify-around items-end py-1.5 relative">
        {/* Left menu items */}
        {leftItems.map(renderMenuItem)}

        {/* Center Scan Button - elevated/prominent */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={openScanner}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Scan QR Code"
          >
            <Icon icon="heroicons:camera-20-solid" className="w-6 h-6" />
            {/* Subtle glow ring */}
            <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse pointer-events-none" />
          </button>
          <span className="text-[10px] mt-0.5 text-center leading-tight text-primary font-medium">Scan</span>
        </div>

        {/* Right menu items */}
        {rightItems.map(renderMenuItem)}
      </div>
    </FooterContent>
  );
};

export default FoerKoeqFooter;
