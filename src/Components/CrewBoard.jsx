import React from "react";
import { motion } from "framer-motion";

export const CrewBoard = ({ crew }) => {
  return (
    <section className="w-full max-w-4xl mt-10 ">
      <h2 className="text-2xl font-semibold text-yellow-300 mb-6 text-center">
        Your Pirate Crew
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
        {Object.entries(crew).map(([role, member]) => (
          <motion.div
            key={role}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-5 rounded-2xl bg-gray-800/60 backdrop-blur-md border
                       border-gray-700 shadow-md flex flex-col items-center 
                          justify-center gap-3 transition-all ${
                            !member
                              ? "hover:border-yellow-400/50 hover:shadow-yellow-500/10"
                              : ""
                          }`}
          >
            {member ? (
              <>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 object-cover rounded-full border-2 border-b-yellow-400 shadow-md shadow-yellow-500/20 hover:scale-110 transition"
                />
                <p className="text-base font-bold text-white">{member.name}</p>
                <p className="text-sm text-yellow-300 capitalize tracking-wide">
                  {role}
                </p>
              </>
            ) : (
              <>
                <div
                  className="w-24 h-24 rounded-full bg-gray-700/70 flex items-center 
                  justify-center border border-gray-600 shadow-inner"
                >
                  <p className="text-sm text-gray-400 capatilize">{role}</p>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
};
