
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  const { crewText } = req.body;

  const prompt = `One Piece meme crew analyzer (funny + savage edition)

Crew:
${crewText}

Be a brutally honest, hilarious One Piece expert.
Tell us exactly how far this crew makes it in the Grand Line and why.

End with a one-line verdict like:
"Dead before Reverse Mountain 🔥"
"Becomes the new Emperor crew"
"Actually finds Laugh Tale by accident"`;

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.9,
          max_tokens: 800,
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json({
      result: data.choices[0].message.content,
    });
  } catch (error) {
    return res.status(500).json({ error: "Groq request failed" });
  }
}
