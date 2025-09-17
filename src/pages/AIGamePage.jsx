import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import "./AIGamePage.css";

// ---- Config / URLs ----------------------------------------------------------
const API_BASE =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
    (typeof process !== "undefined" && process.env?.REACT_APP_API_BASE) ||
    "http://localhost:2500";

const SOCKET_URL = API_BASE;
const ROOM_ID = "ai-game-1";

// Avatars used on the player cards (not in the prompt area)
const AVATAR_PERSONAL =
    "https://www.merchoid.com/media/catalog/product/cache/bfcb5e98c93238c53d4013e78676b669/s/q/squid-game-masked-triangle-guard-minix-figure-12cm-1.jpg";
const AVATAR_456 =
    "https://girasolehomeshop.com/cdn/shop/files/6575226-2_1080x.jpg?v=1737885007";

export default function AIGamePage() {
    const socketRef = useRef(null);

    // connection/state
    const [connected, setConnected] = useState(false);
    const [state, setState] = useState(null);
    const [logs, setLogs] = useState([]);
    const [over, setOver] = useState(null);

    // prompts (initial – sent once on Start)
    const [personalPrompt, setPersonalPrompt] = useState(
        "Tu esi atsargus, taktiškas, bet ryžtingas. Tvarkyk HP/stamina/money protingai. Reaguok į priešininko ėjimus ir pirk daiktus/potions kai tai logiška."
    );
    const [aiPrompt, setAiPrompt] = useState(
        "Tu esi drąsus, greitas ir agresyvus žaidėjas. Visada sieki pulti, bet nepamiršk pirkti potionų ir įrangos kai įmanoma."
    );

    // runtime controls
    const [priceMultiplier, setPriceMultiplier] = useState(0.35);
    const [turnMs, setTurnMs] = useState(2500); // slower by default
    const [useGemini, setUseGemini] = useState(true);
    const [geminiEveryNTurns, setGeminiEveryNTurns] = useState(2);

    // connect socket once
    useEffect(() => {
        console.log("[AI-GAME][FE] connecting to", SOCKET_URL);
        const s = io(SOCKET_URL, { transports: ["websocket"] });
        socketRef.current = s;

        s.on("connect", () => {
            console.log("[AI-GAME][FE] connected id=", s.id);
            setConnected(true);
            s.emit("game:join", { roomId: ROOM_ID }, (ack) => {
                console.log("[AI-GAME][FE] join ack:", ack);
            });
        });

        s.on("disconnect", (reason) => {
            console.log("[AI-GAME][FE] disconnected:", reason);
            setConnected(false);
        });

        s.on("game:state", (payload) => {
            // console.log("[AI-GAME][FE] state:", payload);
            setState(payload);
        });

        s.on("game:log", (entry) => {
            // console.log("[AI-GAME][FE] log:", entry);
            setLogs((prev) => [...prev, entry]);
        });

        s.on("game:over", (payload) => {
            console.log("[AI-GAME][FE] OVER:", payload);
            setOver(payload);
        });

        return () => {
            try {
                s.disconnect();
            } catch {}
            socketRef.current = null;
        };
    }, []);

    const startGame = () => {
        if (!socketRef.current) return;
        const payload = {
            roomId: ROOM_ID,
            players: {
                personal: { name: "Personal" },
                ai: { name: "Player 456" },
            },
            // Initial, one-time prompts + runtime config for BE
            prompts: {
                personal: personalPrompt,
                ai: aiPrompt,
                priceMultiplier: Number(priceMultiplier) || 1,
                turnDelayMs: Number(turnMs) || 2500,
                useGemini: !!useGemini,
                geminiEveryNTurns: Number(geminiEveryNTurns) || 2,
            },
        };
        console.log("[AI-GAME][FE] emit game:start", payload);
        socketRef.current.emit("game:start", payload, (ack) => {
            console.log("[AI-GAME][FE] start ack:", ack);
            setLogs([]);
            setOver(null);
        });
    };

    const stopGame = () => {
        if (!socketRef.current) return;
        console.log("[AI-GAME][FE] emit game:stop");
        socketRef.current.emit("game:stop", { roomId: ROOM_ID }, (ack) => {
            console.log("[AI-GAME][FE] stop ack:", ack);
        });
    };

    // derived
    const players = state?.players || {};
    const round = state?.round ?? 1;
    const turn = state?.turn ?? "-";
    const phase = state?.phase ?? "idle";

    return (
        <div className="ai-game">
            {/* Top toolbar */}
            <header className="bar">
                <div>
                    <strong>AI Game</strong> • {connected ? "Connected" : "Disconnected"} •{" "}
                    Phase: {phase} • Round: {round} • Turn: {turn}
                </div>
                <div className="actions">
                    <label className="pmult">
                        Price x
                        <input
                            type="number"
                            step="0.05"
                            min="0.1"
                            value={priceMultiplier}
                            onChange={(e) => setPriceMultiplier(e.target.value)}
                            title="Shop price multiplier"
                        />
                    </label>
                    <label className="pmult">
                        Turn ms
                        <input
                            type="number"
                            step="100"
                            min="500"
                            value={turnMs}
                            onChange={(e) => setTurnMs(e.target.value)}
                            title="Delay between turns"
                        />
                    </label>
                    <label className="pmult">
                        Gemini every N
                        <input
                            type="number"
                            step="1"
                            min="1"
                            value={geminiEveryNTurns}
                            onChange={(e) => setGeminiEveryNTurns(e.target.value)}
                            title="Call LLM every Nth turn (throttling)"
                        />
                    </label>
                    <label className="pmult" title="Toggle using Gemini vs heuristic">
                        <input
                            type="checkbox"
                            checked={useGemini}
                            onChange={(e) => setUseGemini(e.target.checked)}
                            style={{ marginRight: 6 }}
                        />
                        Use Gemini
                    </label>
                    <button onClick={startGame} className="btn primary">
                        Start
                    </button>
                    <button onClick={stopGame} className="btn">
                        Stop
                    </button>
                </div>
            </header>

            {/* Initial prompts (no avatars here) */}
            <section className="prompts">
                <div className="prompt">
                    <h3>Personal — Initial Prompt</h3>
                    <textarea
                        rows={5}
                        value={personalPrompt}
                        onChange={(e) => setPersonalPrompt(e.target.value)}
                        placeholder="Įklijuok pradinį Personal AI aprašą/taisykles. Bus išsiųstas vieną kartą, kai paspausi Start."
                    />
                </div>

                <div className="prompt">
                    <h3>Player 456 — Initial Prompt</h3>
                    <textarea
                        rows={5}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Įklijuok pradinį Player 456 AI aprašą/taisykles. Bus išsiųstas vieną kartą, kai paspausi Start."
                    />
                </div>
            </section>

            {/* Board */}
            <section className="board">
                <PlayerCard
                    title="Personal"
                    img={AVATAR_PERSONAL}
                    p={players.personal}
                    highlight={turn === "personal"}
                />
                <GameLog logs={logs} />
                <PlayerCard
                    title="Player 456"
                    img={AVATAR_456}
                    p={players.ai}
                    highlight={turn === "ai"}
                />
            </section>

            {over && (
                <div className="over">
                    <strong>Game Over!</strong> Winner: {over.winner}
                </div>
            )}
        </div>
    );
}

