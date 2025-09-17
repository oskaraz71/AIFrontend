import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function LoginPage() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        try {
            await login(email, password);
            navigate("/profile");
        } catch (e2) {
            alert(e2.message);
        }
    }

    const field = { display: "grid", gap: 6, marginBottom: 12 };
    const input = { padding: "10px 12px", borderRadius: 12, border: "1px solid #d3dae6", font: "inherit" };

    return (
        <section>
            <h1 className="page-title">Login</h1>
            <form onSubmit={onSubmit} style={{ maxWidth: 420 }}>
                <div style={field}><label>Email</label><input style={input} value={email} onChange={e=>setEmail(e.target.value)} /></div>
                <div style={field}><label>Password</label><input type="password" style={input} value={password} onChange={e=>setPassword(e.target.value)} /></div>
                <button className="btn btn-primary" disabled={loading} type="submit">{loading ? "..." : "Login"}</button>
            </form>
        </section>
    );
}
