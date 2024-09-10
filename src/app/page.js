"use client";
import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { motion } from 'framer-motion';
import { jwtDecode } from "jwt-decode";
import nookies from 'nookies';
import Link from 'next/link';
import { jwtVerify } from 'jose';
import "../../public/Page.style.css"
import { useRouter } from "next/navigation";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const audioRef = useRef(null);
  const router = useRouter()

  useEffect(() => {
    const fetchTokenAndUsername = async () => {
      // Ambil token dari cookies menggunakan nookies
      const cookies = nookies.get();
      const token = cookies.token || null;

      const decoded = jwtDecode(token);

      // Ambil userId dari decoded token
      const userId = decoded?.userId;

      console.log(userId)
      if (token) {
        try {
          if (!userId) {
            throw new Error('Invalid token');
          }

          // Simpan token ke state
          setToken(token);

          // Ambil username dari API berdasarkan userId
          const res = await fetch(`/api/user?id=${userId}`);
          if (res.ok) {
            const data = await res.json();
            setUsername(data.username);
          } else {
            setUsername('Failed to load username');
          }
        } catch (error) {
          setUsername('Failed to load username');
          console.error('Token decoding or API error:', error);
        }
      } else {
        setUsername('No token found');
      }
    };

    fetchTokenAndUsername();

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleStart = () => {
    router.push("/game")
  };

  return (
    <div className="lobby-container">
      <motion.div
        className="background-video-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <video autoPlay muted loop id="background-video">
          <source src="/images/background/lobby_background.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>
      <audio ref={audioRef} src="/audio/Theme.mp3" preload="auto" loop />

      <motion.div
        className="game-title-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, type: 'spring' }}
      >
        <img src="/images/assets/logo.png" alt="Game Title" className="game-title" />
      </motion.div>

      <motion.div
        className="content"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-section">
          <h1 className='greetings-text'>{username ? `Welcome, ${username}` : 'Loading profile...'}</h1>
          <div className='flex justify-center items-center'>
            <img src='/images/assets/start.png' className='startbtnimg' onClick={handleStart} />
          </div>
          <nav>
            <ul className="flex space-x-4 justify-center">
              {/* Tampilkan link hanya jika token sudah ada */}
              {token && (
                <>
                  <li><Link href={`/profile/${token}`} className="link">Profile</Link></li>
                  <li><Link href="/garage" className="link">Garage</Link></li>
                  <li><Link href="/shop" className="link">Shop</Link></li>
                  <li><Link href="/about" className="link">About</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </motion.div>
    </div>
  );
}
