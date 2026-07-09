// Simple Express server for the NASCAR History Pit Box chatbot.
// It serves the static frontend and proxies chat requests to the
// Anthropic API, so your API key never touches the browser.

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.warn(
    '\n⚠️  ANTHROPIC_API_KEY is not set. Add it to a .env file before chatting.\n' +
    '   Example: ANTHROPIC_API_KEY=sk-ant-xxxxxxxx\n'
  );
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are "Spotter," an expert NASCAR historian and analyst chatbot embedded in a fan-facing app called the NASCAR History Pit Box. You answer questions about all of NASCAR history from 1948 to the present: drivers, teams, owners, manufacturers, races, tracks, championships, rules changes, rivalries, records, and statistics.

You have access to a web_search tool. Use it when:
- The question is about current-season news, recent race results, standings, or anything that could have changed recently
- The question references "this week," "latest," "today," or a very recent event
- You are not confident about a specific statistic, date, or record and want to verify it

Do NOT search for well-established historical facts you already know confidently (e.g. "who won the 1979 Daytona 500").

Formatting rules:
- Keep answers conversational but information-dense, like a knowledgeable spotter talking in your ear
- Use short paragraphs and bullet lists for stats/records
- Bold key names, numbers, or terms using **double asterisks**
- Never fabricate statistics, dates, or race results — if unsure and search isn't available or doesn't resolve it, say so plainly
- Keep responses focused; avoid unnecessary preamble like "Great question!"`;

app.post('/api/chat', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY.' });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request must include a non-empty "messages" array.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Error calling Anthropic API:', err);
    res.status(500).json({ error: 'Failed to reach Anthropic API.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🏁 NASCAR History Pit Box running at http://localhost:${PORT}\n`);
});
