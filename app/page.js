"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DAY_LENGTH = 90;
const SAVE_KEY = "rome-in-a-day-v1";

const CAMPAIGNS = [
  {
    id: "rome", chapter: "I", name: "Rome", subtitle: "Raise the Eternal City",
    dayLength: 90, unlock: null, reward: 25,
    goal: { colosseum: 1 },
    brief: "Crown the city with the Colosseum before sunset."
  },
  {
    id: "italia", chapter: "II", name: "Italia", subtitle: "Unite the Peninsula",
    dayLength: 105, unlock: "rome", reward: 40,
    goal: { road: 12, hut: 6, aqueduct: 2, temple: 1 },
    brief: "Bind the towns together with roads, water, homes, and law."
  },
  {
    id: "mediterranean", chapter: "III", name: "Mare Nostrum", subtitle: "Command the Inland Sea",
    dayLength: 120, unlock: "italia", reward: 60,
    goal: { road: 15, workshop: 4, aqueduct: 3, temple: 2, colosseum: 1 },
    brief: "Build the ports and civic works of a Mediterranean power."
  }
];

const PLANS = [
  { id: "balanced", name: "Measured Plans", icon: "△", desc: "A full day with no penalties.", gather: 1, cost: 1, time: 0 },
  { id: "forced", name: "Forced March", icon: "⚡", desc: "+35% gathering, but 15 fewer seconds.", gather: 1.35, cost: 1, time: -15 },
  { id: "frugal", name: "Frugal Works", icon: "◫", desc: "Buildings cost 15% less; tapping is weaker.", gather: 1, cost: 0.85, time: 0, tap: 0.8 }
];

const DAY_EVENTS = [
  { id: "supply", title: "Supply Caravan", text: "A caravan arrives with 18 of every material.", icon: "⊞" },
  { id: "guild", title: "Guild Inspiration", text: "Gathering is 25% faster for the rest of the day.", icon: "⚒" },
  { id: "engineer", title: "A Brilliant Engineer", text: "Construction costs 15% less for the rest of the day.", icon: "△" }
];

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
  { id: "foremen", name: "Foremen", icon: "⚑", desc: "Start with auto-assigned workers", base: 6 },
  { id: "architects", name: "Architects", icon: "△", desc: "Buildings cost 5% less", base: 8 },
  { id: "legion", name: "Builder Legion", icon: "Ⅼ", desc: "+4 starting workers", base: 12 }
];

const DISTRICTS = [
  { id: "campus", name: "Campus Martius", icon: "⚒", need: 0, perk: "The builders’ first foothold." },
  { id: "forum", name: "Roman Forum", icon: "♜", need: 18, perk: "+10% gathering from organized trade." },
  { id: "palatine", name: "Palatine Hill", icon: "♛", need: 45, perk: "Begin each day with extra materials." },
  { id: "subura", name: "The Subura", icon: "⌂", need: 90, perk: "+4 permanent workers." },
  { id: "capitoline", name: "Capitoline", icon: "▲", need: 160, perk: "+20% renown from every building." },
  { id: "empire", name: "The Empire", icon: "✦", need: 1, victory: true, perk: "Rome is only the beginning." }
];

const ACHIEVEMENTS = [
  { id: "first_stone", name: "First Stone", icon: "◆", desc: "Construct your first building.", test: (s) => s.total >= 1 },
  { id: "roadmaker", name: "All Roads", icon: "═", desc: "Build 9 roads in one day.", test: (s) => s.buildings.road >= 9 },
  { id: "town", name: "A Town by Noon", icon: "⌂", desc: "Reach 250 renown.", test: (s) => s.score >= 250 },
  { id: "workforce", name: "Many Hands", icon: "♟", desc: "Command 20 workers.", test: (s) => s.workers >= 20 },
  { id: "veteran", name: "Persistent as Rome", icon: "☼", desc: "Attempt 10 days.", test: (s) => s.day >= 10 },
  { id: "rome", name: "The Impossible", icon: "◉", desc: "Build the Colosseum before sunset.", test: (s) => s.victories >= 1 }
];

