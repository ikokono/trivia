import React from 'react';

const Rankings = ({ gameResult }) => {
  if (!gameResult || !gameResult.winner) {
    return <p>No game results available.</p>;
  }

  const { winner, losers, coins, exp } = gameResult;

  return (
    <div className="rankings-container bg-gray-800 p-4 rounded-md">
      
      {/* Display Winner */}
      <div className="winner bg-green-600 p-3 rounded-lg mb-4">
        <h3 className="text-white text-lg">🏆 Winner: {winner.username}</h3>
        <p className="text-gray-300">Coins Earned: {coins[winner.username]}</p>
        <p className="text-gray-300">EXP Earned: {exp[winner.username]}</p>
      </div>

      {losers.length > 0 ? (
        <ul className="losers-list">
          {losers.map((loser, index) => (
            <li key={loser.id} className="loser bg-gray-700 p-3 rounded-lg mb-2">
              <h4 className="text-gray-200">#{index + 2} {loser.username}</h4>
              <p className="text-gray-400">Coins Earned: {coins[loser.username]}</p>
              <p className="text-gray-400">EXP Earned: {exp[loser.username]}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No other players participated.</p>
      )}
    </div>
  );
};

export default Rankings;
