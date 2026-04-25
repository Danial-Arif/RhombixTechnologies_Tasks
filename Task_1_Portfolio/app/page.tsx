import Navbar from "@/components/navbar";
import Main from "@/components/main";
import Stat from "@/components/stat";
import Projects from "@/components/projects";
import Education from "@/components/education";
import Skills from "@/components/skills";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
export default function Home() {
  return (
    <main className="bg-gray-100">
      <Navbar />
      <Main />
      <Stat />
      <Projects />
      <Education />
      <Skills />
      <Contact />
      <Footer />
    </main>
  );
}