'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Rangkings from './Rankings'; // Pastikan path-nya benar sesuai struktur folder Anda
import { useRouter } from "next/navigation";

export default function MatchResult({ gameResult, gameOver, username }) {
  const [showMessage, setShowMessage] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [continueVisible, setContinueVisible] = useState(true);
  const [coins, setCoins] = useState(0);
  const [exp, setExp] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (gameOver) {
      // Determine if the current user is the winner
      console.log(gameResult)
      const isWinner = gameResult.winner.username === username;

      // Set message based on whether the user is the winner or not
      setShowMessage(isWinner ? 'Slayyyy!' : 'Big L, Bro.');

      setCoins(gameResult.coins[username]); // Update coins when continuing
      setExp(gameResult.exp[username]); // Update coins when continuing

      console.log("exp", gameResult.coins[username])

      setTimeout(() => {
        setShowMessage('');
        setShowResult(true);
      }, 2000); // Display message for 2 seconds
    }
  }, [gameOver, gameResult, username]);

  useEffect(() => {
    if (showCoins) {
      console.log("Coins to display:", coins); // Log nilai coins
      let start = 0;
      const end = coins;
      const duration = 2; // Duration in seconds
      const stepTime = 100; // Update interval in milliseconds
      const steps = duration * 1000 / stepTime;

      const stepValue = (end - start) / steps;

      const interval = setInterval(() => {
        start += stepValue;
        if (start >= end) {
          start = end;
          clearInterval(interval);
        }
        setCoins(Math.round(start));
        console.log("Current coins value:", Math.round(start)); // Log nilai koin saat ini
      }, stepTime);
    }
  }, [showCoins]);

  const handleUpdateCoins = async (amount) => {
    try {
      const response = await fetch('/api/user/coins', {
        method: 'PUT', // Use PUT to add coins
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: username, amount }),
      });

      if (!response.ok) {
        throw new Error('Failed to update coins');
      }

      console.log('Coins updated successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const handleContinue = () => {
    console.log("Handling continue", showCoins);
    if (showCoins) {
      setShowCoins(false);
      setContinueVisible(false);
      router.push("/"); // Memuat ulang halaman
    } else {
      setContinueVisible(true);
      setShowCoins(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <h1
              className={`text-4xl md:text-7xl font-bold ${showMessage === 'Slayyyy!' ? 'text-green-500' : 'text-red-500'
                }`}
            >
              {showMessage}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {showResult && (
        <div className="relative flex flex-col items-center p-4">
          <AnimatePresence>
            {showCoins && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 1 }}
                className="fixed flex justify-center"
              >
                <div
                  className="p-4 rounded-lg flex flex-col"
                  style={{ transform: 'translateY(2%)' }}
                >
                  <p className="text-3xl md:text-6xl font-bold mb-5">You Snagged</p>
                  <div className="flex items-center ml-4">
                    <img src='/images/assets/coin.gif' width="24" height="24" className={`ml-5`}/>
                    <span className={`text-yellow-400 font-semibold ml-2`}>{coins}</span>
                    <img src='/images/assets/exp.png' width="24" height="24" className={`ml-5`}/>
                    <span className={`text-green-400 font-semibold ml-2`}>{exp}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: showCoins ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="relative flex flex-col items-center"
              >
                <Rangkings gameResult={gameResult} />
              </motion.div>
            )}
          </AnimatePresence>

          {continueVisible && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="fixed inset-0 flex items-center justify-center cursor-pointer"
              onClick={handleContinue}
            >
              <p className="text-sm md:text-lg text-gray-700 absolute bottom-4 left-1/2 transform -translate-x-1/2">
                Tap Anywhere to Continue
              </p>
            </motion.div>
          )}
        </div>
      )}
    </>
  );

}
