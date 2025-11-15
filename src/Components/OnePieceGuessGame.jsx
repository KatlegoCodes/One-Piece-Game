import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterCard } from "./CharacterCard";
import { GuessInput } from "./GuessInput";
import { characters } from "../characters";
import { CrewBoard } from "./CrewBoard";

export const OnePieceGuessGame = () => {
  const [currentCharacter, setCurrentCharacter] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [round, setRound] = useState(0);
  const [message, setMessage] = useState("");
  const [crew, setCrew] = useState({
    captain: null,
    viceCaptain: null,
    fighter: null,
    healer: null,
    support1: null,
    support2: null,
  });

  useEffect(() => {
    getRandomCharacter();
  }, []);

  const getRandomCharacter = () => {
    const random = characters[Math.floor(Math.random() * characters.length)];
    setCurrentCharacter(random);
    setRevealed(false);
    setAttempts(0);
    setMessage("");
  };

  const handleGuess = (guess) => {
    if (!currentCharacter || !guess) return;

    const isCorrect = currentCharacter.alias.some(
      (name) => name.toLowerCase() === guess.toLowerCase()
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
    setMessage(`🏴‍☠️ ${currentCharacter.name} joined as your ${role} `);
    setTimeout(() => {
      getRandomCharacter();
    }, 2000);
  };

  return (
    <main className=" flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-b from-gray-950 to-gray-900 text-white">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-yellow-400 tracking-wide"
      >
        Build your crew
      </motion.h1>

      <CrewBoard crew={crew} />

      {/* Game Section */}
      {currentCharacter && (
        <>
          <CharacterCard
            character={currentCharacter}
            revealed={revealed}
            attempts={attempts}
          />

          <GuessInput onGuess={handleGuess} />

          {message && (
            <p
              key={message}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 text-center font-md text-lg ${
                message.includes("Correct") ? "text-green-400" : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}

          {/* Role Selection */}
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
    </main>
  );
};

export default OnePieceGuessGame;
