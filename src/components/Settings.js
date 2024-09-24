'use client';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

const Settings = () => {
    // Initialize state from localStorage or default to false
    const [playLobbyMusic, setPlayLobbyMusic] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedLobbyMusic = localStorage.getItem('playLobbyMusic');
            return savedLobbyMusic === 'true'; // Convert string to boolean
        }
        return false;
    });

    const [playGameMusic, setPlayGameMusic] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedGameMusic = localStorage.getItem('playGameMusic');
            return savedGameMusic === 'true'; // Convert string to boolean
        }
        return false;
    });

    // Toggle functions to update the settings and localStorage
    const togglePlayLobbyMusic = () => {
        const newValue = !playLobbyMusic;
        setPlayLobbyMusic(newValue);
        localStorage.setItem('playLobbyMusic', newValue); // Save to localStorage
    };

    const togglePlayGameMusic = () => {
        const newValue = !playGameMusic;
        setPlayGameMusic(newValue);
        localStorage.setItem('playGameMusic', newValue); // Save to localStorage
    };

    // Load the initial state from localStorage when component mounts
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedLobbyMusic = localStorage.getItem('playLobbyMusic');
            const savedGameMusic = localStorage.getItem('playGameMusic');

            if (savedLobbyMusic !== null) {
                setPlayLobbyMusic(savedLobbyMusic === 'true');
            }

            if (savedGameMusic !== null) {
                setPlayGameMusic(savedGameMusic === 'true');
            }
        }
    }, []);

    return (
        <div className="max-w-xl mx-auto p-4 bg-gray-900 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
            <div className="h-64 overflow-y-auto scrollable-hidden-scrollbar">
                <ul className="space-y-3">
                    {/* Lobby Music Setting */}
                    <li
                        className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer"
                        onClick={togglePlayLobbyMusic}
                    >
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faMusic} className="text-white mr-3" />
                            <span className="text-sm font-medium text-white">Lobby Music</span>
                        </div>
                        <div>
                            <FontAwesomeIcon
                                icon={playLobbyMusic ? faToggleOn : faToggleOff}
                                className={`text-${playLobbyMusic ? 'green-400' : 'gray-400'} text-2xl`}
                            />
                        </div>
                    </li>

                    {/* Game Music Setting */}
                    <li
                        className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer"
                        onClick={togglePlayGameMusic}
                    >
                        <div className="flex items-center">
                            <FontAwesomeIcon icon={faMusic} className="text-white mr-3" />
                            <span className="text-sm font-medium text-white">Game Music</span>
                        </div>
                        <div>
                            <FontAwesomeIcon
                                icon={playGameMusic ? faToggleOn : faToggleOff}
                                className={`text-${playGameMusic ? 'green-400' : 'gray-400'} text-2xl`}
                            />
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Settings;
