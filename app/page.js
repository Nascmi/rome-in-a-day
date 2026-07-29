"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DAY_LENGTH = 90;
const SAVE_KEY = "rome-in-a-day-v1";

const JOBS = [
  { id: "wood", name: "Timber", icon: "♣", color: "#6d8b55" },
  { id: "stone", name: "Stone", icon: "◆", color: "#8b8d88" },
  { id: "clay", name: "Clay", icon: "●", color: "#b75e3e" },
  { id: "food", name: "Food", icon: "▲", color: "#c49b44" }
];

const BUILDINGS = [
  { id: "road", name: "Road", roman: "VIA", icon: "═", cost: { stone: 10 }, points: 8, max: 18, desc: "Every 3 roads makes everyone 5% faster." },
  { id: "hut", name: "Insula", roman: "DOMUS", icon: "⌂", cost: { wood: 12, clay: 8 }, points: 20, max: 12, desc: "A humble home. Adds one worker tomorrow." },
  { id: "workshop", name: "Workshop", roman: "OFFICINA", icon: "⚒", cost: { wood: 22, stone: 15 }, points: 45, max: 6, desc: "Raises all gathering by 12% this day." },
  { id: "aqueduct", name: "Aqueduct", roman: "AQUAEDUCTUS", icon: "⋂", cost: { stone: 38, clay: 25 }, points: 90, max: 4, desc: "Feeds a growing city. Big renown." },
  { id: "temple", name: "Temple", roman: "TEMPLUM", icon: "♜", cost: { wood: 25, stone: 55, clay: 30 }, points: 160, max: 2, desc: "A monument worthy of memory." },
  { id: "colosseum", name: "Colosseum", roman: "COLOSSEUM", icon: "◉", cost: { wood: 90, stone: 160, clay: 110, food: 60 }, points: 600, max: 1, desc: "Finish it before sunset to build Rome in a day." }
];

const UPGRADES = [
  { id: "hands", name: "Calloused Hands", icon: "✊", desc: "+15% gathering speed", base: 3 },
  { id: "rations", name: "Dawn Rations", icon: "◒", desc: "+2 starting workers", base: 4 },
  { id: "carts", name: "Better Carts", icon: "⊞", desc: "+25% tap power", base: 3 },
  { id: "foremen", name: "Foremen", icon: "⚑", desc: "Start with auto-assigned workers", base: 6 }
];

const emptyBuildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, 0]));
const freshLegacy = { day: 1, laurels: 0, best: 0, total: 0, upgrades: { hands: 0, rations: 0, carts: 0, foremen: 0 } };

function formatCost(cost) {
  return Object.entries(cost).map(([key, value]) => `${value} ${key}`).join(" · ");
}

