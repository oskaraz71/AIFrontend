import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function ProfilePage() {
    const { user, fetchMe, updateProfile, loading } = useAuth();
    const [form, setForm] = useState({ name: "", username: "", avatar: "", extras: {} });

    useEffect(() => {
        (async () => {
            const u = await fetchMe();
            if (u) setForm({ name: u.name || "", username: u.username || "", avatar: u.avatar || "", extras: u.extras || {} });
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onSave(e) {
        e.preventDefault();
        try {
            await updateProfile(form);
            alert("Saved");
        } catch (e2) {
            alert(e2.message);
        }
    }

    const field = { display: "grid", gap: 6, marginBottom: 12 };
    const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #d3dae6", font: "inherit" };

    return (
        <section>
            <h1 className="page-title">My Profile</h1>
            {!user ? <p>Please login.</p> : (
                <>
                    <div style={{ marginBottom: 12 }}>
                        <strong>{user.email}</strong> {user.isAdmin ? <span style={{ color: "#16a34a" }}> (admin)</span> : null}
                    </div>

                    <form onSubmit={onSave} style={{ maxWidth: 520 }}>
                        <div style={field}><label>Name</label><input style={input} value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
                        <div style={field}><label>Username</label><input style={input} value={form.username} onChange={e=>setForm({...form, username:e.target.value})} /></div>
                        <div style={field}><label>Avatar URL</label><input style={input} value={form.avatar} onChange={e=>setForm({...form, avatar:e.target.value})} /></div>
                        <button className="btn btn-primary" disabled={loading} type="submit">{loading ? "..." : "Save"}</button>
                    </form>
                </>
            )}
        </section>
    );
}
