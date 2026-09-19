import ProjectShowcase from "../components/ProjectShowcase";

export default function Projects() {
  return (
    <main>
      <h1 className="page__heading page__heading--center" data-reveal>
        projects
      </h1>
      <ProjectShowcase reveal />
    </main>
  );
}