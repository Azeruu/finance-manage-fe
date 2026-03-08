import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumberWithDots(value: string | number): string {
  if (value === undefined || value === null) return ''
  const number = typeof value === 'string' ? value.replace(/\D/g, '') : Math.floor(value).toString()
  if (!number) return ''
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export function parseFormattedNumber(value: string): string {
  return value.replace(/\./g, '')
}
