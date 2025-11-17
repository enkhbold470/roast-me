# Gork – Roast Cam Quickstart

Generate a concise, PG‑13 roast from your webcam photo and hear it yelled out loud using OpenAI’s `gpt-4o-mini` (vision) and `gpt-4o-mini-tts` (text‑to‑speech).

## Requirements
- Node.js 18.18+ (or 20+ recommended)
- Package manager: pnpm (preferred), npm, yarn, or bun
- OpenAI API key with access to `gpt-4o-mini` and `gpt-4o-mini-tts`

## Setup
1. Create `.env.local` in the project root:
   ```bash
   echo "OPENAI_API_KEY=sk-..." > .env.local
   ```
2. Install dependencies:
   ```bash
   pnpm i
   # or: npm install | yarn | bun install
   ```

## Run (Development)
```bash
pnpm dev
# or: npm run dev | yarn dev | bun dev
```
Open http://localhost:3000, allow camera access, then click “Roast me”. The app captures a frame, sends it to OpenAI for a witty roast, converts it to MP3, and auto‑plays the audio.

## Production
```bash
pnpm build && pnpm start
# or: npm run build && npm run start
```

## Commands
- `pnpm dev`: Start Next.js dev server
- `pnpm build`: Production build
- `pnpm start`: Run the production server
- `pnpm lint`: Lint with Next.js ESLint config

## Configuration Tips
- Voice/model: Edit `app/api/roast/route.ts` (`model: "gpt-4o-mini"`, TTS `model: "gpt-4o-mini-tts"`, `voice: "alloy"`).
- Imports: Use `@/...` absolute paths (see `tsconfig.json`).

## Troubleshooting
- 401/403 from API: Check `OPENAI_API_KEY` in `.env.local` and restart.
- Camera blocked: Enable camera permissions in your browser.
- No audio: Ensure volume is up; the audio element provides controls and should auto‑play after generation.
