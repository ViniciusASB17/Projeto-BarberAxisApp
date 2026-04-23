export const palette = {
  blueElectric: '#1e2eff',
  blueDeep: '#0a157a',
  blueBlack: '#000814',
  blueMid: '#0d1db0',
  accent: '#4f5fff',
  accentGlow: 'rgba(30, 46, 255, 0.35)',
  accentGlowSolid: 'rgba(30, 46, 255, 0.24)',
  white: '#ffffff',
  black: '#000000',
  surface: '#071127',
  surfaceMuted: '#0b1836',
  surfaceSoft: '#0f1f45',
  surfaceGlass: 'rgba(13, 29, 176, 0.18)',
  overlayStrong: 'rgba(0, 8, 20, 0.92)',
  overlaySoft: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(79,95,255,0.34)',
  textMuted: 'rgba(255,255,255,0.68)',
  textMutedSoft: 'rgba(255,255,255,0.8)',
  success: '#2fd6a2',
  warning: '#ffb648',
};

export const shadowPresets = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 10,
  },
  floating: {
    shadowColor: '#000000',
    shadowOpacity: 0.38,
    shadowRadius: 30,
    shadowOffset: {
      width: 0,
      height: 18,
    },
    elevation: 16,
  },
  glow: {
    shadowColor: palette.blueElectric,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 12,
  },
} as const;
