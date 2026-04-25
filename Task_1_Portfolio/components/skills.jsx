import {
  FaHtml5,
  FaCss3Alt,
  FaJs,
  FaReact,
  FaNodeJs,
} from "react-icons/fa";
import { SiNextdotjs, SiTailwindcss, SiMongodb } from "react-icons/si";

export default function Skills() {
  const categories = [
    {
      title: "Frontend",
      skills: [
        { name: "HTML", icon: FaHtml5 },
        { name: "CSS", icon: FaCss3Alt },
        { name: "JavaScript", icon: FaJs },
      ],
      span: "md:col-span-2",
    },
    {
      title: "Frameworks",
      skills: [
        { name: "React", icon: FaReact },
        { name: "Next.js", icon: SiNextdotjs },
      ],
      span: "md:col-span-1",
    },
    {
      title: "Styling",
      skills: [
        { name: "Tailwind", icon: SiTailwindcss },
      ],
      span: "md:col-span-1",
    },
    {
      title: "Backend",
      skills: [
        { name: "Node.js", icon: FaNodeJs },
        { name: "MongoDB", icon: SiMongodb },
      ],
      span: "md:col-span-2",
    },
  ];

  return (
    <section className="min-h-screen px-6 py-24">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <div className="mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
            Skills
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900">
            My toolkit
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map(({ title, skills, span }) => (
            <div
              key={title}
              className={`${span} group bg-white rounded-3xl p-8 border border-neutral-100 hover:shadow-lg transition`}
            >
              <h3 className="text-[11px] tracking-[0.2em] uppercase text-neutral-400 mb-6">
                {title}
              </h3>

              <div className="flex flex-col gap-4">
                {skills.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="flex items-center gap-3"
                  >
                    <Icon className="text-neutral-400 group-hover:text-neutral-700 transition text-lg" />
                    <span className="text-lg font-medium text-neutral-800">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}