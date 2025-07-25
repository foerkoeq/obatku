'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon"
import Image from "next/image";
import Link from 'next/link';

const ProfileInfo = () => {
  return (
    <div className="md:block hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild className=" cursor-pointer">
          <div className=" flex items-center gap-3  text-default-800 ">
          <Image
              src="/images/avatar/av-1.jpg"
              alt="foerkoeq"
              width={36}
              height={36}
              className="rounded-full"
            />

            <div className="text-sm font-medium  capitalize lg:block hidden  ">
              Jhon Doe
            </div>
            <span className="text-base  me-2.5 lg:inline-block hidden">
              <Icon icon="heroicons-outline:chevron-down"></Icon>
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 p-0" align="end">
          <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">

            <Image
              src="/images/avatar/av-1.jpg"
              alt="foerkoeq"
              width={36}
              height={36}
              className="rounded-full"
            />

            <div>
              <div className="text-sm font-medium text-default-800 capitalize ">
                Jhon Doe
              </div>
              <Link
                href="/dashboard"
                className="text-xs text-default-600 hover:text-primary"
              >
                info@codeshaper.net
              </Link>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            {[
              {
                name: "Profile",
                icon: "heroicons:user",
                href: "/user-profile"
              },
              {
                name: "Settings",
                icon: "heroicons:cog-6-tooth",
                href: "/settings"
              },
            ].map((item, index) => (
              <Link
                href={item.href}
                key={`info-menu-${index}`}
                className="cursor-pointer"
              >
                <DropdownMenuItem className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize px-3 py-1.5 cursor-pointer">
                  <Icon icon={item.icon} className="w-4 h-4" />
                  {item.name}
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="mb-0 dark:bg-background" />
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 cursor-pointer"
          >
            <div>
              <form>
                <button type="submit" className=" w-full  flex  items-center gap-2" >
                  <Icon icon="heroicons:power" className="w-4 h-4" />
                  Log out
                </button>
              </form>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export default ProfileInfo;
