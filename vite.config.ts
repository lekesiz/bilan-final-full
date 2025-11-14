import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Sentry is disabled for now - enable it later by adding VITE_SENTRY_DSN to .env.local
// import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(({ mode }) => {
    // Load environment variables from .env files
    // loadEnv loads from .env, .env.local, .env.[mode], .env.[mode].local
    const env = loadEnv(mode, process.cwd(), '');
    
    // Load all AI provider API keys (try both VITE_ and non-VITE_ versions)
    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    const openaiKey = env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || '';
    const claudeKey = env.VITE_CLAUDE_API_KEY || env.CLAUDE_API_KEY || '';
    
    // Debug: Log which keys were found (without exposing values)
    if (mode === 'development') {
      console.log('🔍 Vite Config - Environment Variables:', {
        hasGemini: !!geminiKey,
        hasOpenAI: !!openaiKey,
        hasClaude: !!claudeKey,
        geminiKeyLength: geminiKey.length,
        openaiKeyLength: openaiKey.length,
        claudeKeyLength: claudeKey.length,
      });
    }
    const openaiModel = env.VITE_OPENAI_MODEL || env.OPENAI_MODEL || 'gpt-4o';
    const claudeModel = env.VITE_CLAUDE_MODEL || env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';
    const geminiMaxConcurrency = env.VITE_GEMINI_MAX_CONCURRENCY || env.GEMINI_MAX_CONCURRENCY || '2';
    const geminiFallbackModel = env.VITE_GEMINI_FALLBACK_MODEL || env.GEMINI_FALLBACK_MODEL || '';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react({
          // Ensure React is properly handled
          babel: {
            plugins: [],
          },
        }),
        // Sentry is disabled for now - enable it later by adding VITE_SENTRY_DSN to .env.local
        // Sentry plugin - only in production builds
        // ...(mode === 'production' && env.VITE_SENTRY_DSN
        //   ? [
        //       sentryVitePlugin({
        //         org: env.VITE_SENTRY_ORG,
        //         project: env.VITE_SENTRY_PROJECT,
        //         authToken: env.VITE_SENTRY_AUTH_TOKEN,
        //         sourcemaps: {
        //           assets: './dist/**',
        //           ignore: ['node_modules'],
        //         },
        //       }),
        //     ]
        //   : []),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.OPENAI_API_KEY': JSON.stringify(openaiKey),
        'process.env.VITE_OPENAI_API_KEY': JSON.stringify(openaiKey),
        'process.env.OPENAI_MODEL': JSON.stringify(openaiModel),
        'process.env.VITE_OPENAI_MODEL': JSON.stringify(openaiModel),
        'process.env.CLAUDE_API_KEY': JSON.stringify(claudeKey),
        'process.env.VITE_CLAUDE_API_KEY': JSON.stringify(claudeKey),
        'process.env.CLAUDE_MODEL': JSON.stringify(claudeModel),
        'process.env.VITE_CLAUDE_MODEL': JSON.stringify(claudeModel),
        'process.env.GEMINI_MAX_CONCURRENCY': JSON.stringify(geminiMaxConcurrency),
        'process.env.VITE_GEMINI_MAX_CONCURRENCY': JSON.stringify(geminiMaxConcurrency),
        'process.env.GEMINI_FALLBACK_MODEL': JSON.stringify(geminiFallbackModel),
        'process.env.VITE_GEMINI_FALLBACK_MODEL': JSON.stringify(geminiFallbackModel),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        },
        // Ensure React is resolved correctly in all chunks
        // Prevents multiple React instances which causes "createContext" errors
        dedupe: ['react', 'react-dom'],
      },
      build: {
        // TEMPORARY FIX: Disable ALL vendor chunking to prevent React "Children" errors
        // React 18.3.1 and Ant Design have issues when React is in a different chunk
        // All dependencies must be in the same bundle for React to work correctly
        // TODO: Re-enable optimized chunking after finding a solution or upgrading React
        rollupOptions: {
          output: {
            // Disable manual chunks completely - put everything in main bundle
            // This ensures React is accessible to all libraries (Ant Design, Refine, etc.)
            manualChunks: undefined,
            // Optimize chunk size
            chunkSizeWarningLimit: 2000, // 2MB warning threshold (increased because everything is in one bundle)
          }
        },
        // Enable source maps for production debugging (optional)
        sourcemap: false, // Set to true if needed for debugging
        // Optimize bundle
        minify: 'esbuild',
        target: 'es2020',
      }
    };
});
