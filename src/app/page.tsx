import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "./components/project-card";

export default function Home() {
  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2">
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="curriculum">Currículo</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <ProjectCard />
        </TabsContent>

        <TabsContent value="curriculum"></TabsContent>
      </Tabs>
    </section>
  );
}
