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
          // Readable muted text: 5.7:1 on #0a0a0a, 5.3:1 on #141414 (AA). Use instead of light-300/NN on text.
          400: '#8a8a8a',
        },
        cyan: {
          DEFAULT: '#00d9ff',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        "hero": "clamp(3rem, 8vw, 8rem)",
      },
      letterSpacing: {
        'display': '-0.04em',
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
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [typography],
};
export default config;
