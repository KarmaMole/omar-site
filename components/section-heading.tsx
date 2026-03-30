interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12">
      <h2 className="font-serif text-4xl md:text-5xl font-bold">{title}</h2>
      {subtitle && <p className="text-gray-600 text-lg mt-3">{subtitle}</p>}
      <div className="w-16 h-[2px] bg-brick mt-4" />
    </div>
  );
}
