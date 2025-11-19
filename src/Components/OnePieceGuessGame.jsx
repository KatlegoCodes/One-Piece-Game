import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CharacterCard } from "./CharacterCard";
import { GuessInput } from "./GuessInput";
import { characters } from "../characters";
import { CrewBoard } from "./CrewBoard";

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const OnePieceGuessGame = () => {
  const [deck, setDeck] = useState([]);
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("");
  const [attempts, setAttempts] = useState(0);

  const [crew, setCrew] = useState({
    captain: null,
    viceCaptain: null,
    fighter: null,
    healer: null,
    support1: null,
    support2: null,
  });

  useEffect(() => {
    resetGame();
  }, []);

  const drawNextCharacter = () => {
    setDeck((prev) => {
      const remaining = [...prev];
      remaining.shift();

      if (remaining.length === 0) {
        const reshuffled = shuffleArray(characters);
        setCurrentCharacter(reshuffled[0]);
        return reshuffled;
      }

      setCurrentCharacter(remaining[0]);
      return remaining;
    });

    setRevealed(false);
    setAttempts(0);
    setMessage("");
  };

  const handleGuess = (guess) => {
    if (!currentCharacter || !guess) return;

    const userGuess = guess.trim().toLowerCase();
    const isCorrect = currentCharacter.alias.some(
      (name) => name.toLowerCase() === userGuess
    );

    if (isCorrect) {
      setRevealed(true);
      setMessage("✅ Correct! Choose a crew role to assign.");
    } else {
      setAttempts((prev) => prev + 1);
      setMessage("❌ Try again!");
    }
  };

  const assignToCrew = (role) => {
    setCrew((prev) => ({ ...prev, [role]: currentCharacter }));
    setMessage(`${currentCharacter.name} joined as your ${role}!`);

    setTimeout(() => {
      drawNextCharacter();
    }, 2000);
  };

  const resetGame = () => {
    const newDeck = shuffleArray(characters);
    setDeck(newDeck);
    setCurrentCharacter(newDeck[0]);
    setCrew({
      captain: null,
      viceCaptain: null,
      fighter: null,
      healer: null,
      support1: null,
      support2: null,
    });
    setRevealed(false);
    setAttempts(0);
    setMessage("");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-b from-gray-950 to-gray-900 text-white">
      <div className="flex items-center justify-between w-full max-w-3xl mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-yellow-400 tracking-wide"
        >
          Build Your Crew
        </motion.h1>

        <button
          onClick={resetGame}
          className="px-4 py-2 rounded-lg bg-red-500 font-semibold hover:bg-red-600"
        >
          Reset Game
        </button>
      </div>

      {currentCharacter && (
        <>
          <CharacterCard
            character={currentCharacter}
            revealed={revealed}
            attempts={attempts}
          />

          <GuessInput onGuess={handleGuess} />

          {message && (
            <motion.p
              key={message}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 text-center font-md text-lg ${
                message.includes("Correct") ? "text-gray-400" : "text-red-500"
              }`}
            >
              {message}
            </motion.p>
          )}

          {revealed && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {Object.keys(crew).map((role) => (
                <button
                  key={role}
                  onClick={() => assignToCrew(role)}
                  disabled={crew[role]}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                    crew[role]
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-400 text-black hover:bg-yellow-500"
                  }`}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <CrewBoard crew={crew} />
    </main>
  );
};
