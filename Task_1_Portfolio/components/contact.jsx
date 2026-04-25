export default function Contact() {
    return (
        <section id='contact' className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-6xl grid md:grid-cols-2 gap-10 bg-gray-200 rounded-3xl p-10 shadow-2xl">

                {/* Left Side */}
                <div className="flex flex-col justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            Let’s Talk<span className="text-indigo-500">.</span>
                        </h1>
                        <p className="text-neutral-400 text-lg leading-relaxed max-w-md">
                            I'm always open to new opportunities and collaborations. If you
                            have a project in mind or just want to say hi, feel free to reach out.
                        </p>
                    </div>
                    <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=danialpcr81@gmail.com&su=Hello&body=Hi%20there"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-40 mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-3 text-white font-semibold shadow-lg hover:bg-black transition hover:text-white duration-300"
                    >
                        Contact Me
                    </a>
                </div>

                {/* Right Side */}
                <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-neutral-800 pt-6 md:pt-0 md:pl-10">

                    <div>
                        <h2 className="text-2xl font-semibold">Danial Arif</h2>
                        <p className="text-gray-600 mt-2">Full Stack Developer</p>
                    </div>

                    <div className="flex gap-6 mt-6">
                        <a
                            href="https://github.com/Danial-Arif"
                            className="text-neutral-400 hover:text-black transition-colors duration-300"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://www.linkedin.com/in/danial-arif-84b7bb180/"
                            className="text-neutral-400 hover:text-black transition-colors duration-300"
                        >
                            LinkedIn
                        </a>
                    </div>

                    {/* Optional extra detail */}
                    <div className="mt-10 text-sm text-neutral-500">
                        <p>Based in Pakistan</p>
                        <p>Available for freelance & full-time</p>
                    </div>
                </div>
            </div>
        </section>
    );
}