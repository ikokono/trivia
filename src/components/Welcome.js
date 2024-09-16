// components/WelcomeBack.js
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Welcome = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Timer untuk menghilangkan tampilan setelah beberapa detik
    const timer = setTimeout(() => setIsVisible(false), 2000); // Ganti dengan durasi yang sesuai
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: isVisible ? 'easeInOut' : 'easeOut' }}
    >
      <motion.h1
        className="text-3xl font-bold text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: isVisible ? 'easeInOut' : 'easeOut' }}
      >
        Welcome!
      </motion.h1>
    </motion.div>
  );
};

export default Welcome;
