/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': '#FF9900',
        'brand-hover': '#E88B00',
        'amazon-orange': '#FF9900',
        'amazon-blue': '#232F3E',
        'investor-green': '#10B981',
        'investor-red': '#EF4444',
        'surface': '#111111',
        'surface-raised': '#1a1a1a',
        'surface-overlay': '#222222',
        'border-subtle': '#2a2a2a',
        'text-primary': '#f5f5f5',
        'text-secondary': '#999999',
        'text-muted': '#666666',
        'status-good': '#22c55e',
        'status-warn': '#f59e0b',
        'status-bad': '#ef4444',
      },
      fontSize: {
        'display': ['2.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'title': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'micro': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '12px',
      },
      spacing: {
        '18': '4.5rem',
      }
    },
  },
  plugins: [],
}
