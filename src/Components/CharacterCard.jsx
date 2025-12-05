import React from "react";
import { motion } from "framer-motion";

export const CharacterCard = ({
  character,
  revealed,
  attempts = 0,
  disabled = false,
}) => {
  const hintsToshow = (character.hints || [])
    .filter(Boolean)
    .slice(0, attempts);

  return (
    <>
      <div
        className={`relative bg-gray-800 text-gray-900 rounded-3xl shadow-sm border border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-6 transition-colors`}
      >
        <motion.div
          initial={false}
          animate={
            revealed
              ? { filter: "blur(0px) grayscale(0%)", scale: 1 }
              : { filter: "blur(4px) grayscale(100%)", scale: 0.98 }
          }
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl aspect-3/4 max-w-64 mx-auto"
        >
          <img
            src={character.image}
            alt={character.name}
            className="object-cover w-full h-full"
          />
        </motion.div>

        {/* Title */}
        <h2 className="text-center mt-5 mb-2 text-xl font-semibold text-gray-50">
          {revealed ? character.name : "Who's this character?"}
        </h2>

        {/* Hints */}
        <div>
          {hintsToshow.map((hint, i) => {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-sm px-3 py-2 mb-2 bg-gray-700 rounded-lg border border-gray-600 text-gray-100"
              >
                <strong className="text-xs text-secondary mr-2">
                  Hint {i + 1}:
                </strong>
                {hint}
              </motion.div>
            );
          })}

          {!revealed && hintsToshow.length === 0 && (
            <p className="text-sm text-white text-center">
              No hints yet - try a guess!
            </p>
          )}
        </div>

        {disabled && (
          <div className="absolute inset-0 bg-black/30 rounded-3xl flex items-center justify-center pointer-events-none">
            <p className="text-white text-center font-semibold">
              Crew Complete
            </p>
          </div>
        )}
      </div>
    </>
  );
};
