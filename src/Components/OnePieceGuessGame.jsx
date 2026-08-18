import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CharacterCard } from "./CharacterCard";
import { GuessInput } from "./GuessInput";
import { characters } from "../characters";
import { CrewBoard } from "./CrewBoard";
import { startJourney } from "../ai";

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
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
  const [journeyResult, setJourneyResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [crew, setCrew] = useState({
    captain: null,
    viceCaptain: null,
    fighter: null,
    healer: null,
    support1: null,
    support2: null,
  });

  const [score, setScore] = useState(0);
  const [rolesFilled, setRolesFilled] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    characters.forEach((char) => {
      const img = new Image();
      img.src = char.image;
    });
  }, []);

  useEffect(() => {
    const filled = Object.values(crew).every(Boolean);
    setRolesFilled(filled);

    if (filled) {
      setMessage(`🎉 Crew complete! Final score: ${score}`);
    }
  }, [crew, score]);

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
    setHintUsed(false);
  };

  const handleGuess = (guess) => {
    if (!currentCharacter || !guess || rolesFilled) return;

    const userGuess = guess.trim().toLowerCase();
    const isCorrect = currentCharacter.alias.some(
      (name) => name.toLowerCase() === userGuess,
    );

    if (isCorrect) {
      setRevealed(true);

      const points = Math.max(0, 3 - attempts);
      setScore((prev) => prev + points);
      setMessage("✅ Correct! Choose a crew role to assign.");
      return;
    }

    setAttempts((prev) => {
      const newAttempts = prev + 1;

      if (newAttempts >= 4) {
        setRevealed(true);
        setMessage("❌ Out of hints! Character revealed.");
      } else {
        setMessage("❌ Try again!");
      }

      return newAttempts;
    });
  };

  const handleHint = () => {
    if (!currentCharacter || revealed || hintUsed || isCrewFull) return;

    const hintsAvailable = (currentCharacter.hints || []).filter(
      Boolean,
    ).length;
    if (attempts >= hintsAvailable) return;

    setAttempts((prev) => prev + 1);
    setHintUsed(true);
    setMessage("Hint Revealed");
  };

  const assignToCrew = (role) => {
    if (!currentCharacter) return;

    if (crew[role]) {
      setMessage(`${role} is already filled.`);
      return;
    }

    setCrew((prev) => {
      const newCrew = { ...prev, [role]: currentCharacter };
      return newCrew;
    });
    setMessage(`${currentCharacter.name} joined as your ${role}!`);
    setIsTransitioning(true);

    setTimeout(() => {
      const willBeFilled = Object.values({
        ...crew,
        [role]: currentCharacter,
      }).every(Boolean);

      if (!willBeFilled) {
        drawNextCharacter();
      } else {
        setIsTransitioning(false);
      }
    }, 2000);
  };

  const isCrewFull = Object.values(crew).every((member) => member !== null);

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
    setScore(0);
    setRolesFilled(false);
    setJourneyResult(false);
    setHintUsed(false);
  };

  const handleBeginJourney = async () => {
    setIsLoading(true);
    setIsError(false);
    setJourneyResult("The GrandLine is judging your crew...⏳");

    try {
      const result = await startJourney(crew);
      setJourneyResult(result);
    } catch (error) {
      setIsError(true);
      setJourneyResult(
        "The GrandLine connection failed...even the log Pose gave up",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { bodyText, bountyText, verdictText } = useMemo(() => {
    if (!journeyResult)
      return { bodyText: "", bountyText: "", verdictText: "" };

    const bountyMarker = journeyResult.indexOf("BOUNTY:");
    const verdictMarker = journeyResult.indexOf("VERDICT:");

    if (bountyMarker === -1 || verdictMarker === -1) {
      return { bodyText: journeyResult, bountyText: "", verdictText: "" };
    }
    return {
      bodyText: journeyResult.slice(0, bountyMarker).trim(),
      bountyText: journeyResult
        .slice(bountyMarker + "BOUNTY:".length, verdictMarker)
        .trim(),
      verdictText: journeyResult
        .slice(verdictMarker + "VERDICT:".length)
        .trim(),
    };
  }, [journeyResult]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-linear-to-b from-gray-950 to-gray-900 text-white">
      {/* HEADING  */}
      <div className="w-full flex justify-center mb-2">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-black tracking-wide text-yellow-400 uppercase text-center"
        >
          Build Your Crew
        </motion.h1>
      </div>

      <h2 className="mb-2 text-lg text-gray-300 font-semibold text-center">
        Guess the character and assemble the strongest pirate crew.
      </h2>

      <div className="text-center max-w-2xl mb-10">
        <p className="text-gray-300 leading-relaxed text-xs">
          Guess the One Piece character using hints! Each incorrect guess
          reveals a new hint. Get it right and recruit them into your crew. Fill
          all roles to complete your pirate squad!
        </p>
      </div>

      <AnimatePresence mode="wait">
        {currentCharacter && (
          <motion.div
            key={currentCharacter.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <CharacterCard
              character={currentCharacter}
              revealed={revealed}
              attempts={attempts}
              onImageReady={() => setIsTransitioning(false)}
            />

            <GuessInput
              onGuess={handleGuess}
              disabled={isCrewFull || isTransitioning}
            />

            <motion.button
              onClick={handleHint}
              disabled={hintUsed || revealed || isCrewFull}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                hintUsed || revealed
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Hint
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 h-7 flex items-center justify-center">
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center font-md text-lg ${
              message.includes("Correct") ? "text-gray-400" : "text-red-500"
            }`}
          >
            {message}
          </motion.p>
        )}
      </div>

      {revealed && !rolesFilled && (
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

      <div className="w-full max-w-4xl flex justify-center mt-5">
        <button
          onClick={resetGame}
          className="px-4 py-2 rounded-lg bg-red-500 font-semibold hover:bg-red-600"
        >
          Reset Game
        </button>
      </div>

      {isCrewFull && (
        <button
          className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-50"
          onClick={handleBeginJourney}
          disabled={isLoading}
        >
          {isLoading ? "Consulting the Log Pose..." : "Begin Your Journey"}
        </button>
      )}

      {journeyResult && (
        <motion.div
          initial={{ opacity: 0, y: 16, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 w-full max-w-xl relative"
        >
          <div
            className={`relative rounded-sm p-8 shadow-2xl border-2 ${
              isError
                ? "bg-gray-200 border-gray-400 text-gray-700"
                : "bg-[#f4e8c9] border-[#3e2723]/30 text-[#3e2723]"
            }`}
            style={{ fontFamily: "'Special Elite', monospace" }}
          >
            {/* tape corners */}
            <span className="absolute -top-3 -left-4 w-12 h-6 bg-yellow-100/80 -rotate-6 shadow-sm" />
            <span className="absolute -top-3 -right-4 w-12 h-6 bg-yellow-100/80 rotate-6 shadow-sm" />

            <p className="text-center text-[11px] tracking-[0.35em] uppercase opacity-60 mb-4">
              {isError ? "Transmission Lost" : "Log Pose Reading"}
            </p>

            <p className="whitespace-pre-line leading-relaxed text-[15px]">
              {bodyText}
            </p>

            {bountyText && !isError && (
              <div className="mt-5 text-center">
                <p className="text-[10px] tracking-[0.3em] uppercase opacity-50 mb-1">
                  Bounty
                </p>
                <p className="text-2xl font-bold">{bountyText}</p>
              </div>
            )}

            {verdictText && !isError && (
              <div className="mt-6 flex justify-center">
                <span className="inline-block border-4 border-red-700/80 text-red-700 font-bold uppercase tracking-wide px-4 py-2 -rotate-6 text-sm">
                  {verdictText}
                </span>
              </div>
            )}
          </div>

          {/* re-roll button */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleBeginJourney}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold text-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Consulting the Log Pose..."
                : "Try a different fate"}
            </button>
          </div>
        </motion.div>
      )}

      <CrewBoard crew={crew} />
    </main>
  );
};
