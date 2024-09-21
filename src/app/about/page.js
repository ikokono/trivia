'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LoadingScreen from '../../components/Loading'; // Impor komponen loading
import style from '../styles/About.module.css';

const About = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulasikan loading selama 1 detik
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <LoadingScreen />; // Tampilkan loading screen jika masih loading

    return (
        <motion.div
            className="about-page h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-300 scrollable-hidden-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            <motion.div
                className="max-w-4xl h-[95vh] md:h-[100vh] sm:h-[80vh] p-6 rounded-lg mt-20 mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 50 }}
            >
                <h1 className={`text-2xl font-bold mb-4 text-green-400 ${style.typing} font-retro`}>
                    About Us<span>_</span>
                </h1>
                <p className="text-lg mb-4 font-sans">
                    Hey there! Welcome to our Trivia Game Project! We're <strong>Kelompok 2</strong>, and this is our super cool trivia game that we made as part of our school project.
                    We’re all about creating a fun and interactive way for you to learn while having a blast!
                </p>
                <p className="text-lg mb-4 font-sans">
                    So, why aren’t we using formal English? Well, <strong>we decided</strong> to keep things casual 'cause we want this game to be <strong>fun and relatable</strong>, especially for younger players like you. We’re aiming for a <strong>chill, friendly vibe</strong> while still teaching you something valuable along the way.
                </p>
                <p className="text-lg mb-4 font-sans">
                    In this game, you’ll answer trivia questions that test your language skills, fitness knowledge, and even some cool practical stuff from PKWU. We believe learning is way more fun when it feels like a game, so get ready to learn while you play!
                </p>
                <p className="text-lg mb-4 font-sans">
                    Whether you're here to boost your brainpower or just have some fun, we hope our trivia game gives you both! Thanks for playing, and have an awesome time!
                </p>
                <div className="text-center mt-8 flex flex-row items-center justify-center space-x-1 font-sans pb-20">
                    <p className="text-lg">Made with</p>
                    <motion.img
                        src="/images/assets/heart.png"
                        alt="Heart"
                        className="w-6 h-6"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1.2 }}
                        transition={{ repeat: Infinity, repeatType: 'reverse', duration: 1 }}
                    />
                </div>
            </motion.div>

        </motion.div>
    );
};

export default About;
