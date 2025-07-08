"use client"

import * as React from "react"
import ReactDatePicker from "react-datepicker"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Import react-datepicker CSS and our custom styles
import "react-datepicker/dist/react-datepicker.css"
import "./date-picker-styles.css"

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
  /** Custom date format for picker */
  dateFormat?: string
  /** Show year dropdown */
  showYearDropdown?: boolean
  /** Show month dropdown */
  showMonthDropdown?: boolean
  /** Scroll year dropdown */
  scrollableYearDropdown?: boolean
  /** Year dropdown item number */
  yearDropdownItemNumber?: number
  /** Year range for dropdown (from current year minus this value) */
  yearRange?: number
  /** Portal ID for better z-index management */
  portalId?: string
}

export function DatePicker({
  value,
  selected,
  onChange,
  onSelect,
  placeholder = "Pilih tanggal",
  disabled = false,
  className,
  allowClear = true,
  size = "default",
  displayFormat = "dd/MM/yyyy",
  minDate,
  maxDate,
  showTimeSelect = false,
  dateFormat,
  showYearDropdown = true,
  showMonthDropdown = true,
  scrollableYearDropdown = true,
  yearDropdownItemNumber = 100,  // Much larger range - show more years at once
  yearRange = 120,  // Extended range for better coverage
  portalId,
  ...props
}: DatePickerProps) {
  // Backward-compatible prop resolution
  const resolvedValue = value ?? selected
  const resolvedOnChange = onChange ?? onSelect

  // Calculate year range for better birth date selection
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - yearRange
  const maxYear = currentYear + 10  // Allow future dates

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
      return date.toLocaleDateString("id-ID")
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    resolvedOnChange?.(undefined)
  }

  // Custom input component dengan styling yang lebih baik
  const CustomInput = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }
  >(({ value: inputValue, onClick, ...inputProps }, ref) => (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal transition-all duration-200",
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "group relative",
        sizeClasses[size],
        !resolvedValue && "text-muted-foreground",
        disabled && "cursor-not-allowed opacity-50 hover:bg-background",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...(inputProps as any)}
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-left">
        {resolvedValue ? formatForDisplay(resolvedValue) : placeholder}
      </span>
      {allowClear && resolvedValue && !disabled && (
        <X 
          className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity flex-shrink-0 hover:text-destructive" 
          onClick={handleClear}
        />
      )}
    </Button>
  ))

  CustomInput.displayName = "CustomInput"

  return (
    <div className="w-full">
      <ReactDatePicker
        selected={resolvedValue}
        onChange={(date) => resolvedOnChange?.(date || undefined)}
        customInput={<CustomInput />}
        dateFormat={dateFormat || (showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy")}
        minDate={minDate || new Date(minYear, 0, 1)}  // Set min date to support year range
        maxDate={maxDate || new Date(maxYear, 11, 31)}  // Set max date
        showTimeSelect={showTimeSelect}
        showYearDropdown={showYearDropdown}
        showMonthDropdown={showMonthDropdown}
        scrollableYearDropdown={scrollableYearDropdown}
        yearDropdownItemNumber={yearDropdownItemNumber}
        disabled={disabled}
        placeholderText={placeholder}
        locale={id}
        // Critical: Ensure proper z-index and positioning
        popperClassName="react-datepicker-popper"
        popperPlacement="bottom-start"
        popperProps={{
          strategy: "fixed" as const,
        }}
        // Better UX options
        todayButton="Hari ini"
        showPopperArrow={false}
        fixedHeight
        // Enhanced keyboard navigation
        enableTabLoop={false}
        autoComplete="off"
        // Portal support for better z-index management
        portalId={portalId}
        {...(props as any)}
      />
    </div>
  )
}

DatePicker.displayName = "DatePicker"

export { DatePicker as default } 