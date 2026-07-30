import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(currencyCode?: string | null): string {
  if (!currencyCode) return "₦";
  const code = currencyCode.toUpperCase().trim();
  switch (code) {
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "GHS":
      return "₵";
    case "KES":
      return "KSh ";
    case "NGN":
    default:
      return "₦";
  }
}
