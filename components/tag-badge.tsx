interface TagBadgeProps {
  label: string;
  variant?: "default" | "category";
}

export default function TagBadge({ label, variant = "default" }: TagBadgeProps) {
  const variantClasses =
    variant === "category"
      ? "bg-brick/10 text-brick"
      : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-block text-xs tracking-wide uppercase px-2.5 py-1 rounded ${variantClasses}`}
    >
      {label}
    </span>
  );
}
