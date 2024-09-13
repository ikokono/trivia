const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");
const questionsDatabase = require("./database/questions.json");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

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
    random: [],
    sports: [],
    english: [],
    indonesian: []
  };

  let currentQuestion = null;
  let questionStartTime = null;

  // Store player progress per room
  let playerProgress = {};

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle matchmaking request
    socket.on("requestMatchmaking", (quizType = 'random') => {
      console.log(`Matchmaking request from: ${socket.id} for ${quizType} quiz`);
      if (!matchmakingQueues[quizType]) {
        console.error(`Invalid quiz type: ${quizType}`);
        return;
      }

      matchmakingQueues[quizType].push(socket);

      if (matchmakingQueues[quizType].length >= 2) {
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
            currentQuestion: 0,
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

        // Update player's current question index
        playerProgress[roomId][socket.id].currentQuestion += 1;

        // Emit answer result
        io.to(roomId).emit("answerResult", {
          socketId: socket.id,
          correct,
        });

        // Emit leaderboard update
        io.to(roomId).emit("leaderboardUpdate", playerProgress[roomId]);
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

  const startGame = (roomId, quizType = 'random') => {
    const questions = questionsDatabase[quizType] || questionsDatabase.random; // Select questions based on quizType
    let questionIndex = 0;

    const interval = setInterval(() => {
      if (questionIndex >= questions.length) {
        clearInterval(interval);
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
        if (questionIndex >= questions.length) {
          clearInterval(interval);
          io.to(roomId).emit("gameOver");
        }
      }, 5000); // 5 seconds per question
    }, 5000); // Send new question every 5 seconds
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
