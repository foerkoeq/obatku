"use client"

import * as React from "react"
import DatePicker from "react-datepicker"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Import react-datepicker CSS
import "react-datepicker/dist/react-datepicker.css"

interface ReactDatePickerProps {
  /** Current selected date */
  value?: Date
  /** Change handler */
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Allow clearing the selected date */
  allowClear?: boolean
  /** Size variant */
  size?: "sm" | "default" | "lg"
  /** Format for display */
  displayFormat?: string
  /** Min date */
  minDate?: Date
  /** Max date */
  maxDate?: Date
  /** Show time picker */
  showTimeSelect?: boolean
  /** Locale */
  locale?: string
  /** Custom date format */
  dateFormat?: string
}

export function ReactDatePickerWrapper({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  className,
  allowClear = false,
  size = "default",
  displayFormat = "dd/MM/yyyy",
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat,
  ...props
}: ReactDatePickerProps) {
  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    default: "h-9 px-3",
    lg: "h-10 px-4 text-base"
  }

  const formatForDisplay = (date: Date | undefined): string => {
    if (!date) return ""
    try {
      return format(date, displayFormat)
    } catch {
      return date.toLocaleDateString()
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  // Custom input component
  const CustomInput = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
  >(({ value: inputValue, onClick, ...inputProps }, ref) => (
    <div className="relative">
      <Button
        ref={ref}
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          sizeClasses[size],
          !value && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        disabled={disabled}
        onClick={onClick}
        {...inputProps}
      >
        <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
        <span className="flex-1 truncate">
          {value ? formatForDisplay(value) : placeholder}
        </span>
        {allowClear && value && !disabled && (
          <X 
            className="h-4 w-4 ml-2 opacity-50 hover:opacity-100 transition-opacity flex-shrink-0" 
            onClick={handleClear}
          />
        )}
      </Button>
    </div>
  ))

  CustomInput.displayName = "CustomInput"

  return (
    <DatePicker
      selected={value}
      onChange={(date) => onChange?.(date || undefined)}
      customInput={<CustomInput />}
      dateFormat={dateFormat || (showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy")}
      minDate={minDate}
      maxDate={maxDate}
      showTimeSelect={showTimeSelect}
      disabled={disabled}
      placeholderText={placeholder}
      popperClassName="z-[9999]" // Ensure it appears above modals
      popperPlacement="bottom-start"
      {...props}
    />
  )
}

ReactDatePickerWrapper.displayName = "ReactDatePickerWrapper" 