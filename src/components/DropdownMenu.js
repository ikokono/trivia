import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import dari 'next/navigation' pada Next.js 13
import Leaderboard from './Leaderboard'; // Pastikan path impor ini sesuai dengan lokasi file Leaderboard.js
import Cookies from 'js-cookie'; // Import js-cookie

const DropdownMenu = ({ token }) => {
    const [showSubmenu, setShowSubmenu] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // Menggunakan useRouter dari next/navigation

    const handleToggle = () => {
        setShowSubmenu(!showSubmenu);
    };

    const handleClose = () => {
        setShowSubmenu(false);
    };

    const handleShowLeaderboard = () => {
        setShowLeaderboard(true);
    };

    const handleCloseLeaderboard = () => {
        setShowLeaderboard(false);
    };

    // Fungsi untuk menangani klik link dan memunculkan loading
    const handleLinkClick = (href) => {
        setIsLoading(true); // Set loading jadi true saat link diklik
        router.push(href); // Navigasi ke halaman yang dituju
    };

    // Fungsi untuk logout
    const handleLogout = () => {
        // Hapus cookie yang menyimpan token
        Cookies.remove('token'); // Misalnya token disimpan di cookie 'token'
        setIsLoading(true); // Mulai animasi loading
        router.push('/auth/login'); // Arahkan pengguna ke halaman login
    };

    return (
        <div className="relative">
            <div>
                <button
                    className="inline-flex justify-center items-center w-full rounded-md text-sm font-medium text-white link focus:outline-none"
                    onClick={handleToggle}
                >
                    <img src="/images/assets/menu.png" className="h-6 w-6 mr-2" alt="Profile" />
                    Menu
                </button>
            </div>
            {showSubmenu && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={handleClose}>
                    <div className="w-96 rounded-md shadow-lg bg-gray-900 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                            onClick={handleClose}
                        >
                            <i className="fa-solid fa-x"></i>
                        </button>
                        <div className="py-10" role="none">
                            {token && (
                                <>
                                    <a onClick={() => handleLinkClick('/profile/@me')} className="flex items-center px-6 py-4 text-lg text-white hover:bg-gray-700 cursor-pointer">
                                        <img src="/images/assets/profile.png" className="h-7 w-7 mr-2" alt="Profile" />
                                        Profile
                                    </a>
                                    <a onClick={() => handleLinkClick('/shop')} className="flex items-center px-6 py-4 text-lg text-white hover:bg-gray-700 cursor-pointer">
                                        <img src="/images/assets/shop.png" className="h-7 w-7 mr-2" alt="Shop" />
                                        Shop
                                    </a>
                                    <button onClick={handleShowLeaderboard} className="flex items-center px-6 py-4 text-lg text-white hover:bg-gray-700">
                                        <img src="/images/assets/trophy.png" className="h-7 w-7 mr-2" alt="Ranks" />
                                        Ranks
                                    </button>
                                    <a onClick={() => handleLinkClick('/about')} className="flex items-center px-6 py-4 text-lg text-white hover:bg-gray-700 cursor-pointer">
                                        <img src="/images/assets/about.png" className="h-7 w-7 mr-2" alt="About" />
                                        About
                                    </a>
                                    <button onClick={handleLogout} className="flex items-center px-6 py-4 text-lg text-red hover:bg-gray-700">
                                        <i className="fa-solid fa-right-from-bracket mr-4"></i>
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Leaderboard */}
            {showLeaderboard && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={handleCloseLeaderboard}>
                    <div className="w-96 rounded-lg p-4 shadow-lg relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                            onClick={handleCloseLeaderboard}
                        >
                            <i className="fa-solid fa-x"></i>
                        </button>
                        <Leaderboard />
                    </div>
                </div>
            )}

            {/* Tampilkan animasi loading jika sedang loading */}
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="loader">Loading...</div> {/* Bisa diganti dengan spinner atau animasi loading */}
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;
