import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageListItemProps {
  message: {
    title: string;
    desc: string;
    active?: boolean;
    hasnotifaction?: boolean;
    notification_count?: number;
    image: string;
  }
}

const MessageListItem = ({ message }: MessageListItemProps) => {
  const { title, desc, active, hasnotifaction, notification_count, image } = message;
  return (
    <li className="flex gap-3 py-3 px-6 hover:bg-default-200">
      <div className="flex-1 flex gap-2">
        <div className="relative">
          <Avatar>
            <AvatarImage src={image} alt="mesage title" />
            <AvatarFallback />
          </Avatar>
          <span className={cn("absolute top-1 end-0 w-2 h-2 bg-secondary rounded-full ring-3 ring-default-200",
            { "bg-success": active }
          )}></span>
        </div>
        <div>
          <div className="text-default-800  text-sm font-medium mb-1">{title}</div>
          <div className="text-xs  font-normal text-default-600">{desc}</div>
          <div className="text-default-400 dark:text-default-600  text-xs mt-1">3 min ago</div>
        </div>
      </div>
      {hasnotifaction && (
        <div className="flex-none">
          <span className="h-4 w-4 bg-destructive border border-none rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
            {notification_count}
          </span>
        </div>
      )}
    </li>
  );
};

export default MessageListItem;