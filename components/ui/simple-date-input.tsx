"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SimpleDateInputProps {
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
  /** Format for display (when not focused) */
  displayFormat?: string
  /** Min date */
  min?: string
  /** Max date */
  max?: string
}

export function SimpleDateInput({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  className,
  allowClear = false,
  size = "default",
  displayFormat = "dd/MM/yyyy",
  min,
  max,
}: SimpleDateInputProps) {
  const [isFocused, setIsFocused] = React.useState(false)

  const sizeClasses = {
    sm: "h-8 text-xs px-2",
    default: "h-9 px-3",
    lg: "h-10 px-4 text-base"
  }

  // Convert Date to YYYY-MM-DD format for HTML input
  const formatForInput = (date: Date | undefined): string => {
    if (!date) return ""
    return format(date, "yyyy-MM-dd")
  }

  // Convert HTML input value to Date
  const parseFromInput = (value: string): Date | undefined => {
    if (!value) return undefined
    const date = new Date(value + "T00:00:00")
    return isNaN(date.getTime()) ? undefined : date
  }

  // Format for display when not focused
  const formatForDisplay = (date: Date | undefined): string => {
    if (!date) return ""
    try {
      return format(date, displayFormat)
    } catch {
      return date.toLocaleDateString()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = parseFromInput(e.target.value)
    onChange?.(date)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange?.(undefined)
  }

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  if (isFocused) {
    // Show native date input when focused
    return (
      <div className="relative">
        <Input
          type="date"
          value={formatForInput(value)}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={cn(sizeClasses[size], className)}
          disabled={disabled}
          min={min}
          max={max}
          autoFocus
        />
        {allowClear && value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  // Show formatted display when not focused
  return (
    <div className="relative">
      <Button
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
        onClick={handleFocus}
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
  )
}

SimpleDateInput.displayName = "SimpleDateInput" 