import Link from "next/link";

interface TagBadgeProps {
  label: string;
  variant?: "default" | "category";
  href?: string;
}

export default function TagBadge({ label, variant = "default", href }: TagBadgeProps) {
  const className = `inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-[2px] border transition-colors duration-200 ${
    variant === "category"
      ? "border-cyan/30 text-cyan hover:border-cyan hover:text-cyan"
      : "border-[#1a1a1a] text-light-300 hover:border-cyan hover:text-cyan"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}
