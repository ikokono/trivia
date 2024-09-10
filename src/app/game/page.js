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

  useEffect(() => {
    // Menghubungkan socket
    socket.connect();

    // Mendengarkan event roomAssigned dari server
    socket.on('roomAssigned', (roomId) => {
      setRoom(roomId);
      console.log(`Assigned to room: ${roomId}`);
    });

    // Mendengarkan event newQuestion dari server
    socket.on('newQuestion', (question) => {
      setQuestion(question);
      setAnswerOptions(generateAnswerOptions(question));
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
      socket.disconnect();
    };
  }, []);

  const generateAnswerOptions = (question) => {
    // Ganti dengan logika untuk membuat opsi jawaban berdasarkan pertanyaan
    // Misalnya, untuk tujuan demonstrasi, kita hanya mengembalikan dua opsi
    return [question.answer, "Incorrect Answer"]; // Tambahkan lebih banyak opsi sesuai pertanyaan
  };

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
                {answerOptions.map((option, index) => (
                  <button key={index} onClick={() => handleAnswer(option)} disabled={timer === 0}>
                    {option}
                  </button>
                ))}
              </div>
              {selectedAnswer && <p>You answered: {selectedAnswer}</p>}
            </div>
          ) : (
            <p>Waiting for the question...</p>
          )}
          <div>
            <h3>Leaderboard</h3>
            <ul>
              {Object.entries(answers).map(([socketId, correct], index) => (
                <li key={index}>
                  {socketId}: {correct ? 'Correct' : 'Incorrect'}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
