"use client";
const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");
const axios = require('axios'); // Import axios for making HTTP requests
const { jwtVerify } = require('jose')
const questionsDatabase = require("./database/questions.json");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET; // Replace with your JWT secret

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Antrean untuk matchmaking berdasarkan tipe kuis
  const matchmakingQueues = {
    sports: [],
    english: [],
    indonesian: []
  };

  let currentQuestion = null;
  let questionStartTime = null;
  let totalQuestions = 10; // Total pertanyaan untuk permainan
  let questions = []; // Menyimpan pertanyaan yang sudah diacak
  let questionIndex = 0; // Menyimpan indeks pertanyaan saat ini

  // Store player progress per room
  let playerProgress = {};
  let username = {};

  io.on("connection", async (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Ambil token JWT dari cookies
    const token = socket.handshake.headers.cookie?.split('token=')[1];

    if (token) {
      try {
        // Decode the JWT to get user ID
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId; 

        // Ambil username dari API menggunakan user ID
        const response = await axios.get(`http://localhost:3000/api/user?id=${userId}`);
        username[socket.id] = response.data.username; // Dapatkan username dari respons API
      } catch (error) {
        console.error('Failed to fetch username:', error);
      }
    }

    // Emit username ke client yang terhubung
    socket.emit('username', { username });

    // Handle matchmaking request
    socket.on("requestMatchmaking", (quizType = 'sports') => {
      console.log(`Matchmaking request from: ${socket.id} (${username}) for ${quizType} quiz`);
      if (!matchmakingQueues[quizType]) {
        console.error(`Invalid quiz type: ${quizType}`);
        return;
      }
    
      matchmakingQueues[quizType].push(socket);
    
      // Emit update for players in queue
      io.emit('matchmakingUpdate', {
        playersInQueue: matchmakingQueues[quizType].length
      });
    
      if (matchmakingQueues[quizType].length >= 4) {
        // Create a new room
        const roomId = `room_${Date.now()}`;
        const clientsInRoom = matchmakingQueues[quizType].splice(0, 4);
    
        clientsInRoom.forEach((client) => {
          client.join(roomId);
          client.emit("roomAssigned", roomId);
    
          // Initialize progress for each player in the room
          if (!playerProgress[roomId]) {
            playerProgress[roomId] = {};
          }
          playerProgress[roomId][client.id] = {
            username: username[client.id],
            correctAnswers: 0,
          };
        });
    
        console.log(`Created room ${roomId} with ${clientsInRoom.length} clients for ${quizType} quiz.`);
        startGame(roomId, quizType);
      }
    });

    // Handle choosing quiz type
    socket.on("requestNewGame", (quizType) => {
      console.log(`Quiz type requested: ${quizType}`);
      const roomId = [...socket.rooms][1];
      if (roomId) {
        startGame(roomId, quizType);
      }
    });

    // Handle answering questions
    socket.on("answerQuestion", (answer) => {
      const roomId = [...socket.rooms][1];
      if (currentQuestion && roomId) {
        const correct = currentQuestion.correctAnswer === answer;

        if (correct) {
          playerProgress[roomId][socket.id].correctAnswers += 1;
        }

        // Emit answer result
        io.to(roomId).emit("answerResult", {
          socketId: socket.id,
          correct,
        });

        // Emit leaderboard update
        io.to(roomId).emit("leaderboardUpdate", playerProgress[roomId]);
        console.log(playerProgress[roomId])
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Remove client from all matchmaking queues
      Object.keys(matchmakingQueues).forEach((quizType) => {
        matchmakingQueues[quizType] = matchmakingQueues[quizType].filter(client => client.id !== socket.id);
      });
    });
  });

  const startGame = (roomId, quizType = 'sports') => {
    questions = shuffleArray(questionsDatabase[quizType] || questionsDatabase.sports);
    questionIndex = 0;
    
    const interval = setInterval(() => {
      if (questionIndex >= totalQuestions) {
        clearInterval(interval);
        determineWinner(roomId);
        io.to(roomId).emit("gameOver");
        return;
      }

      currentQuestion = questions[questionIndex];
      questionStartTime = Date.now();
      io.to(roomId).emit("newQuestion", currentQuestion);

      // Emit leaderboard at the start of every question
      io.to(roomId).emit("leaderboardUpdate", playerProgress[roomId]);

      questionIndex++;

      setTimeout(() => {
        if (questionIndex >= totalQuestions) {
          clearInterval(interval);
          determineWinner(roomId);
          io.to(roomId).emit("gameOver");
        }
      }, 10000); // 10 seconds per question
    }, 10000); // Send new question every 10 seconds
  };

  const determineWinner = (roomId) => {
    const scores = Object.values(playerProgress[roomId]);
    scores.sort((a, b) => b.correctAnswers - a.correctAnswers); // Sort players by their scores

    io.to(roomId).emit("gameResult", {
      winner: scores[0],
      losers: scores.slice(1)
    });
  };

  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
