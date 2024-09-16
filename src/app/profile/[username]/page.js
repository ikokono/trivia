// pages/profile.js (atau sesuai dengan path yang Anda gunakan)
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import nookies from 'nookies';
import { jwtDecode } from 'jwt-decode';
import Loading from '../../../components/Loading'; // Import komponen Loading
import '../../styles/Profile.module.css';

const ProfilePage = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (username === "@me" || username === "%40me") {
                const cookies = nookies.get();
                const token = cookies.token || null;

                if (token) {
                    try {
                        const decoded = jwtDecode(token);
                        const userId = decoded?.userId;

                        if (!userId) throw new Error('Invalid token');

                        const res = await fetch(`/api/user?id=${userId}`);
                        if (!res.ok) throw new Error('Failed to fetch user data');

                        const data = await res.json();
                        setUser(data);
                    } catch (error) {
                        setUser(null); // Set to null to trigger user not found message
                        console.error('Error:', error);
                    }
                } else {
                    setUser(null); // No token found
                }
                setLoading(false); // Set loading to false after fetching or error
            } else {
                try {
                    const response = await fetch(`/api/user?id=${username}`);
                    if (!response.ok) throw new Error('Failed to fetch user profile');

                    const data = await response.json();
                    setUser(data);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    setUser(null); // Handle errors by setting user to null
                } finally {
                    setLoading(false);
                }
            }
        };

        if (username) {
            fetchUserProfile();
        }
    }, [username]);

    if (loading) return <Loading />; // Use Loading component here
    if (!user) return <div>User not found</div>;

    return (
        <motion.div
            className="profile-page h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-300 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <motion.div
                className="max-w-4xl h-[70vh] w-full md:w-3 lg:w-1/2 p-6 rounded-lg bg-gray-800"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 50 }}
            >
                <div className="flex items-center justify-center mb-6">
                    <img
                        src={user.avatarUrl || '/images/default-avatar.png'}
                        alt="Profile"
                        className="w-32 h-32 object-cover rounded-full border-4 border-green-400"
                    />
                </div>

                <div className="flex justify-center mb-4 font-sans">
                    <h1 className="text-xl font-bold">{user.username}</h1>
                </div>

                <div className="flex justify-between items-start font-sans">
                    <div className="flex-1 mr-8">
                        <h1 className="text-lg font-bold text-green-400 mb-4 font-retro ml-4">About Me</h1>
                        <div className="rounded-lg bg-gray-700 p-4 h-40 scrollable-hidden-scrollbar">
                            <p className="text-sm text-gray-300">{user.bio}</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-4 mr-20">
                        <p className="text-lg flex items-center">
                            <img src='/images/assets/coin.gif' width="24" height="24" alt="Coin" />
                            <span className="ml-2">{user.balance}</span>
                        </p>
                        <p className="text-lg flex items-center">
                            <img src='/images/assets/exp.png' width="24" height="24" alt="Exp" />
                            <span className="ml-2">{user.exp}</span>
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ProfilePage;
