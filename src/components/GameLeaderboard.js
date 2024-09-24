'use client';
import React from 'react';
import { useMediaQuery } from 'react-responsive';

const GameLeaderboard = ({ leaderboard }) => {
    // Menggunakan media query untuk mendeteksi ukuran layar
    const isDesktop = useMediaQuery({ minWidth: 768 });

    return (
        <div className="max-w-xl mx-auto p-4 overflow-x-auto">
            <div className={`flex ${isDesktop ? 'flex-row' : 'flex-col'} space-x-4`}>
                {Object.entries(leaderboard).map(([socketId, progress]) => (
                    <div key={socketId} className={`flex ${isDesktop ? 'flex-row' : 'flex-col'} items-center`}>
                        <p className="text-sm">
                            {progress.username}: {progress.correctAnswers}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameLeaderboard;
