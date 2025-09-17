import { useState } from "react";
import "./ScrapPage.css";

/** API adresas */
const API_ROOT =
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) ||
    "http://localhost:2500";
const API_BASE = `${String(API_ROOT).replace(/\/+$/, "")}/api/scrape`;

/** PADĖK TIK URL'US ar data: – be įkėlimų */
const CATEGORIES = [
    { slug: "arcade",    name: "Arcade",    url: "https://en.uptodown.com/android/arcade",    img: "https://picsum.photos/seed/arcade/320/200" },
    { slug: "action-",    name: "Action",    url: "https://en.uptodown.com/android/action",    img: "https://picsum.photos/seed/action/320/200" },
    { slug: "rpg",       name: "RPG",       url: "https://en.uptodown.com/android/rpg",       img: "https://picsum.photos/seed/rpg/320/200" },
    { slug: "strategy",  name: "Strategy",  url: "https://en.uptodown.com/android/strategy",  img: "https://picsum.photos/seed/strategy/320/200" },
    { slug: "sports",    name: "Sports",    url: "https://en.uptodown.com/android/sports",    img: "https://picsum.photos/seed/sports/320/200" },
    { slug: "puzzle",    name: "Puzzle",    url: "https://en.uptodown.com/android/puzzle",    img: "https://picsum.photos/seed/puzzle/320/200" }
];

/* --- helperiai, kad nerodytų teksto vietoj paveiksliuko --- */
const norm = (v) => (typeof v === "string" ? v.trim() : "");
const isImageLike = (v) => /^data:image\/|^https?:\/\/|^\//i.test(norm(v));

export default function ScrapPage() {
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);

    const openOriginal = (url) => { if (url) window.open(url, "_blank", "noopener"); };

    const fetchCategory = async (entry) => {
        setSelected(entry.slug);
        setStatus("loading");
        setError("");
        setItems([]);

        // jei duotas pilnas URL – siunčiam ?url=..., kitaip ?category=...
        const param = entry.url
            ? `url=${encodeURIComponent(entry.url)}`
            : `category=${encodeURIComponent(entry.slug)}`;
        const url = `${API_BASE}/android?${param}`;

        try {
            const res = await fetch(url);
            const ct = (res.headers.get("content-type") || "").toLowerCase();
            const text = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0,160)}`);
            if (!ct.includes("application/json")) throw new Error(`Non-JSON response: ${text.slice(0,160)}`);

            const data = JSON.parse(text);
            const list = Array.isArray(data) ? data : (data.items || []);
            setItems(list);
            setStatus("success");
        } catch (e) {
            setStatus("error");
            setError(e.message || "Failed");
        }
    };

    return (
        <main className="page scrap">
            <h1>Android Games</h1>

            {/* Kategorijų kortelės */}
            <section className="tiles-row">
                {CATEGORIES.map((c) => {
                    const src = norm(c.img);
                    const showImg = isImageLike(src);
                    return (
                        <article
                            key={c.slug}
                            className={`tile tile--category${selected === c.slug ? " is-active" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => fetchCategory(c)}
                            onKeyDown={(e) => e.key === "Enter" && fetchCategory(c)}
                            title={c.name}
                            aria-label={`Open ${c.name}`}
                        >
                            <div className="tile-thumb">
                                {showImg ? <img src={src} alt={c.name} /> : <span>{src || c.name}</span>}
                            </div>
                            <div className="tile-title">{c.name}</div>
                        </article>
                    );
                })}
            </section>

            {/* Būsenos */}
            {status === "idle" && <p className="muted">Pasirink kategoriją.</p>}
            {status === "loading" && <p className="muted">Loading…</p>}
            {status === "error" && <p className="error">Failed: {error}</p>}

            {/* Rezultatai */}
            {status === "success" && (
                <section className="tiles-grid">
                    {items.length === 0 && <p className="muted">Rezultatų nėra.</p>}
                    {items.map((g) => (
                        <article
                            key={g.originalUrl || g.title}
                            className="tile tile--game"
                            onClick={() => openOriginal(g.originalUrl)}
                            role="link"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === "Enter" && openOriginal(g.originalUrl)}
                            title={g.title || "Open game"}
                        >
                            <div className="tile-thumb">
                                {isImageLike(g.image) ? <img src={norm(g.image)} alt={g.title || "game"} loading="lazy" /> : <span>no image</span>}
                            </div>
                            <div className="tile-title">{g.title || "Untitled"}</div>
                            {g.description && <p className="muted" style={{ margin: 0 }}>{g.description}</p>}
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}
