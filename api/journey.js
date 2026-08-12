console.log("Key present:", !!process.env.ANTHROPIC_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    console.error("API key missing");
    return res.status(500).json({ error: "API key missing" });
  }

  const { crewText } = req.body;

  if (!crewText || typeof crewText !== "string" || !crewText.trim()) {
    return res.status(400).json({ error: "crewText is required" });
  }

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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "Anthropic API request failed",
      });
    }

    const result = data?.content?.find((block) => block.type === "text")?.text;

    if (!result) {
      console.error("Unexpected Anthropic response shape:", data);
      return res.status(502).json({ error: "No content returned from Claude" });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Anthropic request failed:", error);
    return res.status(500).json({ error: "Anthropic request failed" });
  }
}