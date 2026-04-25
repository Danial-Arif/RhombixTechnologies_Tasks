export default function Education() {
    const education = [
        {
            year: "2023 — 2027",
            title: "BS Computer Science",
            place: "Federal Urdu University of Arts, Sciences & Technology Islamabad",
            desc: "Currently studying core CS concepts, web development, and software engineering fundamentals.",
        },
        {
            year: "2021 — 2023",
            title: "FSC PRE-ENGINEERING",
            place: "Punjab College Islamabad",
            desc: "Studied mathematics, physics, chemistry, and basic computer science .",
        },
        {
            year: "2019 — 2021",
            title: "Matriculation",
            place: "The Educators High School Islamabad",
            desc: "Completed foundational science education.",
        },
    ];

    return (
        <section id='education' className="min-h-screen px-6 py-10 bg-gray-100">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="mb-16">
                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4 font-medium">
                        Chronicle
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-900">
                        Education
                    </h2>
                </div>

                {/* Directory List */}
                <div className="border-t border-neutral-200">
                    {education.map((item, index) => (
                        <div
                            key={index}
                            className="group border-b border-neutral-200 py-8 px-4 -mx-4 transition-all duration-300 hover:bg-neutral-50 cursor-default"
                        >

                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12">

                                {/* Left Meta (Index + Year) */}
                                <div className="md:w-36 shrink-0">
                                    <span className="text-[11px] font-mono text-neutral-300 group-hover:text-neutral-400 transition-colors">
                                        0{index + 1}
                                    </span>
                                    <p className="text-sm text-neutral-500 mt-1 font-medium">
                                        {item.year}
                                    </p>
                                </div>

                                {/* Right Content */}
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-3 flex-wrap">
                                        <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-neutral-900 group-hover:translate-x-1 transition-transform duration-300">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <p className="text-sm text-neutral-400 mt-2 flex items-center gap-2">
                                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                                        {item.place}
                                    </p>

                                    <p className="text-sm text-neutral-400 mt-4 leading-relaxed max-w-xl group-hover:text-neutral-600 transition-colors duration-300">
                                        {item.desc}
                                    </p>
                                </div>

                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}