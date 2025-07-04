"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
    /** Current selected date range */
    value?: DateRange;
    /** Change handler */
    onChange?: (range: DateRange | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    /** Whether to use modal mode (useful when inside other modals) */
    modal?: boolean;
    /** Format string for date display */
    format?: string;
    /** Allow clearing the selected range */
    allowClear?: boolean;
    /** Custom trigger content */
    children?: React.ReactNode;
    /** Size variant */
    size?: "sm" | "default" | "lg";
    /** Variant style */
    variant?: "default" | "outline" | "ghost";
    /** Number of months to display */
    numberOfMonths?: 1 | 2;
    /** Alignment of the popover */
    align?: "start" | "center" | "end";
}

export default function DateRangePicker({
    value,
    onChange,
    placeholder = "Pick a date range",
    disabled = false,
    className,
    modal = false,
    format: dateFormat = "LLL dd, y",
    allowClear = false,
    children,
    size = "default",
    variant = "outline",
    numberOfMonths = 2,
    align = "start",
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false);

    const sizeClasses = {
        sm: "h-8 text-xs px-2",
        default: "h-9 px-3",
        lg: "h-10 px-4 text-base"
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(undefined);
    };

    const formatDate = (date: Date) => {
        try {
            return format(date, dateFormat);
        } catch (error) {
            // Fallback to simple format if date-fns format fails
            return date.toLocaleDateString();
        }
    };

    const formatDateRange = (range: DateRange) => {
        if (!range.from) return placeholder;
        
        if (range.to) {
            return `${formatDate(range.from)} - ${formatDate(range.to)}`;
        }
        
        return formatDate(range.from);
    };

    const handleRangeSelect = (range: DateRange | undefined) => {
        onChange?.(range);
        // Close when both dates are selected
        if (range?.from && range?.to) {
            setIsOpen(false);
        }
    };

    const TriggerButton = () => (
        <Button
            type="button"
            variant={variant}
            className={cn(
                "w-full justify-start text-left font-normal transition-all duration-200",
                sizeClasses[size],
                !value?.from && "text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "group relative",
                disabled && "cursor-not-allowed opacity-50",
                className
            )}
            disabled={disabled}
        >
            <CalendarIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4 flex-shrink-0" />
            <span className="flex-1 truncate">
                {value ? formatDateRange(value) : placeholder}
            </span>
            {allowClear && value?.from && !disabled && (
                <X 
                    className="h-4 w-4 ml-2 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0" 
                    onClick={handleClear}
                />
            )}
        </Button>
    );

    if (children) {
        return (
            <Popover modal={modal} open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    {children}
                </PopoverTrigger>
                <PopoverContent 
                    className="w-auto p-0" 
                    align={align}
                    side="bottom"
                    sideOffset={4}
                >
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={handleRangeSelect}
                        numberOfMonths={numberOfMonths}
                        disabled={disabled}
                    />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <Popover modal={modal} open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <TriggerButton />
            </PopoverTrigger>
            <PopoverContent 
                className="w-auto p-0 shadow-lg border-border/50" 
                align={align}
                side="bottom"
                sideOffset={4}
                onEscapeKeyDown={() => setIsOpen(false)}
                onPointerDownOutside={() => setIsOpen(false)}
            >
                <div className="rounded-md border bg-popover text-popover-foreground">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={handleRangeSelect}
                        numberOfMonths={numberOfMonths}
                        disabled={disabled}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}

DateRangePicker.displayName = "DateRangePicker";
