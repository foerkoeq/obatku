import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";

const DashboardDropdown = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="w-6 h-6  bg-transparent border border-default-300  hover:bg-transparent ring-offset-transparent hover:ring-0 hover:ring-transparent cursor-pointer"
        >
          <MoreHorizontal className="w-4 h-4 text-default-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px] p-0">
        <DropdownMenuItem className="py-2 rounded-none border-b border-default-200  text-default-900 focus:bg-default-400 focus:text-default-100 dark:focus:text-default-900">
          28 Hari Terakhir
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 rounded-none border-b border-default-200  text-default-900 focus:bg-default-400 focus:text-default-100 dark:focus:text-default-900">
          Bulan Lalu
        </DropdownMenuItem>
        <DropdownMenuItem className="py-2 rounded-none  text-default-900 focus:bg-default-400 focus:text-default-100 dark:focus:text-default-900">
          Tahun Lalu
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardDropdown;