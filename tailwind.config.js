/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#121212',
        slate: '#1E1E1E',
        line: '#2E2E2E',
        ink: '#F5F4F0',
        muted: '#A8A69E',
        brand: {
          50: '#FBF7E9',
          100: '#F5EDCB',
          200: '#EDDFA3',
          300: '#E3CE6E',
          400: '#DBBF4F',
          500: '#D4AF37',
          600: '#B8952A',
          700: '#94781F',
          800: '#6F5A17',
          900: '#4A3C10',
        },
        success: '#10B981',
        danger: '#EF4444',
        'danger-soft': '#F87171',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        panel: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        card: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['16px', { lineHeight: '1.6' }],
        label: ['14px', { lineHeight: '1.5' }],
      },
      boxShadow: {
        panel: '0 8px 28px rgba(0, 0, 0, 0.24)',
        modal: '0 24px 70px rgba(0, 0, 0, 0.45)',
      },
      transitionDuration: {
        150: '150ms',
        200: '200ms',
      },
    },
  },
  plugins: [],
}
