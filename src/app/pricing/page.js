'use client'
import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive'; // Import dari react-responsive
import CryptoAddress from './../../components/CryptoAddress'; // Import komponen QR code
import style from "../styles/Purchase.module.css"

const cryptoPrices = {
  btc: 0.000016,  // Harga untuk 1.000 coins dalam BTC
  eth: 0.00042,   // Harga untuk 1.000 coins dalam ETH
  trx: 6.55,      // Harga untuk 1.000 coins dalam TRX
  sol: 0.0068,    // Harga untuk 1.000 coins dalam SOL
  usdt: 1.27,     // Harga untuk 1.000 coins dalam USDT
};

export default function PricingPage() {
  const [selectedCrypto, setSelectedCrypto] = useState('btc');
  const [coinAmount, setCoinAmount] = useState(1000);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State untuk mengontrol visibilitas popup

  const calculatePrice = () => {
    const pricePer1000 = cryptoPrices[selectedCrypto];
    return (pricePer1000 * (coinAmount / 1000)).toFixed(5);
  };

  const handleSelectAmount = (amount) => {
    setCoinAmount(amount);
    setIsPopupVisible(true); // Tampilkan popup saat memilih jumlah
  };

  // Media queries
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 font-sans">
      <div className={`container mx-auto ${style.scrollbar} `}>
        <h3 className="text-3xl font-bold mb-8 text-center flex items-center justify-center">
          <img src="/images/assets/coin.gif" alt="Coin" className="w-12 h-12 mr-4" />
          Purchase
        </h3>

        <div className="flex flex-col md:flex-row justify-center mb-6">
          <label className="mr-4 text-lg">Select Currency:</label>
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none"
          >
            <option value="btc">Bitcoin (BTC)</option>
            <option value="eth">Ethereum (ETH)</option>
            <option value="trx">Tron (TRX)</option>
            <option value="sol">Solana (SOL)</option>
            <option value="usdt">Tether (USDT)</option>
          </select>
        </div>

        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'} gap-6`}>
          {[1000, 5000, 10000, 25000, 50000, 100000].map((amount) => (
            <div key={amount} className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
              <h2 className="text-2xl font-bold mb-4">{amount} Coins</h2>
              <p className="text-xl">
                <span className="font-bold">{(cryptoPrices[selectedCrypto] * (amount / 1000)).toFixed(5)} {selectedCrypto.toUpperCase()}</span>
              </p>
              <button
                onClick={() => handleSelectAmount(amount)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Select
              </button>
            </div>
          ))}
        </div>

        {/* Popup untuk menampilkan Crypto Address dan QR Code */}
        {isPopupVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <CryptoAddress selectedCrypto={selectedCrypto} amount={calculatePrice()} />
              <button
                onClick={() => setIsPopupVisible(false)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
