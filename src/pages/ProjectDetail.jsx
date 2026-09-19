import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import projects from "../data/projects";

function CaseArt({ src, letter, color, className, style, reveal }) {
  const [failed, setFailed] = useState(false);
  const broken = !src || failed;

  if (broken) {
    return (
      <div
        className={className}
        style={{ background: color, ...style }}
        data-reveal={reveal ? "" : undefined}
      >
        <span aria-hidden="true">{letter}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt=""
      style={style}
      data-reveal={reveal ? "" : undefined}
      onError={() => setFailed(true)}
    />
  );
}

function CaseRow({ label, children }) {
  return (
    <section className="case__row" data-reveal>
      <h2 className="case__row__label">{label}</h2>
      <div className="case__row__content">{children}</div>
    </section>
  );
}

function CaseFact({ label, value }) {
  return (
    <div className="case__fact">
      <h3 className="case__fact__label">{label}</h3>
      <p className="case__fact__value">{value}</p>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <main>
        <h1 className="page__heading" data-reveal>not found</h1>
        <p className="page__text" data-reveal>
          This project doesn&rsquo;t exist yet.{" "}
          <Link className="page__link" to="/">
            Back home
          </Link>
          .
        </p>
      </main>
    );
  }

  const letter = project.title.charAt(0);
  const c = project.case;

  return (
    <main className="case">
      <section className="case__hero">
        <CaseArt
          src={c?.heroArt ?? null}
          letter={letter}
          color={project.color}
          className="case__hero__art"
        />
        <div className="case__hero__scrim">
          <p className="case__hero__meta">
            {c?.heroMeta ?? `${project.type} ${project.year}`}
          </p>
          <h1 className="case__hero__title">{project.title}</h1>
        </div>
      </section>

      <div className="case__gutter">
        {c ? (
          <>
            <CaseRow label={c.overview.label}>
              <p className="case__lead">{c.overview.lead}</p>
              <p className="case__text">{c.overview.text}</p>
            </CaseRow>

            <hr className="case__rule" />

            <div className="case__facts" data-reveal="group">
              {c.facts.map((f) => (
                <CaseFact key={f.label} label={f.label} value={f.value} />
              ))}
            </div>

            <hr className="case__rule" />

            <CaseArt
              src={c.logoArt ?? null}
              letter={letter}
              color={project.color}
              className="case__logo"
              reveal
            />

            <hr className="case__rule" />

            <CaseRow label={c.audience.label}>
              <h2 className="case__question">{c.audience.question}</h2>
              <p className="case__text">{c.audience.text}</p>
            </CaseRow>

            <div className="case__mockups">
              {c.mockups.map((src, i) => (
                <CaseArt
                  key={i}
                  src={src}
                  letter={letter}
                  color={project.color}
                  className="case__mockup"
                  reveal
                />
              ))}
            </div>

            <hr className="case__rule" />

            <CaseRow label={c.result.label}>
              <h2 className="case__question">{c.result.question}</h2>
              <p className="case__text">{c.result.text}</p>
            </CaseRow>

            {c.links && (
              <>
                <hr className="case__rule" />
                <div className="case__links">
                  {c.links.map((link) => (
                    <section className="case__links__row" key={link.label} data-reveal>
                      <h2 className="case__links__label">{link.label}</h2>
                      <a
                        className="case__links__link"
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label === "see process" ||
                        link.label === "see prototype"
                          ? "open in figma"
                          : link.label === "see live site" ||
                              link.label === "see mobile site"
                            ? "visit site"
                            : "view repo"}
                      </a>
                    </section>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <CaseRow label="overview">
            <p className="case__lead">{project.description}</p>
            <p className="case__text">
              A full case study for this project is coming soon.
            </p>
          </CaseRow>
        )}
      </div>
    </main>
  );
}
