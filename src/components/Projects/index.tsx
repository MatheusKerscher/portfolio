const Projects = () => {
  return (
    <section id="projects" className="flex flex-col items-center">
      <h2 className="text-primary text-xl md:text-2xl font-bold">
        Meus projetos
      </h2>

      <div className="">
        <div className="p-2 bg-tertiary rounded">
          <h3>Projeto 1</h3>

          <img
            src=""
            alt=""
          />

          <p>Projeto feito para exibir o layout aqui</p>

          <div className="flex gap-2 justify-end">
            <a href="">GH</a>
            <a href="">ST</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
