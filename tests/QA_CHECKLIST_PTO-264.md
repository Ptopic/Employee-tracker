# PTO-264 Acceptance & QA Checklist

## PRD Acceptance Scenarios
- [x] Month visibility test (calendar renders all days in selected month)
- [x] Multi-assignment test (single shift with multiple employees)
- [x] Monthly hours accuracy test (deterministic hour rounding/UTC date normalization)
- [x] PDF parity test (preview totals match exported PDF totals)
- [x] Overlap prevention test (conflicting employee assignment blocked)

## Automated Tests
- App unit/acceptance: `cd app && npm test -- acceptance.spec.ts`
- Backend unit: `cd backend && npm test -- deterministic-hours.spec.ts`
- Backend integration/e2e: `cd backend && npm run test:e2e`

## Security Checklist
- [x] Sensitive tokens stored with SecureStore and secure fallback wrapper
- [x] HTTPS-only enforced in production app config
- [x] API response shape checked before usage
- [x] Backend security headers + HSTS + CSP + X-Frame-Options
- [x] Basic rate limiting middleware enabled

## Performance Targets
- Calendar render target: <300ms (instrumented via `measurePerformance` + prefetch + query caching)
- PDF export target: <2s (duration header + streaming response path)

## Reliability Checklist
- [x] Deterministic hour calculation utility (`calculateDeterministicHours`)
- [x] UTC date normalization utility (`normalizeDateIso`)
- [x] Delete confirmation on destructive actions
- [x] Retry logic for transient API failures in secure fetch helper
- [x] Global backend exception filter + request performance logging
