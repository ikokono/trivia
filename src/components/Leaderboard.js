'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import shortNumber from 'short-number';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter()

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('/api/leaderboard'); // Endpoint API untuk leaderboard
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }
                const data = await response.json();
                setLeaderboard(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">Error: {error}</div>;
    }

    const onclickprofile = (id) => {
        router.push(`/profile/${id}`)
    }

    return (
        <div className="max-w-xl mx-auto p-4 bg-gray-900 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
            <div className="h-64 overflow-y-auto scrollable-hidden-scrollbar">
                <ul className="space-y-3">
                    {leaderboard.map((user, index) => (
                        <li
                            key={user._id}
                            className="flex justify-between items-center p-3 bg-gray-800 rounded-md hover:bg-gray-700 cursor-pointer"
                            onClick={() => onclickprofile(user._id)}
                        >
                            <div className="flex items-center">
                                <span className="text-sm font-semibold text-gray-300 mr-4">{index + 1}.</span>
                                <span className="text-sm font-medium text-white">{user.username}</span>
                            </div>
                            <div className="text-xs text-gray-400 flex flex-col">
                                <div className="mb-1">Level: {user.level}</div>
                                <div>EXP: {shortNumber(parseInt(user.exp))}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Leaderboard;
