import { motion } from 'framer-motion';

// Komponen untuk menampilkan profil pengguna sendiri
export const UserProfile = ({ user }) => (
    <motion.div
        className="profile-page h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-300 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
    >
        <motion.div
            className="max-w-4xl h-[70vh] w-full md:w-3 lg:w-1/2 p-6 rounded-lg bg-gray-800"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 50 }}
        >
            <div className="flex items-center justify-center mb-6">
                <img
                    src={user.avatarUrl || '/images/avatar/avatar_default.png'}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-4 border-green-400"
                />
            </div>

            <div className="flex justify-center mb-4 font-sans">
                <h1 className="text-xl font-bold">{user.username}<i class="fa-solid fa-pen-to-square ml-2" onClick={() => changeUsername()}></i></h1>
            </div>

            <div className="flex justify-between items-start font-sans">
                <div className="flex-1 mr-8">
                    <h1 className="text-lg font-bold text-green-400 mb-4 font-retro ml-4">About Me</h1>
                    <div className="rounded-lg bg-gray-700 p-4 h-40 scrollable-hidden-scrollbar">
                        <p className="text-sm text-gray-300">{user.bio}</p>
                    </div>
                </div>
                <div className="flex flex-col space-y-4 mr-20">
                    <p className="text-lg flex items-center">
                        <img src='/images/assets/coin.gif' width="24" height="24" alt="Coin" />
                        <span className="ml-2">{user.balance}</span>
                    </p>
                    <p className="text-lg flex items-center">
                        <img src='/images/assets/exp.png' width="24" height="24" alt="Exp" />
                        <span className="ml-2">{user.exp}</span>
                    </p>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

// Komponen untuk menampilkan profil orang lain
export const OtherProfile = ({ user }) => (
    <motion.div
        className="profile-page h-screen flex flex-col items-center justify-center p-4 bg-gray-900 text-gray-300 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
    >
        <motion.div
            className="max-w-4xl h-[70vh] w-full md:w-3 lg:w-1/2 p-6 rounded-lg bg-gray-800"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 50 }}
        >
            <div className="flex items-center justify-center mb-6">
                <img
                    src={user.avatarUrl || '/images/avatar/avatar_default.png'}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded-full border-4 border-green-400"
                />
            </div>

            <div className="flex justify-center mb-4 font-sans">
                <h1 className="text-xl font-bold">{user.username}</h1>
            </div>

            <div className="flex justify-between items-start font-sans">
                <div className="flex-1 mr-8">
                    <h1 className="text-lg font-bold text-green-400 mb-4 font-retro ml-4">About Me</h1>
                    <div className="rounded-lg bg-gray-700 p-4 h-40 scrollable-hidden-scrollbar">
                        <p className="text-sm text-gray-300">{user.bio}</p>
                    </div>
                </div>
                <div className="flex flex-col space-y-4 mr-20">
                    <p className="text-lg flex items-center">
                        <img src='/images/assets/coin.gif' width="24" height="24" alt="Coin" />
                        <span className="ml-2">{user.balance}</span>
                    </p>
                    <p className="text-lg flex items-center">
                        <img src='/images/assets/exp.png' width="24" height="24" alt="Exp" />
                        <span className="ml-2">{user.exp}</span>
                    </p>
                </div>
            </div>
        </motion.div>
    </motion.div>
);

