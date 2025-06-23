
import { cn } from "@/lib/utils"

interface UpgradeProps {
  image?: any;
  children: React.ReactNode;
  className?: string;
}
const UpgradeBlock = ({ children, className }: UpgradeProps) => {
  return (
    <div
      className={cn("p-6 relative bg-default-900  rounded-2xl", className)}
    >
      {children}
    </div>
  );
};


export { UpgradeBlock };