// ---- UI Bits ---------------------------------------------------------------

function PlayerCard({ title, img, p, highlight }) {
    const hpPct = useMemo(() => pct(p?.hp, p?.maxHp), [p]);
    const stPct = useMemo(() => pct(p?.stamina, p?.maxStamina), [p]);

    return (
        <div className={`player ${highlight ? "turn" : ""}`}>
            <div className="ph">
                <img src={img} alt={title} className="avatar big" />
                <h3>{title}</h3>
            </div>

            <Stat label="HP" value={`${p?.hp ?? 0} / ${p?.maxHp ?? 100}`} pct={hpPct} />
            <Stat
                label="STA"
                value={`${p?.stamina ?? 0} / ${p?.maxStamina ?? 50}`}
                pct={stPct}
            />

            <div className="meta">
                <span title="Money">💰 {p?.money ?? 0}</span>
                <span title="Power">⚔️ {p?.power ?? 0}</span>
                <span title="Defense">🛡️ {p?.defense ?? 0}</span>
            </div>
        </div>
    );
}

function Stat({ label, value, pct }) {
    return (
        <div className="stat">
            <div className="stat-row">
                <span className="label">{label}</span>
                <span className="val">{value}</span>
            </div>
            <div className="bar">
                <div className="fill" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function GameLog({ logs }) {
    return (
        <div className="log">
            <h3>Game Log</h3>
            <div className="log-body">
                {logs.slice(-250).map((e, i) => (
                    <div key={i} className="log-line">
                        <code>
                            {fmtActor(e.actor)}→{e.action}
                            {e.target ? `→${fmtActor(e.target)}` : ""}
                            {e.value != null ? `=${e.value}` : ""}
                            {e.info ? ` — ${e.info}` : ""}
                        </code>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---- Utils -----------------------------------------------------------------
function pct(v, max) {
    const n = Number(v || 0);
    const m = Number(max || 1);
    return Math.max(0, Math.min(100, Math.round((n / m) * 100)));
}
function fmtActor(a) {
    return a === "personal" ? "Personal" : a === "ai" ? "Player456" : a;
}
