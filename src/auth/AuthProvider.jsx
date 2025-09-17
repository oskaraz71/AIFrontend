import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:2500";
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [user, setUser]   = useState(() => {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        token ? localStorage.setItem("token", token) : localStorage.removeItem("token");
    }, [token]);
    useEffect(() => {
        user ? localStorage.setItem("user", JSON.stringify(user)) : localStorage.removeItem("user");
    }, [user]);

    async function api(path, opts = {}) {
        const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
        const text = await res.text();
        let data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (_) { data = {}; }
        if (!res.ok) {
            const msg = data?.message || text || `HTTP ${res.status}`;
            throw new Error(msg);
        }
        return data;
    }

    async function login(email, password) {
        setLoading(true);
        try {
            const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
            setToken(data.token);
            setUser(data.user);
            return data.user;
        } finally { setLoading(false); }
    }

    async function register(payload) {
        setLoading(true);
        try {
            const data = await api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
            setToken(data.token);
            setUser(data.user);
            return data.user;
        } finally { setLoading(false); }
    }

    async function fetchMe() {
        if (!token) return null;
        const data = await api("/api/auth/me");
        if (data?.user) setUser(data.user);
        return data?.user || null;
    }

    /**
     * Tvirtas profilios atnaujinimas:
     * - siunčia tik leidžiamus laukus
     * - bando kelis endpoint'us suderinamumui
     * - jei atsakyme nėra user, daro fetchMe()
     */
    async function updateProfile(patch) {
        const allowed = ["username", "name", "email", "phone", "avatar", "money"];
        const body = {};
        for (const k of allowed) if (patch?.[k] !== undefined) body[k] = patch[k];

        const attempts = [
            { method: "PUT",   path: "/api/auth/profile" },
            { method: "PATCH", path: "/api/auth/profile" },
            { method: "PATCH", path: "/api/auth/me" },
        ];

        const errors = [];
        for (const a of attempts) {
            try {
                const data = await api(a.path, { method: a.method, body: JSON.stringify(body) });
                const next = data?.user || (await fetchMe()) || { ...(user || {}), ...body };
                setUser(next);
                return next;
            } catch (e) {
                errors.push(`${a.method} ${a.path}: ${e.message}`);
            }
        }

        // niekas nesuveikė — nemetame tyliai, grąžinam aiškų klaidos tekstą
        throw new Error(`Profile update failed. Tried -> ${errors.join(" | ")}`);
    }

    // Alias dėl suderinamumo su komponentais
    async function updateUser(patch) {
        return updateProfile(patch);
    }

    function logout() { setToken(""); setUser(null); }

    const value = useMemo(() => ({
        token, user, loading,
        login, register, fetchMe,
        updateProfile, updateUser,
        logout
    }), [token, user, loading]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() { return useContext(AuthCtx); }
