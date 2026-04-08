import Link from "next/link";

interface FilterPillProps {
  href: string;
  label: string;
  active: boolean;
}

/**
 * Shared filter pill used on the work, dispatch, and studio listing pages.
 * Always renders a Link so browser behaviors like middle-click,
 * right-click-copy, and hover prefetch work as expected.
 */
export default function FilterPill({ href, label, active }: FilterPillProps) {
  return (
    <Link
      href={href}
      className={`shrink-0 whitespace-nowrap font-mono text-xs tracking-[0.15em] uppercase px-4 py-2 rounded border transition-colors duration-200 ${
        active
          ? "bg-cyan/10 border-cyan text-cyan"
          : "border-white/[0.07] text-light-300 hover:text-white hover:border-white/30"
      }`}
    >
      {label}
    </Link>
  );
}
