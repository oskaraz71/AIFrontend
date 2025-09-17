// Paprasti helperiai ir pradinė būsena (Step-1)

export function randInt(min, max) {
    // imtinai [min..max]
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

export function clamp(n, lo, hi) {
    return Math.max(lo, Math.min(hi, n));
}

export function makePlayer(name) {
    return {
        name,
        hp: 100,
        maxHp: 100,
        stamina: 50,
        maxStamina: 50,
        money: 0,
        power: 15,
        defense: 10,
        // Step-1: inventorius nenaudojamas (Shop/Potions disabled)
        inventory: { items: [], potions: { hp: [], stamina: [] } },
    };
}

export function makeInitialState() {
    return {
        phase: "playing",         // playing | summary
        turn: "personal",          // personal | ai
        round: 1,
        players: {
            personal: makePlayer("Personal"),
            ai: makePlayer("Player 456"),
        },
        log: [],
        // Efemeriški UI indikatoriai
        flash: { personal: null, ai: null }, // { type:'attack'|'rest', value:number }
        hitFx: { personal: 0, ai: 0 },       // neigiamas skaičius rodomas prie HP
    };
}

/**
 * Ataka pagal Step-1 formulę:
 * - kaina stamina: [3..min(10, stamina)], jei stamina<3 – ataka negalima
 * - raw damage: [0..power]
 * - blocked: [0..defense]
 * - final damage = max(0, raw - blocked)
 * - earn money: [0..10]
 */
export function performAttack(state, actorKey) {
    const actor = state.players[actorKey];
    const targetKey = actorKey === "personal" ? "ai" : "personal";
    const target = state.players[targetKey];

    if (actor.stamina < 3) {
        return {
            ok: false,
            reason: "NOT_ENOUGH_STAMINA",
            state,
            entry: {
                t: Date.now(),
                actor: actorKey,
                action: "ATTACK",
                info: "not enough stamina (<3)",
            },
        };
    }

    const cost = randInt(3, Math.min(10, actor.stamina));
    const raw = randInt(0, actor.power);
    const blocked = randInt(0, target.defense);
    const damage = Math.max(0, raw - blocked);
    const gain = randInt(0, 10);

    const next = structuredClone(state);
    const A = next.players[actorKey];
    const T = next.players[targetKey];

    A.stamina = Math.max(0, A.stamina - cost);
    A.money += gain;

    const newHp = Math.max(0, T.hp - damage);
    T.hp = newHp;

    next.flash[actorKey] = { type: "attack", value: damage, cost, gain };
    next.hitFx[targetKey] = damage > 0 ? -damage : 0;

    const entry = {
        t: Date.now(),
        actor: actorKey,
        target: targetKey,
        action: "ATTACK",
        value: damage,
        info: `cost ${cost} sta, gain ${gain} gold, raw ${raw}, blocked ${blocked}`,
        after: snapshotPlayers(next),
    };

    return { ok: true, state: next, entry, killed: newHp <= 0 };
}

export function performRest(state, actorKey) {
    const next = structuredClone(state);
    const A = next.players[actorKey];
    const restored = randInt(0, 10);
    A.stamina = clamp(A.stamina + restored, 0, A.maxStamina);

    next.flash[actorKey] = { type: "rest", value: restored };
    // hitFx nekeičiam

    const entry = {
        t: Date.now(),
        actor: actorKey,
        action: "REST",
        value: restored,
        after: snapshotPlayers(next),
    };

    return { state: next, entry };
}

export function toggleTurn(state) {
    const next = structuredClone(state);
    const prev = state.turn;
    next.turn = prev === "personal" ? "ai" : "personal";
    // round didinam po pilno ciklo (kai baigė AI)
    if (prev === "ai") next.round = (state.round || 1) + 1;
    return next;
}

export function clearFx(state) {
    const next = structuredClone(state);
    next.flash = { personal: null, ai: null };
    next.hitFx = { personal: 0, ai: 0 };
    return next;
}

export function snapshotPlayers(state) {
    const { personal, ai } = state.players;
    return {
        personal: {
            hp: personal.hp,
            stamina: personal.stamina,
            money: personal.money,
        },
        ai: {
            hp: ai.hp,
            stamina: ai.stamina,
            money: ai.money,
        },
    };
}
