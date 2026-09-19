import { useEffect, useState } from "react";

const MIN_DISPLAY = 800;

export default function Preloader() {
  const [phase, setPhase] = useState("ready");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    let loadHandler;

    const hide = () => {
      setPhase("leaving");
      window.setTimeout(() => {
        setPhase("done");
        window.dispatchEvent(new Event("preloader:done"));
      }, 600);
    };

    const minTimer = window.setTimeout(() => {
      if (document.readyState === "complete") {
        hide();
      } else {
        loadHandler = hide;
        window.addEventListener("load", loadHandler, { once: true });
      }
    }, MIN_DISPLAY);

    return () => {
      window.clearTimeout(minTimer);
      if (loadHandler) window.removeEventListener("load", loadHandler);
    };
  }, []);

  useEffect(() => {
    if (phase === "ready") return;
    document.body.style.overflow = "";
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div
      className={`preloader${phase === "leaving" ? " preloader--leaving" : ""}`}
      role="status"
      aria-label="loading portfolio"
    >
      <div className="preloader__inner">
        <span className="preloader__word" aria-hidden="true">
          portfolio
        </span>
        <div className="loader" aria-hidden="true" />
      </div>
    </div>
  );
}