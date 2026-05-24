export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "rgb(var(--color-bg) / <alpha-value>)",
          surface: "rgb(var(--color-surface) / <alpha-value>)",
          elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--color-brand) / <alpha-value>)",
          glow: "rgb(var(--color-brand) / 0.15)",
          soft: "rgb(var(--color-brand) / 0.1)",
        },
        success: "rgb(var(--color-success) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        subtle: "rgb(var(--color-subtle) / <alpha-value>)",
        text: {
          primary: "rgb(var(--color-text-primary) / <alpha-value>)",
          secondary: "rgb(var(--color-text-secondary) / <alpha-value>)",
          muted: "rgb(var(--color-text-muted) / <alpha-value>)",
        },
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px 0 rgb(var(--color-brand) / 0.15)",
        input: "0 0 0 2px rgb(var(--color-brand) / 1), 0 0 15px 0 rgb(var(--color-brand) / 0.1)",
      },
    },
  },
  plugins: [],
};
