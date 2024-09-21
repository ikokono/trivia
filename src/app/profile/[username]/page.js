'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import nookies from 'nookies';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode
import Loading from '../../../components/Loading'; // Import komponen Loading
import '../../styles/Profile.module.css'
import { useMediaQuery } from 'react-responsive';
import ChangeAvatar from '../../../components/ChangeAvatar'

const ProfilePage = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);
    const [isUser, setIsUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [usernameError, setUsernameError] = useState(''); // State untuk menyimpan pesan kesalahan username
    const [showChangeAvatar, setShowChangeAvatar] = useState(false);
    const router = useRouter()

    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

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

    // Fungsi untuk memvalidasi username
    const validateUsername = (username) => {
        // Cek jika username mengandung spasi
        if (username.includes(' ')) {
            setUsernameError('Username cannot contain spaces.');
            return false;
        }

        // Cek jika username mengandung huruf kapital
        if (/[A-Z]/.test(username)) {
            setUsernameError('Username cannot contain uppercase letters.');
            return false;
        }

        // Validasi panjang dan karakter username
        const usernameRegex = /^[a-z0-9][a-z0-9._]{1,11}[a-z0-9_]$/; // Username hanya bisa terdiri dari huruf kecil, angka, titik, dan garis bawah
        if (!usernameRegex.test(username)) {
            setUsernameError('Username must be between 3 - 12 characters, and can only contain lowercase letters, numbers, dots, and underscores.');
            return false;
        }

        // Cek jika username berakhir dengan titik atau garis bawah
        if (/^[._]/.test(username)) {
            setUsernameError('Username cannot start with a dot.');
            return false;
        }

        if (/[\.]$/.test(username)) {
            setUsernameError('Username cannot end with a dot.');
            return false;
        }

        setUsernameError(''); // Hapus pesan kesalahan jika username valid
        return true;
    };




    // Fungsi untuk update profil
    const updateUserProfile = async () => {
        if (!user) return;

        // Validasi username sebelum update
        if (!validateUsername(user.username)) {
            return;
        }

        try {
            const res = await fetch(`/api/user/update?id=${user._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: user.username,
                    avatarUrl: user.avatarUrl,
                    bio: user.bio,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                if (errorData.error === 'This username has been taken') {
                    alert('This username has been taken. Please choose another one.');
                } else {
                    throw new Error('Failed to update user profile');
                }
                return;
            }

            // Fetch updated user data
            const updatedUser = await res.json();
            setUser(updatedUser); // Update state dengan data terbaru
            setEditMode(false); // Keluar dari edit mode
        } catch (error) {
            console.error('Error updating user profile:', error);
        }
    };

    const handleAvatarChange = (newAvatar) => {
        setUser((prevUser) => ({
            ...prevUser,
            avatarUrl: newAvatar,
        }));
    };

    if (loading) return <Loading />; // Use Loading component here
    if (!user) return <div className="text-center text-red-500">User not found</div>;

    return (
        <>
            <motion.div
                className="flex flex-col items-center p-2 bg-gray-900 text-gray-300 min-h-screen overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <div className={`w-full max-w-lg relative ${isMobile ? 'mb-6' : 'mb-12'}`}>
                    <img
                        src="/images/banner/banner_default.png"
                        alt="Banner"
                        className={`w-full ${isMobile ? 'h-32' : 'h-48'} object-cover rounded-lg`}
                    />
                    {/* Profile element */}
                    <div className={`absolute left-1/2 transform -translate-x-1/2 ${isMobile ? '-bottom-16' : '-bottom-12'} flex flex-col items-center transition-all duration-300`}>
                        <img
                            src={user.avatarUrl || '/images/avatar/avatar_default.png'}
                            alt="Profile"
                            className="w-24 h-24 object-cover rounded-full border-4 border-gray-900 sm:w-32 sm:h-32 cursor-pointer"
                            onClick={() => {if(editMode){setShowChangeAvatar(true)}}} // Show change avatar modal on click
                        />
                    </div>
                </div>
    
                {showChangeAvatar && (
                    <ChangeAvatar
                        userId={user._id}
                        onClose={() => setShowChangeAvatar(false)}
                        onAvatarSelected={handleAvatarChange}
                        user={user}
                    />
                )}
    
                <div className={`flex justify-center mb-4 font-sans text-center mt-2 ${isMobile ? 'mt-16' : ''}`}>
                    {isUser ? (
                        !editMode ? (
                            <h1 className="text-xl font-bold">{user.username}</h1>
                        ) : (
                            <div className="relative">
                                <motion.input
                                    type="text"
                                    value={user.username}
                                    onChange={(e) => {
                                        const newUsername = e.target.value;
                                        setUser({ ...user, username: newUsername });
                                        validateUsername(newUsername);
                                    }}
                                    placeholder={user.username}
                                    className="text-xl font-bold bg-transparent border-none focus:outline-none text-center"
                                    initial={{ scale: 1 }}
                                    animate={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                />
                                <motion.div
                                    className="absolute inset-x-0 border-b-2 border-gray-700 pointer-events-none"
                                    style={{ left: '25%', right: '25%' }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: '50%' }}
                                    transition={{ duration: 0.3 }}
                                ></motion.div>
                                {usernameError && (
                                    <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                                )}
                            </div>
                        )
                    ) : (
                        <h1 className="text-xl font-bold">{user.username}</h1>
                    )}
                </div>
    
                <div className="flex flex-col items-center font-sans w-full max-w-lg px-4">
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
                                    onClick={updateUserProfile}
                                >
                                    <i className="fa-solid fa-floppy-disk mr-1"></i>Apply
                                </button>
                                <button
                                    className="bg-red-500 text-white px-4 py-2 rounded-2xl font-semibold"
                                    onClick={() => {setEditMode(false);router.refresh()}}
                                >
                                    <i className="fa-solid fa-trash mr-1"></i>Discard
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center items-center font-sans w-full px-4 mt-5">
                        <div className="flex-1 max-w-xs mr-4">
                            <h1 className="text-md font-bold text-green-400 mb-2 font-retro sm:items-center">About Me</h1>
                            <div className="rounded-lg bg-gray-700 p-3 h-24 scrollable-hidden-scrollbar">
                                {isUser && editMode ? (
                                    <textarea
                                        value={user.bio || ''}
                                        onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                        className="w-full h-full bg-transparent border-none resize-none text-white focus:outline-none"
                                        placeholder="Tell something about yourself..."
                                    />
                                ) : (
                                    <p>{user.bio || 'No bio available.'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
    
};

export default ProfilePage;
