import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

/** util: atpažįstam paveikslėlio URL (http/https arba data:image/...) */
const isImgLike = (v) => typeof v === "string" && /^(https?:\/\/|data:image\/)/i.test((v || "").trim());

/** util: paimti pirmą apibrėžtą reikšmę iš kelių kelių */
const first = (obj, keys = [], fallback = "") => {
    for (const k of keys) {
        const v = obj?.[k];
        if (v !== undefined && v !== null && v !== "") return v;
    }
    return fallback;
};

export default function ProfilePage() {
    const { user, updateProfile, updateUser } = useAuth?.() || {};
    const [form, setForm] = useState({
        name: "",
        username: "",
        city: "",
        phone: "",
        avatar: "",
        balance: 0,
    });
    const [status, setStatus] = useState("idle"); // idle|saving|success|error
    const [error, setError] = useState("");
    const [showRaw, setShowRaw] = useState(false);

    // --- DEBUG LOGS ---
    useEffect(() => {
        console.log("[ProfilePage] mount");
        return () => console.log("[ProfilePage] unmount");
    }, []);
    useEffect(() => {
        console.log("[ProfilePage] user from context:", user);
    }, [user]);

    // Užpildom formą iš konteksto (remiamės SENIAIS DB laukais, bet turim ir fallbackus)
    useEffect(() => {
        if (!user) return;
        const initial = {
            name: user.name || "",
            username: first(user, ["userName", "username"], ""),
            city: user.city || "",
            phone: user.phone || "",
            avatar: first(user, ["avatar_url", "avatar"], ""),
            balance: Number(first(user, ["money", "balance"], 0)) || 0,
        };
        setForm(initial);
        console.log("[ProfilePage] initial form:", initial);
    }, [user]);

    const displayName = useMemo(
        () =>
            form.name ||
            form.username ||
            user?.name ||
            user?.userName ||
            user?.username ||
            "User",
        [form.name, form.username, user]
    );

    const previewSrc = isImgLike(form.avatar)
        ? form.avatar.trim()
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            displayName
        )}&background=E5E7EB&color=111827&size=256&bold=true`;

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({
            ...s,
            [name]: name === "balance" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const onSave = async (e) => {
        e.preventDefault();
        setStatus("saving");
        setError("");

        // FE patch – backendas mapins į SENUS DB laukus (userName, avatar_url, money, city, phone)
        const patch = {
            name: form.name,
            username: form.username,
            city: form.city,
            phone: form.phone,
            avatar: form.avatar,
            balance: Number(form.balance || 0),
        };
        console.log("[ProfilePage] SAVE patch:", patch);

        try {
            const fn = updateProfile || updateUser;
            if (!fn) {
                console.warn("[ProfilePage] No updateProfile/updateUser in AuthProvider — skip save");
                setStatus("success");
                setTimeout(() => setStatus("idle"), 1000);
                return;
            }
            const updated = await fn(patch);
            console.log("[ProfilePage] SAVE result:", updated);
            setStatus("success");
            setTimeout(() => setStatus("idle"), 1200);
        } catch (err) {
            console.error("[ProfilePage] SAVE error:", err);
            setError(err?.message || "Save failed");
            setStatus("error");
        }
    };

    if (!user) {
        return (
            <main className="page profile">
                <h1>My Profile</h1>
                <p className="muted">Neprisijungta.</p>
            </main>
        );
    }

    // Papildoma informacija (rodom kuo daugiau laukų – tik skaitymui)
    const info = [
        ["ID", String(user.id || user._id || "")],
        ["Email", user.email || ""],
        ["Name", user.name || ""],
        ["Username (DB userName)", user.userName || ""],
        ["Username (FE username)", user.username || ""],
        ["City", user.city || ""],
        ["Phone", user.phone || ""],
        ["Avatar (DB avatar_url)", user.avatar_url || ""],
        ["Avatar (FE avatar)", user.avatar || ""],
        ["Money (DB money)", user.money ?? ""],
        ["Balance (FE balance)", user.balance ?? ""],
        ["CreatedAt", user.createdAt || user.created_at || ""],
        ["UpdatedAt", user.updatedAt || user.updated_at || ""],
    ];

    // paprastas „dirty“ skaičiavimas
    const dirty =
        (user?.name || "") !== form.name ||
        first(user, ["userName", "username"], "") !== form.username ||
        (user?.city || "") !== form.city ||
        (user?.phone || "") !== form.phone ||
        first(user, ["avatar_url", "avatar"], "") !== form.avatar ||
        Number(first(user, ["money", "balance"], 0) || 0) !== Number(form.balance || 0);

    return (
        <main className="page profile">
            <h1>My Profile</h1>

            {/* Minimalus layout (inline), kad nepaveiktų bendrų stilių */}
            <div
                className="profile-layout"
                style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 300px", gap: 16 }}
            >
                {/* Forma */}
                <form onSubmit={onSave} style={{ display: "grid", gap: 12 }}>
                    <div>
                        <label className="label">Name</label>
                        <input name="name" value={form.name} onChange={onChange} placeholder="Vardas" />
                    </div>

                    <div>
                        <label className="label">Username</label>
                        <input name="username" value={form.username} onChange={onChange} placeholder="Slapyvardis" />
                    </div>

                    <div>
                        <label className="label">City</label>
                        <input name="city" value={form.city} onChange={onChange} placeholder="Miestas" />
                    </div>

                    <div>
                        <label className="label">Phone</label>
                        <input name="phone" value={form.phone} onChange={onChange} placeholder="+370..." />
                    </div>

                    <div>
                        <label className="label">Avatar URL</label>
                        <input
                            name="avatar"
                            value={form.avatar}
                            onChange={onChange}
                            placeholder="https:// arba data:image/..."
                        />
                    </div>

                    <div>
                        <label className="label">Balance (€)</label>
                        <input
                            type="number"
                            name="balance"
                            value={form.balance}
                            onChange={onChange}
                            min={0}
                            step={1}
                        />
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button className="btn primary" type="submit" disabled={status === "saving" || !dirty}>
                            {status === "saving" ? "Saving..." : "Save changes"}
                        </button>
                        {!dirty && <span className="muted">Nėra pakeitimų</span>}
                        {status === "error" && <span className="error" style={{ color: "#b91c1c" }}>{error}</span>}
                        {status === "success" && <span className="success" style={{ color: "#166534" }}>Saved</span>}
                    </div>

                    {/* Info lentelė */}
                    <div style={{ marginTop: 8 }}>
                        <h3 style={{ margin: "12px 0 8px" }}>User info</h3>
                        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
                            {info.map(([k, v]) => (
                                <div
                                    key={k}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "180px 1fr",
                                        padding: "4px 0",
                                        borderBottom: "1px dashed #eee",
                                    }}
                                >
                                    <div style={{ fontWeight: 600 }}>{k}</div>
                                    <div style={{ wordBreak: "break-word" }}>{String(v ?? "")}</div>
                                </div>
                            ))}
                            <div style={{ paddingTop: 8 }}>
                                <button
                                    type="button"
                                    className="btn"
                                    onClick={() => setShowRaw((s) => !s)}
                                >
                                    {showRaw ? "Hide raw JSON" : "Show raw JSON"}
                                </button>
                                {showRaw && (
                                    <pre
                                        style={{
                                            marginTop: 8,
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                            fontSize: 12,
                                            background: "#f9fafb",
                                            padding: 8,
                                            borderRadius: 8,
                                        }}
                                    >
                    {JSON.stringify(user, null, 2)}
                  </pre>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Avatar preview */}
                <aside
                    style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 12,
                        background: "#fff",
                        alignSelf: "start",
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            background: "#f3f4f6",
                            borderRadius: 12,
                            overflow: "hidden",
                            display: "grid",
                            placeItems: "center",
                        }}
                    >
                        <img
                            key={previewSrc}
                            src={previewSrc}
                            alt={`${displayName} avatar`}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            onError={(e) => {
                                console.warn("[ProfilePage] avatar preview error, switching to initials");
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    displayName
                                )}&background=F3F4F6&color=111827&size=256`;
                            }}
                        />
                    </div>
                    <div style={{ marginTop: 8 }}>
                        <div style={{ fontWeight: 600 }}>{displayName}</div>
                        {isImgLike(form.avatar) ? (
                            <a
                                href={form.avatar}
                                target="_blank"
                                rel="noreferrer"
                                className="muted"
                                style={{ fontSize: 12 }}
                            >
                                Open avatar image
                            </a>
                        ) : (
                            <div className="muted" style={{ fontSize: 12 }}>
                                Peržiūra pagal įvestą URL arba sugeneruotus inicialus
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </main>
    );
}
