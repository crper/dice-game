import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Class-name joiner with Tailwind conflict resolution, so an override like
 * `h-9 px-0` actually beats the base classes instead of depending on order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
