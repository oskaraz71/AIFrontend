import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import "./Toolbar.css";

export default function Toolbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const displayName = useMemo(
        () => user?.username || user?.name || user?.email || "User",
        [user]
    );
    const isAdmin = !!user?.isAdmin || (user?.roles || []).includes("admin");
    const avatarLetter = (displayName || "?").charAt(0).toUpperCase();

    const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");
    const closeMenu = () => setOpen(false);

    const onLogout = () => {
        logout();
        setOpen(false);
        navigate("/");
    };

    return (
        <header className="toolbar">
            <div className="toolbar-inner">
                <NavLink to="/" className="brand" onClick={closeMenu}>
                    <span className="brand-dot" />
                    <span className="brand-name">Project with AI</span>
                </NavLink>

                {/* Desktop kairė */}
                <nav className="nav-left" aria-label="Primary">
                    <NavLink to="/" className={linkClass} end>Home</NavLink>
                    {/* Pakeista: Gemini AI -> AI Game */}
                    <NavLink to="/ai-game" className={linkClass}>AI Game</NavLink>
                    <NavLink to="/generator" className={linkClass}>AI Site Generator</NavLink>
                    <NavLink to="/agents" className={linkClass}>AI chat</NavLink>
                    <NavLink to="/scrap" className={linkClass}>Scrap</NavLink>
                    <NavLink to="/puppeteer" className={linkClass}>Puppeteer</NavLink>
                    {isAdmin && <NavLink to="/admin/users" className={linkClass}>Admin</NavLink>}
                </nav>

                {/* Desktop dešinė */}
                <div className="nav-right">
                    {!user ? (
                        <>
                            <NavLink to="/login" className={linkClass}>Login</NavLink>
                            <NavLink to="/register" className={linkClass}>Register</NavLink>
                        </>
                    ) : (
                        <>
                            <NavLink to="/profile" className="nav-link profile-chip">
                                <span className="avatar" aria-hidden>{avatarLetter}</span>
                                <span className="username">{displayName}</span>
                            </NavLink>
                            <button className="btn logout" onClick={onLogout}>Logout</button>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    className="menu-toggle"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    onClick={() => setOpen(v => !v)}
                >
                    {open ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                            <path d="M18 6L6 18M6 6l12 12" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                            <path d="M3 6h18M3 12h18M3 18h18" stroke="#334155" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile drawer */}
            <div
                className={`mobile-drawer ${open ? "open" : ""}`}
                onClick={(e) => {
                    if (e.target.classList.contains("mobile-drawer")) closeMenu();
                }}
            >
                <div className="mobile-inner" role="dialog" aria-modal="true" aria-label="Mobile Menu">
                    <div className="mobile-group">
                        <NavLink to="/" className={linkClass} end onClick={closeMenu}>Home</NavLink>
                        {/* Pakeista: Gemini AI -> AI Game */}
                        <NavLink to="/ai-game" className={linkClass} onClick={closeMenu}>AI Game</NavLink>
                        <NavLink to="/generator" className={linkClass} onClick={closeMenu}>AI Site Generator</NavLink>
                        <NavLink to="/agents" className={linkClass} onClick={closeMenu}>AI chat</NavLink>
                        <NavLink to="/scrap" className={linkClass} onClick={closeMenu}>Scrap</NavLink>
                        <NavLink to="/puppeteer" className={linkClass} onClick={closeMenu}>Puppeteer</NavLink>
                        {isAdmin && (
                            <NavLink to="/admin/users" className={linkClass} onClick={closeMenu}>Admin</NavLink>
                        )}
                    </div>

                    <div className="mobile-group">
                        {!user ? (
                            <>
                                <NavLink to="/login" className={linkClass} onClick={closeMenu}>Login</NavLink>
                                <NavLink to="/register" className={linkClass} onClick={closeMenu}>Register</NavLink>
                            </>
                        ) : (
                            <>
                                <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                                    <span className="avatar" style={{ marginRight: 8 }} aria-hidden>{avatarLetter}</span>
                                    {displayName}
                                </NavLink>
                                <button className="btn logout" onClick={onLogout}>Logout</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
