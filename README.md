<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0D0600,35:1E0D02,65:2B1404,100:1A0A02&height=210&text=%F0%9F%8E%AF%20CreatorBoost&fontColor=FBBF24&fontSize=54&fontAlignY=46&fontAlign=50&desc=For%20creators%20who've%20outgrown%20Google%20Analytics&descColor=F97316&descSize=16&descAlignY=68&animation=scaleIn" alt="CreatorBoost" width="100%">

<br/>

<img src="https://img.shields.io/badge/Node.js-20-166534?style=flat-square&logo=node.js&logoColor=86efac" alt="Node.js 20">&nbsp;
<img src="https://img.shields.io/badge/Express-4-1c2333?style=flat-square&logo=express&logoColor=e2e8f0" alt="Express 4">&nbsp;
<img src="https://img.shields.io/badge/Next.js-16-09090b?style=flat-square&logo=nextdotjs&logoColor=fafafa" alt="Next.js 16">&nbsp;
<img src="https://img.shields.io/badge/PostgreSQL-16-172554?style=flat-square&logo=postgresql&logoColor=93c5fd" alt="PostgreSQL 16">&nbsp;
<img src="https://img.shields.io/badge/OpenAI-GPT--4-2e1065?style=flat-square&logo=openai&logoColor=ddd6fe" alt="OpenAI GPT-4">&nbsp;
<img src="https://img.shields.io/badge/YouTube-Data%20API-450a0a?style=flat-square&logo=youtube&logoColor=fca5a5" alt="YouTube API">

<br/><br/>

