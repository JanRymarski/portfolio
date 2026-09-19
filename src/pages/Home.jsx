import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import ProjectShowcase from "../components/ProjectShowcase";

const TITLE = "explore my projects";

export default function Home() {
  const titleRef = useRef(null);

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
      <h1 className="home__title" ref={titleRef} aria-label={TITLE}>
        {TITLE}
      </h1>
      <ProjectShowcase />
    </main>
  );
}