const emptyBuildings = Object.fromEntries(BUILDINGS.map((b) => [b.id, 0]));
const freshLegacy = {
  day: 1, laurels: 0, best: 0, total: 0, victories: 0, achievements: [],
  completedCampaigns: [],
  upgrades: { hands: 0, rations: 0, carts: 0, foremen: 0, architects: 0, legion: 0 }
};

function formatCost(cost) {
  return Object.entries(cost).map(([key, value]) => `${value} ${key}`).join(" · ");
}

function App() {
  const [legacy, setLegacy] = useState(freshLegacy);
  const [loaded, setLoaded] = useState(false);
  const [campaignId, setCampaignId] = useState("rome");
  const [planId, setPlanId] = useState("balanced");
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
  const [buildFlash, setBuildFlash] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [toast, setToast] = useState(null);
  const [dayEvent, setDayEvent] = useState(null);
  const [dayModifier, setDayModifier] = useState({ gather: 1, cost: 1 });
  const latest = useRef({});
  const audioContext = useRef(null);
  const musicTimer = useRef(null);

  const activeCampaign = CAMPAIGNS.find((campaign) => campaign.id === campaignId) || CAMPAIGNS[0];
  const activePlan = PLANS.find((plan) => plan.id === planId) || PLANS[0];
  const districtUnlocked = (district) => district.victory ? legacy.victories >= district.need : legacy.total >= district.need;
  const forumBonus = districtUnlocked(DISTRICTS[1]) ? 1.1 : 1;
  const palatineBonus = districtUnlocked(DISTRICTS[2]) ? 10 : 0;
  const suburaWorkers = districtUnlocked(DISTRICTS[3]) ? 4 : 0;
  const capitolineBonus = districtUnlocked(DISTRICTS[4]) ? 1.2 : 1;
  const totalWorkers = 4 + legacy.upgrades.rations * 2 + legacy.upgrades.legion * 4 + suburaWorkers + Math.min(8, Math.floor((legacy.total || 0) / 8));
  const assigned = Object.values(workers).reduce((a, b) => a + b, 0);
  const idle = totalWorkers - assigned;
  const score = Math.floor(BUILDINGS.reduce((sum, b) => sum + buildings[b.id] * b.points, 0) * capitolineBonus);
  const roadBonus = 1 + Math.floor(buildings.road / 3) * 0.05;
  const workshopBonus = 1 + buildings.workshop * 0.12;
  const gatherRate = (1 + legacy.upgrades.hands * 0.15) * roadBonus * workshopBonus * forumBonus * activePlan.gather * dayModifier.gather;
  const campaignComplete = Object.entries(activeCampaign.goal).every(([id, needed]) => buildings[id] >= needed);
  const objectiveProgress = Object.entries(activeCampaign.goal).reduce((sum, [id, needed]) => sum + Math.min(1, buildings[id] / needed), 0) / Object.keys(activeCampaign.goal).length;

  const playTone = useCallback((frequency, duration = 0.12, type = "triangle", volume = 0.035) => {
    if (!soundOn || typeof window === "undefined") return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    if (!audioContext.current) audioContext.current = new Context();
    const ctx = audioContext.current;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }, [soundOn]);

  const chime = useCallback(() => {
    [392, 523, 659].forEach((note, index) => setTimeout(() => playTone(note, 0.22, "sine", 0.045), index * 80));
  }, [playTone]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (saved) {
        const completedCampaigns = saved.completedCampaigns || (saved.victories > 0 ? ["rome"] : []);
        setLegacy({
          ...freshLegacy,
          ...saved,
          completedCampaigns,
          achievements: saved.achievements || [],
          upgrades: { ...freshLegacy.upgrades, ...saved.upgrades }
        });
        if (completedCampaigns.includes("rome")) {
          setCampaignId(completedCampaigns.includes("italia") ? "mediterranean" : "italia");
          setTime(completedCampaigns.includes("italia") ? CAMPAIGNS[2].dayLength : CAMPAIGNS[1].dayLength);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    const onInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  useEffect(() => {
    if (!musicOn) {
      clearInterval(musicTimer.current);
      musicTimer.current = null;
      return;
    }
    const notes = [196, 220, 261.6, 246.9, 220, 174.6];
    let index = 0;
    playTone(notes[0], 1.2, "sine", 0.012);
    musicTimer.current = setInterval(() => {
      index = (index + 1) % notes.length;
      playTone(notes[index], 1.4, "sine", 0.012);
    }, 1500);
    return () => clearInterval(musicTimer.current);
  }, [musicOn, playTone]);

  useEffect(() => {
    if (loaded) localStorage.setItem(SAVE_KEY, JSON.stringify(legacy));
  }, [legacy, loaded]);

  useEffect(() => {
    latest.current = { score, buildings, won, campaignId };
  }, [score, buildings, won, campaignId]);

  useEffect(() => {
    if (!loaded) return;
    const snapshot = { total: legacy.total, day: legacy.day, victories: legacy.victories, buildings, score, workers: totalWorkers };
    const newlyEarned = ACHIEVEMENTS.filter((achievement) => !legacy.achievements.includes(achievement.id) && achievement.test(snapshot));
    if (!newlyEarned.length) return;
    const achievement = newlyEarned[0];
    setLegacy((old) => ({ ...old, achievements: [...old.achievements, achievement.id], laurels: old.laurels + 3 }));
    setToast({ title: "Achievement", text: achievement.name, icon: achievement.icon });
    chime();
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [loaded, legacy.total, legacy.day, legacy.victories, legacy.achievements, buildings, score, totalWorkers, chime]);

  const finishDay = useCallback((victory = false) => {
    setRunning(false);
    setEnded(true);
    const current = latest.current;
    const completed = Object.values(current.buildings || {}).reduce((a, b) => a + b, 0);
    const completedCampaign = CAMPAIGNS.find((campaign) => campaign.id === current.campaignId) || CAMPAIGNS[0];
    const earned = Math.max(1, Math.floor((current.score || 0) / 45) + Math.floor(completed / 3) + (victory ? completedCampaign.reward : 0));
    setLegacy((old) => ({
      ...old,
      laurels: old.laurels + earned,
      best: Math.max(old.best, current.score || 0),
      total: old.total + completed,
      victories: old.victories + (victory ? 1 : 0),
      completedCampaigns: victory && !old.completedCampaigns.includes(completedCampaign.id)
        ? [...old.completedCampaigns, completedCampaign.id]
        : old.completedCampaigns
    }));
    if (victory) chime();
    setMessage(victory ? "Rome stands before sunset. The impossible is done." : `Night falls. History remembers what your builders learned. +${earned} laurels.`);
  }, [chime]);

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

  useEffect(() => {
    if (!running || !campaignComplete || won) return;
    setWon(true);
    setMessage(`${activeCampaign.name} stands complete before sunset.`);
  }, [running, campaignComplete, won, activeCampaign.name]);

  useEffect(() => {
    if (!running || !won) return;
    const timer = setTimeout(() => finishDay(true), 700);
    return () => clearTimeout(timer);
  }, [running, won, finishDay]);

  useEffect(() => {
    if (!running || dayEvent || time !== Math.floor((activeCampaign.dayLength + activePlan.time) * 0.55)) return;
    const event = DAY_EVENTS[(legacy.day + CAMPAIGNS.findIndex((campaign) => campaign.id === campaignId)) % DAY_EVENTS.length];
    setDayEvent(event.id);
    if (event.id === "supply") {
      setResources((old) => Object.fromEntries(Object.entries(old).map(([key, amount]) => [key, amount + 18])));
    } else if (event.id === "guild") {
      setDayModifier((old) => ({ ...old, gather: 1.25 }));
    } else {
      setDayModifier((old) => ({ ...old, cost: 0.85 }));
    }
    setToast({ title: event.title, text: event.text, icon: event.icon });
    chime();
    const timer = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timer);
  }, [running, dayEvent, time, activeCampaign.dayLength, activePlan.time, legacy.day, campaignId, chime]);

  const startDay = () => {
    if (running) return;
    setTime(activeCampaign.dayLength + activePlan.time);
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
    const amount = (1.5 + legacy.upgrades.carts * 0.5) * roadBonus * (activePlan.tap || 1);
    setResources((old) => ({ ...old, [job]: old[job] + amount }));
    const rect = event.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setBursts((old) => [...old.slice(-8), { id, text: `+${amount.toFixed(1)}`, x: rect.left + rect.width / 2, y: rect.top }]);
    setTimeout(() => setBursts((old) => old.filter((b) => b.id !== id)), 800);
    playTone(170 + JOBS.findIndex((item) => item.id === job) * 35, 0.06, "square", 0.018);
  };

  const costFor = (building) => Object.fromEntries(Object.entries(building.cost).map(([key, amount]) => [
    key,
    Math.max(1, Math.ceil(amount * Math.max(0.5, 1 - legacy.upgrades.architects * 0.05) * activePlan.cost * dayModifier.cost))
  ]));
  const canAfford = (building) => Object.entries(costFor(building)).every(([key, amount]) => resources[key] >= amount);

  const build = (building) => {
    if (!running) startDay();
    if (!canAfford(building) || buildings[building.id] >= building.max) return;
    setResources((old) => {
      const next = { ...old };
      Object.entries(costFor(building)).forEach(([key, amount]) => next[key] -= amount);
      return next;
    });
    setBuildings((old) => ({ ...old, [building.id]: old[building.id] + 1 }));
    setBuildFlash(building.id);
    setTimeout(() => setBuildFlash(null), 650);
    playTone(building.id === "colosseum" ? 110 : 95, 0.16, "sawtooth", 0.035);
    setTimeout(() => playTone(145, 0.1, "square", 0.02), 90);
    setMessage(`${building.name} complete. Rome reaches a little higher.`);
  };

  const tomorrow = () => {
    const currentIndex = CAMPAIGNS.findIndex((campaign) => campaign.id === campaignId);
    const nextCampaign = won && currentIndex < CAMPAIGNS.length - 1 ? CAMPAIGNS[currentIndex + 1] : activeCampaign;
    setLegacy((old) => ({ ...old, day: old.day + 1 }));
    if (nextCampaign.id !== campaignId) setCampaignId(nextCampaign.id);
    setPlanId("balanced");
    setTime(nextCampaign.dayLength);
    setResources({ wood: 15 + palatineBonus, stone: 12 + palatineBonus, clay: 8 + palatineBonus, food: 15 + palatineBonus });
    setWorkers({ wood: 0, stone: 0, clay: 0, food: 0 });
    setBuildings(emptyBuildings);
    setDayEvent(null);
    setDayModifier({ gather: 1, cost: 1 });
    setEnded(false);
    setWon(false);
    setMessage(nextCampaign.id !== campaignId ? `${nextCampaign.name} awaits. Rome’s knowledge marches with you.` : "The city is gone. The knowledge remains.");
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
    playTone(523, 0.16, "sine", 0.04);
  };

  const installApp = async () => {
    if (!installPrompt) {
      setToast({ title: "Install Rome", text: "Use your browser menu and choose “Add to Home Screen.”", icon: "⊞" });
      setTimeout(() => setToast(null), 4500);
      return;
    }
    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  const selectCampaign = (campaign) => {
    const unlocked = !campaign.unlock || legacy.completedCampaigns.includes(campaign.unlock);
    if (!unlocked || running) return;
    setCampaignId(campaign.id);
    setPlanId("balanced");
    setTime(campaign.dayLength);
    setResources({ wood: 15 + palatineBonus, stone: 12 + palatineBonus, clay: 8 + palatineBonus, food: 15 + palatineBonus });
    setWorkers({ wood: 0, stone: 0, clay: 0, food: 0 });
    setBuildings(emptyBuildings);
    setDayEvent(null);
    setDayModifier({ gather: 1, cost: 1 });
    setEnded(false);
    setWon(false);
    setMessage(`${campaign.name}: ${campaign.brief}`);
    setActiveTab("build");
  };

  const currentDayLength = activeCampaign.dayLength + activePlan.time;
  const sunPct = ((currentDayLength - time) / currentDayLength) * 100;
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
          <div><h1>{activeCampaign.name === "Rome" ? "ROME WASN’T BUILT IN A DAY" : activeCampaign.name.toUpperCase()}</h1><p>Chapter {activeCampaign.chapter} · {activeCampaign.subtitle}</p></div>
        </div>
        <div className="headerActions">
          <button className={soundOn ? "on" : ""} onClick={() => setSoundOn((old) => !old)} aria-label="Toggle sound">{soundOn ? "◖))" : "◖×"}</button>
          <button className={musicOn ? "on" : ""} onClick={() => { setMusicOn((old) => !old); if (!musicOn) setSoundOn(true); }} aria-label="Toggle music">♫</button>
          <button onClick={installApp} aria-label="Install game">⊞</button>
          <div className="dayBadge"><small>ATTEMPT</small><strong>DAY {legacy.day}</strong></div>
        </div>
      </header>

      <section className="sky" style={{ "--sun": `${sunPct}%` }}>
        <div className="sun" />
        <div className="horizon">
          <div className="city">
            {cityItems.length === 0 && <div className="emptyCity"><span>⅋</span><p>An empty field awaits.</p></div>}
            {cityItems.map((item, index) => (
              <div className={`cityBuilding ${item.id} ${buildFlash === item.id && index === cityItems.length - 1 ? "buildingNow" : ""}`} key={item.key} style={{ "--i": index }}>
                <span>{item.icon}</span>
              </div>
            ))}
            {running && Array.from({ length: Math.min(10, Math.max(2, assigned)) }).map((_, index) => (
              <div className="crew" key={index} style={{ "--crew": index, "--delay": `${index * -0.73}s` }}>
                <span>♟</span><i>⌁</i>
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
        <div className="objectiveFloat">
          <small>CHAPTER {activeCampaign.chapter} OBJECTIVE</small>
          <strong>{activeCampaign.brief}</strong>
          <div><i style={{ width: `${objectiveProgress * 100}%` }} /></div>
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
          {!running && !ended && (
            <>
              <div className="planLabel">PRE-DAWN ORDERS</div>
              <div className="planChoices">
                {PLANS.map((plan) => (
                  <button className={planId === plan.id ? "selected" : ""} key={plan.id} onClick={() => { setPlanId(plan.id); setTime(activeCampaign.dayLength + plan.time); }}>
                    <span>{plan.icon}</span><div><strong>{plan.name}</strong><small>{plan.desc}</small></div>
                  </button>
                ))}
              </div>
              <button className="start" onClick={startDay}>BEGIN THE DAY <span>→</span></button>
            </>
          )}
        </aside>

        <section className="ledger">
          <nav>
            <button className={activeTab === "build" ? "active" : ""} onClick={() => setActiveTab("build")}>BUILD ROME</button>
            <button className={activeTab === "legacy" ? "active" : ""} onClick={() => setActiveTab("legacy")}>LEGACY <b>{legacy.laurels}</b></button>
            <button className={activeTab === "chronicle" ? "active" : ""} onClick={() => setActiveTab("chronicle")}>CHRONICLE</button>
          </nav>

          {activeTab === "build" ? (
            <div className="cards">
              {BUILDINGS.map((building) => {
                const affordable = canAfford(building);
                const capped = buildings[building.id] >= building.max;
                return (
                  <button className={`buildCard ${affordable && !capped ? "ready" : ""}`} key={building.id} onClick={() => build(building)} disabled={capped}>
                    <span className={`buildingIcon ${building.id}`}>{building.icon}</span>
                    <span className="buildCopy"><small>{building.roman}</small><strong>{building.name}</strong><em>{building.desc}</em><span className="cost">{capped ? "COMPLETE" : formatCost(costFor(building))}</span></span>
                    <b>{buildings[building.id]}/{building.max}</b>
                  </button>
                );
              })}
            </div>
          ) : activeTab === "legacy" ? (
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
          ) : (
            <div className="chronicle">
              <div className="campaignMap">
                {CAMPAIGNS.map((campaign) => {
                  const unlocked = !campaign.unlock || legacy.completedCampaigns.includes(campaign.unlock);
                  const complete = legacy.completedCampaigns.includes(campaign.id);
                  return (
                    <button className={`${unlocked ? "unlocked" : ""} ${campaign.id === campaignId ? "current" : ""}`} key={campaign.id} disabled={!unlocked || running} onClick={() => selectCampaign(campaign)}>
                      <span>{complete ? "✓" : unlocked ? campaign.chapter : "×"}</span>
                      <div><small>CHAPTER {campaign.chapter}</small><strong>{campaign.name}</strong><em>{complete ? "CONQUERED" : unlocked ? campaign.subtitle : "LOCKED"}</em></div>
                    </button>
                  );
                })}
              </div>
              <div className="chronicleHead">
                <div><small>THE GROWING CITY</small><strong>{DISTRICTS.filter(districtUnlocked).length} / {DISTRICTS.length} districts</strong></div>
                <div><small>DEEDS REMEMBERED</small><strong>{legacy.achievements.length} / {ACHIEVEMENTS.length} achievements</strong></div>
              </div>
              <div className="districtRoad">
                {DISTRICTS.map((district, index) => {
                  const unlocked = districtUnlocked(district);
                  return (
                    <div className={`district ${unlocked ? "unlocked" : ""}`} key={district.id}>
                      <span>{unlocked ? district.icon : "?"}</span>
                      <div><small>DISTRICT {index + 1}</small><strong>{district.name}</strong><em>{unlocked ? district.perk : district.victory ? "Build Rome in one day." : `${district.need - legacy.total} more lifetime buildings`}</em></div>
                    </div>
                  );
                })}
              </div>
              <div className="achievementGrid">
                {ACHIEVEMENTS.map((achievement) => {
                  const earned = legacy.achievements.includes(achievement.id);
                  return (
                    <div className={`achievement ${earned ? "earned" : ""}`} key={achievement.id}>
                      <span>{earned ? achievement.icon : "·"}</span>
                      <div><strong>{earned ? achievement.name : "Unknown Deed"}</strong><small>{earned ? achievement.desc : "Keep building to reveal."}</small></div>
                    </div>
                  );
                })}
              </div>
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
      {toast && <div className="toast"><span>{toast.icon}</span><div><small>{toast.title}</small><strong>{toast.text}</strong></div></div>}

      {ended && (
        <div className="overlay">
          <div className="nightCard">
            <span className="wreath">❧</span>
            <small>{won ? "THE IMPOSSIBLE DAY" : "SUNSET • ATTEMPT COMPLETE"}</small>
            <h2>{won ? `${activeCampaign.name.toUpperCase()} STANDS.` : `${activeCampaign.name.toUpperCase()} WASN’T BUILT TODAY.`}</h2>
            <p>{won ? `Against time itself, your builders completed the works of ${activeCampaign.name} before nightfall.` : "The roads vanish. The walls return to dust. But skilled hands remember."}</p>
            <div className="results"><span><small>RENOWN</small><b>{score}</b></span><span><small>BUILDINGS</small><b>{Object.values(buildings).reduce((a, b) => a + b, 0)}</b></span><span><small>LAURELS</small><b>{legacy.laurels}</b></span></div>
            <button onClick={tomorrow}>{won && campaignId !== "mediterranean" ? "MARCH TO THE NEXT CHAPTER" : won ? "RULE THE EMPIRE" : "TRY AGAIN TOMORROW"} <span>→</span></button>
            <em>Nothing remains but knowledge.</em>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
