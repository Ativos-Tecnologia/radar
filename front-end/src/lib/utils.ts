import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

export const formatISODateToBR = (value?: string | null) => {
  if (!value) return ""
  const [datePart] = value.split("T")
  const match = ISO_DATE_REGEX.exec(datePart)
  if (!match) return ""
  return `${match[3]}/${match[2]}/${match[1]}`
}

export const formatISODateTimeToBR = (value?: string | null) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export const normalizeBRDateInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  const parts = [] as string[]
  if (digits.length > 0) parts.push(digits.slice(0, Math.min(2, digits.length)))
  if (digits.length >= 3) parts.push(digits.slice(2, Math.min(4, digits.length)))
  if (digits.length >= 5) parts.push(digits.slice(4, 8))
  return parts.join("/")
}

export const normalizeBRDateTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 12)
  const datePart = normalizeBRDateInput(digits.slice(0, 8))
  const timeDigits = digits.slice(8)

  if (!timeDigits) return datePart

  let time = ""
  if (timeDigits.length > 0) time += timeDigits.slice(0, Math.min(2, timeDigits.length))
  if (timeDigits.length >= 3) time += ":" + timeDigits.slice(2, 4)

  return [datePart, time].filter(Boolean).join(" ")
}

export const parseBRDateToISO = (value: string) => {
  if (!value) return null
  const match = /^([0-3]\d)\/([0-1]\d)\/(\d{4})$/.exec(value)
  if (!match) return null
  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

export const parseBRDateTimeToISO = (value: string) => {
  if (!value) return null
  const match = /^([0-3]\d)\/([0-1]\d)\/(\d{4})\s+([0-2]\d):([0-5]\d)$/.exec(value)
  if (!match) return null
  const [, day, month, year, hour, minute] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}
