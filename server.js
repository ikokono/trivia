const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const questions = [
  { id: 1, question: "What is the capital of France?", answer: "Paris" },
  { id: 2, question: "What is 2 + 2?", answer: "4" },
  // Add more questions as needed
];

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  let waitingClients = [];
  let currentQuestion = null;
  let questionStartTime = null;

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Add client to matchmaking queue
    socket.on("requestMatchmaking", () => {
      console.log(`Matchmaking request from: ${socket.id}`);
      waitingClients.push(socket);

      console.log(waitingClients)

      if (waitingClients.length >= 2) {
        // Create a new room
        const roomId = `room_${Date.now()}`;
        const clientsInRoom = waitingClients.splice(0, 4);

        clientsInRoom.forEach((client) => {
          client.join(roomId);
          client.emit("roomAssigned", roomId);
        });

        console.log(`Created room ${roomId} with ${clientsInRoom.length} clients.`);
        startGame(roomId);
      }
    });

    // Handle answering questions
    socket.on("answerQuestion", (answer) => {
      const roomId = [...socket.rooms][1];
      if (currentQuestion && roomId) {
        const correct = currentQuestion.answer === answer;
        socket.to(roomId).emit("answerResult", {
          socketId: socket.id,
          correct,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      waitingClients = waitingClients.filter(client => client.id !== socket.id);
    });
  });

  const startGame = (roomId) => {
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

      setTimeout(() => {
        questionIndex++;
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
