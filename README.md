# NASCAR History Pit Box

A standalone NASCAR history chatbot that runs in any browser. The frontend
is plain HTML/CSS/JS; a small Express server keeps your Anthropic API key
private and forwards chat requests to Claude.

## 1. Install dependencies

```bash
cd nascar-chatbot-standalone
npm install
```

## 2. Add your API key

```bash
cp .env.example .env
```

Open `.env` and paste in your real key from https://console.anthropic.com:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## 3. Run it locally

```bash
npm start
```

Then open **http://localhost:3000** in your browser. That's it — no Claude.ai
needed, just a normal webpage.

## How it works

- `public/index.html` — the chat UI. It sends each message to `/api/chat`
  on your own server (not directly to Anthropic).
- `server.js` — a tiny Express server with one route, `/api/chat`, that
  attaches your API key server-side and forwards the request to
  `api.anthropic.com`. This keeps the key out of the browser, where anyone
  could otherwise view it in the page source.

## Deploying it so it's live on the internet

The easiest free options, since this is a standard Node/Express app:

**Render** (simplest for a persistent Node server)
1. Push this folder to a GitHub repo
2. Create a new "Web Service" on render.com, connect the repo
3. Set the build command to `npm install` and start command to `npm start`
4. Add `ANTHROPIC_API_KEY` under Environment Variables
5. Deploy — you'll get a public URL

**Railway** — same idea as Render, also has a generous free tier and auto-detects Node apps from a GitHub repo.

**Vercel/Netlify** — these are built around serverless functions rather than
a long-running Express server. If you'd prefer one of these, let me know
and I can restructure `server.js` into a serverless function (`api/chat.js`)
instead — the frontend won't need any changes since it already just calls
`/api/chat`.

## Notes

- Never commit your `.env` file or share your API key.
- The bot uses Claude's web search tool for current news/results and its
  own knowledge for historical facts, same as before.