[The Idea](#-the-idea) &nbsp;•&nbsp; [Features](#-features) &nbsp;•&nbsp; [Stack](#-stack) &nbsp;•&nbsp; [Architecture](#-architecture) &nbsp;•&nbsp; [Get Started](#-get-started) &nbsp;•&nbsp; [Project Layout](#-project-layout)

</div>

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

## → The Idea

You publish a video and numbers start moving — but *why* did Thursday spike? *Why* did August flatline? Most dashboards tell you the what. **CreatorBoost tells you the why.**

It's a full-stack analytics platform purpose-built for video creators and their teams — combining YouTube data sync, AI-powered performance explanations, and a fast, opinionated dashboard that actually keeps up with how creators think.

> *Every signal, surfaced. Every shift, explained. Every milestone, celebrated.*

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

## → Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>01 &nbsp; 📊 &nbsp; Analytics Dashboards</h3>
      <p>Views, engagement, and channel growth in a single unified view. Slice by video, date range, or segment — no spreadsheet juggling required.</p>
    </td>
    <td width="50%" valign="top">
      <h3>02 &nbsp; 🧠 &nbsp; AI Insight Engine</h3>
      <p>GPT-4 reads your performance curves and writes plain-English explanations. Not <em>"views dropped 40%"</em> — but <strong>why it dropped and what to try next.</strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>03 &nbsp; 📺 &nbsp; YouTube Data Sync</h3>
      <p>First-class YouTube API integration for video metadata, engagement signals, and channel-level aggregates — always fresh, no manual exports.</p>
    </td>
    <td width="50%" valign="top">
      <h3>04 &nbsp; 🔐 &nbsp; Google OAuth</h3>
      <p>Secure team sign-in via Passport.js and Google OAuth 2.0 — so your whole crew can log in without sharing credentials.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>05 &nbsp; 📈 &nbsp; Growth Signals</h3>
      <p>Trend detection, historical comparisons, and high-level overview cards. Built to answer the question you're already asking: <em>are we growing?</em></p>
    </td>
    <td width="50%" valign="top">
      <h3>06 &nbsp; ⚡ &nbsp; Responsive UI</h3>
      <p>App Router + React Query + Zustand. The dashboard is fast, server-first, and built to handle real creator workloads without lag.</p>
    </td>
  </tr>
</table>

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

## → Stack

<div align="center">

| What | With | Why |
|:-----|:-----|:----|
| **API Server** | Node.js 20 + Express 4 | Lightweight, fast, JavaScript all the way down |
| **Authentication** | Passport.js + Google OAuth 2.0 | Secure team login without the plumbing |
| **Database** | PostgreSQL 16 | Relational, reliable, built for analytics queries |
| **AI Layer** | OpenAI GPT-4 | Natural-language insight generation on demand |
| **Frontend** | Next.js 16 — App Router | Server components, fast navigation, great DX |
| **State** | React Query + Zustand | Server cache + lightweight client state |
| **UI System** | Tailwind CSS + Radix UI | Utility-first styling, accessible primitives |
| **Charts** | Recharts | Composable React chart components |
| **Integration** | YouTube Data API v3 | Channel and video performance data |

</div>

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

## → Architecture

Data flows in one direction and integrations stay at the edges — keeping the core clean.

```
   Creator logs in
        │
        ▼
   ┌─────────────┐      OAuth     ┌─────────────────┐
   │  Next.js 16 │ ◄────────────► │  Google OAuth   │
   │  App Router │                └─────────────────┘
   └──────┬──────┘
          │  REST
          ▼
   ┌─────────────┐    SQL queries ┌─────────────────┐
   │  Express 4  │ ◄────────────► │   PostgreSQL    │
   │  REST API   │                └─────────────────┘
   └──────┬──────┘
          │
     ┌────┴─────┐
     │          │
     ▼          ▼
┌─────────┐  ┌──────────────┐
│ YouTube │  │   OpenAI     │
│ Data    │  │   GPT-4      │
│ API v3  │  │   Insights   │
└────┬────┘  └──────┬───────┘
     │              │
     └──────┬───────┘
            ▼
     metadata + explanations
     written to PostgreSQL,
     served back to the UI
```

The frontend talks only to the Express API. The API owns all external calls — YouTube sync and AI generation never touch the browser directly.

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

## → Get Started

**Prerequisites:** Node.js 20+, PostgreSQL running locally, Google OAuth app credentials, and an OpenAI API key.

<br/>

### `1` — Backend

```bash
cd backend-cb
npm install

# Copy and fill in your secrets
cp .env .env.local
# DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OPENAI_API_KEY

# Run migrations and start
npm run migrate
npm run dev
```

The API starts on `http://localhost:5000` by default.

<br/>

### `2` — Frontend

```bash
cd frontend-cb
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — sign in with Google and you're live.

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

## → Project Layout

```
CreatorBoost/
│
├── backend-cb/
│   └── src/
│       ├── controllers/       request handlers for each route
│       ├── routes/            API route definitions
│       ├── services/          business logic, YouTube sync, AI calls
│       ├── config/            DB connection, OAuth setup
│       └── db/                migration files
│
└── frontend-cb/
    ├── app/                   routes and layouts (App Router)
    ├── components/            UI components, chart widgets, tables
    ├── hooks/                 data-fetching hooks (React Query)
    └── lib/                   API client, type definitions, utilities
```

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

## → Contributing

Pull requests are welcome. A few things that keep the codebase healthy:

- One concern per PR — small and focused is better than large and complete
- Add tests alongside new behavior whenever it's feasible
- Keep domain logic in `services/` — not in routes or controllers
- External API calls (YouTube, OpenAI) live in `services/` only — never inline in routes

<br/>

## → License

Open source. See `LICENSE` for details.

<br/>

<p align="center">· &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; · &nbsp; ·</p>

<br/>

<p align="center"><i>Built with coffee, curiosity, and an unhealthy love for dashboards.</i></p>

<br/>

<div align="center">
  <p><sub>Connect with me</sub></p>

  <a href="https://www.linkedin.com/in/meghan31/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" height="28" alt="LinkedIn">
  </a>&nbsp;
  <a href="https://www.instagram.com/me_gun_31/" target="_blank">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=flat-square&logo=instagram&logoColor=white" height="28" alt="Instagram">
  </a>&nbsp;
  <a href="https://www.meghan31.me/" target="_blank">
    <img src="https://img.shields.io/badge/Portfolio-111827?style=flat-square&logo=vercel&logoColor=white" height="28" alt="Portfolio">
  </a>&nbsp;
  <a href="mailto:meghasrivardhanp@gmail.com" target="_blank">
    <img src="https://img.shields.io/badge/Gmail-EA4335?style=flat-square&logo=gmail&logoColor=white" height="28" alt="Gmail">
  </a>

  <br/><br/>

  <img src="https://capsule-render.vercel.app/api?type=shark&color=0:1A0A02,50:0D0600,100:0D0600&height=80&section=footer&reversal=false" width="100%">

</div>
