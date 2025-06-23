import { Check } from "lucide-react";

interface ActivityItemProps {
  activity: {
    title: string;
    date: string;
  }
}
const ActivityItem = ({ activity }: ActivityItemProps) => {
  const { title, date } = activity;
  return (
    <li className="flex items-center gap-3 px-4 pb-10">
      <div className="w-4 h-4 rounded-full flex justify-center items-center bg-default-600 relative">
        <Check className="w-3 h-3 text-default-foreground" />
      </div>
      <div>
        <h2 className="text-sm font-medium  mb-1 text-default-600">
          {title}
        </h2>
        <p className="text-xs capitalize">
          {date}
        </p>
      </div>
    </li>
  );
};

export default ActivityItem;
