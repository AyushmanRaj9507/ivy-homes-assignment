/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F6F0',
        'paper-dim': '#EEEFE6',
        ink: '#182219',
        ivy: {
          950: '#101B13',
          900: '#16241B',
          800: '#1E3624',
          700: '#294A32',
          600: '#3B6244',
          500: '#4F7A57',
          300: '#9AB79C',
          200: '#C9DAC7',
          100: '#E3EBDE'
        },
        brass: {
          700: '#8C6423',
          600: '#A87A2C',
          500: '#B8873B',
          300: '#DCC48F'
        },
        line: '#D8DDCE',
        clay: '#A64B3C'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif']
      },
      borderRadius: {
        none: '0px',
        sm: '2px',
        DEFAULT: '3px'
      }
    }
  },
  plugins: []
}
