'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const ChangeAvatar = ({ userId, onClose, onAvatarSelected, user }) => {
    const [avatars, setAvatars] = useState([]);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [isCustomUpload, setIsCustomUpload] = useState(false);
    const [showModal, setShowModal] = useState(true);
    const [isHaveCustomAvatar, setIsHaveCustomAvatar] = useState(null)
    const fileInputRef = useRef(null);

    const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const response = await fetch(`/api/user/items?id=${userId}`);
                if (response.ok) {
                    const data = await response.json();
    
                    // Set avatars dengan data yang didapat
                    setAvatars(data.items);
                    
                    // Cek apakah user memiliki custom avatar dengan ID tertentu
                    const hasCustomAvatar = data.items.some(item => item._id === '66e84bcff8d9d67550e9090f');
    
                    // Jika ada custom avatar, set flag isHaveCustomAvatar
                    setIsHaveCustomAvatar(hasCustomAvatar);
    
                    // Jika ada custom avatar, hapus dari state avatars
                    if (hasCustomAvatar) {
                        // Filter avatars untuk menghapus item dengan ID tertentu
                        const updatedAvatars = data.items.filter(item => item._id !== '66e84bcff8d9d67550e9090f');
    
                        // Update state dengan avatars yang sudah di-filter
                        setAvatars(updatedAvatars);
    
                        console.log('Custom avatar removed from state');
                    }
                }
            } catch (error) {
                console.error('Error fetching avatars:', error);
            }
        };
    
        fetchAvatars();
    }, [userId]);
        


    const handleCustomUploadClick = () => {
        setIsCustomUpload(true);
        fileInputRef.current.click();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedAvatar(reader.result);
                onAvatarSelected(reader.result);
                updateAvatarInDatabase(reader.result); // Update database
            };
            reader.readAsDataURL(file);
        }
    };

    const updateAvatarInDatabase = async (avatarUrl) => {
        try {
            const response = await fetch(`/api/user/update-avatar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, avatarUrl }),
            });
            if (!response.ok) {
                throw new Error('Failed to update avatar in database');
            }
            // Optionally handle the response if needed
        } catch (error) {
            console.error('Error updating avatar:', error);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleAvatarSelect = (avatar) => {
        setSelectedAvatar(avatar);
        onAvatarSelected(avatar);
        updateAvatarInDatabase(avatar); // Update database when an avatar is selected
    };

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    className={`font-sans fixed inset-0 flex items-center justify-center z-50 ${isMobile ? 'bg-gray-900 bg-opacity-75' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className={`relative bg-gray-800 p-6 rounded-lg shadow-lg ${isMobile ? 'w-full max-w-md' : 'w-1/2'} max-h-full`}
                        style={{ maxHeight: '80vh', overflowY: 'hidden' }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                    >
                        <button
                            className="absolute top-4 right-4 text-white"
                            onClick={handleClose}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                        <div className="flex flex-col items-center">
                            {isHaveCustomAvatar ? (
                                <>
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded-full mb-4"
                                        onClick={handleCustomUploadClick}
                                    >
                                        <i className="fa-solid fa-upload mr-1"></i>Custom Avatar
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        ref={fileInputRef}
                                    /></>
                            ) : <></>}
                            <motion.div
                                className={`flex ${isMobile ? 'overflow-x-scroll' : 'overflow-x-scroll'} space-x-2`}
                                style={{ maxHeight: '60vh', overflowY: 'hidden' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.div className="flex-shrink-0">
                                    <button
                                        className="rounded-lg p-2 mb-2"
                                        onClick={() => handleAvatarSelect(user.avatarUrl || "/images/avatar/avatar_default.png")}
                                    >
                                        <img
                                            src={user.avatarUrl || "/images/avatar/avatar_default.png"}
                                            alt="Your Avatar"
                                            className="w-32 h-32 object-cover rounded-full"
                                        />
                                        <p className="text-center mt-2">Your Avatar</p>
                                    </button>
                                </motion.div>
                                {avatars.map((avatar) => (
                                    <motion.div
                                        key={avatar._id}
                                        className="flex-shrink-0"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <button
                                            className="rounded-lg p-2 mb-2"
                                            onClick={() => handleAvatarSelect(avatar.image)}
                                        >
                                            <img
                                                src={avatar.image}
                                                alt={avatar.name}
                                                className="w-32 h-32 object-cover rounded-full"
                                            />
                                            <p className="text-center mt-2">{avatar.name}</p>
                                        </button>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ChangeAvatar;
