import { clsx, type ClassValue } from "clsx";

/** Join class names. (Tailwind is gone; plain clsx, no conflict-merging.) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
