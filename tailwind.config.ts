module.exports = {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SALIS AUTO Brand Colors - Monochrome Palette
        "salis-black": "#010101",
        "salis-white": "#FFFFFF",
        "salis-gray": "#6B7280",
        "salis-gray-light": "#D1D5DB",
        "salis-gray-dark": "#374151",
        "salis-50-black": "#808080",
        
        // Legacy compatibility (map to monochrome)
        "dark-navy": "#010101",
        
        // shadcn/ui theme colors (using HSL vars)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        // SALIS AUTO Typography
        montserrat: ["Montserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        "14-regular": "var(--14-regular-font-family)",
        "body-base": "var(--body-base-font-family)",
        "body-bold-small": "var(--body-bold-small-font-family)",
        "body-emphasized": "var(--body-emphasized-font-family)",
        "body-medium": "var(--body-medium-font-family)",
        "body-regular": "var(--body-regular-font-family)",
        "body-regular-medium": "var(--body-regular-medium-font-family)",
        "body-semibold": "var(--body-semibold-font-family)",
        "caps-md": "var(--caps-md-font-family)",
        "display-large-semibold": "var(--display-large-semibold-font-family)",
        "display-medium-semibold": "var(--display-medium-semibold-font-family)",
        "display-small-semibold": "var(--display-small-semibold-font-family)",
        "headline-bold": "var(--headline-bold-font-family)",
        "headline-medium": "var(--headline-medium-font-family)",
        "headline-semibold": "var(--headline-semibold-font-family)",
        "label-medium": "var(--label-medium-font-family)",
        "label-regular": "var(--label-regular-font-family)",
        "label-small": "var(--label-small-font-family)",
        "m3-title-small": "var(--m3-title-small-font-family)",
        "single-line-body-base": "var(--single-line-body-base-font-family)",
        "text-sm-medium": "var(--text-sm-medium-font-family)",
        "text-sm-normal": "var(--text-sm-normal-font-family)",
        "text-xs-medium": "var(--text-xs-medium-font-family)",
        "title-medium": "var(--title-medium-font-family)",
        "title-regular": "var(--title-regular-font-family)",
        "title-semibold": "var(--title-semibold-font-family)",
        sans: [
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
      },
      boxShadow: {
        "drop-shadow-100": "var(--drop-shadow-100)",
        shadow: "var(--shadow)",
        "shadow-black-lg": "var(--shadow-black-lg)",
        "shadow-black-sm": "var(--shadow-black-sm)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  darkMode: ["class"],
};
