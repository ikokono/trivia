// components/Loading.js
import { motion } from 'framer-motion';

const Loading = () => (
  <motion.div
    className="flex flex-col items-center justify-center h-screen bg-gray-900"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.img 
      src="/images/assets/loadingCat.gif" 
      alt="Loading" 
      className="w-32 h-32"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    />
    <motion.p 
      className="text-gray-300 mt-4 text-lg font-retro"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      Please wait...
    </motion.p>
  </motion.div>
);

export default Loading;
