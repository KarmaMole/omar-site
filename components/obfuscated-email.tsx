"use client";

interface ObfuscatedEmailProps {
  user: string;
  domain: string;
  className?: string;
}

export default function ObfuscatedEmail({ user, domain, className }: ObfuscatedEmailProps) {
  const handleClick = () => {
    window.location.href = `mailto:${user}@${domain}`;
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {user}&#64;{domain}
    </button>
  );
}
