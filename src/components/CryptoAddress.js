import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Crypto addresses for each cryptocurrency
const cryptoAddresses = {
    btc: '0xa0c75ea85cfd6cab525b5d4ccfa0701cc6b5aa19',  // Example BTC Address
    eth: '0xa0c75ea85cfd6cab525b5d4ccfa0701cc6b5aa19', // Example ETH Address
    trx: '0xa0c75ea85cfd6cab525b5d4ccfa0701cc6b5aa19',  // Example TRX Address
    sol: '0xa0c75ea85cfd6cab525b5d4ccfa0701cc6b5aa19',
    usdt: '0xa0c75ea85cfd6cab525b5d4ccfa0701cc6b5aa19'  // Example USDT Address
};

// Arrow function for CryptoAddress component
const CryptoAddress = ({ selectedCrypto, amount }) => {
    const address = cryptoAddresses[selectedCrypto]; // Get address based on selected crypto
    const cryptoLabel = selectedCrypto.toUpperCase();
    const whatsappNumber = '+8617000941535';  // Replace with the correct WhatsApp number
    
    return (
        <div className="bg-gray-800 p-6 rounded-lg text-center shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
                Send Your {cryptoLabel} Here!
            </h2>

            <div className="text-xl text-gray-400 mb-4">
                <p>Network: <span className="text-white">BNB Smart Chain (BEP20)</span></p> {/* Added BEP20 */}
            </div>

            <div className="flex justify-center mb-4">
                <QRCodeSVG value={address} size={150} />
            </div>

            <p className="text-xl mb-4">
                Address: <span className="font-mono break-all">{address}</span>
            </p>

            <p className="text-lg mb-2 text-gray-300">
                You gotta send <span className="font-bold">{amount} {cryptoLabel}</span> to this address.
            </p>

            <p className="text-lg text-gray-300">
                Once you send the payment, hit up <span className="font-bold">{whatsappNumber}</span> on WhatsApp with your proof!
            </p>
        </div>
    );
};

export default CryptoAddress;
