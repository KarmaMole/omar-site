interface HeroProps {
  headline: string;
  tagline: string;
}

export default function Hero({ headline, tagline }: HeroProps) {
  return (
    <section className="h-screen flex items-center justify-center bg-black text-white overflow-hidden relative">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />

      {/* Content */}
      <div className="relative z-10 text-center px-6">
        <h1 className="text-hero font-serif font-bold">{headline}</h1>
        <p className="text-hero-sub text-gray-300 mt-4">{tagline}</p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
        <div className="w-px h-10 bg-white animate-bounce" />
      </div>
    </section>
  );
}
