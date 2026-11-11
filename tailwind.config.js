/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      colors: {
        // Paleta GitHub Premium - Como la imagen
        primary: {
          DEFAULT: '#6e40c9', // Morado GitHub
          light: '#8957e5',
          dark: '#553098',
        },
        secondary: {
          DEFAULT: '#1f6feb', // Azul GitHub
          light: '#58a6ff',
          dark: '#0969da',
        },
        accent: {
          DEFAULT: '#f778ba', // Rosa GitHub
          light: '#ff9ed0',
          dark: '#db61a2',
        },
        success: {
          DEFAULT: '#3fb950', // Verde GitHub
          light: '#56d364',
          dark: '#2ea043',
        },
        warning: {
          DEFAULT: '#d29922', // Amarillo GitHub
          light: '#e3b341',
          dark: '#9e6a03',
        },
        danger: {
          DEFAULT: '#f85149', // Rojo GitHub
          light: '#ff7b72',
          dark: '#da3633',
        },
        // Grises y backgrounds GitHub
        gray: {
          50: '#f6f8fa',
          100: '#eaeef2',
          200: '#d0d7de',
          300: '#afb8c1',
          400: '#8b949e',
          500: '#6e7681',
          600: '#57606a',
          700: '#424a53',
          800: '#32383f',
          900: '#24292f',
          950: '#1c2128',
        },
        dark: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          hover: '#21262d',
        },
        light: {
          bg: '#fafbfc',
          surface: '#ffffff',
          border: '#d0d7de',
          hover: '#f6f8fa',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(110, 64, 201, 0.4)',
        'glow-md': '0 0 20px rgba(110, 64, 201, 0.5)',
        'glow-lg': '0 0 30px rgba(110, 64, 201, 0.6)',
        'glow-purple': '0 0 25px rgba(110, 64, 201, 0.6)',
        'glow-pink': '0 0 20px rgba(247, 120, 186, 0.5)',
        'glow-blue': '0 0 20px rgba(31, 111, 235, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'glass-lg': '0 8px 32px 0 rgba(110, 64, 201, 0.12)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(110, 64, 201, 0.4)' },
          '50%': { boxShadow: '0 0 35px rgba(110, 64, 201, 0.7)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-github': 'linear-gradient(135deg, #6e40c9 0%, #1f6feb 50%, #f778ba 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
    },
  },
  plugins: [],
}
