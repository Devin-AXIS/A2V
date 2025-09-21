import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a random hex color string in the format "#RRGGBB".
 */
export function getRandomHexColor(): string {
  const colorNumber = Math.floor(Math.random() * 0xffffff)
  const hex = colorNumber.toString(16).padStart(6, "0")
  return `#${hex}`
}
