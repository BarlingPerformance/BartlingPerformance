export const VEHICLE_COLORS = {
  blue: {
    solid: '#1E5FDC',
    glow: 'rgba(30, 95, 220, 0.35)',
    soft: 'rgba(30, 95, 220, 0.12)',
    border: 'rgba(30, 95, 220, 0.4)',
  },
  red: {
    solid: '#DC1E1E',
    glow: 'rgba(220, 30, 30, 0.35)',
    soft: 'rgba(220, 30, 30, 0.12)',
    border: 'rgba(220, 30, 30, 0.4)',
  },
};

export function colorFor(tag) {
  return VEHICLE_COLORS[tag] || VEHICLE_COLORS.red;
}
