import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type ProjectCardProps = {
  title: string;
  imageUrl: string;
  repositoryUrl?: string;
  websiteUrl?: string;
};

const ProjectCard = ({
  title,
  imageUrl,
  repositoryUrl,
  websiteUrl,
}: ProjectCardProps) => {
  return (
    <a
      href={websiteUrl || repositoryUrl}
      target="_blank"
      className="group block hover:scale-105 transition-transform duration-200 ease-in-out"
    >
      <Card className="overflow-hidden">
        <CardContent>
          <div className="relative w-full h-56 overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              priority
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </CardContent>

        <CardFooter>
          <CardTitle>{title}</CardTitle>
        </CardFooter>
      </Card>
    </a>
  );
};

export default ProjectCard;
