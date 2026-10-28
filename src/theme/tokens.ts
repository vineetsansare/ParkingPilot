export interface ThemeColorTokens {
  // Canvases & Surfaces
  canvas: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  cardElevated: string;

  // Borders & Dividers
  borderSubtle: string;
  borderDefault: string;
  borderFocus: string;
  divider: string;

  // Typography
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Primary Brand (Mint Green)
  mintPrimary: string;
  mintPastel: string;
  mintBorder: string;
  mintSurface: string;

  // Secondary Accents (Lilac / Lavender)
  lavenderPrimary: string;
  lavenderPastel: string;
  lavenderBorder: string;

  // Sky / Oceanic Blue
  skyPrimary: string;
  skyPastel: string;
  skyBorder: string;

  // Sand / Warm Amber (Desert Dune)
  sandPrimary: string;
  sandPastel: string;
  sandBorder: string;

  // Alert / Crimson
  rosePrimary: string;
  rosePastel: string;
  roseBorder: string;

  // Driver Persona - Pink
  pinkPrimary: string;
  pinkPastel: string;
  pinkBorder: string;
  pinkSurface: string;

  // Interactive controls
  switchTrackOff: string;
  switchTrackOn: string;
  switchThumb: string;
}

export const lightColors: ThemeColorTokens = {
  canvas: "#F8FAFC",
  surfacePrimary: "#FFFFFF",
  surfaceSecondary: "#F1F5F9",
  surfaceTertiary: "#E2E8F0",
  cardElevated: "#FFFFFF",

  borderSubtle: "#F1F5F9",
  borderDefault: "#E2E8F0",
  borderFocus: "#00C49F",
  divider: "#F1F5F9",

  textPrimary: "#090D16",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",

  mintPrimary: "#059669",
  mintPastel: "#E6F9F4",
  mintBorder: "#A7F3D0",
  mintSurface: "#F0FDF9",

  lavenderPrimary: "#7C3AED",
  lavenderPastel: "#F3E8FF",
  lavenderBorder: "#DDD6FE",

  skyPrimary: "#0284C7",
  skyPastel: "#E0F2FE",
  skyBorder: "#BAE6FD",

  sandPrimary: "#D97706",
  sandPastel: "#FEF3C7",
  sandBorder: "#FDE68A",

  rosePrimary: "#DC2626",
  rosePastel: "#FEE2E2",
  roseBorder: "#FECACA",

  pinkPrimary: "#DB2777",
  pinkPastel: "#FCE7F3",
  pinkBorder: "#FBCFE8",
  pinkSurface: "#FFF1F6",

  switchTrackOff: "#CBD5E1",
  switchTrackOn: "#A7F3D0",
  switchThumb: "#059669",
};

export const darkColors: ThemeColorTokens = {
  canvas: "#090D16",
  surfacePrimary: "#131927",
  surfaceSecondary: "#1C2438",
  surfaceTertiary: "#273248",
  cardElevated: "#171F32",

  borderSubtle: "rgba(255, 255, 255, 0.06)",
  borderDefault: "#222C42",
  borderFocus: "#2DD4BF",
  divider: "rgba(255, 255, 255, 0.08)",

  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",
  textInverse: "#090D16",

  mintPrimary: "#2DD4BF",
  mintPastel: "rgba(45, 212, 191, 0.14)",
  mintBorder: "rgba(45, 212, 191, 0.28)",
  mintSurface: "#0E2725",

  lavenderPrimary: "#A78BFA",
  lavenderPastel: "rgba(167, 139, 250, 0.16)",
  lavenderBorder: "rgba(167, 139, 250, 0.32)",

  skyPrimary: "#38BDF8",
  skyPastel: "rgba(56, 189, 248, 0.15)",
  skyBorder: "rgba(56, 189, 248, 0.30)",

  sandPrimary: "#FBBF24",
  sandPastel: "rgba(251, 191, 36, 0.16)",
  sandBorder: "rgba(251, 191, 36, 0.32)",

  rosePrimary: "#F87171",
  rosePastel: "rgba(248, 113, 113, 0.16)",
  roseBorder: "rgba(248, 113, 113, 0.30)",

  pinkPrimary: "#F472B6",
  pinkPastel: "rgba(244, 114, 182, 0.15)",
  pinkBorder: "rgba(244, 114, 182, 0.30)",
  pinkSurface: "#280A1A",

  switchTrackOff: "#273248",
  switchTrackOn: "rgba(45, 212, 191, 0.35)",
  switchThumb: "#2DD4BF",
};
