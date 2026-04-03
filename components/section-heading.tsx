interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-12">
      <span className="section-label">{title}</span>
      <h2 className="text-4xl md:text-5xl font-bold text-light-100 mt-2">{title}</h2>
      {subtitle && <p className="text-light-300 text-lg mt-3">{subtitle}</p>}
    </div>
  );
}
