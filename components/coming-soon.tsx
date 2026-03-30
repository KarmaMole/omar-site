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
      {/* Brick accent line */}
      <div className="w-12 h-0.5 bg-brick mb-8" />

      <h2 className="font-serif text-4xl font-bold mb-4">{title}</h2>

      <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
        {description}
      </p>

      <Link
        href="/contact"
        className="inline-block bg-brick text-white px-8 py-3 rounded-full font-medium hover:bg-brick-light transition-colors"
      >
        Get in Touch
      </Link>
    </section>
  );
}
