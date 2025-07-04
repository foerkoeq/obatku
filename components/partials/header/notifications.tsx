'use client';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from '@/components/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { notifications, type Notification } from "./data";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { Icon } from "@/components/ui/icon";

const Notifications = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button type="button" className="relative  hidden focus:ring-none focus:outline-hidden md:h-8 md:w-8 md:bg-secondary   text-secondary-foreground    rounded-full  md:flex flex-col items-center justify-center cursor-pointer">
                    <Icon icon="heroicons-outline:bell" className="animate-tada h-5 w-5" />
                    <Badge className=" w-4 h-4 p-0 text-[8px] rounded-full  font-semibold  items-center justify-center absolute left-[calc(100%-12px)] bottom-[calc(100%-10px)]" color="destructive">
                        2
                    </Badge>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className=" z-999 mx-4 lg:w-[320px] p-0">
                <DropdownMenuLabel>
                    <div className="flex justify-between px-4 py-3 border-b border-default-100 ">
                        <div className="text-sm text-default-800  font-medium ">
                            Notifikasi
                        </div>
                        <div className="text-default-800  text-xs md:text-right">
                            <Link href="/notifications" className="underline">
                                Lihat semua
                            </Link>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <div className="h-[300px] xl:h-[350px]">
                    <ScrollArea className="h-full">
                        {notifications?.map((item, index) => (
                            <div
                                key={`inbox-list-${index}`}
                                className="flex  items-center gap-2 px-4 py-3 border-b border-default-100 last:border-b-0  cursor-pointer hover:bg-secondary  last:rounded-b-lg"
                            >
                                <div className="flex-none">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.image} />
                                        <AvatarFallback>{item.title.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1 flex">
                                    <div className="flex-1">
                                        <div
                                            className={cn(
                                                "text-sm font-medium text-default-900",
                                                {
                                                    "text-default-600": item.unread,
                                                }
                                            )}
                                        >
                                            {item.title}
                                        </div>
                                        <div
                                            className={cn("text-xs  text-default-600 mt-1", {
                                                "text-default-500": item.unread,
                                            })}
                                        >
                                            {item.desc}
                                        </div>
                                    </div>
                                    <div className="flex-none">
                                        <div className="text-xs text-default-400 mt-1">
                                            {item.date}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default Notifications;
