# AI Service Migration Guide

## Status

**Current Status**: Partial Implementation

- ✅ Backend AI proxy endpoints created (`/api/ai/*`)
- ✅ Frontend API client updated with AI endpoints
- ✅ Frontend AI service has backend fallback mechanism
- ⚠️ Backend AI service implementation in progress
- ⚠️ Frontend still uses `dangerouslyAllowBrowser` (will be removed after migration)

## Architecture

### Current Flow (Frontend AI)
```
Component → aiService.ts → AI Provider (Gemini/OpenAI/Claude) → AI API
```

### Target Flow (Backend AI)
```
Component → aiService.ts → Backend API (/api/ai/*) → Backend AI Service → AI Provider → AI API
```

## Implementation Steps

### 1. Backend AI Service Implementation

**Location**: `backend/src/services/ai/` (to be created)

**Required Files**:
- `aiService.ts` - Main AI service (similar to frontend)
- `providers/geminiProvider.ts` - Gemini provider (without dangerouslyAllowBrowser)
- `providers/openaiProvider.ts` - OpenAI provider (without dangerouslyAllowBrowser)
- `providers/claudeProvider.ts` - Claude provider (without dangerouslyAllowBrowser)

**Environment Variables** (Backend `.env`):
```env
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
OPENAI_MODEL=gpt-4o
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

### 2. Backend Route Implementation

**File**: `backend/src/routes/ai.ts`

Currently returns 501 (Not Implemented). Need to:
1. Import backend AI service
2. Call AI service methods
3. Return results

### 3. Frontend Migration

**File**: `services/aiService.ts`

Already has fallback mechanism:
- Checks `VITE_USE_BACKEND_AI` environment variable
- Tries backend API first
- Falls back to frontend AI service if backend fails

**To Enable Backend AI**:
```env
VITE_USE_BACKEND_AI=true
```

### 4. Remove dangerouslyAllowBrowser

**Files to Update**:
- `services/providers/openaiProvider.ts` - Remove `dangerouslyAllowBrowser: true`
- `services/providers/claudeProvider.ts` - Remove `dangerouslyAllowBrowser: true`

**Note**: These can only be removed after backend AI is fully implemented and tested.

## Testing

### Test Backend AI Endpoints

```bash
# Test question generation
curl -X POST http://localhost:3001/api/ai/generate/question \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "phaseKey": "phase1",
    "categoryIndex": 0,
    "previousAnswers": [],
    "userName": "Test User",
    "coachingStyle": "collaborative",
    "userProfile": null,
    "language": "fr"
  }'
```

### Test Frontend Fallback

1. Set `VITE_USE_BACKEND_AI=false` (or unset)
2. Verify frontend AI service still works
3. Set `VITE_USE_BACKEND_AI=true`
4. Verify backend AI is used

## Migration Checklist

- [ ] Backend AI service created
- [ ] Backend AI providers implemented (without dangerouslyAllowBrowser)
- [ ] Backend AI routes fully implemented
- [ ] Environment variables configured in backend
- [ ] Frontend fallback tested
- [ ] Backend AI tested
- [ ] `dangerouslyAllowBrowser` removed from frontend providers
- [ ] Documentation updated

## Benefits

1. **Security**: API keys stored server-side only
2. **Performance**: Better rate limiting and caching
3. **Scalability**: Can add more providers without frontend changes
4. **Monitoring**: Better logging and error tracking
5. **Cost Control**: Centralized API usage tracking

## Rollback Plan

If issues occur:
1. Set `VITE_USE_BACKEND_AI=false` in frontend `.env.local`
2. Frontend will automatically use local AI service
3. Fix backend issues
4. Re-enable backend AI

## Notes

- Frontend AI service will remain as fallback
- Backend AI is optional (can be enabled/disabled via env var)
- Migration can be done incrementally (per endpoint)
- No breaking changes to existing code

