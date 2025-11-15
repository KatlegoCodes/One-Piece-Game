import React from "react";
import { motion } from "framer-motion";

export const CrewBoard = ({ crew }) => {
  return (
    <section className="w-full max-w-3xl mb-8">
      <h2 className="text-xl font-semibold text-yellow-300 mb-4 text-center">
        🏴‍☠️ Your Pirate Crew
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Object.entries(crew).map(([role, member]) => (
          <motion.div
            key={role}
            className="p-3 rounded-lg bg-gray-800 text-center flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {member ? (
              <>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 object-cover rounded-full mb-2 border-2 border-yellow-400"
                />
                <p className="text-sm font-bold">{member.name}</p>
                <p className="text-xs text-gray-400 capitalize">{role}</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-gray-700 mb-2" />
                <p className="text-sm text-gray-500 capitalize">{role}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
