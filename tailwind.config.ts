import type { Config } from 'tailwindcss'

export default {
  content: [],
  plugins: [],
  theme: {
    colors: {
      accent: '#E3E3E3',
      'accent-dark': '#C9C9C9',
      'accent-darker': '#454545',
      'accent-light': '#F6F6F6',
      background: '#FFFFFF',
      black: '#202020',
      'main-dark': '#791616',
      'main-light': '#E59696',
      main: '#CA3D3D',
      white: '#FFFFFF',
    },
    fontFamily: {
      Sarala: ['Sarala', 'sans-serif'],
      ReemKufi: ['Reem Kufi', 'Sarala', 'sans-serif'],
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
      boxShadow: {
        'inner-m': 'inset 0 2px 8px 0 rgb(0 0 0 / 0.3)',
      },
    },
  },
} satisfies Config
