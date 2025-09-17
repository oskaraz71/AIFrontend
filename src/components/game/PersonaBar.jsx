import React, { useEffect } from "react";

const PRESETS = [
    "drąsus, ryžtingas ir greitas — visada siekia pulti ir dominuoti",
    "atsargus, gynybiškas, taupus — laukia progos ir saugo HP",
    "agresyvus, beatodairiškas, rizikuojantis — renkasi atakas net su maža stamina",
    "strategiškas, oportunistiškas — perka daiktus, laukia stipresnio smūgio momento",
    "neryžtingas, nekantrus — blaškosi tarp pirkimo ir atakų",
];

export default function PersonaBar({
                                       personalPersona, setPersonalPersona,
                                       aiPersona, setAiPersona,
                                   }) {

    useEffect(() => {
        // Auto išsaugom į localStorage
        localStorage.setItem("aiGame.persona.personal", personalPersona || "");
        localStorage.setItem("aiGame.persona.ai", aiPersona || "");
    }, [personalPersona, aiPersona]);

    return (
        <div className="persona-bar">
            <div className="persona-col">
                <div className="persona-title">Personal persona</div>
                <textarea
                    className="persona-input"
                    placeholder="Aprašyk charakterį (pvz.: drąsus, ryžtingas ir greitas...)"
                    value={personalPersona}
                    onChange={(e) => setPersonalPersona(e.target.value)}
                    rows={3}
                />
                <div className="persona-presets">
                    {PRESETS.slice(0, 3).map((p) => (
                        <button key={p} type="button" className="chip" onClick={() => setPersonalPersona(p)}>{p}</button>
                    ))}
                </div>
            </div>

            <div className="persona-col">
                <div className="persona-title">Player 456 persona</div>
                <textarea
                    className="persona-input"
                    placeholder="Aprašyk charakterį (pvz.: atsargus, neryžtingas...)"
                    value={aiPersona}
                    onChange={(e) => setAiPersona(e.target.value)}
                    rows={3}
                />
                <div className="persona-presets">
                    {PRESETS.slice(2).map((p) => (
                        <button key={p} type="button" className="chip" onClick={() => setAiPersona(p)}>{p}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}
