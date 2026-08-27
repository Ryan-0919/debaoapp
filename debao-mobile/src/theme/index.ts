export const colors = {
  brand: '#4C4BEA',
  brandDark: '#3735C8',
  brandLight: '#F0F0FF',
  action: '#C9F456',
  page: '#F4F5F7',
  surface: '#FFFFFF',
  ink: '#171925',
  body: '#5F6574',
  muted: '#707684',
  line: '#E5E7ED',
  success: '#5DA765',
  error: '#FF7252',
  warning: '#F5A623',
  mint: '#EAF6EF',
  sky: '#EDF5FF',
  gold: '#FFF5DD',
  celadon: '#EAF7F7',
  apricot: '#FFF1E8',
  rose: '#FFF0F5',
  overlay: 'rgba(23, 25, 37, 0.48)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  section: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: '#171925',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
} as const;
