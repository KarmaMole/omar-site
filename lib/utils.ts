export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // Pin to Dubai so a post dated at local midnight never shows the previous
    // day to visitors in other timezones (or on the UTC build server).
    timeZone: "Asia/Dubai",
  });
}

/** Short form ("Oct 2, 2026") for compact metadata lines. Also pinned to Dubai. */
export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Dubai",
  });
}
