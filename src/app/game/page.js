"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket } from '../../socket'; // pastikan path benar
import styles from '../styles/Game.module.css'; // Import CSS Modules

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
      setTimer(5);
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
    });

    return () => {
      socket.off('roomAssigned');
      socket.off('newQuestion');
      socket.off('answerResult');
      socket.off('gameOver');
      socket.off('leaderboardUpdate');
      socket.off('matchmakingUpdate');
      socket.disconnect();
    };
  }, []);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    socket.emit('answerQuestion', answer);
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
        Player {socketId}: Question {progress.currentQuestion}, Correct Answers: {progress.correctAnswers}
      </p>
    ));
  };

  const autoAnswer = () => {
    if (answerOptions.length > 0) {
      const randomAnswer = answerOptions[Math.floor(Math.random() * answerOptions.length)];
      handleAnswer(randomAnswer);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Trivia Game</h1>

      <AnimatePresence>
        {!room && !quizType && (
          <motion.div
            className="flex flex-col items-center justify-center w-full"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4">Select Quiz Type</h3>
            <div className="flex space-x-4">
              <motion.div
                className="w-32 h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuizTypeChange('english')}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <p>English</p>
              </motion.div>
              <motion.div
                className="w-32 h-32 bg-green-500 text-white flex items-center justify-center rounded-lg cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuizTypeChange('sports')}
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <p>Sports</p>
              </motion.div>
              <motion.div
                className="w-32 h-32 bg-red-500 text-white flex items-center justify-center rounded-lg cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleQuizTypeChange('indonesian')}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
              >
                <p>Indonesian</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quizType && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4">Selected Quiz Type: {quizType}</h3>
            <p className="text-lg">Matching with your quiz: {playersInQueue}/4</p>
          </motion.div>
        )}
      </AnimatePresence>

      {room && !gameOver && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Room: {room}</h2>
          {question ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Question: {question.question}</h3>
              <p className="text-sm mb-4">Time left: {timer}s</p>
              <div>
                <ul className="list-none p-0">
                  {answerOptions.map((option, index) => (
                    <li key={index} className="mb-2">
                      <motion.button
                        className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
                        onClick={() => handleAnswer(option)}
                        disabled={timer === 0}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        {option}
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedAnswer && <p className="mt-4">You answered: {selectedAnswer}</p>}
            </div>
          ) : (
            <p>Waiting for the question.....</p>
          )}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Leaderboard</h3>
            {renderLeaderboard()}
          </div>
        </div>
      )}

      {gameOver && (
        <h2 className="text-2xl font-bold">Game Over</h2>
      )}
    </div>
  );
}
