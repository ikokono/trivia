const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const questions = [{ "id": "1", "question": "Olahraga apa yang terkenal dengan pukulan smash?", "answers": ["Bulu tangkis", "Basket", "Renang", "Voli"], "correctAnswer": "Bulu tangkis" }, { "id": "2", "question": "Siapa pemain sepak bola Indonesia yang terkenal dengan julukan 'Si Anak Ajaib'?", "answers": ["Bambang Pamungkas", "Cristiano Ronaldo", "Lionel Messi", "Kaka"], "correctAnswer": "Bambang Pamungkas" }, { "id": "3", "question": "Berapa jumlah pemain dalam satu tim sepak bola?", "answers": ["10", "11", "12", "13"], "correctAnswer": "11" }, { "id": "4", "question": "Olahraga apa yang menggunakan raket dan kok?", "answers": ["Tenis", "Bulu tangkis", "Badminton", "Catur"], "correctAnswer": "Bulu tangkis" }, { "id": "5", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan persegi panjang?", "answers": ["Sepak bola", "Basket", "Voli", "Rugby"], "correctAnswer": "Sepak bola" }, { "id": "6", "question": "Olahraga apa yang terkenal dengan gerakan salto dan putaran?", "answers": ["Senam", "Renang", "Atletik", "Bulu tangkis"], "correctAnswer": "Senam" }, { "id": "7", "question": "Siapa pemain basket Indonesia yang terkenal dengan julukan 'The Big Boss'?", "answers": ["Dennis Rodman", "Michael Jordan", "Kobe Bryant", "Stephen Curry"], "correctAnswer": "Dennis Rodman" }, { "id": "8", "question": "Berapa jumlah pemain dalam satu tim basket?", "answers": ["5", "6", "7", "8"], "correctAnswer": "5" }, { "id": "9", "question": "Olahraga apa yang menggunakan lapangan dengan garis-garis putih dan bola bundar?", "answers": ["Basket", "Sepak bola", "Voli", "Tenis"], "correctAnswer": "Basket" }, { "id": "10", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan net?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "11", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Minions'?", "answers": ["Kevin Sanjaya dan Marcus Gideon", "Taufik Hidayat", "Susi Susanti", "Greysia Polii"], "correctAnswer": "Kevin Sanjaya dan Marcus Gideon" }, { "id": "12", "question": "Berapa jumlah set dalam permainan bulu tangkis?", "answers": ["2", "3", "4", "5"], "correctAnswer": "3" }, { "id": "13", "question": "Olahraga apa yang menggunakan raket dan bola berbulu?", "answers": ["Tenis", "Bulu tangkis", "Badminton", "Catur"], "correctAnswer": "Bulu tangkis" }, { "id": "14", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan jaring?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "15", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Smiling Assassin'?", "answers": ["Taufik Hidayat", "Susi Susanti", "Greysia Polii", "Liliyana Natsir"], "correctAnswer": "Taufik Hidayat" }, { "id": "16", "question": "Berapa jumlah pemain dalam satu tim voli?", "answers": ["6", "7", "8", "9"], "correctAnswer": "6" }, { "id": "17", "question": "Olahraga apa yang menggunakan lapangan dengan garis-garis putih dan bola bundar?", "answers": ["Basket", "Sepak bola", "Voli", "Tenis"], "correctAnswer": "Basket" }, { "id": "18", "question": "Apa nama olahraga yang menggunakan raket dan bola berbulu?", "answers": ["Tenis", "Bulu tangkis", "Badminton", "Catur"], "correctAnswer": "Bulu tangkis" }, { "id": "19", "question": "Siapa pemain sepak bola Indonesia yang terkenal dengan julukan 'Lord'?", "answers": ["Bambang Pamungkas", "Cristiano Ronaldo", "Lionel Messi", "Kaka"], "correctAnswer": "Bambang Pamungkas" }, { "id": "20", "question": "Berapa jumlah pemain dalam satu tim sepak bola?", "answers": ["10", "11", "12", "13"], "correctAnswer": "11" }, { "id": "21", "question": "Olahraga apa yang menggunakan lapangan dengan garis-garis putih dan bola bundar?", "answers": ["Basket", "Sepak bola", "Voli", "Tenis"], "correctAnswer": "Basket" }, { "id": "22", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan jaring?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "23", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Minions'?", "answers": ["Kevin Sanjaya dan Marcus Gideon", "Taufik Hidayat", "Susi Susanti", "Greysia Polii"], "correctAnswer": "Kevin Sanjaya dan Marcus Gideon" }, { "id": "24", "question": "Berapa jumlah set dalam permainan bulu tangkis?", "answers": ["2", "3", "4", "5"], "correctAnswer": "3" }, { "id": "25", "question": "Olahraga apa yang menggunakan raket dan bola berbulu?", "answers": ["Tenis", "Bulu tangkis", "Badminton", "Catur"], "correctAnswer": "Bulu tangkis" }, { "id": "26", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan jaring?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "27", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Smiling Assassin'?", "answers": ["Taufik Hidayat", "Susi Susanti", "Greysia Polii", "Liliyana Natsir"], "correctAnswer": "Taufik Hidayat" }, { "id": "28", "question": "Berapa jumlah pemain dalam satu tim voli?", "answers": ["6", "7", "8", "9"], "correctAnswer": "6" }, { "id": "29", "question": "Olahraga apa yang menggunakan lapangan dengan garis-garis putih dan bola bundar?", "answers": ["Basket", "Sepak bola", "Voli", "Tenis"], "correctAnswer": "Basket" }, { "id": "30", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan net?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "31", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Minions'?", "answers": ["Kevin Sanjaya dan Marcus Gideon", "Taufik Hidayat", "Susi Susanti", "Greysia Polii"], "correctAnswer": "Kevin Sanjaya dan Marcus Gideon" }, { "id": "32", "question": "Berapa jumlah set dalam permainan bulu tangkis?", "answers": ["2", "3", "4", "5"], "correctAnswer": "3" }, { "id": "33", "question": "Olahraga apa yang menggunakan raket dan bola berbulu?", "answers": ["Tenis", "Bulu tangkis", "Badminton", "Catur"], "correctAnswer": "Bulu tangkis" }, { "id": "34", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan jaring?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "35", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Smiling Assassin'?", "answers": ["Taufik Hidayat", "Susi Susanti", "Greysia Polii", "Liliyana Natsir"], "correctAnswer": "Taufik Hidayat" }, { "id": "36", "question": "Berapa jumlah pemain dalam satu tim voli?", "answers": ["6", "7", "8", "9"], "correctAnswer": "6" }, { "id": "37", "question": "Olahraga apa yang menggunakan lapangan dengan garis-garis putih dan bola bundar?", "answers": ["Basket", "Sepak bola", "Voli", "Tenis"], "correctAnswer": "Basket" }, { "id": "38", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan net?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "39", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Minions'?", "answers": ["Kevin Sanjaya dan Marcus Gideon", "Taufik Hidayat", "Susi Susanti", "Greysia Polii"], "correctAnswer": "Kevin Sanjaya dan Marcus Gideon" }, { "id": "40", "question": "Berapa jumlah set dalam permainan bulu tangkis?", "answers": ["2", "3", "4", "5"], "correctAnswer": "3" }, { "id": "41", "question": "Olahraga apa yang menggunakan raket dan bola berbulu?", "answers": ["Tenis", "Bulu tangkis", "Badminton", "Catur"], "correctAnswer": "Bulu tangkis" }, { "id": "42", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan jaring?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "43", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Smiling Assassin'?", "answers": ["Taufik Hidayat", "Susi Susanti", "Greysia Polii", "Liliyana Natsir"], "correctAnswer": "Taufik Hidayat" }, { "id": "44", "question": "Berapa jumlah pemain dalam satu tim voli?", "answers": ["6", "7", "8", "9"], "correctAnswer": "6" }, { "id": "45", "question": "Olahraga apa yang menggunakan lapangan dengan garis-garis putih dan bola bundar?", "answers": ["Basket", "Sepak bola", "Voli", "Tenis"], "correctAnswer": "Basket" }, { "id": "46", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan net?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }, { "id": "47", "question": "Siapa atlet bulutangkis Indonesia yang terkenal dengan julukan 'The Minions'?", "answers": ["Kevin Sanjaya dan Marcus Gideon", "Taufik Hidayat", "Susi Susanti", "Greysia Polii"], "correctAnswer": "Kevin Sanjaya dan Marcus Gideon" }, { "id": "48", "question": "Berapa jumlah set dalam permainan bulu tangkis?", "answers": ["2", "3", "4", "5"], "correctAnswer": "3" }, { "id": "49", "question": "Olahraga apa yang menggunakan raket dan bola berbulu?", "answers": ["Tenis", "Bulu tangkis", "Badminton", "Catur"], "correctAnswer": "Bulu tangkis" }, { "id": "50", "question": "Apa nama olahraga yang menggunakan bola bundar dan dimainkan di lapangan dengan net?", "answers": ["Voli", "Sepak bola", "Basket", "Tenis"], "correctAnswer": "Voli" }];

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

  // Store player progress per room
  let playerProgress = {};

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Add client to matchmaking queue
    socket.on("requestMatchmaking", () => {
      console.log(`Matchmaking request from: ${socket.id}`);
      waitingClients.push(socket);

      if (waitingClients.length >= 2) {
        // Create a new room
        const roomId = `room_${Date.now()}`;
        const clientsInRoom = waitingClients.splice(0, 4);

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

        console.log(`Created room ${roomId} with ${clientsInRoom.length} clients.`);
        startGame(roomId);
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

      // Emit leaderboard at the start of every question
      io.to(roomId).emit("leaderboardUpdate", playerProgress[roomId]);

      setTimeout(() => {
        questionIndex++;
      }, 10000); // 10 seconds per question
    }, 10000); // Send new question every 10 seconds
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