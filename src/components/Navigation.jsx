import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  const jumpToSection = (event, id) => {
    event.preventDefault();
    close();

    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    if (location.pathname === "/") {
      scroll();
      return;
    }

    navigate("/");
    window.setTimeout(scroll, 0);
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="nav">
      {onHome ? (
        <Link to="/" className="nav__name" onClick={close}>
          Jan Rymarski
        </Link>
      ) : (
        <button
          type="button"
          className="nav__back"
          onClick={() => navigate(-1)}
        >
          <span aria-hidden="true" className="nav__back__arrow">
            &#8592;
          </span>
          go back
        </button>
      )}
      <Link to="/" className="nav__center" onClick={close}>
        portfolio
      </Link>
      <button
        type="button"
        className={`nav__menu-toggle${menuOpen ? " nav__menu-toggle--open" : ""}`}
        aria-label={menuOpen ? "close menu" : "open menu"}
        aria-expanded={menuOpen}
        aria-controls="nav-menu"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span className="nav__menu-toggle__line" aria-hidden="true" />
        <span className="nav__menu-toggle__line" aria-hidden="true" />
        <span className="nav__menu-toggle__line" aria-hidden="true" />
      </button>
      <div
        id="nav-menu"
        className={`nav__right${menuOpen ? " nav__right--open" : ""}`}
      >
        <Link to="/" onClick={(event) => jumpToSection(event, "projects")}>
          projects
        </Link>
        <Link to="/" onClick={(event) => jumpToSection(event, "about")}>
          about me
        </Link>
      </div>
    </nav>
  );
}
