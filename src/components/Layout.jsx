import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { gsap, ScrollTrigger } from "../lib/gsap";
import Navigation from "./Navigation";
import BackgroundField from "./BackgroundField";

function resetScrollToTop() {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  window.requestAnimationFrame(() => {
    root.style.scrollBehavior = previousScrollBehavior;
  });
}

export default function Layout() {
  const location = useLocation();
  const onHome = location.pathname === "/";
  const [emailHovered, setEmailHovered] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);
  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    setShowTopButton(false);
    if (onHome) return;
    resetScrollToTop();
  }, [location.pathname, onHome]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    if (onHome) return;
    const frame = window.requestAnimationFrame(resetScrollToTop);
    const timer = window.setTimeout(resetScrollToTop, 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [location.pathname, onHome]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setShowTopButton(window.scrollY > 400);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

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

  const scrollToTop = () => {
    resetScrollToTop();
    setShowTopButton(false);
  };

  return (
    <div className="page" ref={pageRef}>
      <BackgroundField />
      <Navigation />
      <div className="page__content">
        <Outlet />
      </div>
      {!onHome && (
        <footer className="home__footer">
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
            href="./JanRymarski_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            cv
          </a>
        </footer>
      )}
      <button
        type="button"
        className={`back-to-top${showTopButton ? " back-to-top--visible" : ""}`}
        aria-label="back to top"
        onClick={scrollToTop}
      >
        <span className="back-to-top__icon" aria-hidden="true">
          &#8593;
        </span>
        <span>top</span>
      </button>
    </div>
  );
}
