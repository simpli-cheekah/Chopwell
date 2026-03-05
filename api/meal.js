export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  const systemPrompt = `You are a Nigerian food assistant specializing in budget meals for Lagos students. You know Nigerian ingredients, local market prices, street food and mama put meals. Suggest realistic meals based on budget and ingredients. Be friendly and speak like a young Nigerian.

IMPORTANT: Always respond with ONLY valid JSON array (no markdown, no explanation, no backticks). Format:
[
  {
    "name": "Meal Name",
    "emoji": "🍲",
    "cost": 500,
    "type": "cook",
    "steps": ["Step 1...", "Step 2...", "Step 3..."],
    "extra_ingredients": ["ingredient 1", "ingredient 2"]
  }
]
type must be "cook" or "buy". Give 2-3 meal options. Keep steps short and practical.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const result = data.choices[0].message.content;
    return res.status(200).json({ result });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}