function App() {
  const [legacy, setLegacy] = useState(freshLegacy);
  const [loaded, setLoaded] = useState(false);
  const [time, setTime] = useState(DAY_LENGTH);
  const [running, setRunning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [won, setWon] = useState(false);
  const [resources, setResources] = useState({ wood: 15, stone: 12, clay: 8, food: 15 });
  const [workers, setWorkers] = useState({ wood: 0, stone: 0, clay: 0, food: 0 });
  const [buildings, setBuildings] = useState(emptyBuildings);
  const [message, setMessage] = useState("The field is empty. The sun is rising.");
  const [activeTab, setActiveTab] = useState("build");
  const [bursts, setBursts] = useState([]);
  const latest = useRef({});

  const totalWorkers = 4 + legacy.upgrades.rations * 2 + Math.min(8, Math.floor((legacy.total || 0) / 8));
  const assigned = Object.values(workers).reduce((a, b) => a + b, 0);
  const idle = totalWorkers - assigned;
  const score = BUILDINGS.reduce((sum, b) => sum + buildings[b.id] * b.points, 0);
  const roadBonus = 1 + Math.floor(buildings.road / 3) * 0.05;
  const workshopBonus = 1 + buildings.workshop * 0.12;
  const gatherRate = (1 + legacy.upgrades.hands * 0.15) * roadBonus * workshopBonus;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved) setLegacy({ ...freshLegacy, ...saved, upgrades: { ...freshLegacy.upgrades, ...saved.upgrades } });
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(SAVE_KEY, JSON.stringify(legacy));
  }, [legacy, loaded]);

  useEffect(() => {
    latest.current = { score, buildings, won };
  }, [score, buildings, won]);

  const finishDay = useCallback((victory = false) => {
    setRunning(false);
    setEnded(true);
    const current = latest.current;
    const completed = Object.values(current.buildings || {}).reduce((a, b) => a + b, 0);
    const earned = Math.max(1, Math.floor((current.score || 0) / 45) + Math.floor(completed / 3) + (victory ? 25 : 0));
    setLegacy((old) => ({
      ...old,
      laurels: old.laurels + earned,
      best: Math.max(old.best, current.score || 0),
      total: old.total + completed
    }));
    setMessage(victory ? "Rome stands before sunset. The impossible is done." : `Night falls. History remembers what your builders learned. +${earned} laurels.`);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setTime((old) => {
        if (old <= 1) {
          finishDay(false);
          return 0;
        }
        return old - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running, finishDay]);

  useEffect(() => {
    if (!running) return;
    const gather = setInterval(() => {
      setResources((old) => {
        const next = { ...old };
        JOBS.forEach((job) => {
          next[job.id] += workers[job.id] * gatherRate * 0.5;
        });
        return next;
      });
    }, 500);
    return () => clearInterval(gather);
  }, [running, workers, gatherRate]);

  const startDay = () => {
    if (running) return;
    setRunning(true);
    setMessage("Daylight is precious. Put every pair of hands to work.");
    if (legacy.upgrades.foremen > 0 && assigned === 0) {
      const auto = { wood: 0, stone: 0, clay: 0, food: 0 };
      for (let i = 0; i < totalWorkers; i++) auto[JOBS[i % 4].id]++;
      setWorkers(auto);
    }
  };

  const assign = (job, amount) => {
    if (!running) startDay();
    setWorkers((old) => {
      if (amount > 0 && idle <= 0) return old;
      if (amount < 0 && old[job] <= 0) return old;
      return { ...old, [job]: old[job] + amount };
    });
  };

  const tapGather = (job, event) => {
    if (!running) startDay();
    const amount = (1.5 + legacy.upgrades.carts * 0.5) * roadBonus;
    setResources((old) => ({ ...old, [job]: old[job] + amount }));
    const rect = event.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setBursts((old) => [...old.slice(-8), { id, text: `+${amount.toFixed(1)}`, x: rect.left + rect.width / 2, y: rect.top }]);
    setTimeout(() => setBursts((old) => old.filter((b) => b.id !== id)), 800);
  };

  const canAfford = (building) => Object.entries(building.cost).every(([key, amount]) => resources[key] >= amount);

  const build = (building) => {
    if (!running) startDay();
    if (!canAfford(building) || buildings[building.id] >= building.max) return;
    setResources((old) => {
      const next = { ...old };
      Object.entries(building.cost).forEach(([key, amount]) => next[key] -= amount);
      return next;
    });
    setBuildings((old) => ({ ...old, [building.id]: old[building.id] + 1 }));
    setMessage(`${building.name} complete. Rome reaches a little higher.`);
    if (building.id === "colosseum") {
      setWon(true);
      setTimeout(() => finishDay(true), 500);
    }
  };

  const tomorrow = () => {
    setLegacy((old) => ({ ...old, day: old.day + 1 }));
    setTime(DAY_LENGTH);
    setResources({ wood: 15, stone: 12, clay: 8, food: 15 });
    setWorkers({ wood: 0, stone: 0, clay: 0, food: 0 });
    setBuildings(emptyBuildings);
    setEnded(false);
    setWon(false);
    setMessage("The city is gone. The knowledge remains.");
    setActiveTab("build");
  };

  const buyUpgrade = (up) => {
    const level = legacy.upgrades[up.id];
    const cost = up.base + level * (up.base + 1);
    if (legacy.laurels < cost) return;
    setLegacy((old) => ({
      ...old,
      laurels: old.laurels - cost,
      upgrades: { ...old.upgrades, [up.id]: level + 1 }
    }));
  };

  const sunPct = ((DAY_LENGTH - time) / DAY_LENGTH) * 100;
  const cityItems = useMemo(() => {
    const items = [];
    BUILDINGS.forEach((b) => {
      for (let i = 0; i < buildings[b.id]; i++) items.push({ ...b, key: `${b.id}-${i}` });
    });
    return items;
  }, [buildings]);

  if (!loaded) return <main className="loading">Waking the builders…</main>;

  return (
    <main className="game">
      <header className="topbar">
        <div className="brand">
          <span className="spqr">SPQR</span>
          <div><h1>ROME WASN’T BUILT IN A DAY</h1><p>But perhaps tomorrow.</p></div>
        </div>
        <div className="dayBadge"><small>ATTEMPT</small><strong>DAY {legacy.day}</strong></div>
      </header>

      <section className="sky" style={{ "--sun": `${sunPct}%` }}>
        <div className="sun" />
        <div className="horizon">
          <div className="city">
            {cityItems.length === 0 && <div className="emptyCity"><span>⅋</span><p>An empty field awaits.</p></div>}
            {cityItems.map((item, index) => (
              <div className={`cityBuilding ${item.id}`} key={item.key} style={{ "--i": index }}>
                <span>{item.icon}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="timeStrip">
          <span>☼ DAWN</span>
          <div className="track"><div style={{ width: `${sunPct}%` }} /></div>
          <strong>{Math.floor(time / 60)}:{String(time % 60).padStart(2, "0")}</strong>
          <span>DUSK ◐</span>
        </div>
      </section>

      <section className="statRow">
        {JOBS.map((job) => (
          <button className="resource" key={job.id} onClick={(e) => tapGather(job.id, e)}>
            <span className="resIcon" style={{ background: job.color }}>{job.icon}</span>
            <span><small>{job.name}</small><strong>{Math.floor(resources[job.id])}</strong></span>
            <em>tap +</em>
          </button>
        ))}
      </section>

      <div className="message"><span>✦</span>{message}</div>

      <section className="workArea">
        <aside className="workers">
          <div className="panelTitle"><span>WORKFORCE</span><strong>{idle} idle / {totalWorkers}</strong></div>
          <div className="workerArt">{Array.from({ length: Math.min(totalWorkers, 16) }).map((_, i) => <i key={i}>♟</i>)}</div>
          {JOBS.map((job) => (
            <div className="job" key={job.id}>
              <span className="jobDot" style={{ background: job.color }} />
              <span>{job.name}<small>{(workers[job.id] * gatherRate).toFixed(1)}/s</small></span>
              <div><button onClick={() => assign(job.id, -1)}>−</button><b>{workers[job.id]}</b><button onClick={() => assign(job.id, 1)}>+</button></div>
            </div>
          ))}
          {!running && !ended && <button className="start" onClick={startDay}>BEGIN THE DAY <span>→</span></button>}
        </aside>

        <section className="ledger">
          <nav>
            <button className={activeTab === "build" ? "active" : ""} onClick={() => setActiveTab("build")}>BUILD ROME</button>
            <button className={activeTab === "legacy" ? "active" : ""} onClick={() => setActiveTab("legacy")}>LEGACY <b>{legacy.laurels}</b></button>
          </nav>

          {activeTab === "build" ? (
            <div className="cards">
              {BUILDINGS.map((building) => {
                const affordable = canAfford(building);
                const capped = buildings[building.id] >= building.max;
                return (
                  <button className={`buildCard ${affordable && !capped ? "ready" : ""}`} key={building.id} onClick={() => build(building)} disabled={capped}>
                    <span className={`buildingIcon ${building.id}`}>{building.icon}</span>
                    <span className="buildCopy"><small>{building.roman}</small><strong>{building.name}</strong><em>{building.desc}</em><span className="cost">{capped ? "COMPLETE" : formatCost(building.cost)}</span></span>
                    <b>{buildings[building.id]}/{building.max}</b>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="upgradeGrid">
              <div className="legacyIntro"><strong>{legacy.laurels} laurels</strong><span>Knowledge survives the night.</span></div>
              {UPGRADES.map((up) => {
                const level = legacy.upgrades[up.id];
                const cost = up.base + level * (up.base + 1);
                return (
                  <button className="upgrade" key={up.id} onClick={() => buyUpgrade(up)} disabled={legacy.laurels < cost}>
                    <span>{up.icon}</span><div><strong>{up.name}</strong><small>{up.desc}</small><em>Level {level} · {cost} laurels</em></div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </section>

      <footer>
        <div><small>TODAY’S RENOWN</small><strong>{score}</strong></div>
        <blockquote>“What we do in life echoes in eternity.”</blockquote>
        <div><small>BEST ATTEMPT</small><strong>{legacy.best}</strong></div>
      </footer>

      {bursts.map((b) => <span className="burst" key={b.id} style={{ left: b.x, top: b.y }}>{b.text}</span>)}

      {ended && (
        <div className="overlay">
          <div className="nightCard">
            <span className="wreath">❧</span>
            <small>{won ? "THE IMPOSSIBLE DAY" : "SUNSET • ATTEMPT COMPLETE"}</small>
            <h2>{won ? "ROME STANDS." : "ROME WASN’T BUILT TODAY."}</h2>
            <p>{won ? "Against time itself, your builders raised Rome before nightfall." : "The roads vanish. The walls return to dust. But skilled hands remember."}</p>
            <div className="results"><span><small>RENOWN</small><b>{score}</b></span><span><small>BUILDINGS</small><b>{Object.values(buildings).reduce((a, b) => a + b, 0)}</b></span><span><small>LAURELS</small><b>{legacy.laurels}</b></span></div>
            <button onClick={tomorrow}>{won ? "BUILD THE EMPIRE" : "TRY AGAIN TOMORROW"} <span>→</span></button>
            <em>Nothing remains but knowledge.</em>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
