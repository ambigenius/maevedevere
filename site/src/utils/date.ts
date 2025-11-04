/**
 * Format a Date object into a human-friendly string
 * @param d - Date object to format
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

