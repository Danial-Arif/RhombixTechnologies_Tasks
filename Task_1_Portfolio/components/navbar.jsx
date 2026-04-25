"use client";
import { useState } from "react";
import Link from "next/link";
import { Newsreader } from "next/font/google";

const newsreader = Newsreader({ subsets: ["latin"] });

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between py-4 px-6 md:px-10 bg-white">

            {/* Logo */}
            <div className="logo">
                <h1 className={`${newsreader.className} uppercase text-black  text-2xl`}>Danial Arif</h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex gap-10">
                <a className="hover:text-blue-800 hover:border-b-2 border-blue-800 transition-colors duration-500" href="#main">Home</a>
                <a className="hover:text-blue-800 hover:border-b-2 border-blue-800 transition-colors duration-500" href="#projects">Projects</a>
                <a className="hover:text-blue-800 hover:border-b-2 border-blue-800 transition-colors duration-500" href="#education">Education</a>
            </div>

            {/* Desktop Button */}
            <Link href="#contact" className="hidden md:block">
                <button className="bg-black rounded-3xl text-white py-2 px-6 uppercase">
                    Contact
                </button>
            </Link>

            {/* Hamburger */}
            <button
                className="md:hidden flex flex-col gap-1"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="w-6 h-[2px] bg-black"></span>
                <span className="w-6 h-[2px] bg-black"></span>
                <span className="w-6 h-[2px] bg-black"></span>
            </button>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="absolute transition-transform duration-600 ease-in-out transform translate-x-0 top-full left-0 w-full bg-white flex flex-col items-start gap-4 px-6 py-6 md:hidden shadow-md">                    <a href="#main">Home</a>
                    <a href="#projects">Projects</a>
                    <a href="#education">Education</a>

                    <Link href="#contact" className="bg-black rounded-3xl text-white py-2 px-6 uppercase">
                        Contact
                    </Link>
                </div>
            )}
        </nav>
    );
}