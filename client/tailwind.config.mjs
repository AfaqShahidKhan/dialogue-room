/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode Colors
        light: {
          background: "#FFFFFF", // Pure white for a clean look
          foreground: "#1A1A1A", // Dark gray for text
          primary: "#3CAE8B", // Vibrant green for buttons and accents
          secondary: "#FFD140", // Warm yellow for secondary elements
          accent: "#0171DF", // Deep blue for highlights
          muted: "#F5F5F5", // Light gray for backgrounds
        },
        // Dark Mode Colors
        dark: {
          background: "#121212", // Dark gray (not pure black) for reduced eye strain
          foreground: "#E0E0E0", // Off-white for text
          primary: "#4CAF50", // Muted green for buttons and accents
          secondary: "#FFC107", // Muted yellow for secondary elements
          accent: "#2196F3", // Muted blue for highlights
          muted: "#1E1E1E", // Darker gray for backgrounds
        },
      },
    },
  },
  plugins: [],
};
