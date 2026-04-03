import Link from "next/link";

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = "Coming Soon",
  description = "This section is currently under construction. Check back soon or get in touch to learn more.",
}: ComingSoonProps) {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-12 h-0.5 bg-cyan mb-8" />

      <h2 className="text-4xl font-bold text-light-100 mb-4">{title}</h2>

      <p className="text-light-300 max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      <Link
        href="/contact"
        className="inline-block border border-cyan text-cyan px-8 py-3 rounded-[2px] font-mono text-sm hover:bg-cyan hover:text-black transition-colors"
      >
        Get in Touch
      </Link>
    </section>
  );
}
