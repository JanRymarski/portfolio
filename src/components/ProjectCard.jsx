import { useState } from "react";
import { Link } from "react-router-dom";

export default function ProjectCard({ project }) {
  const letter = project.title.charAt(0);
  const [hovered, setHovered] = useState(false);
  const src = hovered && project.hoverImage ? project.hoverImage : project.image;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="project-card"
      aria-label={`Open ${project.title}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="project-card__media">
        {src ? (
          <img className="project-card__art" src={src} alt={project.title} />
        ) : (
          <div
            className="project-card__art"
            style={{ background: project.color }}
          >
            <span aria-hidden="true">{letter}</span>
          </div>
        )}
      </div>
      <div className="project-card__info">
        <h3 className="project-card__title">{project.title}</h3>
        <div className="project-card__type">
          <span className="project-card__type__label">{project.type}</span>
          <span className="project-card__type__year">{project.year}</span>
        </div>
      </div>
    </Link>
  );
}
