import { useEffect, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import Marquee from "../components/Marquee";
import ProjectShowcase from "../components/ProjectShowcase";

const TITLE = "explore my projects";

const software = [
  "Photoshop",
  "Illustrator",
  "InDesign",
  "After Effects",
  "Figma",
  "Blender",
  "Visual Studio Code",
  "Docker",
  "FileZilla",
];

const code = [
  "React",
  "React Router",
  "PHP",
  "HTML",
  "CSS",
  "Astro",
  "Git",
  "Github",
  "JavaScript",
  "Strapi",
];

export default function Home() {
  const titleRef = useRef(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const title = titleRef.current;
    if (!title) return;

    let ctx;

    const split = () => {
      if (title.dataset.split) return;
      title.dataset.split = "1";
      title.innerHTML =
        TITLE.split("")
          .map(
            (ch) =>
              `<span class="home__title__letter" aria-hidden="true">${
                ch === " " ? "&nbsp;" : ch
              }</span>`
          )
          .join("");
    };

    const startWave = (letters) => {
      const state = { p: 0 };
      const CYCLE = 60;
      const STEP = 0.02;
      const AMP = 1;

      gsap.to(state, {
        p: 1,
        duration: CYCLE,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          letters.forEach((el, i) => {
            const sin = Math.sin((state.p - i * STEP) * Math.PI * 2);
            el.style.transform = `translate3d(0, ${AMP * sin}px, 0)`;
            const se = Math.max(0, sin);
            el.style.fontVariationSettings = `"wght" 400, "SEIS" ${Math.round(
              se * 100
            )}`;
          });
        },
      });
    };

    ctx = gsap.context(() => {
      split();
      const letters = gsap.utils.toArray(".home__title__letter", title);
      startWave(letters);
    }, title);

    return () => ctx.revert();
  }, []);

  return (
    <main className="home">
      <header className="home__header" id="about">
        <div className="about__layout">
          <div className="about__media" data-reveal>
            <span className="about__tile" aria-hidden="true">
              J
            </span>
            {!imgFailed && (
              <img
                className="about__image"
                src="./jan.jpg"
                alt="Portrait of Jan Rymarski"
                onError={() => setImgFailed(true)}
              />
            )}
          </div>

          <div className="about__body">
            <p className="about__lead" data-reveal>Hey, I&rsquo;m Jan.</p>

            <p className="about__text">
              I’m a <strong>Digital Design &amp; Development</strong> student from Belgium,{" "}
              <strong>combining visual design and technology</strong> to create distinctive identities, engaging digital experiences and interfaces that are both thoughtful and functional.
            </p>

            <div className="about__links" data-reveal>
              <a
                href="https://www.linkedin.com/in/jan-rymarski-5ba212327/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin
              </a>
              <a
                href="https://github.com/JanRymarski"
                target="_blank"
                rel="noopener noreferrer"
              >
                github
              </a>
              <a href="./JanRymarski_CV.pdf" target="_blank" rel="noopener noreferrer">
                cv
              </a>
              <a href="mailto:janrymarski90@gmail.com">email</a>
            </div>

            <div className="header-scroll-cue" data-reveal aria-hidden="true">
              <span className="header-scroll-cue__text">scroll to see more</span>
              <span className="header-scroll-cue__indicator">
                <span className="header-scroll-cue__arrow">↓</span>
              </span>
            </div>
          </div>
        </div>

        <div className="about__skills">
          <div className="about__skill-row" data-reveal="group">
            <h2 className="about__skill-label">software</h2>
            <Marquee items={software} />
          </div>

          <div className="about__skill-row" data-reveal="group">
            <h2 className="about__skill-label">programming languages</h2>
            <Marquee items={code} />
          </div>
        </div>
      </header>

      <section className="home__projects" id="projects" aria-labelledby="projects-title">
        <h1 className="home__title" id="projects-title" ref={titleRef} aria-label={TITLE}>
          {TITLE}
        </h1>
        <ProjectShowcase />
      </section>
    </main>
  );
}
