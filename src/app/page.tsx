import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectCard from "./components/project-card";

export default function Home() {
  return (
    <section className="w-full">
      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="curriculum">Currículo</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 my-5">
            <ProjectCard
              title="Web Carros"
              imageUrl="/thumbnails/thumbnail-web-carros.png"
              websiteUrl="https://web-carros-pi.vercel.app/"
            />

            <ProjectCard
              title="Dev Controle"
              imageUrl="/thumbnails/thumbnail-dev-controle.png"
              websiteUrl="https://dev-controle-topaz.vercel.app/"
            />

            <ProjectCard
              title="MyMock"
              imageUrl="/thumbnails/thumbnail-my-mock.png"
              websiteUrl="https://my-mock-ecru.vercel.app/"
            />

            <ProjectCard
              title="Pet na porta"
              imageUrl="/thumbnails/thumbnail-pet-na-porta.png"
              websiteUrl="https://pet-na-porta.vercel.app/"
            />

            <ProjectCard
              title="Cripto Currency"
              imageUrl="/thumbnails/thumbnail-cripto-currency.png"
              websiteUrl="https://cripto-currency-orcin.vercel.app/"
            />
          </div>
        </TabsContent>

        <TabsContent value="curriculum"></TabsContent>
      </Tabs>
    </section>
  );
}
