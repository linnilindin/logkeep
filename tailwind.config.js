/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent': '#E8A87C',
        // dark mode colors
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-border': '#2E2E2E',
        'dark-text-primary': '#E0E0E0',
        'dark-text-secondary': '#B0B0B0',
        // light mode colors 
        'light-bg': '#FAFAFA',
        'light-surface': '#F5F5F5',
        'light-border': '#E8E8E8',
        'light-text-primary': '#1A1A1A',
        'light-text-secondary': '#666666',
      },
      fontFamily: {
        title: ['var(--font-title)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        sans: ['var(--font-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

