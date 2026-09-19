import { useEffect, useRef, useState } from "react";
import projects from "../data/projects";
import ProjectCard from "./ProjectCard";

export default function ProjectShowcase({ reveal = false }) {
  const railRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth;
      const overflow = max > 0;
      setHasOverflow(overflow);
      setProgress(overflow ? Math.min(1, rail.scrollLeft / max) : 0);
    };

    const onWheel = (e) => {
      const max = rail.scrollWidth - rail.clientWidth;
      if (max <= 0) return;
      e.preventDefault();
      rail.scrollLeft += e.deltaX + e.deltaY;
    };

    update();
    rail.addEventListener("scroll", update, { passive: true });
    rail.addEventListener("load", update, true);
    rail.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    const timer = window.setTimeout(update, 500);

    return () => {
      rail.removeEventListener("scroll", update);
      rail.removeEventListener("load", update, true);
      rail.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", update);
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <section className="project-showcase" aria-label="projects">
      <div
        className="project-rail"
        ref={railRef}
        tabIndex={0}
        data-reveal={reveal ? "group" : undefined}
      >
        {projects.map((project) => (
          <div className="project-rail__item" key={project.id}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
      <div
        className={`project-slider${hasOverflow ? "" : " project-slider--idle"}`}
        aria-hidden="true"
      >
        <span className="project-slider__track" />
        <span
          className="project-slider__thumb"
          style={{ width: `${progress * 100}%` }}
        />
        <span className="project-slider__hint">scroll to see all projects</span>
      </div>
    </section>
  );
}
