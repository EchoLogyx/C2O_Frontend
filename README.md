# C2O Morgan — Quotation Admin

An AI-powered product quotation and admin panel for **Clothes2Order (C2O)**. The front-facing **Express Quote Widget** lets customers get instant garment quotes via a conversational AI assistant ("Morgan"), while the **admin panel** provides CRUD management for products, categories, quotes, pricing tiers, and CSV data imports.

Built with [Next.js](https://nextjs.org) (v16 App Router), [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org), and [Tailwind CSS v4](https://tailwindcss.com).

---

## Features

### Express Quote Widget (`/`)
- **Morgan AI Assistant** — Conversational chatbot powered by the `elxBot` API
- **Guided Quote Flow** — Step-by-step questions (purpose, quantity, category, gender, fabric, fit, decoration, etc.)
- **Facet‑Based Product Filtering** — Real‑time matching from the product catalogue
- **Tiered Pricing Results** — Products grouped into budget, value, premium, and elite tiers with estimated totals
- **FAQ / Advice / Human Chat** — Preset topics, personalised recommendations, and live team redirect
- **Session Persistence** — Chat history survives page refresh via session cookies

### Admin Panel (`/admin`)
- **Dashboard** — Overview and key metrics
- **Products** — Manage garment catalogue
- **Categories** — Organise product types
- **Quotes** — View and manage customer quotes
- **Tiers** — Configure pricing tiers
- **CSV Import** — Bulk-import product data

### Quote Engine
- Local facet‑based recommendation engine at `src/lib/quoteEngine.ts`
- Decoration service pricing (printing / embroidery) with quantity breaks
- Configurable speed and priority options

---

## Tech Stack

| Layer              | Technology |
|--------------------|------------|
| Framework          | Next.js 16 (App Router) |
| UI Library         | React 19 |
| Language           | TypeScript |
| Styling            | Tailwind CSS v4 + CSS-in-JS (widget) |
| UI Components      | Radix UI (Dialog, Select, Switch, Tabs, etc.) |
| Tables             | TanStack Table v8 |
| Forms              | React Hook Form + Zod |
| Icons              | Lucide React |
| Chat API           | elxBot (window.elxBot.createConversation) |

---

## Project Structure

```
quotation-admin/
├── public/                          # Static assets
├── src/
│   ├── app/                         # Next.js App Router pages
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Express Quote Widget
│   │   └── admin/                   # Admin panel routes
│   │       ├── layout.tsx
│   │       ├── dashboard/
│   │       ├── products/
│   │       ├── categories/
│   │       ├── quotes/
│   │       ├── tiers/
│   │       └── csv-import/
│   ├── components/
│   │   ├── express-quote/           # The quote widget & chatbot
│   │   │   ├── widget.tsx           # Main component (~1000 lines)
│   │   │   ├── types.ts             # TypeScript interfaces
│   │   │   └── data.ts              # Colors, constants, configuration
│   │   ├── layout/                  # Admin layout (sidebar, mobile nav)
│   │   ├── ui/                      # Reusable UI primitives
│   │   ├── dashboard/               # Admin dashboard components
│   │   ├── products/                # Admin product management
│   │   ├── categories/
│   │   ├── quotes/
│   │   ├── tiers/
│   │   └── csv-import/
│   ├── lib/
│   │   ├── quoteEngine.ts           # Product recommendation engine
│   │   ├── utils.ts                 # Shared utilities
│   │   └── repositories/            # Data access layer
│   ├── data/                        # Static JSON data files
│   └── types/
│       └── index.ts                 # Global type definitions
├── components.json                  # shadcn/ui configuration
└── next.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm, pnpm, or yarn

### Installation

```bash
cd quotation-admin
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the Express Quote Widget.  
Navigate to [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Configuration

### Chat API (`elxBot`)

The widget relies on a global `window.elxBot` API. Ensure the `elxBot` script is loaded on the page before mounting the widget. Session IDs are persisted in a cookie (`c2o_session`) and automatically restored on page reload.

### Colour Palette

Defined in `src/components/express-quote/data.ts`:

| Token       | Value     | Usage |
|-------------|-----------|-------|
| `NAVY`      | `#4A90E2` | Primary accent |
| `NAVY_DARK` | `#1e3a5f` | Top bar, headings |
| `GOLD`      | `#d4a574` | MVP badge, highlights |
| `INK`       | `#111827` | Body text |
| `MUTED`     | `#6b7280` | Secondary text |
| `GREEN`     | `#16a34a` | Callback / success |
| `AMBER`     | `#d97706` | Order / advice |

---

## Key Architecture Decisions

1. **Single‑file widget** — The `ExpressQuoteWidget` component (~1000 lines) deliberately keeps all the chat + quote logic in one file for simplicity during the MVP phase.
2. **Facet‑based engine** — `quoteEngine.ts` implements a pure client‑side filtering engine that cross‑references product metadata against user answers, avoiding backend calls for recommendations.
3. **Conversation caching** — Chat history is cached in a ref (`chatMessagesRef`) so navigating between views preserves the conversation without re‑fetching from the API.
4. **Price flexibility** — The `ProductInfo.price` field accepts `number | string`, allowing raw values like `"£3.89 - £7.46"` to display as‑received from the API.

---

## Deployment

The app is a standard Next.js build and can be deployed to any platform supporting Node.js:

- **Vercel** (recommended) — `npx vercel`
- **Docker** — Multi‑stage Node.js build
- **Traditional server** — `npm run build && npm start`

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more options.
