/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#1E40AF',
          DEFAULT: '#1E40AF',
        },
        success: {
          green: '#059669',
          DEFAULT: '#059669',
        },
        error: {
          red: '#DC2626',
          DEFAULT: '#DC2626',
        },
        warning: {
          orange: '#F59E0B',
          DEFAULT: '#F59E0B',
        },
        neutral: {
          gray: '#6B7280',
        },
      },
    },
  },
  plugins: [],
}
