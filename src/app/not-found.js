'use client'
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const Custom404 = () => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-800 text-white">
      <div className="text-center">
        <motion.img
          src="/images/assets/error.png" // Ganti dengan path gambar Anda
          alt="404 Not Found"
          className="w-auto h-32 mx-auto mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-4">Page Not Found</p>
          <p className="mb-4">Sorry fam, the page you’re lookin for doesn’t exist.</p>
            <a className="text-blue-400 hover:underline" href='/'>Wanna Go Home?</a><br></br>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-400 hover:underline"
          >
            Go Back Maybe??
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Custom404;
