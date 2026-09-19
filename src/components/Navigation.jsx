import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const onHome = location.pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <nav className="nav">
      {onHome ? (
        <Link to="/about" className="nav__name" onClick={close}>
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
        <Link to="/" onClick={close}>
          projects
        </Link>
        <Link to="/about" onClick={close}>
          about me
        </Link>
        <Link to="/contact" onClick={close}>
          contact
        </Link>
      </div>
    </nav>
  );
}