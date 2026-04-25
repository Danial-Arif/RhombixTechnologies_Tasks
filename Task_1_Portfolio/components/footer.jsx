import { Newsreader } from "next/font/google";
const newsreader = Newsreader({ subsets: ["latin"] });
export default function Footer() {
    return (
        <footer className=" border-t border-[#231500] px-6 py-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

                {/* Left */}
                <div>
                    <h1 className={` ${newsreader.className} text-xl font-bold text-black uppercase`}>
                        Danial Arif
                    </h1>
                    <p className="text-gray-600 text-sm mt-2 max-w-sm">
                        Full Stack Developer crafting modern, scalable, and user-focused digital experiences.
                    </p>
                </div>

                {/* Right */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-gray-600 text-sm">
                    <a
                        href="https://github.com/Danial-Arif"
                        className="hover:text-black transition-colors duration-300"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://www.linkedin.com/in/danial-arif-84b7bb180/"
                        className="hover:text-black transition-colors duration-300"
                    >
                        LinkedIn
                    </a>
                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=danialpcr81@gmail.com&su=Hello&body=Hi%20there"
                        className="hover:text-black transition-colors duration-300"
                    >
                        Gmail
                    </a>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600 gap-4">
                <p>© {new Date().getFullYear()} Danial Arif. All rights reserved.</p>
                <p>Built with React & Tailwind CSS</p>
            </div>
        </footer>
    );
}