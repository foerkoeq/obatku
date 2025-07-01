// # START OF DatePicker Component - Reusable date picker with popover
// Purpose: Provides a date picker input field with calendar popover
// Props: value, onChange, placeholder, disabled, className
// Returns: Date picker input with calendar popup
// Dependencies: Popover, Calendar, Button, Input, Icon from lucide-react

"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

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
  modal?: boolean
}

export function DatePicker({
  value,
  selected,
  onChange,
  onSelect,
  placeholder = "Pick a date",
  disabled = false,
  className,
  modal,
}: DatePickerProps) {
  // Backward-compatible prop resolution
  const resolvedValue = value ?? selected;
  const resolvedOnChange = onChange ?? onSelect;

  return (
    <Popover modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !resolvedValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {resolvedValue ? format(resolvedValue, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={resolvedValue}
          onSelect={resolvedOnChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// # END OF DatePicker Component 