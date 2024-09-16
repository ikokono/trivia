'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import nookies from 'nookies';
import { jwtDecode } from 'jwt-decode';
import Loading from '../../../components/Loading'; // Import komponen Loading
import '../../styles/Profile.module.css'

const ProfilePage = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [isUser, setIsUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
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
                        setIsUser(true);
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
                    setIsUser(false);
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
    if (!user) return <div className="text-center text-red-500">User not found</div>;

    return (
        <motion.div
            className="flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-300 h-screen overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <div className="flex flex-col items-center mb-6">
                <img
                    src={user.avatarUrl || '/images/avatar/avatar_default.png'}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-4 border-green-400"
                />
                {isUser && editMode && (
                    <button
                        className="mt-4 bg-blue-500 text-white px-5 py-0.5 rounded-full font-semibold font-sans"
                        onClick={() => alert('Change Avatar clicked')}
                    >
                        Change Avatar
                    </button>
                )}
            </div>

            <div className="flex justify-center mb-4 font-sans">
                {isUser ? (
                    !editMode ? (
                        <h1 className="text-xl font-bold">{user.username}</h1>
                    ) : (
                        <div className="relative">
                            <motion.input
                                type="text"
                                value={user.username}
                                onChange={(e) => setUser({ ...user, username: e.target.value })}
                                placeholder={user.username}
                                className="text-xl font-bold bg-transparent border-none focus:outline-none text-center"
                                initial={{ scale: 1 }}
                                animate={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            />
                            <motion.div
                                className="absolute inset-x-0 bottom-0 border-b-2 border-gray-700 pointer-events-none"
                                style={{ left: '25%', right: '25%' }}
                                initial={{ width: '0%' }}
                                animate={{ width: '50%' }}
                                transition={{ duration: 0.3 }}
                            ></motion.div>
                        </div>
                    )
                ) : (
                    <h1 className="text-xl font-bold">{user.username}</h1>
                )}
            </div>

            <div className="flex flex-col items-center font-sans w-full max-w-6xl px-4">
                <div className="flex space-x-4 mb-4">
                    <p className="text-md flex items-center">
                        <img src='/images/assets/coin.gif' width="20" height="20" alt="Coin" />
                        <span className="ml-2">{user.balance}</span>
                    </p>
                    <p className="text-md flex items-center">
                        <img src='/images/assets/exp.png' width="20" height="20" alt="Exp" />
                        <span className="ml-2">{user.exp}</span>
                    </p>
                </div>
                <div className="flex justify-center w-full pt-2">
                    {isUser && !editMode && (
                        <button
                            className="bg-green-500 text-gray-900 px-4 py-1 rounded-2xl font-semibold"
                            onClick={() => setEditMode(true)}
                        >
                            <i className="fa-solid fa-pen-to-square mr-1"></i>Edit Profile
                        </button>
                    )}

                    {isUser && editMode && (
                        <div className="flex space-x-2">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-2xl font-semibold"
                                onClick={() => setEditMode(false)}
                            >
                                <i className="fa-solid fa-floppy-disk mr-1"></i>Apply
                            </button>
                            <button
                                className="bg-red-500 text-white px-4 py-2 rounded-2xl font-semibold"
                                onClick={() => setEditMode(false)}
                            >
                                <i className="fa-solid fa-trash mr-1"></i>Discard
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap justify-center items-center font-sans w-full max-w-6xl px-4 mt-5">
                    <div className="flex-1 max-w-xs mr-4">
                        <h1 className="text-md font-bold text-green-400 mb-2 font-retro sm:items-center">About Me</h1>
                        <div className="rounded-lg bg-gray-700 p-3 h-24 scrollable-hidden-scrollbar">
                            {isUser && editMode ? (
                                <textarea
                                    className="w-full h-full bg-gray-700 text-xs text-gray-300 p-2 border-none focus:outline-none resize-none"
                                    value={user.bio}
                                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                />
                            ) : (
                                <p className="text-xs text-gray-300">{user.bio}</p>
                            )}
                        </div>

                    </div>
                </div>
            </div>



        </motion.div>
    );
};

export default ProfilePage;
