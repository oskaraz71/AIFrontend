import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function RegisterPage() {
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    async function onSubmit(e) {
        e.preventDefault();
        try {
            await register(form);
            navigate("/profile");
        } catch (e2) {
            alert(e2.message);
        }
    }

    const field = { display: "grid", gap: 6, marginBottom: 12 };
    const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #d3dae6", font: "inherit" };

    return (
        <section>
            <h1 className="page-title">Register</h1>
            <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
                <div style={field}><label>Name</label><input style={input} value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
                <div style={field}><label>Email</label><input style={input} value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></div>
                <div style={field}><label>Password</label><input type="password" style={input} value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /></div>
                <button className="btn btn-primary" disabled={loading} type="submit">{loading ? "..." : "Create account"}</button>
            </form>
        </section>
    );
}
