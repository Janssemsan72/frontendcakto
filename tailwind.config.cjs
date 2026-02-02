/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  // ✅ OTIMIZAÇÃO PERFORMANCE: Content paths otimizados para purge agressivo de CSS não utilizado
  content: {
    files: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      // Excluir admin do purge inicial (será purgado separadamente)
      "!./src/pages/admin/**/*",
      "!./src/components/admin/**/*"
    ],
    extract: {
      // Garantir que classes dinâmicas sejam detectadas
      js: (content) => {
        // Extrair classes de strings template e concatenações
        const classMatches = content.match(/className\s*[:=]\s*["'`]([^"'`]+)["'`]/g) || [];
        const templateMatches = content.match(/className\s*[:=]\s*`([^`]+)`/g) || [];
        const clsxMatches = content.match(/clsx\(([^)]+)\)/g) || [];
        const cnMatches = content.match(/cn\(([^)]+)\)/g) || [];
        return [...classMatches, ...templateMatches, ...clsxMatches, ...cnMatches].join(' ');
      }
    }
  },
  // ✅ OTIMIZAÇÃO PERFORMANCE: Purge mais agressivo
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Safelist apenas para classes críticas que são geradas dinamicamente
    safelist: [
      'bg-primary',
      'text-primary',
      'border-primary',
      'bg-background',
      'text-foreground',
    ],
    // Remover classes não utilizadas mais agressivamente
    defaultExtractor: (content) => {
      const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || [];
      const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || [];
      return broadMatches.concat(innerMatches);
    }
  },
  theme: {
    extend: {
      colors: {
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
