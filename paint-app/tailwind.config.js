/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'accent-bg': 'var(--accent-bg)',
        'primary-text': 'var(--primary-text)',
        'secondary-text': 'var(--secondary-text)',
        'accent-color': 'var(--accent-color)',
        'success-color': 'var(--success-color)',
        'warning-color': 'var(--warning-color)',
        'border-color': 'var(--border-color)',
        'hover-bg': 'var(--hover-bg)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}