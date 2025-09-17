import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../auth/AuthProvider";
import "./AgentsChatPage.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:2500";

export default function AgentsChatPage() {
    const { user } = useAuth();
    const username = useMemo(() => user?.username || user?.name || "User", [user]);

    const [socketRef] = useState(() => io(API_BASE, { transports: ["websocket"] }));
    const [agents, setAgents] = useState([]);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        const s = socketRef;

        s.on("connect", () => {
            console.log("[Agents] connected", s.id);
            s.emit("agents:join", { username });
        });

        s.on("agents:init", (data) => {
            console.log("[Agents] init", data);
            setAgents(data.agents || []);
            setMessages(data.history || []);
        });

        s.on("agents:agents", (data) => {
            console.log("[Agents] agents updated", data);
            setAgents([...data]);
        });

        s.on("agents:message", (msg) => {
            console.log("[Agents] message", msg);
            setMessages((arr) => [...arr, msg]);
        });

        return () => {
            s.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketRef, username]);

    useEffect(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
    }, [messages]);

    const send = () => {
        const body = text.trim();
        if (!body) return;
        socketRef.emit("agents:user_message", { text: body });
        setText("");
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const updateAgent = (id, patch) => {
        socketRef.emit("agents:update", { id, ...patch });
    };

    return (
        <div className="agents-layout">
            {/* kairė – chat */}
            <section className="chat">
                <header className="chat-header">
                    <h2>Chat with Bots</h2>
                    <div className="muted">Penki botai diskutuoja pasirinkta tema. Temą botų charakterius reikia pasirinkti!
                    </div>
                </header>

                <div className="chat-feed" ref={scrollRef}>
                    {messages.map((m) => (
                        <div key={m.id} className={`msg ${m.role === "user" ? "user" : "agent"}`}>
                            <div className="meta">
                                <span className="name">{m.name || (m.role === "user" ? username : "AI")}</span>
                                <span className="time">{new Date(m.ts).toLocaleTimeString()}</span>
                            </div>
                            <div className="body">{m.text}</div>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="empty">Start by typing a topic/question below. Agents will reply periodically.</div>
                    )}
                </div>

                <div className="chat-input">
          <textarea
              className="input"
              placeholder="Write a topic or ask a question… (Enter to send)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
          />
                    <button className="btn-primary" onClick={send}>Send</button>
                </div>
            </section>

            {/* dešinė – agentų kortos */}
            <aside className="agents-panel">
                <h3>AI Agents</h3>
                <div className="cards">
                    {agents.map((a) => (
                        <div className="agent-card" key={a.id}>
                            <div className="row">
                                <input
                                    className="name"
                                    value={a.name}
                                    onChange={(e) => updateAgent(a.id, { name: e.target.value })}
                                />
                            </div>
                            <textarea
                                className="persona"
                                value={a.persona}
                                onChange={(e) => updateAgent(a.id, { persona: e.target.value })}
                            />
                        </div>
                    ))}
                </div>
                <p className="muted small">GAlima redaguoti apuokų vardus. Atsakymus botai generuoja pagal pasirinktus charakterio bruožus, galima nurodyti kiek paprastai rašo žodžių</p>
            </aside>
        </div>
    );
}
