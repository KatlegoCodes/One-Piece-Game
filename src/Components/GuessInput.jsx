import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { div, form } from "motion/react-client";

export const GuessInput = ({ onGuess }) => {
  const [guess, setOnGuess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (guess.trim() === "") {
      setError("Please Enter a guess");
      return;
    }
    setError("");
    onGuess(guess.trim().toLowerCase());
    setOnGuess("");
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto mt-8 flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-2 transition focus-within:ring-indigo-500  ">
        <Search className="text-gray-500 w-5 h-5 ml-2" />
        <input
          type="text"
          placeholder="Guess the character"
          value={guess}
          onChange={(event) => setOnGuess(event.target.value)}
          className="flex-1 bg-transparent outline-none px-2 py-2 text-gray-500 placeholder:gray-500/70"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-600/90 active:scale-95 transition-transform"
        >
          Guess
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500 text-sm font-medium"
        >
          {error}
        </motion.p>
      )}
    </motion.form>
  );
};
