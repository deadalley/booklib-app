export type ThemeTokens = {
  colors: {
    primary: {
      DEFAULT: string
      50: string
      100: string
      200: string
      300: string
      400: string
      500: string
      600: string
      700: string
      800: string
      900: string
    }
    surface: {
      DEFAULT: string
      canvas: string
      container: string
      subtle: string
      elevated: string
      dark: string
      inverse: string
    }
    ink: {
      primary: string
      secondary: string
      subtle: string
      muted: string
      inverse: string
    }
    stroke: {
      DEFAULT: string
      subtle: string
      strong: string
      inverse: string
    }
  }
  fontFamily: {
    body: string[]
    display: string[]
    mono: string[]
  }
  letterSpacing: {
    caps: string
  }
  borderRadius: {
    scholarly: string
  }
  boxShadow: {
    atelier: string
    elevated: string
    inner: string
    subtle: string
  }
}

export const legacyTheme: ThemeTokens = {
  colors: {
    primary: {
      DEFAULT: '#CA3D3D',
      50: '#fff1f1',
      100: '#ffe0e0',
      200: '#ffc6c6',
      300: '#f6a1a1',
      400: '#e87272',
      500: '#CA3D3D',
      600: '#b12d2d',
      700: '#962020',
      800: '#791616',
      900: '#5f1111',
    },
    surface: {
      DEFAULT: '#F6F6F6',
      canvas: '#FFFFFF',
      container: '#FFFFFF',
      subtle: '#F6F6F6',
      elevated: '#FFFFFF',
      dark: '#202020',
      inverse: '#202020',
    },
    ink: {
      primary: '#202020',
      secondary: '#454545',
      subtle: '#DEDEDE',
      muted: '#C9C9C9',
      inverse: '#FFFFFF',
    },
    stroke: {
      DEFAULT: '#E3E3E3',
      subtle: '#F6F6F6',
      strong: '#C9C9C9',
      inverse: '#202020',
    },
  },
  fontFamily: {
    body: ['Sarala', 'sans-serif'],
    display: ['Reem Kufi', 'Sarala', 'sans-serif'],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },
  letterSpacing: {
    caps: '0.18em',
  },
  borderRadius: {
    scholarly: '2.4rem',
  },
  boxShadow: {
    atelier:
      '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    elevated:
      '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
    inner: 'inset 0 2px 8px 0 rgb(0 0 0 / 0.3)',
    subtle: '0px 0px 5px 2px rgba(0,0,0,0.82)',
  },
}

export const newTheme: ThemeTokens = {
  colors: {
    primary: {
      DEFAULT: '#b22227',
      50: '#fef3f2',
      100: '#fee5e3',
      200: '#fccbcd',
      300: '#f9a4a7',
      400: '#f46f74',
      500: '#e94545',
      600: '#d52c31',
      700: '#b22227',
      800: '#941f23',
      900: '#7b1f22',
    },
    surface: {
      DEFAULT: '#f5f3f3',
      canvas: '#fbf9f8',
      container: '#efeded',
      subtle: '#f5f3f3',
      elevated: '#ffffff',
      dark: '#1b1c1c',
      inverse: '#1b1c1c',
    },
    ink: {
      primary: '#1b1c1c',
      secondary: '#584140',
      subtle: '#A79A99',
      muted: '#8c7d7c',
      inverse: '#fbf9f8',
    },
    stroke: {
      DEFAULT: '#ddd5d4',
      subtle: '#ece8e7',
      strong: '#b7abaa',
      inverse: '#1b1c1c',
    },
  },
  fontFamily: {
    body: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui'],
    display: ['Fraunces', 'Manrope', 'Inter', 'ui-sans-serif', 'system-ui'],
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },
  letterSpacing: {
    caps: '0.18em',
  },
  borderRadius: {
    scholarly: '0.5rem',
  },
  boxShadow: {
    atelier:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    elevated:
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 8px 0 rgb(0 0 0 / 0.12)',
    subtle: '0px 0px 1px 1px rgba(0,0,0,0.06)',
  },
}

export const activeThemeName = 'new'

export const themes = {
  legacy: legacyTheme,
  new: newTheme,
} as const

export const activeTheme = themes[activeThemeName]

export function toTailwindTheme(theme: ThemeTokens) {
  return {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fontFamily,
      letterSpacing: theme.letterSpacing,
      borderRadius: theme.borderRadius,
      boxShadow: theme.boxShadow,
    },
  }
}
