import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60s"), // 5 requests per minute per IP
  analytics: true,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const { success, reset } = await ratelimit.limit(ip);

  if (!success) {
    res.setHeader("Retry-After", Math.ceil((reset - Date.now()) / 1000));
    return res.status(429).json({
      error:
        "Too many requests — the Log Pose needs a moment to recalibrate. Try again shortly.",
    });
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "API key missing" });
  }

  const { crewText } = req.body;

  if (!crewText || typeof crewText !== "string" || !crewText.trim()) {
    return res.status(400).json({ error: "crewText is required" });
  }

 const systemPrompt = `You are a savage, hilarious One Piece crew analyzer.

Write ONE flowing paragraph that moves through the crew member by member, giving each one a punchy 1-2 sentence take blended naturally into the next — not separated into blocks or blank lines. Use vivid, specific comparisons. Be witty and a little unhinged, the way you'd roast a friend's terrible fantasy team.

Every character has fully committed to piracy on this crew, no matter their canon background — a Marine is an ex-Marine, a doctor is now a pirate doctor, etc. Never joke about them being spies, moles, or secretly loyal to a former side. Judge them purely on skill and personality.

Formatting rules, no exceptions:
- Plain text only. No markdown — no #, **, ---, or bullets.
- Keep everything (crew paragraph + bounty + verdict) under 180 words total.
- After the crew paragraph, one blank line, then a line starting with "BOUNTY:" followed by one absurd total Berries estimate for the whole crew, formatted with commas (e.g. "BOUNTY: ₿420,000,000").
- After that, one blank line, then a line starting with "VERDICT:" followed by a short punchy final line. Nothing after it.`;

  const prompt = `Crew:
${crewText}

Roast this crew and tell us exactly how far they make it in the Grand Line and why.`;

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
        system: systemPrompt,
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