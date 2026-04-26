'use client'
import { Noto_Nastaliq_Urdu } from "next/font/google"

const notonastaliq = Noto_Nastaliq_Urdu({
    weight: "400",
    subsets: ["latin"]
})

export default function Navbar({ toggleTheme, isDarkMode }) {
    return (
        <div className={`flex justify-between items-center px-6 py-4 backdrop-blur-xl border-b transition-colors duration-300 ${isDarkMode ? 'bg-[#020617]/40 border-white/10' : 'bg-white/60 border-gray-200'}`}>
            <h1
                className={`text-xl font-bold tracking-tight ${notonastaliq.className}`}
                style={
                    isDarkMode
                        ? { textShadow: "0 0 10px #3b82f6, 0 0 20px #3b82f6, 0 0 30px #3b82f6" }
                        : {}
                }
            >
                دانیال عارف
            </h1>

            <button
                onClick={toggleTheme}
                className={`cursor-pointer px-4 py-2 rounded-full border text-sm transition-all ${isDarkMode ? 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-100'}`}
            >
                {isDarkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
            </button>
        </div>
    )
}