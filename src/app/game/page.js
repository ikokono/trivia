"use client";
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../../socket'; // pastikan path benar
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS
import MatchResult from '../../components/Result.js'
import nookies from 'nookies';
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import GameLeaderboard from "../../components/GameLeaderboard"

export default function Game() {
  const [room, setRoom] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [leaderboard, setLeaderboard] = useState({});
  const [quizType, setQuizType] = useState('');
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const [activeBackground, setActiveBackground] = useState(null);
  const [answered, setAnswered] = useState(false); // New state to track if the question has been answered
  const audioRef = useRef(null);
  const [gameResult, setGameResult] = useState(null);
  const [audio, setAudio] = useState(null);
  const [audioSrc, setAudioSrc] = useState('');
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const [coins, setCoins] = useState(0)
  const router = useRouter();
  const [playGameMusic, setPlayGameMusic] = useState(true);

  useEffect(() => {
    // Load playGameMusic setting from localStorage when component mounts
    const savedGameMusic = localStorage.getItem('playGameMusic');
    if (savedGameMusic === 'true') {
      setPlayGameMusic(true);
    }

    if (savedGameMusic === 'true') {
      // Play game music if the setting is enabled
      const audio = new Audio('/audio/Theme_quiz.mp3');
      audio.loop = true;
      audio.play();

      return () => {
        audio.pause();
        audio.currentTime = 0; // Reset audio when component unmounts
      };
    }
  }, []);

  useEffect(() => {
    const fetchTokenAndUsername = async () => {
      const cookies = nookies.get();
      const token = cookies.token || null;
      const decoded = jwtDecode(token);
      const userId = decoded?.userId;

      if (token) {
        try {
          if (!userId) throw new Error('Invalid token');
          setToken(token);
          console.log(token)
          console.log(userId)
          const res = await fetch(`/api/user?id=${userId}`);
          const data = res.ok ? await res.json() : { username: 'Failed to load username' };
          setUsername(data.username);
        } catch (error) {
          setUsername('Failed to load username');
          console.error('Token decoding or API error:', error);
        }
      } else setUsername('No token found');
    };

    fetchTokenAndUsername();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch((error) => {
        console.log("Autoplay mungkin di-block oleh browser:", error);
      });
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on('roomAssigned', (roomId) => {
      setRoom(roomId);
      console.log(`Assigned to room: ${roomId}`);
    });

    socket.on('leaderboardUpdate', (data) => {
      setLeaderboard(data);
    });

    socket.on('newQuestion', (question) => {
      setQuestion(question);
      setAnswerOptions(question.answers);
      setTimer(10);
      setAnswered(false); // Reset answered state when a new question arrives
      startTimer();
    });

    socket.on('answerResult', ({ socketId, correct }) => {
      setAnswers(prev => ({ ...prev, [socketId]: correct }));
    });

    socket.on('gameOver', () => {
      setGameOver(true);
    });

    // Handle matchmaking update
    socket.on('matchmakingUpdate', (data) => {
      setPlayersInQueue(data.playersInQueue);
      console.log('Players in Queue:', data.playersInQueue);
    });

    socket.on('gameResult', (result) => {
      setGameResult(result);
      console.log(result)

      if (result.winner.username === username) { // Ganti dengan logika untuk mendeteksi pemenang Anda
        setAudioSrc('/audio/Win.mp3'); // Path ke lagu menang
      } else {
        setAudioSrc('/audio/Lose.mp3'); // Path ke lagu kalah
      }
    });

    return () => {
      socket.off('roomAssigned');
      socket.off('newQuestion');
      socket.off('answerResult');
      socket.off('gameOver');
      socket.off('leaderboardUpdate');
      socket.off('matchmakingUpdate');
      socket.off('gameResult');
      socket.disconnect();
    };
  }, []);

  const handleAnswer = (answer) => {
    if (!answered) { // Only allow answering if not already answered
      setSelectedAnswer(answer);
      setAnswered(true); // Set answered to true when an answer is selected
      socket.emit('answerQuestion', answer);
    }
  };

  const handleQuizTypeChange = (type) => {
    setQuizType(type);
    setActiveBackground(null)
    socket.emit('requestMatchmaking', type);
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          autoAnswer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const renderLeaderboard = () => {
    return Object.entries(leaderboard).map(([socketId, progress]) => (
      <p key={socketId}>
        {progress.username}'s Points: {progress.correctAnswers}
      </p>
    ));
  };

  const autoAnswer = () => {
    if (answerOptions.length > 0 && !answered) { // Ensure auto-answer doesn't occur if already answered
      const randomAnswer = answerOptions[Math.floor(Math.random() * answerOptions.length)];
      handleAnswer(randomAnswer);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 font-sans">
      <AnimatePresence>
        {activeBackground && (
          <motion.div
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${activeBackground})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!room && !quizType && (
          <motion.div
            className="flex flex-col items-center justify-center w-full p-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Smart Enough 🧐? You do you!</h3>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Button for English */}
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => setActiveBackground('/images/background/english.jpg')}
                onHoverEnd={() => setActiveBackground(null)}
                onClick={() => handleQuizTypeChange('english')}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm sm:text-lg">English</p>
              </motion.div>

              {/* Button for Sports */}
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 bg-green-500 text-white flex items-center justify-center rounded-lg cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => setActiveBackground('/images/background/sports.jpg')}
                onHoverEnd={() => setActiveBackground(null)}
                onClick={() => handleQuizTypeChange('sports')}
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm sm:text-lg">Sports</p>
              </motion.div>

              {/* Button for Indonesian */}
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 bg-red-500 text-white flex items-center justify-center rounded-lg cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => setActiveBackground('/images/background/indonesia.jpg')}
                onHoverEnd={() => setActiveBackground(null)}
                onClick={() => handleQuizTypeChange('indonesian')}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm sm:text-lg">Indonesian</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quizType && !gameOver && !gameResult && (
          <motion.div
            className="text-center p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            {!question && (
              <h2 className="text-lg sm:text-xl font-semibold mb-4">{quizType.toUpperCase()}</h2>
            )}
            {question && (
              <>
                <GameLeaderboard leaderboard={leaderboard} />
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-base sm:text-lg font-medium mb-4 text-black">{question.question}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {answerOptions.map((answer, index) => (
                      <motion.button
                        key={index}
                        className={`w-full py-2 px-4 rounded-lg text-white font-semibold ${selectedAnswer === answer ? 'bg-blue-500' : 'bg-gray-800'} hover:bg-blue-600 focus:outline-none`}
                        onClick={() => handleAnswer(answer)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={answered}
                      >
                        {answer}
                      </motion.button>
                    ))}
                  </div>
                  <p className="text-sm sm:text-lg text-black">Timer: {timer}s</p>
                </div>
              </>
            )}
            {!question && (
              <div className="mt-4">
                <h3 className="text-lg sm:text-xl font-semibold">Players in Queue: {playersInQueue}</h3>
              </div>
            )}
          </motion.div>
        )}

        {gameResult && gameOver && (
          <MatchResult gameResult={gameResult} gameOver={gameOver} username={username} />
        )}
      </AnimatePresence>
    </div>
  );

}
