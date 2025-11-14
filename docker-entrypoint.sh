#!/bin/sh
set -e

echo "🔧 Configuring runtime environment variables..."

# Replace placeholders in env-config.js with actual environment variables
# This allows runtime configuration without rebuilding the Docker image
ENV_CONFIG_FILE="/usr/share/nginx/html/env-config.js"

if [ -f "$ENV_CONFIG_FILE" ]; then
  echo "📝 Updating $ENV_CONFIG_FILE with runtime values..."
  
  # Replace placeholders with actual values (or empty string if not set)
  sed -i "s|%VITE_API_URL%|${VITE_API_URL:-http://localhost:3001/api}|g" "$ENV_CONFIG_FILE"
  sed -i "s|%VITE_GEMINI_API_KEY%|${VITE_GEMINI_API_KEY:-}|g" "$ENV_CONFIG_FILE"
  sed -i "s|%VITE_OPENAI_API_KEY%|${VITE_OPENAI_API_KEY:-}|g" "$ENV_CONFIG_FILE"
  sed -i "s|%VITE_CLAUDE_API_KEY%|${VITE_CLAUDE_API_KEY:-}|g" "$ENV_CONFIG_FILE"
  sed -i "s|%VITE_GEMINI_MAX_CONCURRENCY%|${VITE_GEMINI_MAX_CONCURRENCY:-2}|g" "$ENV_CONFIG_FILE"
  sed -i "s|%VITE_GEMINI_FALLBACK_MODEL%|${VITE_GEMINI_FALLBACK_MODEL:-}|g" "$ENV_CONFIG_FILE"
  
  echo "✅ Environment configuration updated successfully"
  
  # Debug: Show which keys are set (without exposing values)
  echo "  📍 VITE_API_URL: ${VITE_API_URL:-http://localhost:3001/api}"
  
  if [ -n "$VITE_GEMINI_API_KEY" ]; then 
    echo "  ✅ VITE_GEMINI_API_KEY: SET"
  else 
    echo "  ⚠️  VITE_GEMINI_API_KEY: NOT SET"
  fi
  
  if [ -n "$VITE_OPENAI_API_KEY" ]; then 
    echo "  ✅ VITE_OPENAI_API_KEY: SET"
  else 
    echo "  ⚠️  VITE_OPENAI_API_KEY: NOT SET"
  fi
  
  if [ -n "$VITE_CLAUDE_API_KEY" ]; then 
    echo "  ✅ VITE_CLAUDE_API_KEY: SET"
  else 
    echo "  ⚠️  VITE_CLAUDE_API_KEY: NOT SET"
  fi
else
  echo "⚠️  Warning: $ENV_CONFIG_FILE not found, skipping runtime configuration"
fi

echo "🚀 Starting nginx..."
exec nginx -g "daemon off;"
