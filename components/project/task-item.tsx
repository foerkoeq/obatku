import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SquarePen, Trash2 } from "lucide-react";

interface TaskItemProps {
  task: { image: string; title: string };
}
const TaskItem = ({ task }: TaskItemProps) => {
  const { image, title } = task
  return (
    <li className="flex items-center gap-2 py-3 px-6">
      <div className="flex-none w-12">
        <Checkbox className="dark:bg-default-300" />
      </div>
      <div className="flex-none">
        <Avatar className="w-8 h-8">
          <AvatarImage src={image} alt={title} />
          <AvatarFallback>SA</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <div className="text-sm text-default-600 max-w-[140px] truncate">{title}</div>
      </div>
      <button className="text-default-400 me-2"> <SquarePen className="w-4 h-4 " /></button>
      <button className=" text-default-400 hover:text-destructive">   <Trash2 className="w-4 h-4" /></button>
    </li>
  );
};

export default TaskItem;