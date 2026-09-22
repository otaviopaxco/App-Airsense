

export const colors = {
  bg: {
    top: '#0A1420',
    mid: '#0D2130',
    bottom: '#0F2A36',
  },
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(148, 219, 235, 0.18)',
  cardBorderStrong: 'rgba(148, 219, 235, 0.35)',
  glass: 'rgba(15, 42, 54, 0.65)',

  text: {
    primary: '#EAF6FA',
    secondary: '#9FB8C4',
    muted: '#5F7C89',
  },

  accent: '#22D3EE', // ciano principal (marca AirSense)
  accentSoft: 'rgba(34, 211, 238, 0.15)',
  accentGradient: ['#0EA5B7', '#22D3EE', '#7DF9E0'] as const,

  status: {
    Ativo: '#34D399',
    Offline: '#8A97A6',
    Alerta: '#FBBF24',
    Erro: '#F87171',
  },

  statusSoft: {
    Ativo: 'rgba(52, 211, 153, 0.16)',
    Offline: 'rgba(138, 151, 166, 0.16)',
    Alerta: 'rgba(251, 191, 36, 0.16)',
    Erro: 'rgba(248, 113, 113, 0.16)',
  },

  danger: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',

  screenGradient: ['#0A1420', '#0D2130', '#123642'] as const,
  headerGradient: ['#0EA5B7', '#0A1420'] as const,
  buttonGradient: ['#0EA5B7', '#22D3EE'] as const,
};

export type StatusKey = keyof typeof colors.status;
