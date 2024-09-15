import React from 'react';
import { motion } from 'framer-motion';

const WarningComponent = ({ title, message, onConfirm, onCancel }) => {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
        <h2 className="text-xl font-semibold text-red-400 mb-4">{title}</h2> {/* Title */}
        <p className="text-lg text-white mb-4">{message}</p> {/* Message */}
        <div className="flex justify-between">
          <button
            onClick={onConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          >
            No
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WarningComponent;
