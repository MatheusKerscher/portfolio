import ProjectCard from "./components/project-card";

export default function Home() {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2">
      <ProjectCard />
      <ProjectCard />
    </section>
  );
}
