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
  const router = useRouter();
  
  // State untuk Play/Pause button
  const [isPlaying, setIsPlaying] = useState(false);

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

    const onConnect = () => {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => setTransport(transport.name));
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setTransport("N/A");
    };

    if (socket.connected) onConnect();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
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

  const handleStart = () => {
    router.push("/game");
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="lobby-container">
      <motion.div
        className="background-gif-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <img src="/images/background/lobby_background.gif" alt="Background GIF" className="background-gif" />
      </motion.div>

      {/* Tombol Play/Pause di pojok kanan atas */}
      <button
        onClick={handlePlayPause}
        className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-300"
      >
        {isPlaying ? 'Pause' : "Play"}
      </button>

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
