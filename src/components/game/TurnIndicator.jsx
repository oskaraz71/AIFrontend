import React from "react";

export default function TurnIndicator({ turn, round }) {
    return (
        <div className="turn-indicator">
            <div className="dot" />
            <span>Ėjimas: <b>{turn === "personal" ? "Personal" : "Player 456"}</b></span>
            <span className="round">Round {round}</span>
        </div>
    );
}
