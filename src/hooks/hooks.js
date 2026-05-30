import { useState, useEffect, useCallback, useRef } from "react";
import {
  BEASTS, ZONES, XP_PER_LEVEL,
  BEAST_MOODS, ENCOUNTER_EVENTS,
  STREAK_BONUS_XP, STREAK_TAME_BOOST,
  getDailyQuests,
} from "../data/data";

const SAVE_KEY = "beast_tamer_save_v2";

// ── Weighted random pick ───────────────────────────────────────────────────────
function weightedPick(table, pool) {
  const f = pool.filter(b => (table[b.rarity] ?? 0) > 0);
  if (!f.length) return pool[0];
  const tot = f.reduce((s, b) => s + (table[b.rarity] ?? 0), 0);
  let r = Math.random() * tot;
  for (const b of f) { r -= table[b.rarity]; if (r <= 0) return b; }
  return f[f.length - 1];
}

export function pickEncounter(zone) {
  const eligible = BEASTS.filter(b => zone.beastLevels.includes(b.level));
  return weightedPick(zone.encounterTable, eligible);
}

export function pickMood() {
  return BEAST_MOODS[Math.floor(Math.random() * BEAST_MOODS.length)];
}

// ── useNotifications ──────────────────────────────────────────────────────────
export function useNotifications() {
  const [notification, setNotification] = useState(null);
  const timerRef = useRef(null);
  const notify = useCallback((msg, color = "#818cf8") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotification({ msg, color });
    timerRef.current = setTimeout(() => setNotification(null), 2800);
  }, []);
  return { notification, notify };
}

// ── useSaveSystem ─────────────────────────────────────────────────────────────
export function useSaveSystem({ playerLevel, xp, collection, log, questState, streak, onLoad }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) onLoad(JSON.parse(raw));
    } catch { /* corrupted */ }
  }, []); // eslint-disable-line

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ playerLevel, xp, collection, log, questState, streak }));
    } catch { /* full */ }
  }, [playerLevel, xp, collection, log, questState, streak]);

  const resetSave = () => { try { localStorage.removeItem(SAVE_KEY); } catch {} };
  return { resetSave };
}

