# TraderLogs v1.9.29 — AI News Stage 1

## Added
- Added an isolated AI News XAU/USD page and a new bottom navigation item.
- Added clear, non-live status cards describing planned calendar, AI analysis, push notifications, and Risk Awareness capabilities.
- Documented that the AI News page is a foundation only; it does not claim to fetch live news, run AI analysis, or send notifications yet.

## Preserved
- Existing journal, simulator, chart, and embedded economic calendar components.
- Existing Risk Guard calculation logic and settings. `src/journalMath.js` was not changed.
- Existing Supabase storage and authentication implementation.

## Not included yet
- No server-side scheduler or push-notification backend.
- No AI provider integration or API keys.
- No new Supabase tables or schema changes.

## Validation
- Source changes were inspected and the Risk Guard math file was left unchanged.
- A production build could not be run in this environment because `npm install` timed out before Vite dependencies were available. Run `npm install` and `npm run build` locally before deployment.
