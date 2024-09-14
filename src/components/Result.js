'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Podium from './Podium'; // Pastikan path-nya benar sesuai struktur folder Anda
import { useRouter } from "next/navigation";

export default function MatchResult({ gameResult, gameOver, username }) {
  const [showMessage, setShowMessage] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [continueVisible, setContinueVisible] = useState(true);
  const [coins, setCoins] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (gameOver) {
      // Determine if the current user is the winner
      const isWinner = gameResult.winner.username === username;

      // Set message based on whether the user is the winner or not
      setShowMessage(isWinner ? 'Congratulations!' : 'You Lose');

      setTimeout(() => {
        setShowMessage('');
        setShowResult(true);
      }, 2000); // Display message for 2 seconds
    }
  }, [gameOver, gameResult, username]);

  useEffect(() => {
    if (showCoins) {
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
      }, stepTime);
    }
  }, [showCoins]);

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
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <h1 className={`text-7xl font-bold ${showMessage === 'Congratulations!' ? 'text-green-500' : 'text-red-500'}`}>
              {showMessage}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {showResult && (
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {showCoins && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 1 }}
                className="fixed flex justify-center"
              >
                <div className="p-4 rounded-lg flex flex-col" style={{ transform: 'translateY(2%)' }}> {/* Adjust translateY */}
                  <p className="text-6xl font-bold">You Received</p>
                  <p className="text-2xl font-bold ml-3">{coins} coins</p>
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
                <Podium gameResult={gameResult} />
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
              <p className="text-lg text-gray-700 absolute bottom-4 left-1/2 transform -translate-x-1/2">Tap Anywhere to Continue</p>
            </motion.div>
          )}
        </div>
      )}
    </>
  );
}
