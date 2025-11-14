# Multi-stage build for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.ts tsconfig.json ./

# Install dependencies
# Using --legacy-peer-deps to resolve peer dependency conflicts
# @refinedev/react-router-v6@4.6.2 requires @refinedev/core@^4.46.1
# but we're using @refinedev/core@^5.0.6 for compatibility with other packages
RUN npm ci --legacy-peer-deps

# Copy source files (including .env.local if it exists)
COPY . .

# Build frontend with environment variables
ARG VITE_GEMINI_API_KEY
ARG GEMINI_API_KEY
ARG VITE_OPENAI_API_KEY
ARG VITE_CLAUDE_API_KEY
ARG VITE_GEMINI_MAX_CONCURRENCY
ARG VITE_GEMINI_FALLBACK_MODEL

# Set environment variables for build
# Priority: ARG > .env.local (via COPY) > default
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY:-${GEMINI_API_KEY:-}}
ENV VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY:-}
ENV VITE_CLAUDE_API_KEY=${VITE_CLAUDE_API_KEY:-}
ENV VITE_GEMINI_MAX_CONCURRENCY=${VITE_GEMINI_MAX_CONCURRENCY:-2}
ENV VITE_GEMINI_FALLBACK_MODEL=${VITE_GEMINI_FALLBACK_MODEL:-}

# Also set as regular env vars for process.env access
ENV GEMINI_API_KEY=${VITE_GEMINI_API_KEY:-${GEMINI_API_KEY:-}}
ENV OPENAI_API_KEY=${VITE_OPENAI_API_KEY:-}
ENV CLAUDE_API_KEY=${VITE_CLAUDE_API_KEY:-}
ENV GEMINI_MAX_CONCURRENCY=${VITE_GEMINI_MAX_CONCURRENCY:-2}
ENV GEMINI_FALLBACK_MODEL=${VITE_GEMINI_FALLBACK_MODEL:-}

# Debug: Log which keys are available (without exposing values)
RUN echo "🔍 Build-time environment check:" && \
    if [ -n "$VITE_GEMINI_API_KEY" ]; then echo "  ✅ VITE_GEMINI_API_KEY: SET (length: ${#VITE_GEMINI_API_KEY})"; else echo "  ❌ VITE_GEMINI_API_KEY: NOT SET"; fi && \
    if [ -n "$VITE_OPENAI_API_KEY" ]; then echo "  ✅ VITE_OPENAI_API_KEY: SET (length: ${#VITE_OPENAI_API_KEY})"; else echo "  ⚠️  VITE_OPENAI_API_KEY: NOT SET"; fi && \
    if [ -n "$VITE_CLAUDE_API_KEY" ]; then echo "  ✅ VITE_CLAUDE_API_KEY: SET (length: ${#VITE_CLAUDE_API_KEY})"; else echo "  ⚠️  VITE_CLAUDE_API_KEY: NOT SET"; fi

RUN npm run build

# Production stage for frontend
FROM nginx:alpine AS frontend

COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and set executable permission for entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]

