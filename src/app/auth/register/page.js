'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie } from 'nookies';
import { motion } from 'framer-motion';
import Welcome from '../../../components/Welcome';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('Registration successful:', data);
      setCookie(null, 'token', data.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      setIsRegistered(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      console.log('Registration failed:', data);
      alert('Registration failed');
    }
  };


  if (isRegistered) {
    return <Welcome />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
      <motion.div 
        className="bg-gray-800 p-8 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Sign Up</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300">Username</label>
            <motion.input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              whileFocus={{ scale: 1.05 }}
            />
          </div>
          <div>
            <label className="block text-gray-300">Password</label>
            <motion.input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              whileFocus={{ scale: 1.05 }}
            />
          </div>
          <div>
            <label className="block text-gray-300">Confirm Password</label>
            <motion.input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              whileFocus={{ scale: 1.05 }}
            />
          </div>
          <motion.button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition transform hover:scale-105"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Register
          </motion.button>
        </form>
        <p className="mt-4 text-center text-gray-300">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-400 hover:underline">
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
