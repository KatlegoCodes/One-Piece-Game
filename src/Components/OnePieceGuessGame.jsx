import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { characters } from "../characters";
import CharacterCard from "./CharacterCard";

const OnePieceGuessGame = () => {
  const [currentCharacter, setCurrentCharacter] = useState(
    characters[Math.floor(Math.random() * characters.length)]
  );
  const [guess, setGuess] = useState("");
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [round, setRound] = useState(0); // helps with animation key

  const handleGuess = () => {
    const normalizedGuess = guess.toLowerCase().trim();
    if (currentCharacter.alias.includes(normalizedGuess)) {
      setMessage("✅ Correct! You guessed it!");
      setScore(score + 1);
      setTimeout(nextCharacter, 1500);
    } else {
      setAttempts(attempts + 1);
      setMessage("❌ Wrong! Try again.");
      if (attempts + 1 >= 2) setShowHint(true);
    }
    setGuess("");
  };

  const nextCharacter = () => {
    const newCharacter =
      characters[Math.floor(Math.random() * characters.length)];
    setCurrentCharacter(newCharacter);
    setAttempts(0);
    setShowHint(false);
    setHintIndex(0);
    setMessage("");
    setRound(round + 1); // triggers animation
  };

  const handleShowHint = () => {
    if (hintIndex < currentCharacter.hints.length - 1)
      setHintIndex(hintIndex + 1);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-900 to-sky-700 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">⚓ One Piece Guess Game</h1>

      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <CharacterCard image={currentCharacter.image} />
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex flex-col items-center">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Who is this character?"
          className="p-2 rounded text-black w-64 text-center mb-2"
        />
        <button
          onClick={handleGuess}
          className="bg-yellow-400 text-black px-4 py-2 rounded font-bold hover:bg-yellow-500 transition"
        >
          Guess
        </button>

        <p className="mt-3 text-lg">{message}</p>

        {showHint && (
          <button
            onClick={handleShowHint}
            className="mt-3 bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 transition"
          >
            💡 Show Hint
          </button>
        )}

        {showHint && (
          <p className="mt-2 italic text-sm text-yellow-200">
            {currentCharacter.hints[hintIndex]}
          </p>
        )}

        <p className="mt-5 text-lg">
          🏴‍☠️ Score: <span className="font-bold">{score}</span>
        </p>
      </div>
    </div>
  );
};

export default OnePieceGuessGame;
