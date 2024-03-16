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
    },
  },
} satisfies Config
