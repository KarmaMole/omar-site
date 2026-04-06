export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  music: "Music",
  visual: "Visual",
  comics: "Comics",
  film: "Film",
  ai: "AI",
  writing: "Writing",
  photography: "Photography",
  research: "Research",
};

export function getContentTypeLabel(type: string): string {
  return CONTENT_TYPE_LABELS[type] ?? type;
}
