import React, { useState } from "react";
import { characters } from "./characters";
import { CharacterCard } from "./Components/CharacterCard";
import { GuessInput } from "./Components/GuessInput";

export default function App() {
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleGuess = (userGuess) => {
    const character = characters[0];
    if (character.alias.includes(userGuess)) {
      setRevealed(true);
    } else {
      setAttempts((prev) => prev + 1);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      <CharacterCard
        character={characters[0]}
        revealed={revealed}
        attempts={attempts}
      />
      <GuessInput onGuess={handleGuess} />
    </main>
  );
}
