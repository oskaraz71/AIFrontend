const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:2500";

function getToken() {
    // bandom iš context, bet turim „fallback“ į localStorage
    try {
        const raw = localStorage.getItem("auth");
        if (raw) {
            const obj = JSON.parse(raw);
            if (obj?.token) return obj.token;
        }
    } catch (_) {}
    return localStorage.getItem("token") || "";
}

async function authFetch(path, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: "Bearer " + token } : {}),
    };
    const res = await fetch(API_BASE + path, { ...options, headers });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
        const msg = (data && (data.message || data.error)) || res.statusText;
        throw new Error(`${res.status} ${msg}`);
    }
    return data;
}

export const AdminAPI = {
    listUsers() {
        console.log("[AdminAPI] listUsers");
        return authFetch("/api/auth/users");
    },
    updateUser(id, patch) {
        console.log("[AdminAPI] updateUser", id, patch);
        return authFetch(`/api/auth/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(patch),
        });
    },
    deleteUser(id) {
        console.log("[AdminAPI] deleteUser", id);
        return authFetch(`/api/auth/users/${id}`, { method: "DELETE" });
    },
};

export default AdminAPI;
