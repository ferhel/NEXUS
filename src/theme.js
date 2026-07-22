// ─────────────────────────────────────────────
// theme.js — Sistema de Diseño Premium "Nexus"
// Paletas claro/oscuro. El cambio en vivo se
// gestiona desde ThemeContext.js (useTheme()).
// ─────────────────────────────────────────────

export const darkTheme = {
  // --- Fondos Estilo iOS Dark Mode (elevación por brillo) ---
  bg:         "#121014",   // Base, negro con tinte morado muy sutil
  bgCard:     "#1E1B24",   // Superficie elevada para tarjetas
  bgMuted:    "#2A2530",   // Rellenos secundarios

  // --- Texto de alta legibilidad sobre fondo oscuro ---
  text:       "#F5F5F7",   // Label principal
  textMuted:  "#A8A3B3",   // Secondary label
  textLight:  "#726C7D",   // Placeholders

  // --- Acentos Cromáticos Apple (dark) ---
  accent:     "#BF5AF2",   // systemPurple (Apple HIG dark)
  accentSoft: "rgba(191, 90, 242, 0.16)",
  accentMid:  "#8944AB",

  green:      "#30D158",   // Éxito / Concentrado
  greenSoft:  "rgba(48, 209, 88, 0.16)",
  greenMid:   "#1F8A3D",

  amber:      "#FF9F0A",   // Advertencia / Distraído
  amberSoft:  "rgba(255, 159, 10, 0.16)",

  red:        "#FF453A",   // Error / Ausente
  redSoft:    "rgba(255, 69, 58, 0.16)",

  purple:     "#5E5CE6",   // Acento secundario de "flow" (indigo, distinto del accent principal)
  purpleSoft: "rgba(94, 92, 230, 0.16)",

  // --- Bordes: hairlines claros sobre fondo oscuro ---
  border:     "rgba(255, 255, 255, 0.08)",
  borderMid:  "rgba(255, 255, 255, 0.16)",

  // --- Sombras de profundidad orgánica (más opacas para notarse en dark) ---
  shadow:     "0 2px 8px rgba(0,0,0,0.35)",
  shadowMd:   "0 10px 30px rgba(0,0,0,0.45)",
  shadowHover: "0 20px 40px rgba(0,0,0,0.55)",

  // Panel de cristal esmerilado (indicadores flotantes tipo "en foco")
  glassPanel: "rgba(42, 37, 48, 0.55)",

  bubble: {
    bg: "rgba(191, 90, 242, 0.10)",
    border: "rgba(255, 255, 255, 0.22)",
    blur: "blur(14px)",
    gradient: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.22), transparent 60%), linear-gradient(135deg, rgba(191, 90, 242, 0.35) 0%, rgba(94, 58, 140, 0.08) 100%)",
    shadow: "0 8px 32px 0 rgba(191, 90, 242, 0.25)",
    innerShadow: "inset 0 0 12px rgba(255, 255, 255, 0.14)"
  }
};

export const lightTheme = {
  // --- Fondos Estilo iOS claro ---
  bg:         "#F2F2F7",   // Gris claro de sistema
  bgCard:     "#FFFFFF",   // Blanco puro para tarjetas
  bgMuted:    "#E5E5EA",   // Rellenos secundarios

  // --- Texto de alta legibilidad sobre fondo claro ---
  text:       "#1C1C1E",   // Label principal
  textMuted:  "#3A3A3C",   // Secondary label
  textLight:  "#8E8E93",   // Placeholders

  // --- Acentos Cromáticos Apple (light) ---
  accent:     "#AF52DE",   // systemPurple (Apple HIG light)
  accentSoft: "rgba(175, 82, 222, 0.12)",
  accentMid:  "#D9A6F0",

  green:      "#34C759",   // Éxito / Concentrado
  greenSoft:  "rgba(52, 199, 89, 0.12)",
  greenMid:   "#AFF2C5",

  amber:      "#FF9500",   // Advertencia / Distraído
  amberSoft:  "rgba(255, 149, 0, 0.12)",

  red:        "#FF3B30",   // Error / Ausente
  redSoft:    "rgba(255, 59, 48, 0.12)",

  purple:     "#5856D6",   // Acento secundario de "flow" (indigo, distinto del accent principal)
  purpleSoft: "rgba(88, 86, 214, 0.12)",

  // --- Bordes sutiles sobre fondo claro ---
  border:     "rgba(0, 0, 0, 0.08)",
  borderMid:  "rgba(0, 0, 0, 0.16)",

  // --- Sombras suaves y difusas ---
  shadow:     "0 2px 8px rgba(0,0,0,0.06)",
  shadowMd:   "0 10px 30px rgba(0,0,0,0.08)",
  shadowHover: "0 20px 40px rgba(0,0,0,0.12)",

  // Panel de cristal esmerilado (indicadores flotantes tipo "en foco")
  glassPanel: "rgba(255, 255, 255, 0.6)",

  bubble: {
    bg: "rgba(175, 82, 222, 0.08)",
    border: "rgba(255, 255, 255, 0.6)",
    blur: "blur(14px)",
    gradient: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), transparent 60%), linear-gradient(135deg, rgba(175, 82, 222, 0.25) 0%, rgba(90, 200, 250, 0.05) 100%)",
    shadow: "0 8px 32px 0 rgba(175, 82, 222, 0.12)",
    innerShadow: "inset 0 0 12px rgba(255, 255, 255, 0.4)"
  }
};

// Fuente nativa de Apple
export const font = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';
