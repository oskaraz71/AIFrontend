import React, { useEffect, useRef } from "react";

export default function GameLog({ entries }) {
    const boxRef = useRef(null);

    useEffect(() => {
        if (boxRef.current) {
            boxRef.current.scrollTop = boxRef.current.scrollHeight;
        }
    }, [entries]);

    return (
        <div className="game-log" ref={boxRef}>
            {entries.length === 0 && <div className="muted">Log'as tuščias. Atlik veiksmą.</div>}
            {entries.map((e, i) => (
                <div key={e.t + "-" + i} className="log-row">
                    <span className={`actor ${e.actor}`}>{e.actor === "personal" ? "Personal" : "Player 456"}</span>
                    <span className="arrow">→</span>
                    <span className="action">{e.action}</span>
                    {typeof e.value === "number" && <span className="value">{e.action === "REST" ? `+${e.value}` : `−${Math.abs(e.value)}`}</span>}
                    {e.target && <span className="target">({e.target})</span>}
                    {e.info && <span className="info"> — {e.info}</span>}
                    {e.after && (
                        <span className="after">
              {" "}| HP {e.after.personal.hp}/{/* personal */} / {e.after.ai.hp}
                            {" "}• STA {e.after.personal.stamina} / {e.after.ai.stamina}
                            {" "}• $ {e.after.personal.money} / {e.after.ai.money}
            </span>
                    )}
                </div>
            ))}
        </div>
    );
}
