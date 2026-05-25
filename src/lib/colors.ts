/**
 * Digica Finance Dashboard — brand color palette
 * @see src/app/globals.css for CSS variables and theme tokens
 */
export const colors = {
  primary: {
    deepPurple: "#2e0260",
    royalPurple: "#620a79",
  },
  secondary: {
    softLavender: "#c0a0ff",
    paleLavender: "#e3d5ff",
    mutedPurple: "#5d4f8f",
    softPeriwinkle: "#c1c8fa",
    lightPurpleTint: "#ccb6dd",
  },
  gradient: {
    from: "#e3d5ff",
    to: "#e4efff",
    angle: "135deg",
  },
  background: "#f2f3fc",
} as const;

export const premiumGradient = `linear-gradient(${colors.gradient.angle}, ${colors.gradient.from} 0%, ${colors.gradient.to} 100%)`;
