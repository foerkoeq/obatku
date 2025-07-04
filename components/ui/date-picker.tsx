// # START OF DatePicker Component - Reusable date picker with popover
// Purpose: Provides a date picker input field with calendar popover
// Props: value, onChange, placeholder, disabled, className
// Returns: Date picker input with calendar popup
// Dependencies: Popover, Calendar, Button, Input, Icon from lucide-react

"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  /** Current selected date - preferred prop */
  value?: Date
  /** Legacy alias of value */
  selected?: Date
  /** Change handler - preferred prop */
  onChange?: (date: Date | undefined) => void
  /** Legacy alias of onChange */
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Whether to use modal mode (useful when inside other modals) */
  modal?: boolean
  /** Format string for date display */
  format?: string
  /** Allow clearing the selected date */
  allowClear?: boolean
  /** Custom trigger content */
  children?: React.ReactNode
  /** Size variant */
  size?: "sm" | "default" | "lg"
  /** Variant style */
  variant?: "default" | "outline" | "ghost"
}

export function DatePicker({
  value,
  selected,
  onChange,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  className,
  modal = false,
  format: dateFormat = "PPP",
  allowClear = false,
  children,
  size = "default",
  variant = "outline",
}: DatePickerProps) {
  // Backward-compatible prop resolution
  const resolvedValue = value ?? selected;
  const resolvedOnChange = onChange ?? onSelect;

  const [isOpen, setIsOpen] = React.useState(false)

  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    default: "h-9 px-3",
    lg: "h-10 px-4 text-base"
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    resolvedOnChange?.(undefined)
  }

  const formatDate = (date: Date) => {
    try {
      return format(date, dateFormat)
    } catch (error) {
      // Fallback to simple format if date-fns format fails
      return date.toLocaleDateString()
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    resolvedOnChange?.(date)
    setIsOpen(false)
  }

  const TriggerButton = () => (
    <Button
      type="button"
      variant={variant}
      className={cn(
        "w-full justify-start text-left font-normal transition-all duration-200",
        sizeClasses[size],
        !resolvedValue && "text-muted-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "group relative",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      disabled={disabled}
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
      <span className="flex-1 truncate">
        {resolvedValue ? formatDate(resolvedValue) : placeholder}
      </span>
      {allowClear && resolvedValue && !disabled && (
        <X 
          className="h-4 w-4 ml-2 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0" 
          onClick={handleClear}
        />
      )}
    </Button>
  )

  if (children) {
    return (
      <Popover modal={modal} open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {children}
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-0" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Calendar
            mode="single"
            selected={resolvedValue}
            onSelect={handleDateSelect}
            defaultMonth={resolvedValue}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover modal={modal} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <TriggerButton />
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 shadow-lg border-border/50" 
        align="start"
        side="bottom"
        sideOffset={4}
        onEscapeKeyDown={() => setIsOpen(false)}
        onPointerDownOutside={() => setIsOpen(false)}
      >
        <div className="rounded-md border bg-popover text-popover-foreground">
          <Calendar
            mode="single"
            selected={resolvedValue}
            onSelect={handleDateSelect}
            defaultMonth={resolvedValue}
            initialFocus
            disabled={disabled}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

DatePicker.displayName = "DatePicker"

// # END OF DatePicker Component 