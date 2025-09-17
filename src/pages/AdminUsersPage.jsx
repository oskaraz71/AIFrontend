import { useEffect, useMemo, useState } from "react";
import AdminAPI from "../api/admin";
import { useAuth } from "../auth/AuthProvider";
import "./AdminUsersPage.css";

export default function AdminUsersPage() {
    const { user } = useAuth();
    const isAdmin = !!user?.isAdmin;
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");

    const filtered = useMemo(() => {
        const f = filter.trim().toLowerCase();
        if (!f) return users;
        return users.filter(u =>
            [u.email, u.name, u.username]
                .filter(Boolean)
                .some(v => v.toLowerCase().includes(f))
        );
    }, [users, filter]);

    async function load() {
        try {
            setLoading(true);
            setError("");
            const res = await AdminAPI.listUsers();
            setUsers(res.users || []);
            console.log("[AdminUsers] loaded", res.users?.length);
        } catch (e) {
            console.error("[AdminUsers] load error", e);
            setError(e.message || "Load error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isAdmin) load();
    }, [isAdmin]);

    if (!isAdmin) {
        return (
            <div className="admin-wrap">
                <h2>Admin</h2>
                <div className="alert">No access. Administrator only.</div>
            </div>
        );
    }

    const onFieldChange = (id, field, value) => {
        setUsers(prev =>
            prev.map(u => (u.id === id ? { ...u, [field]: value } : u))
        );
    };

    const onExtraChange = (id, key, value) => {
        setUsers(prev =>
            prev.map(u =>
                u.id === id ? { ...u, extras: { ...(u.extras || {}), [key]: value } } : u
            )
        );
    };

    const onExtraRemove = (id, key) => {
        setUsers(prev =>
            prev.map(u => {
                if (u.id !== id) return u;
                const ex = { ...(u.extras || {}) };
                delete ex[key];
                return { ...u, extras: ex };
            })
        );
    };

    const onExtraAdd = (id) => {
        const key = prompt("New field key (e.g. phone, level, notes):");
        if (!key) return;
        setUsers(prev =>
            prev.map(u =>
                u.id === id
                    ? { ...u, extras: { ...(u.extras || {}), [key]: "" } }
                    : u
            )
        );
    };

    const saveUser = async (u) => {
        const patch = {
            name: u.name ?? "",
            username: u.username ?? "",
            avatar: u.avatar ?? "",
            isAdmin: !!u.isAdmin,
            balance: Number(u.balance || 0),
            extras: u.extras || {},
            purchases: u.purchases || [],
        };
        try {
            console.log("[AdminUsers] save", u.id, patch);
            const res = await AdminAPI.updateUser(u.id, patch);
            // sync su reikšmėm iš serverio
            setUsers(prev => prev.map(x => (x.id === u.id ? res.user : x)));
        } catch (e) {
            console.error("[AdminUsers] save error", e);
            alert("Save failed: " + e.message);
        }
    };

    const delUser = async (u) => {
        if (!window.confirm(`Delete user ${u.email}?`)) return;
        try {
            await AdminAPI.deleteUser(u.id);
            setUsers(prev => prev.filter(x => x.id !== u.id));
        } catch (e) {
            console.error("[AdminUsers] delete error", e);
            alert("Delete failed: " + e.message);
        }
    };

    return (
        <div className="admin-wrap">
            <header className="admin-head">
                <h2>Users</h2>
                <div className="tools">
                    <input
                        className="filter"
                        placeholder="Search by email, name, username…"
                        value={filter}
                        onChange={(e)=>setFilter(e.target.value)}
                    />
                    <button className="btn" onClick={load} disabled={loading}>
                        {loading ? "Loading…" : "Reload"}
                    </button>
                </div>
            </header>

            {error && <div className="alert">{error}</div>}

            <div className="users-grid">
                {filtered.map(u => (
                    <div className="user-card" key={u.id}>
                        <div className="row between">
                            <div className="email">{u.email}</div>
                            <span className={"badge " + (u.isAdmin ? "admin" : "user")}>
                {u.isAdmin ? "admin" : "user"}
              </span>
                        </div>

                        <div className="row">
                            <label>Name</label>
                            <input value={u.name || ""} onChange={e=>onFieldChange(u.id, "name", e.target.value)} />
                        </div>

                        <div className="row">
                            <label>Username</label>
                            <input value={u.username || ""} onChange={e=>onFieldChange(u.id, "username", e.target.value)} />
                        </div>

                        <div className="row">
                            <label>Balance</label>
                            <input type="number" step="0.01" value={u.balance || 0} onChange={e=>onFieldChange(u.id, "balance", e.target.value)} />
                        </div>

                        <div className="row">
                            <label>Role</label>
                            <label className="chk">
                                <input type="checkbox" checked={!!u.isAdmin} onChange={e=>onFieldChange(u.id, "isAdmin", e.target.checked)} />
                                <span>Is Admin</span>
                            </label>
                        </div>

                        <div className="row">
                            <label>Extras</label>
                            <div className="extras">
                                {Object.entries(u.extras || {}).map(([k,v]) => (
                                    <div className="kv" key={k}>
                                        <input className="k" value={k} readOnly />
                                        <input className="v" value={v ?? ""} onChange={e=>onExtraChange(u.id, k, e.target.value)} />
                                        <button className="icon danger" title="Remove" onClick={()=>onExtraRemove(u.id, k)}>×</button>
                                    </div>
                                ))}
                                <button className="btn small" onClick={()=>onExtraAdd(u.id)}>+ add field</button>
                            </div>
                        </div>

                        <div className="row meta">
                            <div>Created: {u.createdAt ? new Date(u.createdAt).toLocaleString("lt-LT", { timeZone: "Europe/Vilnius" }) : "-"}</div>
                            <div>Updated: {u.updatedAt ? new Date(u.updatedAt).toLocaleString("lt-LT", { timeZone: "Europe/Vilnius" }) : "-"}</div>
                            <div>Purchases: {Array.isArray(u.purchases) ? u.purchases.length : 0}</div>
                        </div>

                        <div className="actions">
                            <button className="btn primary" onClick={()=>saveUser(u)}>Save</button>
                            <button className="btn danger" onClick={()=>delUser(u)}>Delete</button>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && !loading && (
                    <div className="empty">No users found.</div>
                )}
            </div>
        </div>
    );
}