// ── useGameState ──────────────────────────────────────────────────────────────
export function useGameState() {
  const { notification, notify } = useNotifications();

  // Core state
  const [playerLevel, setPlayerLevel] = useState(1);
  const [xp,          setXp]          = useState(0);
  const [collection,  setCollection]  = useState([]);
  const [log,         setLog]         = useState([]);
  const [tameStreak,  setTameStreak]  = useState(0);

  // Daily quests
  const todayQuests = getDailyQuests();
  const [questState, setQuestState] = useState(() =>
    Object.fromEntries(todayQuests.map(q => [q.id, { progress: 0, done: false }]))
  );

  // Navigation
  const [currentTab, setCurrentTab] = useState("home");

  // ── Zone Explorer phases: "zones" | "routes" | "explore" ──────────────────
  const [adventurePhase,   setAdventurePhase]   = useState("zones");
  const [selectedZone,     setSelectedZone]      = useState(null);
  const [selectedRoute,    setSelectedRoute]     = useState(null);
  const [investigated,     setInvestigated]      = useState(new Set());
  const [investigating,    setInvestigating]     = useState(null); // spot id being investigated
  const [playerPos,        setPlayerPos]         = useState({ x: 45, y: 65 });
  const [beastsFound,      setBeastsFound]       = useState(0);
  const [xpGained,         setXpGained]          = useState(0);

  // Encounter / event
  const [adventureResult,  setAdventureResult]   = useState(null);
  const [eventResult,      setEventResult]       = useState(null);
  const [tameAnim,         setTameAnim]          = useState(null);

  const addLog = msg => setLog(prev => [msg, ...prev].slice(0, 40));

  // Save/load
  const handleLoad = ({ playerLevel: lvl, xp: sx, collection: col, log: sl, questState: qs, streak: st }) => {
    if (lvl) setPlayerLevel(lvl);
    if (sx !== undefined) setXp(sx);
    if (col) setCollection(col);
    if (sl)  setLog(sl);
    if (qs)  setQuestState(qs);
    if (st !== undefined) setTameStreak(st);
  };
  const { resetSave } = useSaveSystem({
    playerLevel, xp, collection, log, questState, streak: tameStreak, onLoad: handleLoad,
  });

  // Quest progress
  const progressQuest = useCallback((type, rarity) => {
    setQuestState(prev => {
      const next = { ...prev };
      todayQuests.forEach(q => {
        if (next[q.id]?.done) return;
        const matches = q.type === type ||
          (q.type === `tameRarity:${rarity}` && type === "tame") ||
          (q.type === "streak" && type === "streak");
        if (matches) {
          const p = (next[q.id]?.progress ?? 0) + 1;
          const done = p >= q.goal;
          next[q.id] = { progress: p, done };
          if (done) setTimeout(() => notify(`🏆 Quest done: ${q.label}! +${q.reward} XP`, "#fbbf24"), 400);
        }
      });
      return next;
    });
  }, [todayQuests, notify]);

  // XP / level up
  const gainXp = useCallback(amount => {
    setXp(prev => {
      let newXp = prev + amount;
      let newLevel = playerLevel;
      let leveled = false;
      while (newXp >= XP_PER_LEVEL(newLevel)) {
        newXp -= XP_PER_LEVEL(newLevel);
        newLevel++;
        leveled = true;
      }
      if (leveled) {
        setPlayerLevel(newLevel);
        notify(`🎉 Level Up! You are now Level ${newLevel}!`, "#fbbf24");
      }
      return newXp;
    });
  }, [playerLevel, notify]);

  // Quest XP payouts
  const prevQuestRef = useRef(questState);
  useEffect(() => {
    todayQuests.forEach(q => {
      const prev = prevQuestRef.current[q.id];
      const curr = questState[q.id];
      if (curr?.done && !prev?.done) gainXp(q.reward);
    });
    prevQuestRef.current = questState;
  }, [questState]); // eslint-disable-line

  // ── Zone Explorer actions ──────────────────────────────────────────────────

  /** Phase 1: select a zone */
  const selectZone = useCallback(zone => {
    if (playerLevel < zone.minLevel) {
      notify(`🚫 You need Level ${zone.minLevel} to enter ${zone.name}!`, "#f87171");
      return;
    }
    setSelectedZone(zone);
    setAdventurePhase("routes");
  }, [playerLevel, notify]);

  /** Phase 2: select a route */
  const selectRoute = useCallback(route => {
    setSelectedRoute(route);
    setInvestigated(new Set());
    setInvestigating(null);
    setPlayerPos({ x: 45, y: 65 });
    setBeastsFound(0);
    setXpGained(0);
    setAdventurePhase("explore");
    addLog(`🧭 Entered ${selectedZone.name} via ${route.label}!`);
    progressQuest("explore");
  }, [selectedZone, progressQuest]);

  /** Phase 3: investigate a spot */
  const investigateSpot = useCallback(spot => {
    if (!spot || investigating) return;
    setInvestigating(spot.id);
    setPlayerPos({ x: spot.x, y: spot.y - 12 });

    setTimeout(() => {
      setInvestigating(null);
      setInvestigated(prev => new Set([...prev, spot.id]));

      const eventChance = selectedRoute?.ec ?? 0.15;
      if (Math.random() < eventChance) {
        const event = ENCOUNTER_EVENTS[Math.floor(Math.random() * ENCOUNTER_EVENTS.length)];
        setEventResult({ event, zone: selectedZone });
        addLog(`✨ Something unusual happened in ${selectedZone.name}!`);
        progressQuest("event");
      } else {
        const found  = pickEncounter(selectedZone);
        const mood   = pickMood();
        const canTame = playerLevel >= found.level;
        setAdventureResult({ beast: found, zone: selectedZone, canTame, mood });
        setBeastsFound(prev => prev + 1);
        addLog(`👀 Encountered a wild ${found.name} (Lv.${found.level})!`);
      }
    }, 1400);
  }, [investigating, selectedZone, selectedRoute, playerLevel, progressQuest]);

  /** Back navigation */
  const adventureBack = useCallback(() => {
    if (adventurePhase === "explore") {
      setAdventurePhase("routes");
      setInvestigated(new Set());
      setInvestigating(null);
      setPlayerPos({ x: 45, y: 65 });
      setAdventureResult(null);
      setEventResult(null);
    } else if (adventurePhase === "routes") {
      setAdventurePhase("zones");
      setSelectedZone(null);
      setSelectedRoute(null);
    }
  }, [adventurePhase]);

  /** Done exploring */
  const doneExploring = useCallback(() => {
    notify(`✅ Zone cleared! ${beastsFound} encounters, +${xpGained} XP`, "#4ade80");
    setAdventurePhase("routes");
    setInvestigated(new Set());
    setInvestigating(null);
    setPlayerPos({ x: 45, y: 65 });
    setAdventureResult(null);
    setEventResult(null);
  }, [beastsFound, xpGained, notify]);

  /** Tame attempt */
  const attemptTame = useCallback(() => {
    const { beast, mood } = adventureResult;
    const alreadyOwned    = collection.some(b => b.id === beast.id);
    const base            = alreadyOwned ? 0.40 : 0.75;
    const moodMod         = mood?.tameMod ?? 0;
    const streakBoost     = STREAK_TAME_BOOST(tameStreak);
    const success         = Math.random() < Math.min(base + moodMod + streakBoost, 0.97);

    setTameAnim(success ? "success" : "fail");

    setTimeout(() => {
      setTameAnim(null);
      if (success) {
        if (!alreadyOwned) setCollection(prev => [...prev, beast]);
        const newStreak = tameStreak + 1;
        const streakXp  = STREAK_BONUS_XP(newStreak);
        const totalXp   = beast.level * 20 + streakXp;
        setTameStreak(newStreak);
        gainXp(totalXp);
        setXpGained(prev => prev + totalXp);
        const sm = newStreak > 1 ? ` 🔥×${newStreak}! +${streakXp} bonus` : "";
        addLog(`✅ Tamed ${beast.name}! +${totalXp} XP${sm}`);
        notify(`🎉 ${beast.name} joined your team!${sm}`, beast.color);
        progressQuest("tame", beast.rarity);
        if (newStreak >= 3) progressQuest("streak");
      } else {
        setTameStreak(0);
        gainXp(5);
        setXpGained(prev => prev + 5);
        addLog(`💨 ${beast.name} escaped! +5 XP`);
        notify(`😢 ${beast.name} got away…`, "#f87171");
      }
      setAdventureResult(null);
    }, 1200);
  }, [adventureResult, collection, tameStreak, gainXp, notify, progressQuest]);

  /** Flee */
  const flee = useCallback(() => {
    setTameStreak(0);
    setAdventureResult(null);
    setEventResult(null);
    addLog("🏃 Fled from the encounter.");
  }, []);

  /** Resolve event */
  const resolveEvent = useCallback(choice => {
    if (choice.outcome === "xp") {
      gainXp(choice.xpGain);
      setXpGained(prev => prev + choice.xpGain);
    }
    notify(choice.msg, "#86efac");
    addLog(`✨ ${choice.msg}`);
    setEventResult(null);
  }, [gainXp, notify]);

  const ownedIds = new Set(collection.map(b => b.id));

  return {
    // state
    playerLevel, xp, collection, log, notification,
    adventureResult, tameAnim, eventResult, tameStreak,
    ownedIds, questState, todayQuests,
    // zone explorer
    adventurePhase, selectedZone, selectedRoute,
    investigated, investigating, playerPos,
    beastsFound, xpGained,
    // navigation
    currentTab, setCurrentTab,
    // actions
    notify, addLog, gainXp,
    selectZone, selectRoute, investigateSpot,
    adventureBack, doneExploring,
    attemptTame, flee, resolveEvent,
    resetSave,
    XP_PER_LEVEL,
  };
}
