import { useState } from "react";
import Marquee from "../components/Marquee";

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

export default function About() {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <main className="about">


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

          <p className="about__text" data-reveal>
            I&rsquo;m a visual design student from Belgium who likes making
            things that look good, feel interesting and actually do something.
          </p>

          <p className="about__text" data-reveal>
            My work lives somewhere between design, interaction and code. I
            enjoy turning ideas into interactive experiences — whether that
            means building a website, experimenting with creative coding,
            designing an installation or figuring out how to make an
            interaction feel just right.
          </p>

          <p className="about__text" data-reveal>
            I&rsquo;m naturally curious and probably spend too much time asking
            &ldquo;what if?&rdquo;.
          </p>

          <p className="about__text" data-reveal>
            I like experimenting, breaking things, starting over and learning
            something new along the way. I&rsquo;m less interested in following
            a formula and more interested in finding a solution that fits the
            idea. Design, code, interaction — I like mixing all three.
          </p>


          <a className="about__cv" href="./JanRymarski_CV.pdf" download data-reveal>
            download my cv
          </a>
        </div>
      </div>

      <div className="about__skills">
        <div className="about__skill-row" data-reveal="group">
          <h2 className="about__skill-label">software i&rsquo;m comfortable with</h2>
          <Marquee items={software} />
        </div>

        <div className="about__skill-row" data-reveal="group">
          <h2 className="about__skill-label">programming languages</h2>
          <Marquee items={code} />
        </div>
      </div>
    </main>
  );
}