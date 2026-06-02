export type ThemeId = 'watermelon-ice'
// Add new theme IDs here as a union:
// export type ThemeId = 'watermelon-ice' | 'midnight-botanical' | 'saffron-bazaar'

export interface ThemePalette {
  bg: string
  bg2: string
  surface: string
  surface2: string
  plate: string
  ink: string
  ink2: string
  muted: string
  rule: string
  plum: string
  plum2: string
  plumDark: string
  copper: string
  copper2: string
  copperDark: string
  gold: string
  dustRose: string
  dustRoseLight: string
  petal: string
  overlay: string
  sale: string
  ok: string
}

export interface Theme {
  id: ThemeId
  name: string
  nameFA: string
  palette: ThemePalette
}

export const THEMES: Record<ThemeId, Theme> = {
  'watermelon-ice': {
    id: 'watermelon-ice',
    name: 'Watermelon Ice',
    nameFA: 'هندوانه یخی',
    palette: {
      bg:             '#F6FFFE',
      bg2:            '#E8FFFE',
      surface:        '#FAFFFF',
      surface2:       '#EBF9F8',
      plate:          '#E0F9F6',
      ink:            '#0A1A18',
      ink2:           '#1A3530',
      muted:          '#4A7A70',
      rule:           'rgba(10, 26, 24, .10)',
      plum:           '#002A22',
      plum2:          '#001A16',
      plumDark:       '#004A3A',
      copper:         '#D42A50',
      copper2:        '#B31E43',
      copperDark:     '#8F1536',
      gold:           '#00C9A7',
      dustRose:       '#FFB3C6',
      dustRoseLight:  '#FFD6E5',
      petal:          '#FFE0E8',
      overlay:        'rgba(0, 42, 34, 0.5)',
      sale:           '#C42050',
      ok:             '#00B896',
    },
  },
}

export const DEFAULT_THEME: ThemeId = 'watermelon-ice'
export const THEME_LIST = Object.values(THEMES)
