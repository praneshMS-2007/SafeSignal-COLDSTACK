import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Surface system ── */
        surface:                    "#f7f9fc",
        "surface-dim":              "#d8dadd",
        "surface-bright":           "#f7f9fc",
        "surface-container-lowest": "#ffffff",
        "surface-container-low":    "#f2f4f7",
        "surface-container":        "#eceef1",
        "surface-container-high":   "#e6e8eb",
        "surface-container-highest":"#e0e3e6",
        "on-surface":               "#191c1e",
        "on-surface-variant":       "#44474f",
        "inverse-surface":          "#2d3133",
        "inverse-on-surface":       "#eff1f4",
        "surface-variant":          "#e0e3e6",
        "surface-tint":             "#475e8c",

        /* ── Primary (Navy) ── */
        primary:                    "#03224d",
        "on-primary":               "#ffffff",
        "primary-container":        "#1f3864",
        "on-primary-container":     "#8ba2d5",
        "inverse-primary":          "#afc6fb",
        "primary-fixed":            "#d8e2ff",
        "primary-fixed-dim":        "#afc6fb",
        "on-primary-fixed":         "#001a41",
        "on-primary-fixed-variant": "#2e4673",

        /* ── Secondary (Purple) ── */
        secondary:                  "#584fbc",
        "on-secondary":             "#ffffff",
        "secondary-container":      "#958dff",
        "on-secondary-container":   "#2b1c8f",
        "secondary-fixed":          "#e3dfff",
        "secondary-fixed-dim":      "#c5c0ff",
        "on-secondary-fixed":       "#140067",
        "on-secondary-fixed-variant":"#3f35a3",

        /* ── Tertiary (Teal / Green) ── */
        tertiary:                   "#00291e",
        "on-tertiary":              "#ffffff",
        "tertiary-container":       "#004131",
        "on-tertiary-container":    "#5fb195",
        "tertiary-fixed":           "#a0f3d4",
        "tertiary-fixed-dim":       "#84d6b9",
        "on-tertiary-fixed":        "#002117",
        "on-tertiary-fixed-variant":"#00513e",

        /* ── Error ── */
        error:                      "#ba1a1a",
        "on-error":                 "#ffffff",
        "error-container":          "#ffdad6",
        "on-error-container":       "#93000a",

        /* ── Outline ── */
        outline:                    "#747780",
        "outline-variant":          "#c4c6d0",

        /* ── Background ── */
        background:                 "#f7f9fc",
        "on-background":            "#191c1e",

        /* ── Semantic status (non-token) ── */
        "safe-green":               "#1E5023",
        "critical-red":             "#A02D2D",
        "amber-warning":            "#8A5A00",
      },

      borderRadius: {
        sm:      "0.125rem",
        DEFAULT: "0.25rem",
        md:      "0.375rem",
        lg:      "0.5rem",
        xl:      "0.75rem",
        full:    "9999px",
      },

      spacing: {
        "gutter":         "24px",
        "stack-gap":      "12px",
        "margin-mobile":  "16px",
        "margin-desktop": "48px",
        "tap-target-min": "56px",
      },

      fontFamily: {
        sans:        ["Inter", "system-ui", "sans-serif"],
        mono:        ["JetBrains Mono", "monospace"],
        "label-caps":["Inter", "system-ui", "sans-serif"],
        "headline":  ["Inter", "system-ui", "sans-serif"],
        "title":     ["Inter", "system-ui", "sans-serif"],
        "body":      ["Inter", "system-ui", "sans-serif"],
        "display":   ["Inter", "system-ui", "sans-serif"],
        "mono-code": ["JetBrains Mono", "monospace"],
      },

      fontSize: {
        "label-caps":       ["12px", { lineHeight: "16px",  letterSpacing: "0.05em", fontWeight: "700" }],
        "body-md":          ["16px", { lineHeight: "24px",  fontWeight: "400" }],
        "body-lg":          ["18px", { lineHeight: "28px",  fontWeight: "400" }],
        "title-md":         ["20px", { lineHeight: "28px",  fontWeight: "600" }],
        "headline-lg":      ["32px", { lineHeight: "40px",  fontWeight: "700" }],
        "headline-lg-mobile":["24px",{ lineHeight: "32px",  fontWeight: "700" }],
        "display-lg":       ["44px", { lineHeight: "52px",  letterSpacing: "-0.02em", fontWeight: "700" }],
        "mono-code":        ["14px", { lineHeight: "20px",  fontWeight: "400" }],
      },

      borderWidth: {
        "6": "6px",
      },

      minHeight: {
        "tap-target": "56px",
      },
    },
  },
  plugins: [],
};

export default config;
