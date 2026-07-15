import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#232E54',
          hover: '#1B2342',
          active: '#141B33',
        },
        coral: {
          DEFAULT: '#DD5E54',
          hover: '#C64A41',
          active: '#A93B33',
        },
        ink: '#1B2138',
        'text-body': '#181D29',
        'text-2': '#4C5567',
        'text-3': '#79839A',
        heading: '#121726',
        line: '#E1E5EE',
        'line-strong': '#CAD1DF',
        'surface-1': '#FFFFFF',
        'surface-2': '#EEF1F5',
        'surface-3': '#E4E8EF',
        'success-green': '#2F7D5B',
      },
      fontFamily: {
        display: ['"Schibsted Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(40px,5.6vw,70px)', { lineHeight: '1.04', letterSpacing: '-0.035em', fontWeight: '700' }],
        'h2': ['clamp(28px,3.4vw,44px)', { lineHeight: '1.04', letterSpacing: '-0.025em', fontWeight: '700' }],
      },
      maxWidth: {
        'content': '1140px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(18,23,38,.05), 0 1px 3px rgba(18,23,38,.05)',
        'md': '0 4px 10px rgba(18,23,38,.05), 0 14px 32px rgba(18,23,38,.09)',
        'lg': '0 10px 26px rgba(18,23,38,.09), 0 28px 56px rgba(18,23,38,.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
