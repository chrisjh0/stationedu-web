# Station Landing Page

Public marketing landing page for [stationforedu.com](https://stationforedu.com).

Built with Vite + React + TypeScript + Tailwind CSS. Completely independent from the main app at `app.stationforedu.com`.

## Prerequisites

- Node.js 18+
- npm 9+

## Local development

```bash
cd artifacts/landing
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build for production

```bash
npm run build
# Output is in dist/
```

Preview the production build locally:

```bash
npm run preview
```

## Deploy to Vercel as stationforedu.com

### First-time setup

1. **Create a new Vercel project** (separate from the app project):
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import the `stationedu-web` GitHub repo
   - Set the **Root Directory** to `artifacts/landing`
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Click **Deploy**

2. **Assign the custom domain**:
   - In the project's Settings → Domains, add `stationforedu.com`
   - Add both `stationforedu.com` and `www.stationforedu.com`
   - Follow Vercel's DNS instructions to point your domain

3. **Set environment variables** (none required — all config is build-time).

### Subsequent deploys

Push to `main` branch — Vercel auto-deploys.

Or deploy manually:

```bash
npm i -g vercel
vercel --prod
```

## Project structure

```
artifacts/landing/
├── public/           Static assets (screenshots, logo PNGs)
├── src/
│   ├── components/   Page sections + shared UI
│   ├── hooks/        useReveal (scroll animations)
│   ├── App.tsx       Root component
│   ├── index.css     Tailwind base + custom CSS tokens
│   └── main.tsx      Entry point
├── index.html        HTML shell (Google Fonts loaded here)
├── vercel.json       SPA catch-all rewrite
└── tailwind.config.ts
```

## Swapping in the founder photo

A placeholder "CH" initials circle is used for Christopher Ho in the Founder Quote section.

To replace it:
1. Add `public/christopher-ho.jpg` (square, min 104×104px, ideally 200×200px)
2. Edit `src/components/FounderQuote.tsx` and replace the `<div>` placeholder with:
   ```tsx
   <img
     src="/christopher-ho.jpg"
     alt="Christopher Ho"
     style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
   />
   ```

## Demo modal

The "Request a demo" modal opens the user's default email client with a pre-filled message to `support@stationforedu.com`. No data is stored or sent through the landing page itself.
