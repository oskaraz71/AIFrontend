import React from "react";

export default function ActionBar({
                                      disabledAll,
                                      canAttack,
                                      onAttack,
                                      onRest,
                                  }) {
    return (
        <div className="action-bar">
            <button className="btn primary" disabled={disabledAll || !canAttack} onClick={onAttack}>
                Attack
            </button>
            <button className="btn" disabled={disabledAll} onClick={onRest}>
                Rest
            </button>

            {/* Step-1: Shop ir Potions tik placeholder'iai */}
            <button className="btn ghost" disabled title="Step-2 (soon)">Shop</button>
            <button className="btn ghost" disabled title="Step-2 (soon)">Potions</button>
        </div>
    );
}
