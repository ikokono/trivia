'use client';
import { motion } from 'framer-motion';

export default function Podium({ gameResult }) {
  if (!gameResult) return null;

  const { winner, losers } = gameResult;

  // Susun peringkat
  const sortedResults = [
    { ...winner, position: 1 },
    ...losers.map((loser, index) => ({
      ...loser,
      position: index + 2
    }))
  ];

  // Warna podium berdasarkan posisi
  const podiumColors = ["bg-yellow-400", "bg-gray-400", "bg-orange-500"];

  return (
    <div className="flex justify-center items-end mt-10 space-x-4">
      {sortedResults.slice(0, 3).map((player, index) => (
        <motion.div
          key={player.username}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 10, delay: index * 0.2 }}
          className={`flex flex-col items-center ${podiumColors[player.position - 1]} p-4 rounded-lg`}
          style={{
            width: '100px',
            height: `${200 - player.position * 6}px` // Adjust height for podium effect
          }}
        >
          {/* Display the trophy emoji */}
          <div className="text-white font-bold">{player.position === 1 ? "🏆" : player.position === 2 ? "🥈" : "🥉"}</div>
          
          {/* Display player avatar */}
          <img
            src={player.avatarUrl} // Ensure the URL is valid and accessible
            alt={player.username}
            className="w-16 h-16 rounded-full border-4 border-white mt-2"
            style={{ objectFit: 'cover' }}
          />
          
          {/* Display player username */}
          <p className="text-white mt-2">{player.username}</p>
          
          {/* Display player points */}
          <p className="text-white">{player.correctAnswers} pts</p>
        </motion.div>
      ))}
      {sortedResults.length > 3 && (
        <div className="flex flex-col items-center mt-6">
          <div className="bg-gray-200 p-4 rounded-lg shadow-md">
            <p className="text-gray-700 font-bold">4th</p>
            <p className="text-gray-700 text-sm truncate">{sortedResults[3].username}</p>
            <p className="text-gray-700 text-sm">{sortedResults[3].correctAnswers} pts</p>
          </div>
        </div>
      )}
    </div>
  );
}
