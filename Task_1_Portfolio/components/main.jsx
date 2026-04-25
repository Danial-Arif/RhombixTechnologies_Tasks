import { Newsreader } from 'next/font/google';

const newsreader = Newsreader({
    subsets: ['latin'],
    weight: ['400', '500', '700'],
    style: ['normal', 'italic'],
});

export default function Main() {
    return (
        <main id='main' className="h-[80vh] md:h-[110vh] flex flex-col justify-center items-start px-6 md:px-20">
            <div className="flex gap-4 flex-col justify-start md:justify-between items-start">

                <h5 className="uppercase text-[12px] tracking-widest text-[#0F172A]">
                    NEXT.JS DEVELOPER & DIGITAL ARCHITECT
                </h5>

                <h1 className={`${newsreader.className} text-4xl md:text-7xl max-w-[24ch]`}>
                    Crafting performant <span className="italic text-[#BDB294]">
                        web applications
                    </span> that bridge the gap between user experience and scalable architecture.
                </h1>

                <p className="text-gray-600 max-w-[70ch]  md:text-[16px] font-normal">
                    With a strong focus on modern frameworks, I specialize in building fast, SEO-optimized, and production-ready applications for startups and growing businesses.                </p>

            </div>
        </main>
    );
}