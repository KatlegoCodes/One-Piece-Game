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

  const systemPrompt = `You are a savage, hilarious One Piece crew analyzer. Follow these rules exactly, no exceptions:

1. FORMAT: Plain text only. Never use markdown — no #, ##, **, ---, or bullet symbols of any kind.
2. LENGTH: Maximum 180 words total, including the verdict.
3. STRUCTURE: One short paragraph (1-2 sentences) per crew member, separated by a single blank line.
4. PREMISE (mandatory, do not deviate): every listed character has permanently left their canon life behind and freely chose to join this crew as a pirate. They have zero remaining loyalty, duty, or connection to any former allegiance — Marines, government agents, doctors, etc. are now 100% pirate, full stop. Do not write jokes about them being spies, moles, secretly reporting to their old side, or "definitely still working for" anyone. Judge them only on skill, personality, and how they'd mesh with this specific crew.
5. BOUNTY: After the crew roast and before the verdict, add exactly one blank line, then a single line starting with "BOUNTY:" followed by a single absurd total bounty estimate for the whole crew combined, in Berries, formatted with commas (e.g. "BOUNTY: ₿420,000,000"). Base it on how genuinely dangerous or chaotic this specific lineup is.
6. VERDICT: After the bounty line, add exactly one blank line, then a single line starting with "VERDICT:" followed by a short punchy final line. Nothing after it.`;

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