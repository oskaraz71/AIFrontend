import React, { useState } from "react";

export default function PlayerCard({
                                       player,
                                       side = "left",
                                       isActive = false,
                                       flash = null,   // rezervuota efektams iš BE (nebūtina dabar)
                                       hitFx = 0,      // rezervuota efektams iš BE (nebūtina dabar)
                                       avatarUrl = "",
                                   }) {
    const [imgOk, setImgOk] = useState(true);

    const hpPct = Math.round((player.hp / player.maxHp) * 100);
    const staPct = Math.round((player.stamina / player.maxStamina) * 100);
    const letter = (player.name || "P").charAt(0).toUpperCase();

    return (
        <div className={`pg-card ${isActive ? "active" : ""} ${side === "right" ? "flip" : ""} ${hitFx ? "shake" : ""}`}>
            <div className="pg-avatar">
                <div className="pg-avatar-img">
                    {avatarUrl && imgOk ? (
                        <img
                            src={avatarUrl}
                            alt={player.name}
                            onError={() => setImgOk(false)}
                            loading="lazy"
                            decoding="async"
                        />
                    ) : (
                        <div className="pg-avatar-fallback">{letter}</div>
                    )}
                </div>
            </div>

            <div className="pg-name">{player.name}</div>

            <div className="pg-bars">
                <label>HP: {player.hp}/{player.maxHp}</label>
                <div className="bar hp">
                    <div className="fill" style={{ width: `${hpPct}%` }} />
                </div>

                <label>Stamina: {player.stamina}/{player.maxStamina}</label>
                <div className="bar stamina">
                    <div className="fill" style={{ width: `${staPct}%` }} />
                </div>
            </div>

            <div className="pg-stats">
                <div><span>Money</span><b>{player.money}</b></div>
                <div><span>Power</span><b>{player.power}</b></div>
                <div><span>Defense</span><b>{player.defense}</b></div>
            </div>

            {flash && (
                <div className={`action-badge ${flash.type}`}>
                    {/* Palikta ateičiai iš BE */}
                </div>
            )}

            {hitFx < 0 && <div className="hit-fx">−{Math.abs(hitFx)}</div>}
        </div>
    );
}
