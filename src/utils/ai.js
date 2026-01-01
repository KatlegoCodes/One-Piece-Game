async function startJourney(crew) {
  const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    document.getElementById("journey-result").innerHTML =
      "No Log Pose found… API key missing 🧭";
    return;
  }

  const roles = {
    captain: "Captain",
    viceCaptain: "Vice-Captain",
    fighter: "Fighter",
    healer: "Healer",
    support1: "Support",
    support2: "Support",
  };

  const crewText = Object.entries(crew)
    .filter(([_, name]) => name)
    .map(([role, name]) => `${roles[role] || role}: ${name}`)
    .join("\n");

  const prompt = `One Piece meme crew analyzer (funny + savage edition)

Crew:
${crewText}

Be a brutally honest, hilarious One Piece expert.
Tell us exactly how far this crew makes it in the Grand Line and why.

End with a one-line verdict like:
"Dead before Reverse Mountain 🔥"
"Becomes the new Emperor crew"
"Actually finds Laugh Tale by accident"`;

  document.getElementById("journey-result").innerHTML =
    "The Grand Line is judging your crew... ⏳";

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
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

    if (!data.choices) throw new Error("Groq error");

    document.getElementById("journey-result").innerHTML =
      data.choices[0].message.content
        .replace(/\n/g, "<br>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  } catch (e) {
    document.getElementById("journey-result").innerHTML =
      "The Grand Line connection failed... even the Log Pose gave up.";
  }
}
