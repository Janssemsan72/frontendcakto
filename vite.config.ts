import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import fs from "node:fs";
import { imagetools } from "vite-imagetools";
// ✅ OTIMIZAÇÃO: Removido compression - Vercel já faz compressão automática
// Isso acelera significativamente o build
// import { compression } from "vite-plugin-compression2";
import { injectScriptPlugin } from "./vite-plugin-inject-script";
import { mimeTypesPlugin } from "./vite-plugin-mime-types";
// ✅ OTIMIZAÇÃO: Visualizer para análise de bundle
import { visualizer } from "rollup-plugin-visualizer";

const vitestSetupFile = path.resolve(__dirname, "src/__tests__/setup.ts");
const vitestSetupFiles = fs.existsSync(vitestSetupFile) ? ["./src/__tests__/setup.ts"] : undefined;

export default defineConfig({
  plugins: [
    react(), 
    imagetools(),
    // ✅ OTIMIZAÇÃO: Removido compression - Vercel já faz compressão automática
    // Isso elimina processamento duplo e acelera o build significativamente
    // compression({
    //   algorithm: 'gzip',
    //   exclude: [/\.(br)$/, /\.(gz)$/],
    // }),
    // compression({
    //   algorithm: 'brotliCompress',
    //   exclude: [/\.(br)$/, /\.(gz)$/],
    // }),
    // ✅ CORREÇÃO CRÍTICA: Plugin para garantir MIME types corretos
    mimeTypesPlugin(),
    // ✅ CORREÇÃO CRÍTICA: Plugin para injetar script principal no HTML
    injectScriptPlugin(),
    // ✅ OTIMIZAÇÃO: Visualizer para análise de bundle (apenas em produção)
    ...(process.env.NODE_ENV === "production" ? [
      visualizer({
        filename: "dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
        template: "treemap", // ou "sunburst", "network"
      })
    ] : []),
  ],
  // ✅ OTIMIZAÇÃO: Forçar o pré-bundle do React para evitar conflitos em produção
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  // ✅ CORREÇÃO: Garantir base URL correto para produção
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // ✅ CORREÇÃO CRÍTICA: Forçar uma única instância do React para todo o app
      // Isso resolve conflitos de dependência como o do embla-carousel
      "react": path.resolve(__dirname, "./node_modules/react"),
    },
  },
  // ✅ CORREÇÃO: Configurações de servidor para evitar cache
  server: {
    // Forçar HMR (Hot Module Replacement) a funcionar corretamente
    hmr: {
      overlay: true,
    },
    // Desabilitar cache de headers
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  },
  // ✅ CORREÇÃO: Configuração de assets para garantir processamento correto
  assetsInclude: ["**/*.webp", "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.svg", "**/*.mp4", "**/*.webm"],
  // ✅ CORREÇÃO: Definir BUILD_ID para garantir hashes únicos
  define: {
    __BUILD_ID__: JSON.stringify(process.env.BUILD_ID || Date.now().toString()),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    minify: "esbuild",
    rollupOptions: {
      input: './index.html',
      treeshake: {
        preset: 'recommended',
        moduleSideEffects: (id) => {
          if (id.includes('lucide-react') || id.includes('date-fns') || (id.includes('zod') && !id.includes('zod/lib'))) {
            return false;
          }
          if (id.includes('src/') || id.includes('.css')) {
            if (id.includes('src/main.tsx') || id.includes('src/App.tsx') || id.includes('src/index.tsx')) {
              return true;
            }
            if (id.includes('src/pages/admin') || id.includes('src/components/admin')) {
              return true;
            }
            if (id.includes('src/pages/Quiz') || id.includes('src/pages/Checkout')) {
              return false;
            }
            return true;
          }
          if (id.includes('@radix-ui/react-toast')) {
            return true;
          }
          return false;
        },
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false,
      },
      output: {
        compact: true,
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        // ✅ CORREÇÃO CRÍTICA: Garantir que React seja sempre carregado primeiro
        manualChunks: (id) => {
          // React e React-DOM DEVEM estar no mesmo chunk e ser carregados primeiro
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/') ||
              id.includes('react/jsx-runtime') ||
              id.includes('react/jsx-dev-runtime')) {
            return 'react';
          }
          // React Router
          if (id.includes('react-router') || id.includes('@remix-run/router')) {
            return 'router';
          }
          // Outras dependências grandes
          if (id.includes('@radix-ui')) {
            return 'radix';
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Vendor chunk para o resto
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext || "")) {
            const name = assetInfo.name?.replace(/\.[^/.]+$/, "") || "image";
            return `assets/img/${name}-[hash:8].[ext]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || "")) {
            return "assets/fonts/[name]-[hash:8].[ext]";
          }
          return "assets/[ext]/[name]-[hash:8].[ext]";
        },
      },
    },
    chunkSizeWarningLimit: 300,
    assetsInlineLimit: 4096,
    sourcemap: process.env.NODE_ENV !== "production",
    cssCodeSplit: true,
    cssMinify: true,
    modulePreload: {
      polyfill: false,
    },
    target: "esnext",
    reportCompressedSize: process.env.NODE_ENV === "production",
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  test: {
    environment: "jsdom",
    ...(vitestSetupFiles ? { setupFiles: vitestSetupFiles } : {}),
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "frontend/**"],
  },
});
