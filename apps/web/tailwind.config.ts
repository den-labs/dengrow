import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        body: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        dengrow: {
          50: '#f0fbe8',
          100: '#ddf6cd',
          200: '#bceda0',
          300: '#93df68',
          400: '#9AF95E',
          500: '#5CAC37',
          600: '#4a8a2c',
          700: '#3a6b24',
          800: '#237805',
          900: '#1a3f14',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 20px rgba(92, 172, 55, 0.15)',
        'glow-lg': '0 0 40px rgba(92, 172, 55, 0.2)',
        card: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover':
          '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-hero':
          'linear-gradient(to bottom, hsl(110 40% 96%), hsl(0 0% 100%))',
        'gradient-nature':
          'linear-gradient(135deg, hsl(110 40% 96%), hsl(104 30% 92%))',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
