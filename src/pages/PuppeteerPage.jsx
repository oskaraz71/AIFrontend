import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

/** API bazė */
const API_ROOT =
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) ||
    process.env.REACT_APP_API_BASE ||
    "http://localhost:2500";
const API = (p) => `${String(API_ROOT).replace(/\/+$/, "")}${p.startsWith("/") ? p : `/${p}`}`;

/** Pagalbiniai */
const kb = (bytes) => (bytes ? Math.round(bytes / 1024) : 0);

export default function PuppeteerPage() {
    const { token, user } = useAuth?.() || {};
    const authed = !!token;

    const [query, setQuery] = useState("children books");
    const [count, setCount] = useState(5);
    const [download, setDownload] = useState(false);

    const [running, setRunning] = useState(false);
    const [error, setError] = useState("");

    const [items, setItems] = useState([]);    // paieškos rezultatai
    const [files, setFiles] = useState([]);    // /api/books sąrašas
    const [booksError, setBooksError] = useState("");

    const authHeaders = useMemo(
        () => (authed ? { Authorization: `Bearer ${token}` } : {}),
        [authed, token]
    );

    // ---- Parsisiųstų failų sąrašas ----
    const loadBooks = async () => {
        try {
            setBooksError("");
            if (!authed) {
                setFiles([]);
                setBooksError("Please login to see downloaded books.");
                console.warn("[PuppeteerPage] /api/books skipped: not authenticated");
                return;
            }
            const res = await fetch(API("/api/books"), { headers: { ...authHeaders } });
            const text = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`);
            const data = text ? JSON.parse(text) : {};
            console.log("[PuppeteerPage] /api/books ->", data);
            setFiles(Array.isArray(data.files) ? data.files : []);
        } catch (e) {
            console.warn("[PuppeteerPage] /api/books failed:", e.message);
            setFiles([]);
            setBooksError(e.message);
        }
    };

    useEffect(() => {
        loadBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authed]);

    const runSearch = async () => {
        setRunning(true);
        setError("");
        setItems([]);
        try {
            if (!authed) {
                setError("Please login to run search.");
                console.warn("[PuppeteerPage] RUN blocked: not authenticated");
                return;
            }
            console.log("[PuppeteerPage] RUN", { query, count, download });

            const res = await fetch(API("/api/puppeteer/search"), {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders },
                body: JSON.stringify({ query, limit: Number(count || 5), download: !!download }),
            });

            const text = await res.text();
            if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`);
            const data = text ? JSON.parse(text) : {};
            console.log("[PuppeteerPage] /api/puppeteer/search ->", data);

            const list = Array.isArray(data.items) ? data.items : [];
            setItems(list);

            if (download) {
                await loadBooks();
            }
        } catch (e) {
            console.error("[PuppeteerPage] RUN error:", e);
            setError(e.message || "Search failed");
        } finally {
            setRunning(false);
        }
    };

    return (
        <main className="page puppeteer" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
            {/* Kairė: rezultatai */}
            <section>
                <h1>Puppeteer · Project Gutenberg</h1>
                {!authed && (
                    <p className="muted" style={{ color: "#6b7280" }}>
                        You must be logged in to run searches and view downloaded files.
                    </p>
                )}
                {error && <p className="error" style={{ color: "#b91c1c" }}>Error: {error}</p>}
                {!error && items.length === 0 && <p className="muted">Rezultatų nėra. Įvesk paiešką ir spausk <b>Run</b>.</p>}

                <div className="tiles-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 12 }}>
                    {items.map((it, idx) => {
                        const title = it.title || `Book #${idx + 1}`;
                        const format = it.format || (it.fileUrl?.split(".").pop() || "").toUpperCase();
                        const sizeKb = kb(it.size);
                        const canRead = !!it.localUrl; // „Read/Preview“ tik jei failas parsisiųstas

                        return (
                            <article key={it.pageUrl || it.fileUrl || title + idx} className="tile tile--book"
                                     style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                                <div className="tile-thumb" style={{ background: "#f3f4f6", aspectRatio: "4/3", display: "grid", placeItems: "center" }}>
                                    {it.thumb ? (
                                        <img src={it.thumb} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <span style={{ color: "#6b7280" }}>no cover</span>
                                    )}
                                </div>
                                <div className="tile-body" style={{ padding: 10 }}>
                                    <div className="tile-title" style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div>
                                    <div className="muted" style={{ fontSize: 12, display: "flex", gap: 8 }}>
                                        <span>{format || "—"}</span>
                                        <span>•</span>
                                        <span>{sizeKb ? `${sizeKb} KB` : "size: —"}</span>
                                    </div>

                                    <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                                        {it.pageUrl && (
                                            <a href={it.pageUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 10px" }}>
                                                Original
                                            </a>
                                        )}
                                        {canRead && (
                                            <a href={it.localUrl} target="_blank" rel="noopener noreferrer" className="btn primary"
                                               style={{ background: "#2563eb", color: "#fff", borderRadius: 8, padding: "6px 10px" }}>
                                                Read / Preview
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* Dešinė: valdymas */}
            <aside style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fff", height: "fit-content" }}>
                <h2 style={{ marginTop: 0 }}>Control</h2>

                <label className="field" style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                    <span className="label">Search query</span>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="children books" />
                </label>

                <label className="field" style={{ display: "grid", gap: 6, marginBottom: 10 }}>
                    <span className="label">Count</span>
                    <input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value || 5))} />
                </label>

                <label className="field" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <input type="checkbox" checked={download} onChange={(e) => setDownload(e.target.checked)} />
                    <span>Download files to server</span>
                </label>

                <button
                    className="btn primary"
                    onClick={runSearch}
                    disabled={running || !authed}
                    style={{ background: "#2563eb", color: "#fff", borderRadius: 10, padding: "8px 12px" }}
                >
                    {running ? "Running…" : "Run"}
                </button>

                <hr style={{ margin: "16px 0" }} />

                <div>
                    <h3 style={{ marginTop: 0 }}>Downloaded files</h3>
                    {booksError && (
                        <p className="muted" style={{ color: "#6b7280" }}>
                            {booksError}
                        </p>
                    )}
                    {!booksError && files.length === 0 && (
                        <p className="muted">Nothing downloaded yet.</p>
                    )}
                    <ul style={{ paddingLeft: 16 }}>
                        {files.map((f) => (
                            <li key={f.url || f.name}>
                                <a href={API(f.url || `/books/${encodeURIComponent(f.name)}`)} target="_blank" rel="noreferrer">
                                    {f.name} {f.size ? `(${kb(f.size)} KB)` : ""}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        </main>
    );
}

