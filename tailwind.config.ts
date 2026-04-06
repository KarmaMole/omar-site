import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: '#0a0a0a',
        dark: {
          100: '#1a1a1a',
          200: '#141414',
          300: '#0f0f0f',
        },
        light: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#a3a3a3',
        },
        cyan: {
          DEFAULT: '#00d9ff',
          dark: '#00b8d9',
          glow: 'rgba(0, 217, 255, 0.15)',
          strong: 'var(--color-accent-strong)',
          medium: 'var(--color-accent-medium)',
          subtle: 'var(--color-accent-subtle)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Source Serif 4', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        "hero": "clamp(3rem, 8vw, 8rem)",
        "hero-sub": "clamp(1.25rem, 2.5vw, 2rem)",
      },
      letterSpacing: {
        'display': '-0.04em',
        'tight-xl': '-0.03em',
      },
      transitionTimingFunction: {
        'spring-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        'card': 'rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.3) 0px 1px 3px 0px',
        'card-hover': 'rgba(255, 255, 255, 0.06) 0px 1px 0px 0px inset, rgba(0, 217, 255, 0.12) 0px 0px 20px 0px, rgba(0, 0, 0, 0.3) 0px 2px 8px 0px',
      },
      spacing: {
        'section': '6rem',
        'section-sm': '4rem',
        'section-lg': '8rem',
      },
      borderRadius: {
        DEFAULT: '2px',
        sm: '1px',
        md: '2px',
        lg: '4px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-in': 'slide-in 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [typography],
};
export default config;
