import projects from "../data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectShowcase() {
  return (
    <section className="project-showcase" aria-label="projects">
      <div className="project-gallery" data-reveal="group">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}
