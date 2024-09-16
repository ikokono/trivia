"use client";
import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";
import { motion } from 'framer-motion';
import { jwtDecode } from "jwt-decode";
import nookies from 'nookies';
import Link from 'next/link';
import Loading from '../components/Loading';
import "../../public/Page.style.css"
import { useRouter } from "next/navigation";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");
  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);
  const audioRef = useRef(null);
  const [loading, setLoading] = useState(true);
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

      setLoading(false);
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
    <div className="lobby-container relative min-h-screen overflow-hidden">
      <motion.div
        className="background-gif-container absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src="/images/background/lobby_background.gif"
          alt="Background GIF"
          className="background-gif object-cover w-full h-full"
        />
      </motion.div>

      {/* Tombol Play/Pause di pojok kanan atas */}
      <button
        onClick={handlePlayPause}
        className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-full hover:bg-blue-600 transition duration-300"
      >
        {isPlaying ? <img src="images/assets/pause.png" className="w-3 h-3"/> : <img src="images/assets/play.png" className="w-3 h-3"/>}
      </button>

      <audio ref={audioRef} src="/audio/Theme.mp3" preload="auto" loop />

      <motion.div
        className="game-title-container flex justify-center mt-10 sm:mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, type: 'spring' }}
      >
        <img
          src="/images/assets/logo.png"
          alt="Game Title"
          className="w-3/4 sm:w-1/2 lg:w-1/3 xl:w-1/4 mx-auto"
        />

      </motion.div>

      <motion.div
        className="content mt-15 sm:mt-20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-section text-center p-4">
          <h1 className="greetings-text text-xl sm:text-l">
            {username ? `Welcome, ${username}` : 'Loading profile...'}
          </h1>
          <div className="flex justify-center items-center mt-4">
            <img
              src="/images/assets/start.png"
              className="w-20 h-auto sm:w-24 md:w-32 lg:w-30 xl:w-35 cursor-pointer"
              onClick={handleStart}
            />

          </div>
          <nav className="mt-6">
            <ul className="flex flex-wrap space-x-4 justify-center">
              {token && (
                <>
                  <li className="mb-2">
                    <Link href="/profile/@me" className="flex link text-sm sm:text-base md:text-lg items-center">
                    <img src="/images/assets/profile.png" className="h-9 w-9 mr-2"></img>
                      Profile
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/shop" className="flex link text-sm sm:text-base md:text-lg items-center">
                    <img src="/images/assets/shop.png" className="h-8 w-8 mr-2"></img>
                      Shop
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href="/about" className="flex link text-sm sm:text-base md:text-lg items-center">
                    <img src="/images/assets/about.png" className="h-7 w-7"></img>
                      About
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

        </div>
      </motion.div>
    </div>
  );

}
