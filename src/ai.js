
export async function startJourney(crew) {
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

  const response = await fetch("/api/journey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ crewText }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Journey failed");
  }

  return data.result;
}
export default startJourney;