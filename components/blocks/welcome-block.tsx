
import { cn } from "@/lib/utils"
interface WelcomeProps {
  image?: any;
  children: React.ReactNode;
  badge?: string;
  className?: string;
}
const WelcomeBlock = ({ children, className, }: WelcomeProps) => {
  return (
    <div
      className={cn('bg-no-repeat bg-cover bg-center p-4 rounded-md relative z-10', className)}
    >
      {children}
    </div>
  );
};

const BlockBadge = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn('absolute z-10 top-1/2 -translate-y-1/2   end-6 mt-2 h-12 w-12 bg-primary-foreground dark:bg-default-900 dark:text-default-100 rounded-full text-xs font-medium flex flex-col items-center justify-center', className)} >
      {children}
    </div >
  )
}

export { WelcomeBlock, BlockBadge };