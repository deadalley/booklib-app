type Ramp = {
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

export type ThemeColors = {
  primary: Ramp
  secondary: Ramp
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

export type ThemeShadows = {
  card: string
  atelier: string
  elevated: string
  inner: string
  subtle: string
}

export type ThemeTokens = {
  colors: ThemeColors
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
  boxShadow: ThemeShadows
}

export type ThemeName = 'light' | 'dark'
export type ThemePreference = ThemeName | 'system'

export const THEME_STORAGE_KEY = 'booklib.theme'

/** BookLib v2 design tokens (the v1 "legacy" theme was retired). */
export const activeTheme: ThemeTokens = {
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
    secondary: {
      DEFAULT: '#c47f2b',
      50: '#fef3dc',
      100: '#fce4b8',
      200: '#f7d28a',
      300: '#f0c060',
      400: '#dca044',
      500: '#c47f2b',
      600: '#b06f1e',
      700: '#a06010',
      800: '#804d0e',
      900: '#5c380a',
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
    card: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    atelier:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    elevated:
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 8px 0 rgb(0 0 0 / 0.12)',
    subtle: '0px 0px 1px 1px rgba(0,0,0,0.06)',
  },
}

/**
 * Dark theme. The ramps are inverted: -50…-300 are dark tinted surfaces and
 * -400…-900 progressively lighter inks, so `bg-primary-50 text-primary` still
 * reads as "soft tint + strong accent" without per-component overrides.
 */
export const darkTheme: Pick<ThemeTokens, 'colors' | 'boxShadow'> = {
  colors: {
    primary: {
      DEFAULT: '#e0585d',
      50: '#341c1d',
      100: '#43211f',
      200: '#6a2b2e',
      300: '#93393d',
      400: '#f0868a',
      500: '#e0585d',
      600: '#f2a0a3',
      700: '#f4b1b3',
      800: '#f7c6c8',
      900: '#f9d8d9',
    },
    secondary: {
      DEFAULT: '#d99a45',
      50: '#33270f',
      100: '#45331a',
      200: '#694c1f',
      300: '#a57630',
      400: '#d99a45',
      500: '#e3ab5c',
      600: '#ecc07f',
      700: '#e9b56c',
      800: '#f2d09c',
      900: '#f7e2c2',
    },
    surface: {
      DEFAULT: '#2b2626',
      canvas: '#151313',
      container: '#2e2828',
      subtle: '#221e1e',
      elevated: '#1d1a1a',
      dark: '#0d0c0c',
      inverse: '#0d0c0c',
    },
    ink: {
      primary: '#f2ecea',
      secondary: '#d3c5c3',
      subtle: '#776a69',
      muted: '#a59694',
      inverse: '#1b1010',
    },
    stroke: {
      DEFAULT: '#3b3434',
      subtle: '#2c2626',
      strong: '#5b5151',
      inverse: '#f2ecea',
    },
  },
  boxShadow: {
    card: '0 1px 2px rgba(0, 0, 0, 0.5)',
    atelier: '0 4px 10px rgba(0, 0, 0, 0.45)',
    elevated:
      '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    inner: 'inset 0 2px 8px 0 rgb(0 0 0 / 0.4)',
    subtle: '0px 0px 1px 1px rgba(0, 0, 0, 0.4)',
  },
}

export const THEMES: Record<
  ThemeName,
  Pick<ThemeTokens, 'colors' | 'boxShadow'>
> = {
  light: activeTheme,
  dark: darkTheme,
}

/** `primary.DEFAULT` → `--primary`, `surface.canvas` → `--surface-canvas` */
export function themeVarName(group: string, key: string): string {
  return key === 'DEFAULT' ? `--${group}` : `--${group}-${key}`
}

function themeDeclarations(
  theme: Pick<ThemeTokens, 'colors' | 'boxShadow'>,
): string[] {
  const colors = Object.entries(theme.colors).flatMap(([group, values]) =>
    Object.entries(values).map(
      ([key, value]) => `${themeVarName(group, key)}:${value}`,
    ),
  )
  const shadows = Object.entries(theme.boxShadow).map(
    ([key, value]) => `${themeVarName('shadow', key)}:${value}`,
  )
  return [...colors, ...shadows]
}

/**
 * CSS custom properties for both themes. The light theme is on `:root`; the
 * dark theme applies under any `[data-theme="dark"]` ancestor.
 */
export function themeCss(): string {
  // Text on the always-dark bulk actions bar stays light in both themes
  const shared = `--ink-on-dark:${activeTheme.colors.ink.inverse}`
  const light = [
    'color-scheme:light',
    shared,
    ...themeDeclarations(activeTheme),
  ]
  const dark = ['color-scheme:dark', shared, ...themeDeclarations(darkTheme)]
  return `:root{${light.join(';')}}[data-theme="dark"]{${dark.join(';')}}`
}

/**
 * Runs before first paint (inlined in the document head) so the saved theme
 * is applied without a flash of the light theme.
 */
export const themeBootScript = `(function(){try{var p=localStorage.getItem('${THEME_STORAGE_KEY}');var d=p==='dark'||(p!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var t=d?'dark':'light';document.documentElement.setAttribute('data-theme',t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',t==='dark'?'${darkTheme.colors.surface.canvas}':'${activeTheme.colors.surface.canvas}');}catch(e){}})()`

function toVarRefs<T extends Record<string, Record<string, string>>>(
  values: T,
): T {
  return Object.fromEntries(
    Object.entries(values).map(([group, entries]) => [
      group,
      Object.fromEntries(
        Object.keys(entries).map((key) => [
          key,
          `var(${themeVarName(group, key)})`,
        ]),
      ),
    ]),
  ) as T
}

export function toTailwindTheme(theme: ThemeTokens) {
  return {
    extend: {
      // Colors and shadows resolve through CSS variables so the theme can
      // switch at runtime; see `themeCss()`.
      colors: toVarRefs(theme.colors),
      fontFamily: theme.fontFamily,
      letterSpacing: theme.letterSpacing,
      borderRadius: theme.borderRadius,
      boxShadow: toVarRefs({ shadow: theme.boxShadow }).shadow,
    },
  }
}
