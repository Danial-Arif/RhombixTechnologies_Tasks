import Link from "next/link";

export default function Projects() {
    return (
        <section id='projects' className="px-6 md:px-12 py-20 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-end justify-between mb-16">
                <div>
                    <p className="text-sm tracking-widest uppercase text-neutral-500 mb-2">
                        Selected Works
                    </p>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
                        Projects
                    </h2>
                </div>

                <a
                    href="#"
                    className="text-xs uppercase tracking-wider underline underline-offset-4 hover:opacity-70 transition"
                >
                    View All
                </a>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-15">

                {/* Large Card */}
                <Link
                    href="https://fonder-clone.vercel.app/"
                    target="_blank"
                    className="md:col-span-8 group cursor-pointer block"
                >
                    <div className="overflow-hidden rounded-2xl mb-5">
                        <img
                            src="Fonder.png"
                            alt=""
                            className="w-full aspect-[16/9] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-700 ease-out"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[10px] tracking-wide px-3 py-1 border rounded-full">
                            UI/UX
                        </span>
                        <span className="text-[10px] tracking-wide px-3 py-1 border rounded-full">
                            GSAP
                        </span>
                    </div>

                    <h3 className="text-xl font-medium mb-2">
                        Fonder Homepage Clone
                    </h3>

                    <p className="text-neutral-500 max-w-xl leading-relaxed">
                        Recreated the Fonder Studio website (an Awwwards nominee) to challenge my frontend expertise. Emphasized high-end UI fidelity, advanced animations, performance optimization, and seamless interactive transitions.
                    </p>
                </Link>

                {/* Right Top */}
                <Link
                    href="https://cuberto-clone-by-danial.vercel.app/"
                    target="_blank"
                    className="md:col-span-4 md:mt-16 group cursor-pointer block"
                >
                    <div className="overflow-hidden rounded-2xl mb-5">
                        <img
                            src="Cuberto-phone.png"
                            alt=""
                            className="w-full aspect-[9/16] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-700 ease-out"
                        />
                    </div>

                    <span className="text-[10px] tracking-wide px-3 py-1 border rounded-full">
                        UI/UX
                    </span>

                    <h3 className="text-lg font-medium mt-3 mb-2">
                        Cuberto Homepage Clone
                    </h3>

                    <p className="text-neutral-500 leading-relaxed">
                        Cloned the Cuberto Homepage to enhance my frontend development skills and gain hands-on experience with modern UI animations
                    </p>
                </Link>

                {/* Large Bottom */}
                <Link
                    href="https://danial-store.vercel.app/"
                    target="_blank"
                    className="md:col-span-8 md:-mt-16 group cursor-pointer block"
                >
                    <div className="overflow-hidden rounded-2xl mb-5">
                        <img
                            src="Store.png"
                            alt=""
                            className="w-full aspect-[16/8] object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition duration-700 ease-out"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[10px] tracking-wide px-3 py-1 border rounded-full">
                            Next.js
                        </span>
                        <span className="text-[10px] tracking-wide px-3 py-1 border rounded-full">
                            Next Auth
                        </span>
                        <span className="text-[10px] tracking-wide px-3 py-1 border rounded-full">
                            MongoDB
                        </span>
                    </div>

                    <h3 className="text-xl font-medium mb-2">
                        E-Commerce Website
                    </h3>

                    <p className="text-neutral-500 max-w-xl leading-relaxed">
                        A fullstack e commerce website with all the features of a real e-commerce website.
                    </p>
                </Link>

            </div>
        </section>
    );
}