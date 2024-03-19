import type { Config } from 'tailwindcss'

export default {
  content: [],
  plugins: [],
  theme: {
    colors: {
      accent: '#C3BBAE',
      'accent-dark': '#A99D89',
      'accent-light': '#DFDCD4',
      background: '#EBE9E4',
      black: '#322020',
      gray: '#BEBEBE',
      'gray-dark': '#454545',
      'gray-light': '#E0E0E0',
      'main-dark': '#7E4141',
      'main-light': '#AB7777',
      'main-lighter': '#D09999',
      main: '#985858',
      white: '#FFFFFF',
    },
    fontFamily: {
      RadioCanada: ['Radio Canada', 'sans-serif'],
    },
    extend: {
      borderRadius: {
        m: '2.4rem',
      },
      fontSize: {
        base: '14px',
        lg: '1.2rem',
        xl: '1.44rem',
        '2xl': '1.728rem',
        '3xl': '2.074rem',
        '4xl': '2.488rem',
        '5xl': '2.986rem',
      },
    },
  },
} satisfies Config
