"use client"

import * as React from "react"
import DatePicker from "react-datepicker"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Import react-datepicker CSS and our custom styles
import "react-datepicker/dist/react-datepicker.css"
import "./date-picker-styles.css"

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangePickerProps {
  /** Current selected date range */
  value?: DateRange
  /** Change handler */
  onChange?: (range: DateRange) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Allow clearing the selected dates */
  allowClear?: boolean
  /** Size variant */
  size?: "sm" | "default" | "lg"
  /** Format for display */
  displayFormat?: string
  /** Min date */
  minDate?: Date
  /** Max date */
  maxDate?: Date
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
  /** Portal ID for better z-index management */
  portalId?: string
  /** Number of months to show */
  monthsShown?: number
}

export function DateRangePicker({
  value = { startDate: null, endDate: null },
  onChange,
  placeholder = "Pilih rentang tanggal",
  disabled = false,
  className,
  allowClear = true,
  size = "default",
  displayFormat = "dd/MM/yyyy",
  minDate,
  maxDate,
  dateFormat,
  showYearDropdown = true,
  showMonthDropdown = true,
  scrollableYearDropdown = true,
  yearDropdownItemNumber = 15,
  portalId,
  monthsShown = 2,
  ...props
}: DateRangePickerProps) {
  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    default: "h-9 px-3", 
    lg: "h-10 px-4 text-base"
  }

  const formatForDisplay = (range: DateRange): string => {
    const { startDate, endDate } = range
    if (!startDate && !endDate) return ""
    
    try {
      if (startDate && endDate) {
        return `${format(startDate, displayFormat)} - ${format(endDate, displayFormat)}`
      } else if (startDate) {
        return `${format(startDate, displayFormat)} - ...`
      }
      return ""
    } catch {
      if (startDate && endDate) {
        return `${startDate.toLocaleDateString("id-ID")} - ${endDate.toLocaleDateString("id-ID")}`
      } else if (startDate) {
        return `${startDate.toLocaleDateString("id-ID")} - ...`
      }
      return ""
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    onChange?.({ startDate: null, endDate: null })
  }

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    onChange?.({ startDate: start, endDate: end })
  }

  // Custom input component
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
        !value.startDate && !value.endDate && "text-muted-foreground",
        disabled && "cursor-not-allowed opacity-50 hover:bg-background",
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...inputProps}
    >
      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate text-left">
        {formatForDisplay(value) || placeholder}
      </span>
      {allowClear && (value.startDate || value.endDate) && !disabled && (
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
      <DatePicker
        selected={value.startDate}
        onChange={handleDateChange}
        startDate={value.startDate}
        endDate={value.endDate}
        selectsRange
        customInput={<CustomInput />}
        dateFormat={dateFormat || "dd/MM/yyyy"}
        minDate={minDate}
        maxDate={maxDate}
        monthsShown={monthsShown}
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
          strategy: "fixed",
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
        {...props}
      />
    </div>
  )
}

DateRangePicker.displayName = "DateRangePicker"

export { DateRangePicker as default } 