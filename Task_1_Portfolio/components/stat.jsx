import { Newsreader } from 'next/font/google';

const newsreader = Newsreader({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    style: ['normal', 'italic'],
});

export default function Stat() {
    return (
        <div className={`${newsreader.className} px-6 md:px-10`}>
            <div className="flex flex-row justify-between items-center border-t border-b border-gray-500 py-10 gap-8">

                {/* Experience */}
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-5xl">2+</h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        Years of Experience
                    </p>
                </div>

                {/* Projects */}
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-5xl">5+</h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        Completed Projects
                    </p>
                </div>

                {/* Clients / Extra */}
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-5xl">3+</h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        Happy Clients
                    </p>
                </div>

                {/* Bonus stat (makes it feel richer) */}
                <div className="flex flex-col items-center">
                    <h1 className="text-2xl md:text-5xl">100%</h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        Project Delivery Rate
                    </p>
                </div>

            </div>
        </div>
    );
}