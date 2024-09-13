'use client';
import { useEffect, useState } from 'react';
import { socket } from '../../socket'; // pastikan path benar

export default function Game() {
  const [room, setRoom] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [leaderboard, setLeaderboard] = useState({});

  useEffect(() => {
    // Menghubungkan socket
    socket.connect();

    // Mendengarkan event roomAssigned dari server
    socket.on('roomAssigned', (roomId) => {
      setRoom(roomId);
      console.log(`Assigned to room: ${roomId}`);
    });

    socket.on('leaderboardUpdate', (data) => {
      setLeaderboard(data);
    });

    // Mendengarkan event newQuestion dari server
    socket.on('newQuestion', (question) => {
      setQuestion(question);
      setAnswerOptions(question.answers);
      setTimer(5); // Set timer to 5 seconds
      startTimer();
    });

    // Mendengarkan event answerResult dari server
    socket.on('answerResult', ({ socketId, correct }) => {
      setAnswers(prev => ({ ...prev, [socketId]: correct }));
    });

    // Mendengarkan event gameOver dari server
    socket.on('gameOver', () => {
      setGameOver(true);
    });

    // Membersihkan event listener dan memutuskan koneksi saat komponen dibongkar
    return () => {
      socket.off('roomAssigned');
      socket.off('newQuestion');
      socket.off('answerResult');
      socket.off('gameOver');
      socket.off('leaderboardUpdate');
      socket.disconnect();
    };
  }, []);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    socket.emit('answerQuestion', answer);
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
    <div>
      <h1>Trivia Game</h1>
      {!room ? (
        <button onClick={() => socket.emit('requestMatchmaking')}>Find Match</button>
      ) : gameOver ? (
        <h2>Game Over</h2>
      ) : (
        <div>
          <h2>Room: {room}</h2>
          {question ? (
            <div>
              <h3>Question: {question.question}</h3>
              <p>Time left: {timer}s</p>
              <div>
                <ul>
                  {answerOptions.map((option, index) => (
                    <li><button key={index} onClick={() => handleAnswer(option)} disabled={timer === 0}>
                      {option}
                    </button></li>
                  ))}
                </ul>
              </div>
              {selectedAnswer && <p>You answered: {selectedAnswer}</p>}
            </div>
          ) : (
            <p>Waiting for the question...</p>
          )}
          <div>
            <h3>Leaderboard</h3>
            {renderLeaderboard()}
          </div>
        </div>
      )}
    </div>
  );
}
