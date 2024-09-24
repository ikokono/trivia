import React from 'react';

const Rankings = ({ gameResult }) => {
  if (!gameResult || !gameResult.winner) {
    return <p>No game results available.</p>;
  }

  const { winner, losers, coins, exp } = gameResult;

  return (
    <div className="rankings-container bg-gray-800 p-4 rounded-md">
      {/* Display Winner */}
      <div className="winner bg-green-600 p-6 rounded-lg mb-4 flex items-center">
        {/* Display winner avatar */}
        <img
          src={winner.avatarUrl ? winner.avatarUrl : "/images/avatar/avatar_default.png"}
          alt={`${winner.username}'s avatar`}
          className="w-12 h-12 rounded-full mr-4"
        />
        {/* Display winner details */}
        <div>
          <h3 className="text-white text-lg">{winner.username}</h3>
          <p className="text-gray-300 flex items-center">
            <img src='/images/assets/coin.gif' alt="coin" className="w-6 h-6 mr-2" /> {coins[winner.username]}
            <img src='/images/assets/exp.png' alt="exp" className="w-6 h-6 ml-4 mr-2" /> {exp[winner.username]}
          </p>
        </div>
      </div>

      {/* Display Losers */}
      {losers.length > 0 ? (
        <ul className="losers-list">
          {losers.map((loser, index) => (
            <li key={loser.id} className="loser bg-gray-700 p-3 rounded-lg mb-2 flex items-center">
              {/* Display loser avatar */}
              <img
                src={loser.avatarUrl ? loser.avatarUrl : "/images/avatar/avatar_default.png"}
                alt={`${loser.username}'s avatar`}
                className="w-10 h-10 rounded-full mr-4"
              />
              {/* Display loser details */}
              <div>
                <h4 className="text-gray-200">{loser.username}</h4>
                <p className="text-gray-400 flex items-center">
                  <img src='/images/assets/coin.gif' alt="coin" className="w-5 h-5 mr-2" /> {coins[loser.username]}
                  <img src='/images/assets/exp.png' alt="exp" className="w-5 h-5 ml-4 mr-2" /> {exp[loser.username]}
                </p>
              </div>
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
