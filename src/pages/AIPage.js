import React, { useEffect, useRef, useState } from "react";
import "./AIPage.css";

const API_BASE =
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_BASE)
        ? process.env.REACT_APP_API_BASE
        : "http://localhost:2500";

export default function AIPage() {
    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState("");
    const [sending, setSending] = useState(false);
    const answersRef = useRef(null);

    useEffect(() => {
        if (answersRef.current) answersRef.current.scrollTop = answersRef.current.scrollHeight;
    }, [messages, sending]);

    const onSend = async () => {
        const q = question.trim();
        if (!q || sending) return;
        setMessages((arr) => [...arr, { role: "user", text: q }]);
        setQuestion("");
        setSending(true);
        try {
            const res = await fetch(`${API_BASE}/api/ai/ask`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question: q }),
            });
            if (!res.ok) {
                const t = await res.text().catch(() => "");
                setMessages((a) => [...a, { role: "assistant", text: `Server error (${res.status}) ${t||""}` }]);
                return;
            }
            const data = await res.json();
            setMessages((a) => [...a, { role: "assistant", text: data?.answer || "(no content)" }]);
        } catch {
            setMessages((a) => [...a, { role: "assistant", text: "Network error. Try again." }]);
        } finally { setSending(false); }
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
    };

    const disabled = !question.trim() || sending;

    return (
        <main className="page">
            {/* VISKAS konteineryje */}
            <div className="container">
                <h1 className="page-title">Ask AI</h1>

                <div className="ai-card">
                    <section className="ai-answers" ref={answersRef}>
                        {messages.length === 0 ? (
                            <div className="ai-placeholder">
                                <div className="ph-title">ANSWER FROM AI</div>
                                <p className="ph-text">Type your question below and press <kbd>Enter</kbd>.</p>
                            </div>
                        ) : (
                            <ul className="ai-list">
                                {messages.map((m, i) => (
                                    <li key={i} className={`ai-msg ${m.role}`}>
                                        <div className="avatar" aria-hidden>{m.role === "user" ? "Y" : "AI"}</div>
                                        <div className="bubble">{m.text}</div>
                                    </li>
                                ))}
                                {sending && (
                                    <li className="ai-msg assistant">
                                        <div className="avatar" aria-hidden>AI</div>
                                        <div className="bubble"><span className="dots"><i></i><i></i><i></i></span></div>
                                    </li>
                                )}
                            </ul>
                        )}
                    </section>

                    <section className="ai-inputRow">
            <textarea
                className="ai-input"
                placeholder="QUESTION FOR AI"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={onKeyDown}
            />
                        <button className="ai-send btn-primary" disabled={disabled} onClick={onSend} title="Send (Enter)">
                            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                                <path d="M3 11l16-8-7 18-2-7-7-3z" fill="currentColor"/>
                            </svg>
                            <span>Send</span>
                        </button>
                    </section>
                </div>
            </div>
        </main>
    );
}
