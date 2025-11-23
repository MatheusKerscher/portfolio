import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

const ProjectCard = () => {
  return (
    <Card>
      <CardContent>
        <p>Imagem do projeto</p>
      </CardContent>

      <CardFooter>
        <CardTitle>Projeto</CardTitle>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
