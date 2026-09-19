import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { gsap, ScrollTrigger } from "../lib/gsap";
import Navigation from "./Navigation";

export default function Layout() {
  const location = useLocation();
  const onHome = location.pathname === "/";
  const [emailHovered, setEmailHovered] = useState(false);
  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pageRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx;
    const onPreloaderDone = () => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".nav__back, .nav__name, .nav__center, .nav__right a",
          { yPercent: -140, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.06,
          }
        );
      }, pageRef);
      ScrollTrigger.refresh();
    };

    window.addEventListener("preloader:done", onPreloaderDone, { once: true });
    return () => {
      window.removeEventListener("preloader:done", onPreloaderDone);
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();
    const refresh = () => ScrollTrigger.refresh();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.utils.toArray("[data-reveal]").forEach((el) => gsap.set(el, { clearProps: "all" }));
      gsap.utils
        .toArray("[data-reveal='group']")
        .forEach((el) => gsap.set(el.children, { clearProps: "all" }));
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const reveals = gsap.utils.toArray("[data-reveal]");
      reveals.forEach((el) => {
        const targets =
          el.dataset.reveal === "group" ? gsap.utils.toArray(el.children) : [el];
        gsap.set(targets, { autoAlpha: 0, y: 40 });
        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
      return () => {
        gsap.utils
          .toArray("[data-reveal]")
          .forEach((el) => gsap.set(el, { clearProps: "autoAlpha,transform,opacity,visibility" }));
      };
    });

    const t = window.setTimeout(refresh, 400);
    window.addEventListener("load", refresh, { once: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [location.pathname]);

  return (
    <div className="page" ref={pageRef}>
      <Navigation />
      <Outlet />
      <footer
        className={`home__footer${onHome ? " home__footer--fixed" : ""}`}
      >
        <a
          className="home__footer__link"
          href="https://www.linkedin.com/in/jan-rymarski-5ba212327/"
          target="_blank"
          rel="noopener noreferrer"
        >
          linkedin
        </a>
        <a
          className="home__footer__link home__footer__email"
          href="mailto:janrymarski90@gmail.com"
          onMouseEnter={canHover ? () => setEmailHovered(true) : undefined}
          onMouseLeave={canHover ? () => setEmailHovered(false) : undefined}
          onFocus={canHover ? () => setEmailHovered(true) : undefined}
          onBlur={canHover ? () => setEmailHovered(false) : undefined}
        >
          {canHover ? (
            <>
              <span className="home__footer__email__measure" aria-hidden="true">
                janrymarski90@gmail.com
              </span>
              <span className="home__footer__email__label">
                {emailHovered ? "janrymarski90@gmail.com" : "email"}
              </span>
            </>
          ) : (
            "email"
          )}
        </a>
        <a
          className="home__footer__link"
          href="https://github.com/JanRymarski"
          target="_blank"
          rel="noopener noreferrer"
        >
          github
        </a>
        <a
          className="home__footer__link"
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          instagram
        </a>
      </footer>
    </div>
  );
}