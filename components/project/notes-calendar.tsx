"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"

const NotesCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  )
}

export default NotesCalendar;