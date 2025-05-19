import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * @param inputs - Class names to combine
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a consistent AI avatar URL based on a seed value
 * @param seed - String to use as seed for the avatar
 * @param size - Size of the avatar in pixels
 * @returns URL for the avatar image
 */
export function getAvatarUrl(seed: string, size: number = 128) {
  // Use dicebear avatars for human-like avatars
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&size=${size}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

/**
 * Generates a consistent AI icon URL based on a seed value
 * @param seed - String to use as seed for the icon
 * @param size - Size of the icon in pixels
 * @returns URL for the icon image
 */
export function getIconUrl(seed: string, size: number = 128) {
  // Use dicebear icons for abstract/geometric icons
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&size=${size}&backgroundColor=059ff2,9331f5,16d499,f5c837,fc7428`
}

/**
 * Generates a consistent project icon URL based on a seed value
 * @param seed - String to use as seed for the project icon
 * @param size - Size of the icon in pixels
 * @returns URL for the project icon image
 */
export function getProjectIconUrl(seed: string, size: number = 128) {
  // Use dicebear icons for app icons
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(seed)}&size=${size}&backgroundColor=ffdfbf,ffd5dc,d1d4f9,c0aede,b6e3f4`
}
