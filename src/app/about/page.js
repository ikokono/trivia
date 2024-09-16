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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Sed dictum, ipsum at cursus laoreet, urna magna viverra nunc, et vestibulum velit dui in metus. Donec bibendum, turpis ut dapibus dictum, leo quam elementum nisl, eget pharetra mi dolor non arcu. Integer tristique ligula sit amet bibendum fringilla. Ut imperdiet, justo at aliquet convallis, turpis lorem aliquam risus, id malesuada velit urna sed tortor. Phasellus efficitur libero non magna laoreet, nec cursus dui condimentum.
                </p>
                <p className="text-lg mb-4 font-sans">
                    Morbi ut lorem et nisl consectetur bibendum. Nullam ultricies gravida ligula, a volutpat ipsum bibendum sed. Quisque dapibus varius ex ac tincidunt. Integer nec fringilla ex. Sed pharetra vestibulum quam. Sed vulputate, urna et dictum vestibulum, turpis ex faucibus dui, eu vehicula lectus lectus non velit.
                </p>
                <p className="text-lg mb-4 font-sans">
                    Vestibulum vehicula enim id ante dictum, sed venenatis orci elementum. Aliquam ac ligula a sapien pharetra malesuada. Duis euismod ipsum ut justo dapibus, sed consectetur velit feugiat. Praesent dictum, erat sit amet bibendum interdum, odio dolor fringilla est, sed vehicula ligula justo eget libero.
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
