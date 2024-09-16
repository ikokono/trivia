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

  const rooms = {};

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

        // Ambil data pengguna dari API menggunakan user ID
        const response = await axios.get(`http://localhost:3000/api/user?id=${userId}`);

        // Ambil username dan ID dari respons API
        const playerUsername = response.data.username;
        const playerId = response.data._id;

        // Ambil abilities dari respons API
        const abilitiesResponse = await axios.get(`http://localhost:3000/api/user/items?id=${userId}`);
        const abilities = abilitiesResponse.data.items; // Misalnya, abilities adalah array di dalam items

        // Menyimpan data pengguna ke dalam objek username
        username[socket.id] = {
          username: playerUsername,
          id: playerId,
          abilities: abilities,
          socketId: socket.id,
          avatarUrl: response.data.avatarUrl // Menggunakan abilities dari API
        };
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }

    function findSocketIdByUsername(username, playerId) {
      // Iterasi melalui semua key dalam objek username
      for (const socketId in username) {
        if (username.hasOwnProperty(socketId)) {
          const player = username[socketId];
          // Bandingkan username atau playerId
          if (player.id === playerId) {
            return socketId; // Mengembalikan socket.id jika ditemukan
          }
        }
      }
      return null; // Mengembalikan null jika tidak ditemukan
    }

    const deleteAbility = async (userId, abilityId) => {
      try {
        const response = await axios.delete(`http://localhost:3000/api/user/items?id=${userId}&itemId=${abilityId}`);
        return response.data;
      } catch (error) {
        console.error("Failed to delete ability:", error);
        throw error;
      }
    };

    const getProfile = async (id) => {
      const response = await axios.get(`http://localhost:3000/api/user?id=${id}`);
      return response.data
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

      io.emit('matchmakingUpdate', {
        playersInQueue: matchmakingQueues[quizType].length
      });

      if (matchmakingQueues[quizType].length >= 4) {
        const roomId = `room_${Date.now()}`;
        const clientsInRoom = matchmakingQueues[quizType].splice(0, 4);

        clientsInRoom.forEach((client) => {
          client.join(roomId);
          client.emit("roomAssigned", roomId);
        });

        console.log(`Created room ${roomId} with ${clientsInRoom.length} clients for ${quizType} quiz.`);
        startGame(roomId, quizType, socket.id);
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
      if (rooms[roomId] && rooms[roomId].currentQuestion) {
        const correct = rooms[roomId].currentQuestion.correctAnswer === answer;

        if (correct) {
          rooms[roomId].players[socket.id].correctAnswers += 1;
        }

        io.to(roomId).emit("answerResult", {
          socketId: socket.id,
          correct
        });

        // Emit leaderboard update
        io.to(roomId).emit("leaderboardUpdate", rooms[roomId].players);
      }
    });


    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Remove client from all matchmaking queues
      Object.keys(matchmakingQueues).forEach((quizType) => {
        matchmakingQueues[quizType] = matchmakingQueues[quizType].filter(client => client.id !== socket.id);
      });

      // Remove player from room
      Object.keys(rooms).forEach((roomId) => {
        if (rooms[roomId].players[socket.id]) {
          delete rooms[roomId].players[socket.id];
          // Check if the room is empty after player leaves
          if (Object.keys(rooms[roomId].players).length === 0) {
            // Optionally, you can delete the room if no players are left
            delete rooms[roomId];
          }
        }
      });
    });

  });

  const startGame = async (roomId, quizType = 'sports', socketId) => {
    // Inisialisasi room
    rooms[roomId] = {
      players: {}, // Menyimpan data pemain
      currentQuestion: null,
      questionIndex: 0,
      questions: shuffleArray(questionsDatabase[quizType] || questionsDatabase.sports),
      totalQuestions: 3,
      interval: null
    };

    // Ambil daftar client di room
    const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);

    // Tambahkan pemain ke dalam room
    for (const clientId of clients) {
      try {
        // Pastikan username sudah ada di objek `username`
        const playerData = username[clientId] || { username: 'Unknown', abilities: [], id: clientId };

        rooms[roomId].players[clientId] = {
          username: playerData.username,
          id: playerData.id, // Pastikan id tersedia
          abilities: playerData.abilities,
          socketId,
          avatarUrl: playerData.avatarUrl,
          correctAnswers: 0
        };

        // Kirim profil pemain ke client masing-masing
        io.to(clientId).emit("playerProfile", rooms[roomId].players[clientId]);
      } catch (error) {
        console.error(`Error adding player ${clientId} to room ${roomId}:`, error);
      }
    }

    console.log(`Initialized players in room ${roomId}:`, rooms[roomId].players);

    // Kirim data pemain ke semua client untuk leaderboard
    io.to(roomId).emit("playerData", rooms[roomId].players);

    const interval = setInterval(() => {
      if (rooms[roomId].questionIndex >= rooms[roomId].totalQuestions) {
        clearInterval(rooms[roomId].interval);
        determineWinner(roomId);
        io.to(roomId).emit("gameOver");
        return;
      }

      rooms[roomId].currentQuestion = rooms[roomId].questions[rooms[roomId].questionIndex];
      io.to(roomId).emit("newQuestion", rooms[roomId].currentQuestion);

      // Emit leaderboard at the start of every question
      io.to(roomId).emit("leaderboardUpdate", rooms[roomId].players);

      rooms[roomId].questionIndex++;

      setTimeout(() => {
        if (rooms[roomId].questionIndex >= rooms[roomId].totalQuestions) {
          clearInterval(rooms[roomId].interval);
          determineWinner(roomId);
          io.to(roomId).emit("gameOver");
        }
      }, 10000); // 10 seconds per question
    }, 10000); // Send new question every 10 seconds

    rooms[roomId].interval = interval;
  };

  const updateCoinsInAPI = async (username, amount) => {
    try {
      const response = await fetch('http://localhost:3000/api/user/coins?id=' + username, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        console.log(response)
        throw new Error('Failed to update coins');
      }

      console.log(`Coins updated successfully for ${username}`);
    } catch (error) {
      console.error(error);
    }
  };

  const updateExpInAPI = async (playerId, exp) => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/exp?id=${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: exp }),
      });

      if (!response.ok) {
        console.log(response)
        throw new Error('Failed to update EXP');
      }

      const result = await response.json();
      console.log('EXP updated:', result);
    } catch (error) {
      console.error('Error updating EXP:', error);
    }
  };

  const determineWinner = (roomId) => {
    if (!rooms[roomId] || !rooms[roomId].players) {
      console.error(`Room ${roomId} does not exist or has no players.`);
      return;
    }

    // Ambil semua pemain dan skor mereka dari room
    const players = Object.values(rooms[roomId].players);

    // Urutkan pemain berdasarkan jumlah jawaban yang benar
    players.sort((a, b) => b.correctAnswers - a.correctAnswers);

    // Tentukan koin per peringkat
    const coinPerRank = [10, 8, 6, 4];
    const expPerRank = [100, 80, 60, 40];

    const coins = {}
    const exp = {}

    // Hitung dan perbarui koin untuk setiap pemain berdasarkan peringkat mereka
    players.forEach((player, index) => {
      const coinsEarned = coinPerRank[index] ? player.correctAnswers * coinPerRank[index] : 0;
      const expEarned = expPerRank[index] ? expPerRank[index] : 0;

      updateCoinsInAPI(player.id, coinsEarned); // Update melalui API
      updateExpInAPI(player.id, expEarned);

      // Kirimkan koin ke klien yang bersangkutan
      coins[player.username] = coinsEarned
      exp[player.username] = expEarned

      console.log(`${player.username}: ${coinsEarned}`)
    });
    // Kirim hasil permainan ke room setelah pembaruan koin
    io.to(roomId).emit("gameResult", {
      winner: players[0], // Pemain dengan skor tertinggi
      losers: players.slice(1),
      coins,
      exp // Sisanya adalah kalah
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
