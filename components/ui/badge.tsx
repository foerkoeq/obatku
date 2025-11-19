import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { color, rounded } from "@/lib/type";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border py-1 px-2 text-xs  capitalize font-semibold  transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      color: {
        default: "border-transparent bg-default text-default-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        secondary: "bg-secondary border-transparent text-secondary-foreground ",
        destructive: "bg-destructive border-transparent text-destructive-foreground",
        success: "bg-success border-transparent  text-success-foreground ",
        info: "bg-info border-transparent text-info-foreground ",
        warning: "bg-warning  border-transparent text-warning-foreground",
        blue: "bg-blue-500 border-transparent text-white hover:bg-blue-600",
        purple: "bg-purple-500 border-transparent text-white hover:bg-purple-600",
        indigo: "bg-indigo-500 border-transparent text-white hover:bg-indigo-600",
        teal: "bg-teal-500 border-transparent text-white hover:bg-teal-600",
        emerald: "bg-emerald-500 border-transparent text-white hover:bg-emerald-600",
        amber: "bg-amber-500 border-transparent text-white hover:bg-amber-600",
        rose: "bg-rose-500 border-transparent text-white hover:bg-rose-600",
        cyan: "bg-cyan-500 border-transparent text-white hover:bg-cyan-600",
        violet: "bg-violet-500 border-transparent text-white hover:bg-violet-600",
        fuchsia: "bg-fuchsia-500 border-transparent text-white hover:bg-fuchsia-600",
        sky: "bg-sky-500 border-transparent text-white hover:bg-sky-600",
        lime: "bg-lime-500 border-transparent text-white hover:bg-lime-600",
        orange: "bg-orange-500 border-transparent text-white hover:bg-orange-600",
        pink: "bg-pink-500 border-transparent text-white hover:bg-pink-600",
        slate: "bg-slate-500 border-transparent text-white hover:bg-slate-600",
        zinc: "bg-zinc-500 border-transparent text-white hover:bg-zinc-600",
        stone: "bg-stone-500 border-transparent text-white hover:bg-stone-600",
        neutral: "bg-neutral-500 border-transparent text-white hover:bg-neutral-600",
        red: "bg-red-500 border-transparent text-white hover:bg-red-600",
        green: "bg-green-500 border-transparent text-white hover:bg-green-600",
      },
      rounded: {
        sm: "rounded",
        md: "rounded-md",
        lg: "rounded-lg",
        full: "rounded-full",
      }
    },

    defaultVariants: {
      color: "default",
      rounded: "md",
    },
  }
);
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {

  color?: color;
  rounded?: rounded;
}


function Badge({ className, color, rounded, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ color, rounded }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
