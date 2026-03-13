import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b10',
        foreground: '#e1e1e3',
        primary: {
          DEFAULT: '#9fef00', // HTB Green
          foreground: '#050505',
        },
        secondary: {
          DEFAULT: '#1f2029',
          foreground: '#e1e1e3',
        },
        muted: {
          DEFAULT: '#15161e',
          foreground: '#9499b3',
        },
        accent: {
          DEFAULT: '#9fef00',
          foreground: '#050505',
        },
        card: {
          DEFAULT: '#11121a',
          foreground: '#e1e1e3',
        },
        border: '#1f2029',
        input: '#0a0b10',
        ring: '#9fef00',
        success: '#9fef00',
        error: '#ff4b4b',
        warning: '#ffb86c',
        info: '#8be9fd',
        'htb-green': '#9fef00',
        'htb-dark': '#0a0b10',
        'htb-card': '#11121a',
        'htb-border': '#1f2029',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 15px -3px rgba(159, 239, 0, 0.3)',
        'glow-green-lg': '0 0 30px -5px rgba(159, 239, 0, 0.4)',
      },
      backgroundImage: {
        'grid-pattern': "url('/grid.svg')",
        'dots-pattern': "radial-gradient(circle, #1f2029 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
