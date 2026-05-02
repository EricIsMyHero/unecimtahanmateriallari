// api/ask.js — Vercel Serverless Function (OpenRouter)
export default async function handler(req, res) {

  const allowedOrigins = [
    'https://ericismyhero.github.io',
    'https://ericismyhero-github-io.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, context } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Missing question' });
  }

  try {
    const prompt = `Sen UNEC (Azərbaycan Dövlət İqtisad Universiteti) üzrə bir köməkçisən.
Yalnız aşağıdakı kontekst əsasında cavab ver. Kontekstdən kənar sualları rədd et.
Kontekst:
${context}
Sual: ${question}`;

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://ericismyhero.github.io',
        'X-Title': 'UNEC AI Köməkçi'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const orData = await orRes.json();
    console.log('OPENROUTER RAW:', JSON.stringify(orData));

    const reply = orData?.choices?.[0]?.message?.content
      ?? 'Cavab alınmadı.';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('OpenRouter error:', err);
    return res.status(500).json({ error: 'Server xətası' });
  }
}
