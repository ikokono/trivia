'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setCookie } from 'nookies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import WelcomeBack from '../../../components/WelcomeBack';
import "../../styles/Auth.module.css"

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('Login successful:', data);
      setCookie(null, 'token', data.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });
      setIsLoggedIn(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      console.log('Login failed:', data);
      alert('Login failed');
    }
  };

  if (isLoggedIn) {
    return <WelcomeBack />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-sans">
      <div className="bg-gray-800 p-6 rounded-lg w-80">
        <h1 className="text-2xl font-semibold mb-4 text-center">Welcome Back</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
          <i className="fa-solid fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              required
            />
          </div>
          <div className="relative">
          <i className="fa-solid fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition focus:outline-none text-sm"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400 text-sm">
          New here?{' '}
          <a href="/auth/register" className="text-blue-400 hover:underline">
            Sign up now!
          </a>
        </p>
      </div>
    </div>
  );
}
