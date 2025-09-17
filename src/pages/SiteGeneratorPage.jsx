import { useState } from "react";

const API_BASE =
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE)
        ? process.env.REACT_APP_API_BASE
        : "http://localhost:2500";

export default function SiteGeneratorPage() {
    const [topic, setTopic] = useState("animal shelter");
    const [brand, setBrand] = useState("Paw Haven");
    const [language, setLanguage] = useState("lt");
    const [primaryColor, setPrimaryColor] = useState("#2563eb");
    const [accentColor, setAccentColor] = useState("#16a34a");
    const [tone, setTone] = useState("friendly");
    const [sections, setSections] = useState(["hero","features","testimonials","faq"]);
    const [cta, setCta] = useState("Adopt now");
    const [contactEmail, setContactEmail] = useState("info@example.com");

    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);

    const toggleSection = (name) => {
        setSections((arr) =>
            arr.includes(name) ? arr.filter(s => s !== name) : [...arr, name]
        );
    };

    const generate = async () => {
        setLoading(true);
        setFiles([]);
        try {
            const body = {
                topic, brand, language, primaryColor, accentColor, tone, sections, cta, contactEmail
            };
            console.log("[Generator] body", body);

            const res = await fetch(`${API_BASE}/api/ai/generate-site`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok || !data?.success) throw new Error(data?.message || `HTTP ${res.status}`);
            setFiles(data.files || []);
        } catch (e) {
            alert("Generate failed: " + e.message);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fieldBox = { display: "grid", gap: 6, marginBottom: 12 };
    const labelCss = { fontSize: 12, fontWeight: 700, opacity: .7 };
    const inputCss = {
        padding: "10px 12px", borderRadius: 12, border: "1px solid #d3dae6",
        outline: "none", font: "inherit"
    };
    const btnCss = {
        padding: "10px 14px", borderRadius: 12, border: "1px solid #3b82f6",
        background: "linear-gradient(180deg, #4f8cff, #2f6ce9)", color: "#fff",
        fontWeight: 700, cursor: "pointer"
    };
    const checkboxRow = { display: "flex", flexWrap: "wrap", gap: 12 };

    return (
        <section>
            <h1 className="page-title">HTML Site Generator</h1>

            <div className="card" style={{ padding: 16, borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff", marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={fieldBox}>
                        <label style={labelCss}>Topic</label>
                        <input style={inputCss} value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="e.g., animal shelter" />
                    </div>

                    <div style={fieldBox}>
                        <label style={labelCss}>Brand name</label>
                        <input style={inputCss} value={brand} onChange={(e)=>setBrand(e.target.value)} placeholder="e.g., Paw Haven" />
                    </div>

                    <div style={fieldBox}>
                        <label style={labelCss}>Language</label>
                        <select style={inputCss} value={language} onChange={(e)=>setLanguage(e.target.value)}>
                            <option value="lt">Lithuanian (lt)</option>
                            <option value="en">English (en)</option>
                        </select>
                    </div>

                    <div style={fieldBox}>
                        <label style={labelCss}>Tone</label>
                        <select style={inputCss} value={tone} onChange={(e)=>setTone(e.target.value)}>
                            <option>friendly</option>
                            <option>professional</option>
                            <option>playful</option>
                            <option>minimal</option>
                        </select>
                    </div>

                    <div style={fieldBox}>
                        <label style={labelCss}>Primary color</label>
                        <input type="color" style={{ ...inputCss, padding: 4 }} value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} />
                    </div>

                    <div style={fieldBox}>
                        <label style={labelCss}>Accent color</label>
                        <input type="color" style={{ ...inputCss, padding: 4 }} value={accentColor} onChange={(e)=>setAccentColor(e.target.value)} />
                    </div>

                    <div style={fieldBox}>
                        <label style={labelCss}>Primary CTA</label>
                        <input style={inputCss} value={cta} onChange={(e)=>setCta(e.target.value)} placeholder="e.g., Adopt now" />
                    </div>

                    <div style={fieldBox}>
                        <label style={labelCss}>Contact email</label>
                        <input type="email" style={inputCss} value={contactEmail} onChange={(e)=>setContactEmail(e.target.value)} placeholder="info@example.com" />
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                    <div style={{ ...labelCss, marginBottom: 6 }}>Include sections</div>
                    <div style={checkboxRow}>
                        {["hero","features","testimonials","pricing","faq","gallery"].map(s => (
                            <label key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <input
                                    type="checkbox"
                                    checked={sections.includes(s)}
                                    onChange={()=>toggleSection(s)}
                                />
                                {s}
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ marginTop: 16 }}>
                    <button style={btnCss} onClick={generate} disabled={loading}>
                        {loading ? "Generating…" : "Generate pages"}
                    </button>
                </div>
            </div>

            {files?.length > 0 && (
                <div className="card" style={{ padding: 16, borderRadius: 16, border: "1px solid #e5e7eb", background: "#fff" }}>
                    <strong>Generated files</strong>
                    <ul>
                        {files.map(f => (
                            <li key={f.url}>
                                <a href={`${API_BASE}${f.url}`} target="_blank" rel="noreferrer">{f.name}.html</a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
