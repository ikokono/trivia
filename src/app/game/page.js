"use client";
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../../socket'; // pastikan path benar
import 'tailwindcss/tailwind.css'; // Import Tailwind CSS
import MatchResult from '../../components/Result.js'
import nookies from 'nookies';
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

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
      <audio ref={audioRef} src="/audio/Theme_quiz.mp3" preload="auto" loop />
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
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">Select Quiz Type</h3>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {/* Button for English */}
              <motion.div
                className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onHoverStart={() => setActiveBackground('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fres.cloudinary.com%2Fsimpleview%2Fimage%2Fupload%2Fcrm%2Fnewyorkstate%2Fstatueofliberty_julienneschaer_077_ade37ed2-fc26-2db2-4f0873df93118bb3.jpg&f=1&nofb=1&ipt=8806139492a293ff18d4cb115d390a5fe6c9ac5795d4559eddd97f142c4acdb9&ipo=images')}
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
                onHoverStart={() => setActiveBackground('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpaperaccess.com%2Ffull%2F720099.jpg&f=1&nofb=1&ipt=286afb481ca3e16067e79804b2266167e1a7e104469381c9473935595f0851c2&ipo=images')}
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
                onHoverStart={() => setActiveBackground('https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Finsiderjourneys.com.au%2Fwp-content%2Fuploads%2F2020%2F01%2FIndonesia-Bali-pura-ulun-danu-bratan-temple-shutterstock_638432449-1920.jpg&f=1&nofb=1&ipt=c705fbcc77101469d33188e515deedfa60720cc914252f23b297c264d1071434&ipo=images')}
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
                      disabled={answered} // Disable button if already answered
                    >
                      {answer}
                    </motion.button>
                  ))}
                </div>
                <p className="text-sm sm:text-lg text-black">Timer: {timer}s</p>
              </div>
            )}
            {leaderboard && question &&  (
              <div className="mt-4">
                {renderLeaderboard()}
              </div>
            )}
            <div className="mt-4">
              <h3 className="text-lg sm:text-xl font-semibold">Players in Queue: {playersInQueue}</h3>
            </div>
          </motion.div>
        )}

        {gameResult && gameOver && (
          <MatchResult gameResult={gameResult} gameOver={gameOver} username={username} />
        )}
      </AnimatePresence>
    </div>
  );

}
