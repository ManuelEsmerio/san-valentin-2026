import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        handwritten: ["'Caveat'", "cursive"],
        calligraphy: ["'Great Vibes'", "cursive"],
        body: ["'Inter'", 'sans-serif'],
        code: ['monospace'],
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
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        coral: 'hsl(var(--coral))',
        magenta: 'hsl(var(--magenta))',
        gold: 'hsl(var(--accent))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 16px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-out': {
            'from': { opacity: '1', transform: 'scale(1)' },
            'to': { opacity: '0', transform: 'scale(0.95)' },
        },
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'heart-fly-1': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(0, -120px) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'heart-fly-2': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(80px, -80px) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'heart-fly-3': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(120px, 0) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'heart-fly-4': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(80px, 80px) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'heart-fly-5': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(0, 120px) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'heart-fly-6': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(-80px, 80px) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'heart-fly-7': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(-120px, 0) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'heart-fly-8': { '0%': { transform: 'translate(0, 0) scale(0.5)', opacity: '0' }, '1%': { opacity: '1' }, '25%': { transform: 'translate(-80px, -80px) scale(1.2)', opacity: '0' }, '100%': { opacity: '0' } },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(120%) rotate(360deg)', opacity: '0' },
        },
        'heart-celebrate': {
          '0%': { transform: 'translateY(10px) scale(0.7)', opacity: '0' },
          '40%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { transform: 'translateY(-30px) scale(0.8)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' },
        },
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px hsla(var(--primary), 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 25px hsla(var(--primary), 0.8))' },
        },
        'spin-slow': 'spin 8s linear infinite',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'fade-out': 'fade-out 0.5s ease-in forwards',
        'heart-beat': 'heart-beat 1.2s ease-in-out infinite',
        'heart-fly-1': 'heart-fly-1 4s ease-out infinite',
        'heart-fly-2': 'heart-fly-2 4s ease-out infinite',
        'heart-fly-3': 'heart-fly-3 4s ease-out infinite',
        'heart-fly-4': 'heart-fly-4 4s ease-out infinite',
        'heart-fly-5': 'heart-fly-5 4s ease-out infinite',
        'heart-fly-6': 'heart-fly-6 4s ease-out infinite',
        'heart-fly-7': 'heart-fly-7 4s ease-out infinite',
        'heart-fly-8': 'heart-fly-8 4s ease-out infinite',
        'confetti-fall': 'confetti-fall 2s linear infinite',
        'heart-celebrate': 'heart-celebrate 1.2s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
