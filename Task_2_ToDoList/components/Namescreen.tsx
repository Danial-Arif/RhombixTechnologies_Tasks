'use client'
import { useState } from "react";
import { Fleur_De_Leah, Google_Sans } from "next/font/google";

const fleurDeLeah = Fleur_De_Leah({
    weight: "400",
    subsets: ["latin"]
});

const googleSans = Google_Sans({
    weight: "400",
    subsets: ["latin"]
});

export default function NameScreen({ setUserName }: { setUserName: (username: string) => void }) {
    const [input, setInput] = useState("")

    const handleSetName = () => {
        if (!input.trim()) return;
        setUserName(input)
        localStorage.setItem("username", input)
    }
    return (
        <div className="h-screen bg-white flex flex-col justify-center items-center px-6">
            <h1 className={`${fleurDeLeah.className} text-6xl md:text-8xl mb-8`}>Welcome, Sir!</h1>
            <br></br>
            <label className={`${googleSans.className} text-lg text-gray-600 mb-4`} htmlFor="username"> Please Enter Your Name: </label>
            <input id="username" className="border-2 border-gray-300 w-[300px] md:w-[400px] rounded-lg bg-gray-100 px-4 py-2" type="text" placeholder="Name" value={input} onChange={(e) => setInput(e.target.value)} />
            <br></br>
            <button className="border border-black bg-black text-white rounded-full px-8 py-3" onClick={handleSetName}>Enter</button>
        </div>
    );
}