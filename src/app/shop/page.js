'use client'
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import nookies from 'nookies';
import { jwtDecode } from "jwt-decode";
import { WarningComponent, WarningYesButton } from '../../components/Dialog'; // Import komponen Warning
import styles from '../styles/Shop.module.css';
import { useRouter } from 'next/navigation';

export default function ShopPage() {
    const [categories, setCategories] = useState([]);
    const [profile, setProfile] = useState({});
    const [tokens, setToken] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showWarning, setShowWarning] = useState(false); // State untuk Warning
    const [showNotEnoughMoney, setShowNotEnoughMoney] = useState(false); // State untuk Warning
    const [selectedItem, setSelectedItem] = useState(null); // Item yang diklik
    const audioRef = useRef(null);
    const router = useRouter()

    const cookies = nookies.get();
    const token = cookies.token || null;
    const decoded = jwtDecode(token);
    const userId = decoded?.userId;

    const fetchTokenAndUsername = async () => {
        if (token) {
            try {
                if (!userId) throw new Error('Invalid token');
                setToken(token);
                const res = await fetch(`/api/user?id=${userId}`);
                const data = await res.json();
                setProfile(data);
            } catch (error) {
                setProfile('Failed to load profile');
                console.error('Token decoding or API error:', error);
            }
        } else setProfile('No token found');
    };

    const isItEnoughMoney = async (price) => {
        const coins = profile.balance

        if (price <= coins) {
            return true
        } else {
            return false
        }
    }

    const buyItem = async (price, itemId) => {
        try {
            // Periksa apakah saldo cukup
            const isEnough = await isItEnoughMoney(price);
            if (!isEnough) {
                setShowNotEnoughMoney(true);
                return;
            }

            // Kurangi saldo pengguna
            const newBalance = profile.balance - price;

            // Update saldo dan tambahkan item ke user
            const res = await fetch(`/api/user/items?id=${userId}&itemId=${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newBalance: newBalance
                })
            });

            const data = await res.json();
            if (res.status !== 200) {
                console.error('Error updating user:', data.error);
                return;
            }

            // Perbarui state
            setProfile((prevProfile) => ({
                ...profile,
                balance: newBalance,
                items: [...profile.items, itemId],
            }));

            alert(`Item ${selectedItem.name} purchased successfully!`);

        } catch (error) {
            console.error('Error buying item:', error);
        }
    };

    function handlePurchaseClick() {
        router.push("/pricing")
    }


    useEffect(() => {
        // Mengambil data dari API
        async function fetchData() {
            try {
                const response = await fetch('/api/items');
                const data = await response.json();

                // Mengelompokkan items berdasarkan kategori
                const groupedCategories = data.reduce((acc, item) => {
                    const { type, ...itemData } = item;
                    if (!acc[type]) {
                        acc[type] = { name: type, items: [] };
                    }
                    acc[type].items.push(itemData);
                    return acc;
                }, {});

                // Mengonversi objek kategori menjadi array
                const categoriesArray = Object.values(groupedCategories);
                setCategories(categoriesArray);
                setSelectedCategory(categoriesArray[0]); // Set kategori pertama sebagai default
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchTokenAndUsername()
        fetchData();

        const audio = audioRef.current;
        if (audio) {
            audio.play().catch((error) => {
                console.log("Autoplay mungkin di-block oleh browser:", error);
            });
        }

        return () => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    }, []);

    const handleConfirmAlertNotEnoughMoney = () => {
        setShowNotEnoughMoney(false)
    };
    // Handler untuk mengkonfirmasi item
    const handleConfirmAlertBuy = async () => {
        const check = await isItEnoughMoney(selectedItem.price);

        if (check) {
            await buyItem(selectedItem.price, selectedItem._id);
            setShowWarning(false);
            setSelectedItem(null);
        } else {
            setShowNotEnoughMoney(true);
            setShowWarning(false);
            setSelectedItem(null);
        }
    };

    // Handler untuk membatalkan item
    const handleCancelAlertBuy = () => {
        setShowWarning(false);
        setSelectedItem(null);
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setShowWarning(true);
    };

    if (!selectedCategory) return null; // Menunggu data diambil

    return (
        <div className="shop-page relative w-full h-screen overflow-hidden font-sans">
            {/* Background Video */}
            <motion.div
                className="fixed top-0 left-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
            >
                <img src="/images/background/shop_background.gif" alt="Background GIF" className="object-cover w-full h-full" />
            </motion.div>
            <audio ref={audioRef} src="/audio/Theme_shop.mp3" preload="auto" loop />
    
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-25"></div>
    
            {/* Shop Container */}
            <div className="relative z-10 flex flex-col items-center justify-start h-screen text-white scrollable-hidden-scrollbar pb-6">
                <h1 className="text-4xl font-bold mb-8 mt-20 font-retro">
                    <span className="text-white">Digi</span><span className="text-retroGreen">Dudes</span>
                </h1>
    
                {/* Category Buttons */}
                <div className="flex flex-col items-center">
                    <div className="flex items-center">
                        <img src='/images/assets/coin.gif' />
                        <span className={`${styles.money} text-yellow-400 font-semibold ml-2`}>
                            {profile.balance}
                        </span>
                    </div>
    
                    {/* Purchase Button */}
                    <button
                        className="mt-4 bg-green-500 text-white font-semibold px-4 py-2 rounded hover:bg-green-600 transition"
                        onClick={handlePurchaseClick}
                    >
                        Purchase
                    </button>
                </div>
    
                {/* Selected Category Items */}
                <div className="w-4/5 md:w-2/3 lg:w-1/2 bg-gray-900 bg-opacity-80 p-8 rounded-lg mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-2xl font-semibold mb-4">{selectedCategory.name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedCategory.items.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className="bg-gray-800 p-4 rounded-lg flex flex-col items-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <img src={item.image} alt={item.name} className="mb-4 w-32 h-32 object-cover rounded-lg" />
                                    <p className="text-lg">{item.name}</p>
                                    <p className="text-md text-gray-400">{item.description}</p>
                                    <div className="flex items-center">
                                        <img src="/images/assets/coin.gif" alt="Coin" className="w-6 h-6 mr-2" />
                                        <p className="text-lg font-bold">{item.price_label}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
    
            {/* Tampilkan komponen Warning jika diperlukan */}
            {showWarning && (
                <WarningComponent
                    title={"Hold Up!"}
                    message={`Are you sure you want to buy ${selectedItem.name} (${selectedItem.price_label})?`}
                    onConfirm={handleConfirmAlertBuy}
                    onCancel={handleCancelAlertBuy}
                />
            )}
    
            {showNotEnoughMoney && (
                <WarningYesButton
                    title={"Whoops!"}
                    message={`Your coins ain't enough, come back later if you're already rich!`}
                    onConfirm={handleConfirmAlertNotEnoughMoney}
                />
            )}
        </div>
    );
}
