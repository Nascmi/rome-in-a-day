"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DAY_LENGTH = 90;
const LEGACY_SAVE_KEY = "rome-in-a-day-v1";
const SAVE_KEY = "rome-in-a-day-v2";

const CAMPAIGNS = [
  {
    id: "rome", chapter: "I", name: "Rome", subtitle: "Raise the Eternal City",
    dayLength: 90, unlock: null, reward: 25,
    goal: { colosseum: 1 },
    brief: "Crown the city with the Colosseum before sunset."
  },
  {
    id: "italia", chapter: "II", name: "Italia", subtitle: "Unite the Peninsula",
    dayLength: 125, unlock: "rome", reward: 55, costScale: 1.65,
    goal: { road: 18, hut: 12, workshop: 6, aqueduct: 4, temple: 2, granary: 2, forum: 1, fort: 1 },
    brief: "Unite Italia with roads, granaries, a forum, and a fortified frontier."
  },
  {
    id: "mediterranean", chapter: "III", name: "Mare Nostrum", subtitle: "Command the Inland Sea",
    dayLength: 180, unlock: "italia", reward: 90, costScale: 1.9,
    goal: { road: 18, workshop: 6, aqueduct: 4, temple: 2, colosseum: 1, harbor: 2, shipyard: 1, lighthouse: 1, basilica: 1 },
    brief: "Command the sea with harbors, a shipyard, lighthouse, and imperial basilica."
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

const LAST_PUSHES = [
  { id: "rally", name: "Rally the Crews", icon: "⚑", desc: "+45% gathering and construction until sunset." },
  { id: "salvage", name: "Strip the Scaffolds", icon: "⚒", desc: "Recover 30 of every material." },
  { id: "simplify", name: "Simplify the Plans", icon: "△", desc: "Construction costs 15% less until sunset." }
];

const JOBS = [
  { id: "wood", name: "Timber", icon: "♣", color: "#6d8b55" },
  { id: "stone", name: "Stone", icon: "◆", color: "#8b8d88" },
  { id: "clay", name: "Clay", icon: "●", color: "#b75e3e" },
  { id: "food", name: "Food", icon: "▲", color: "#c49b44" }
];

const BUILDINGS = [
  { id: "road", name: "Road", roman: "VIA", icon: "═", seconds: 2, cost: { stone: 10 }, points: 8, max: 18, desc: "Every 3 roads makes everyone 5% faster." },
  { id: "hut", name: "Insula", roman: "DOMUS", icon: "⌂", seconds: 3, cost: { wood: 12, clay: 8 }, points: 20, max: 12, desc: "A humble home for the growing population." },
  { id: "workshop", name: "Workshop", roman: "OFFICINA", icon: "⚒", seconds: 5, cost: { wood: 22, stone: 15 }, points: 45, max: 6, desc: "Raises all gathering by 12% this day." },
  { id: "aqueduct", name: "Aqueduct", roman: "AQUAEDUCTUS", icon: "⋂", seconds: 8, cost: { stone: 38, clay: 25 }, points: 90, max: 4, desc: "Carries fresh water across the land." },
  { id: "temple", name: "Temple", roman: "TEMPLUM", icon: "♜", seconds: 12, cost: { wood: 25, stone: 55, clay: 30 }, points: 160, max: 2, desc: "A monument worthy of memory." },
  { id: "colosseum", name: "Colosseum", roman: "COLOSSEUM", icon: "◉", seconds: 20, cost: { wood: 90, stone: 160, clay: 110, food: 60 }, points: 600, max: 1, campaigns: ["rome", "mediterranean"], desc: "The crowning achievement of the capital." },
  { id: "granary", name: "Granary", roman: "HORREUM", icon: "▤", seconds: 9, cost: { wood: 95, clay: 120, food: 70 }, points: 340, max: 2, campaigns: ["italia"], desc: "Feeds the towns of a united peninsula." },
  { id: "forum", name: "Great Forum", roman: "FORUM", icon: "▥", seconds: 18, cost: { wood: 140, stone: 210, clay: 90, food: 80 }, points: 720, max: 1, campaigns: ["italia"], desc: "The civic heart of all Italia." },
  { id: "fort", name: "Frontier Fort", roman: "CASTRUM", icon: "▰", seconds: 20, cost: { wood: 190, stone: 260, clay: 120, food: 140 }, points: 900, max: 1, campaigns: ["italia"], desc: "Secures the roads and distant settlements." },
  { id: "harbor", name: "Grand Harbor", roman: "PORTUS", icon: "≋", seconds: 18, cost: { wood: 260, stone: 210, clay: 140, food: 180 }, points: 1100, max: 2, campaigns: ["mediterranean"], desc: "Opens a gateway across the inland sea." },
  { id: "shipyard", name: "Imperial Shipyard", roman: "NAVALIA", icon: "ϟ", seconds: 25, cost: { wood: 440, stone: 280, clay: 160, food: 250 }, points: 1700, max: 1, campaigns: ["mediterranean"], desc: "Constructs the fleet that binds the empire." },
  { id: "lighthouse", name: "Great Lighthouse", roman: "PHARUS", icon: "♢", seconds: 28, cost: { wood: 180, stone: 520, clay: 240, food: 170 }, points: 1900, max: 1, campaigns: ["mediterranean"], desc: "Guides Roman ships safely home." },
  { id: "basilica", name: "Imperial Basilica", roman: "BASILICA", icon: "♚", seconds: 32, cost: { wood: 300, stone: 620, clay: 300, food: 260 }, points: 2400, max: 1, campaigns: ["mediterranean"], desc: "The monumental seat of imperial power." }
];

const UPGRADES = [
  { id: "hands", name: "Calloused Hands", icon: "✊", desc: "+15% gathering speed", base: 3 },
  { id: "rations", name: "Dawn Rations", icon: "◒", desc: "+2 starting workers", base: 4 },
  { id: "carts", name: "Better Carts", icon: "⊞", desc: "+25% tap power", base: 3 },
  { id: "foremen", name: "Foremen", icon: "⚑", desc: "Start with auto-assigned workers", base: 6 },
  { id: "architects", name: "Architects", icon: "△", desc: "Buildings cost 5% less; level 3 adds a build slot", base: 8 },
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
  completedCampaigns: [], campaignStats: {},
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
  const [constructionWorkers, setConstructionWorkers] = useState(0);
  const [constructionQueue, setConstructionQueue] = useState([]);
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
  const [dayModifier, setDayModifier] = useState({ gather: 1, cost: 1, construction: 1 });
  const [lastPush, setLastPush] = useState(null);
  const [announcedPhase, setAnnouncedPhase] = useState("dawn");
  const [lastResult, setLastResult] = useState(null);
  const [pendingRun, setPendingRun] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const latest = useRef({});
  const audioContext = useRef(null);
  const musicTimer = useRef(null);
  const constructionQueueRef = useRef([]);

  const activeCampaign = CAMPAIGNS.find((campaign) => campaign.id === campaignId) || CAMPAIGNS[0];
  const activePlan = PLANS.find((plan) => plan.id === planId) || PLANS[0];
  const districtUnlocked = (district) => district.victory ? legacy.victories >= district.need : legacy.total >= district.need;
  const forumBonus = districtUnlocked(DISTRICTS[1]) ? 1.1 : 1;
  const palatineBonus = districtUnlocked(DISTRICTS[2]) ? 10 : 0;
  const suburaWorkers = districtUnlocked(DISTRICTS[3]) ? 4 : 0;
  const capitolineBonus = districtUnlocked(DISTRICTS[4]) ? 1.2 : 1;
  const totalWorkers = 4 + legacy.upgrades.rations * 2 + legacy.upgrades.legion * 4 + suburaWorkers + Math.min(8, Math.floor((legacy.total || 0) / 8));
  const resourceWorkers = Object.values(workers).reduce((a, b) => a + b, 0);
  const assigned = resourceWorkers + constructionWorkers;
  const idle = totalWorkers - assigned;
  const score = Math.floor(BUILDINGS.reduce((sum, b) => sum + buildings[b.id] * b.points, 0) * capitolineBonus);
  const roadBonus = 1 + Math.floor(buildings.road / 3) * 0.05;
  const workshopBonus = 1 + buildings.workshop * 0.12;
  const gatherRate = (1 + legacy.upgrades.hands * 0.15) * roadBonus * workshopBonus * forumBonus * activePlan.gather * dayModifier.gather;
  const effectiveCrew = (count) => count <= 8 ? count : 8 + Math.pow(count - 8, 0.72);
  const constructionSpeed = (0.35 + effectiveCrew(constructionWorkers) * 0.22) * dayModifier.construction;
  const buildSlots = legacy.upgrades.architects >= 3 ? 2 : 1;
  const campaignComplete = Object.entries(activeCampaign.goal).every(([id, needed]) => buildings[id] >= needed);
  const objectiveProgress = Object.entries(activeCampaign.goal).reduce((sum, [id, needed]) => sum + Math.min(1, buildings[id] / needed), 0) / Object.keys(activeCampaign.goal).length;
  const remainingObjectives = Object.entries(activeCampaign.goal)
    .filter(([id, needed]) => buildings[id] < needed)
    .map(([id, needed]) => ({
      id,
      name: BUILDINGS.find((building) => building.id === id)?.name || id,
      built: buildings[id],
      needed,
      remaining: needed - buildings[id]
    }))
    .sort((a, b) => (a.built / a.needed) - (b.built / b.needed));
  const currentDayLength = activeCampaign.dayLength + activePlan.time;
  const elapsedRatio = 1 - (time / currentDayLength);
  const dayPhase = !running ? "dawn" : time <= 15 ? "final" : elapsedRatio >= 0.78 ? "evening" : elapsedRatio >= 0.45 ? "afternoon" : "morning";

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
      const envelope = JSON.parse(localStorage.getItem(SAVE_KEY));
      const legacySave = envelope?.version === 2 ? envelope.legacy : JSON.parse(localStorage.getItem(LEGACY_SAVE_KEY));
      if (legacySave) {
        const completedCampaigns = legacySave.completedCampaigns || (legacySave.victories > 0 ? ["rome"] : []);
        setLegacy({
          ...freshLegacy,
          ...legacySave,
          completedCampaigns,
          campaignStats: legacySave.campaignStats || {},
          achievements: legacySave.achievements || [],
          upgrades: { ...freshLegacy.upgrades, ...legacySave.upgrades }
        });
        if (envelope?.version === 2) {
          setSoundOn(envelope.preferences?.soundOn ?? true);
          setMusicOn(envelope.preferences?.musicOn ?? false);
        }
        if (envelope?.version === 2 && envelope.run?.running && envelope.run.time > 0) {
          setPendingRun(envelope.run);
        } else if (completedCampaigns.includes("rome")) {
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
    if (!loaded) return;
    const timer = setTimeout(() => {
      const activeRun = running ? {
        running: true,
        savedAt: Date.now(),
        campaignId,
        planId,
        time,
        resources,
        workers,
        constructionWorkers,
        constructionQueue,
        buildings,
        dayEvent,
        dayModifier,
        lastPush,
        announcedPhase
      } : pendingRun;
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        version: 2,
        legacy,
        preferences: { soundOn, musicOn },
        run: activeRun || null
      }));
    }, 100);
    return () => clearTimeout(timer);
  }, [loaded, legacy, soundOn, musicOn, running, pendingRun, campaignId, planId, time, resources, workers, constructionWorkers, constructionQueue, buildings, dayEvent, dayModifier, lastPush, announcedPhase]);

  useEffect(() => {
    latest.current = { score, buildings, won, campaignId, time, constructionQueue };
  }, [score, buildings, won, campaignId, time, constructionQueue]);

  useEffect(() => {
    constructionQueueRef.current = constructionQueue;
  }, [constructionQueue]);

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
    const goalEntries = Object.entries(completedCampaign.goal);
    const progress = goalEntries.reduce((sum, [id, needed]) => sum + Math.min(1, (current.buildings[id] || 0) / needed), 0) / goalEntries.length;
    const oldStats = legacy.campaignStats[completedCampaign.id] || { attempts: 0, victories: 0, bestProgress: 0, bestTimeRemaining: 0 };
    const newProgressRecord = progress > oldStats.bestProgress;
    const newTimeRecord = victory && (current.time || 0) > oldStats.bestTimeRemaining;
    const earned = Math.max(1, Math.floor((current.score || 0) / 45) + Math.floor(completed / 3) + (victory ? completedCampaign.reward : 0));
    setLastResult({
      victory,
      progress,
      earned,
      timeRemaining: current.time || 0,
      newProgressRecord,
      newTimeRecord,
      underway: (current.constructionQueue || []).map((project) => ({
        name: project.name,
        progress: Math.floor(project.progress)
      })),
      remaining: goalEntries
        .filter(([id, needed]) => (current.buildings[id] || 0) < needed)
        .map(([id, needed]) => ({
          name: BUILDINGS.find((building) => building.id === id)?.name || id,
          remaining: needed - (current.buildings[id] || 0)
        }))
    });
    setLegacy((old) => ({
      ...old,
      laurels: old.laurels + earned,
      best: Math.max(old.best, current.score || 0),
      total: old.total + completed,
      victories: old.victories + (victory ? 1 : 0),
      completedCampaigns: victory && !old.completedCampaigns.includes(completedCampaign.id)
        ? [...old.completedCampaigns, completedCampaign.id]
        : old.completedCampaigns,
      campaignStats: {
        ...old.campaignStats,
        [completedCampaign.id]: {
          attempts: (old.campaignStats[completedCampaign.id]?.attempts || 0) + 1,
          victories: (old.campaignStats[completedCampaign.id]?.victories || 0) + (victory ? 1 : 0),
          bestProgress: Math.max(old.campaignStats[completedCampaign.id]?.bestProgress || 0, progress),
          bestTimeRemaining: Math.max(old.campaignStats[completedCampaign.id]?.bestTimeRemaining || 0, victory ? (current.time || 0) : 0)
        }
      }
    }));
    if (victory) chime();
    setMessage(victory ? "Rome stands before sunset. The impossible is done." : `Night falls. History remembers what your builders learned. +${earned} laurels.`);
  }, [chime, legacy.campaignStats]);

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
          next[job.id] += effectiveCrew(workers[job.id]) * gatherRate * 0.5;
        });
        return next;
      });
    }, 500);
    return () => clearInterval(gather);
  }, [running, workers, gatherRate]);

  useEffect(() => {
    if (!running || constructionQueue.length === 0) return;
    const construction = setInterval(() => {
      const oldQueue = constructionQueueRef.current;
      const updated = oldQueue.map((project, index) => index < buildSlots
        ? { ...project, progress: Math.min(100, project.progress + (constructionSpeed / project.seconds) * 25) }
        : project
      );
      const completed = updated.filter((project, index) => index < buildSlots && project.progress >= 100);
      const remaining = updated.filter((project) => project.progress < 100);
      constructionQueueRef.current = remaining;
      setConstructionQueue(remaining);
      if (completed.length > 0) {
        setBuildings((old) => {
          const next = { ...old };
          completed.forEach((project) => { next[project.buildingId] += 1; });
          return next;
        });
        const latestProject = completed[completed.length - 1];
        setBuildFlash(latestProject.buildingId);
        setTimeout(() => setBuildFlash(null), 650);
        setMessage(`${latestProject.name} complete. ${completed.length > 1 ? "The skyline surges upward." : "The scaffolding falls away."}`);
        playTone(118, 0.16, "sawtooth", 0.035);
        setTimeout(() => playTone(165, 0.1, "square", 0.02), 90);
      }
    }, 250);
    return () => clearInterval(construction);
  }, [running, constructionQueue.length, constructionSpeed, buildSlots, playTone]);

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

  useEffect(() => {
    if (!running || dayPhase === announcedPhase) return;
    setAnnouncedPhase(dayPhase);
    const phaseCopy = {
      morning: { title: "Morning", text: `${activePlan.name}. The day begins with confidence.`, icon: "☼" },
      afternoon: { title: "The Sun Climbs", text: "The opening is over. Adapt the plan.", icon: "☼" },
      evening: { title: "Evening Approaches", text: `${remainingObjectives.length} objectives remain before sunset.`, icon: "◒" },
      final: { title: "Final Light", text: "Fifteen seconds. One last order.", icon: "◐" }
    }[dayPhase];
    if (!phaseCopy) return;
    setToast(phaseCopy);
    if (dayPhase === "final") chime();
    const timer = setTimeout(() => setToast(null), dayPhase === "final" ? 3200 : 2200);
    return () => clearTimeout(timer);
  }, [running, dayPhase, announcedPhase, remainingObjectives.length, activePlan.name, chime]);

  useEffect(() => {
    if (!running || time > 10 || time <= 0) return;
    playTone(time <= 3 ? 620 : 310, 0.055, "square", time <= 3 ? 0.045 : 0.022);
  }, [running, time, playTone]);

  const startDay = () => {
    if (running) return;
    setTime(activeCampaign.dayLength + activePlan.time);
    setLastResult(null);
    setAnnouncedPhase("dawn");
    setRunning(true);
    setMessage("Daylight is precious. Put every pair of hands to work.");
    if (legacy.upgrades.foremen > 0 && assigned === 0) {
      const auto = { wood: 0, stone: 0, clay: 0, food: 0 };
      const buildersForConstruction = Math.max(1, Math.floor(totalWorkers * 0.18));
      for (let i = 0; i < totalWorkers - buildersForConstruction; i++) auto[JOBS[i % 4].id]++;
      setWorkers(auto);
      setConstructionWorkers(buildersForConstruction);
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

  const assignConstruction = (amount) => {
    if (!running) startDay();
    setConstructionWorkers((old) => {
      if (amount > 0 && idle <= 0) return old;
      if (amount < 0 && old <= 0) return old;
      return old + amount;
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
    Math.max(1, Math.ceil(amount * Math.max(0.65, Math.max(0.5, 1 - legacy.upgrades.architects * 0.05) * activePlan.cost * dayModifier.cost) * (activeCampaign.costScale || 1)))
  ]));
  const canAfford = (building) => Object.entries(costFor(building)).every(([key, amount]) => resources[key] >= amount);
  const queuedCount = (buildingId) => constructionQueue.filter((project) => project.buildingId === buildingId).length;

  const build = (building) => {
    if (!running) startDay();
    if (!canAfford(building) || buildings[building.id] + queuedCount(building.id) >= building.max) return;
    if (constructionQueue.length >= 4) {
      setMessage("The construction ledger is full. Finish a project before ordering another.");
      return;
    }
    setResources((old) => {
      const next = { ...old };
      Object.entries(costFor(building)).forEach(([key, amount]) => next[key] -= amount);
      return next;
    });
    const project = {
      queueId: `${Date.now()}-${Math.random()}`,
      buildingId: building.id,
      name: building.name,
      icon: building.icon,
      seconds: building.seconds,
      progress: 0
    };
    setConstructionQueue((old) => [...old, project]);
    setMessage(`${building.name} ordered. Move builders to construction to raise it before sunset.`);
    playTone(95, 0.1, "square", 0.025);
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
    setConstructionWorkers(0);
    setConstructionQueue([]);
    setBuildings(emptyBuildings);
    setDayEvent(null);
    setDayModifier({ gather: 1, cost: 1, construction: 1 });
    setLastPush(null);
    setAnnouncedPhase("dawn");
    setLastResult(null);
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

  const restoreRun = (run) => {
    const campaign = CAMPAIGNS.find((item) => item.id === run.campaignId) || CAMPAIGNS[0];
    const plan = PLANS.find((item) => item.id === run.planId) || PLANS[0];
    setCampaignId(campaign.id);
    setPlanId(plan.id);
    setTime(Math.max(1, Math.min(run.time || campaign.dayLength + plan.time, campaign.dayLength + plan.time)));
    setResources({ wood: 0, stone: 0, clay: 0, food: 0, ...(run.resources || {}) });
    setWorkers({ wood: 0, stone: 0, clay: 0, food: 0, ...(run.workers || {}) });
    setConstructionWorkers(Math.max(0, run.constructionWorkers || 0));
    setConstructionQueue(Array.isArray(run.constructionQueue) ? run.constructionQueue.slice(0, 4) : []);
    setBuildings({ ...emptyBuildings, ...(run.buildings || {}) });
    setDayEvent(run.dayEvent || null);
    setDayModifier({ gather: 1, cost: 1, construction: 1, ...(run.dayModifier || {}) });
    setLastPush(run.lastPush || null);
    setAnnouncedPhase(run.announcedPhase || "dawn");
    setEnded(false);
    setWon(false);
    setLastResult(null);
    setPendingRun(null);
    setActiveTab("build");
    setMessage(`Day ${legacy.day} resumes with ${Math.floor(run.time || 0)} seconds of daylight.`);
    setRunning(true);
  };

  const abandonSavedRun = () => {
    if (!pendingRun) return;
    restoreRun(pendingRun);
    setTimeout(() => finishDay(false), 250);
  };

  const resetAllProgress = () => {
    setRunning(false);
    setPendingRun(null);
    setLegacy({ ...freshLegacy, achievements: [], completedCampaigns: [], campaignStats: {}, upgrades: { ...freshLegacy.upgrades } });
    setCampaignId("rome");
    setPlanId("balanced");
    setTime(CAMPAIGNS[0].dayLength);
    setResources({ wood: 15, stone: 12, clay: 8, food: 15 });
    setWorkers({ wood: 0, stone: 0, clay: 0, food: 0 });
    setConstructionWorkers(0);
    setConstructionQueue([]);
    setBuildings(emptyBuildings);
    setDayEvent(null);
    setDayModifier({ gather: 1, cost: 1, construction: 1 });
    setLastPush(null);
    setAnnouncedPhase("dawn");
    setLastResult(null);
    setEnded(false);
    setWon(false);
    setActiveTab("build");
    setMessage("A new timeline begins with four builders and an empty field.");
    setShowReset(false);
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_SAVE_KEY);
  };

  const chooseLastPush = (push) => {
    if (lastPush || !running || time > 20) return;
    setLastPush(push.id);
    if (push.id === "rally") {
      setDayModifier((old) => ({ ...old, gather: old.gather * 1.45, construction: old.construction * 1.45 }));
    } else if (push.id === "salvage") {
      setResources((old) => Object.fromEntries(Object.entries(old).map(([key, amount]) => [key, amount + 30])));
    } else {
      setDayModifier((old) => ({ ...old, cost: old.cost * 0.85 }));
    }
    setMessage(`${push.name}. The builders make one final effort.`);
    playTone(440, 0.18, "sawtooth", 0.04);
  };

  const selectCampaign = (campaign) => {
    const unlocked = !campaign.unlock || legacy.completedCampaigns.includes(campaign.unlock);
    if (!unlocked || running) return;
    setCampaignId(campaign.id);
    setPlanId("balanced");
    setTime(campaign.dayLength);
    setResources({ wood: 15 + palatineBonus, stone: 12 + palatineBonus, clay: 8 + palatineBonus, food: 15 + palatineBonus });
    setWorkers({ wood: 0, stone: 0, clay: 0, food: 0 });
    setConstructionWorkers(0);
    setConstructionQueue([]);
    setBuildings(emptyBuildings);
    setDayEvent(null);
    setDayModifier({ gather: 1, cost: 1, construction: 1 });
    setLastPush(null);
    setAnnouncedPhase("dawn");
    setLastResult(null);
    setEnded(false);
    setWon(false);
    setMessage(`${campaign.name}: ${campaign.brief}`);
    setActiveTab("build");
  };

  const sunPct = ((currentDayLength - time) / currentDayLength) * 100;
  const clampedSunPct = Math.max(0, Math.min(100, sunPct));
  const sunX = 4 + clampedSunPct * 0.88;
  const sunY = 116 - Math.sin((clampedSunPct / 100) * Math.PI) * 92;
  const cityItems = useMemo(() => {
    const items = [];
    BUILDINGS.forEach((b) => {
      for (let i = 0; i < buildings[b.id]; i++) items.push({ ...b, key: `${b.id}-${i}` });
    });
    return items;
  }, [buildings]);

  if (!loaded) return <main className="loading">Waking the builders…</main>;

  return (
    <main className={`game phase-${dayPhase}`}>
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

      <section className={`sky ${dayPhase}`} style={{ "--sun": `${sunPct}%`, "--sun-x": `${sunX}%`, "--sun-y": `${sunY}px` }}>
        <div className="sun" />
        <div className="horizon">
          <div className="city">
            {cityItems.length === 0 && constructionQueue.length === 0 && <div className="emptyCity"><span>⅋</span><p>An empty field awaits.</p></div>}
            {cityItems.map((item, index) => (
              <div className={`cityBuilding ${item.id} ${buildFlash === item.id && index === cityItems.length - 1 ? "buildingNow" : ""}`} key={item.key} style={{ "--i": index }}>
                <span>{item.icon}</span>
              </div>
            ))}
            {constructionQueue.slice(0, buildSlots).map((project, index) => (
              <div className={`scaffold scaffold-${project.buildingId}`} key={project.queueId} style={{ "--scaffold": index, "--height": `${25 + project.progress * 0.75}%` }}>
                <span>{project.icon}</span><i style={{ height: `${project.progress}%` }} />
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
        {running && <div className="phaseStamp">{dayPhase === "final" ? "FINAL LIGHT" : dayPhase.toUpperCase()}</div>}
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

      {running && time <= 20 && !lastPush && (
        <section className="lastPush">
          <div className="lastPushTitle"><small>SUNSET DECISION</small><strong>ONE FINAL ORDER</strong><span>{time}s</span></div>
          <div>
            {LAST_PUSHES.map((push) => (
              <button key={push.id} onClick={() => chooseLastPush(push)}>
                <span>{push.icon}</span><div><strong>{push.name}</strong><small>{push.desc}</small></div>
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="workArea">
        <aside className="workers">
          <div className="panelTitle"><span>WORKFORCE</span><strong>{idle} idle / {totalWorkers}</strong></div>
          {totalWorkers >= 32 && <div className="logisticsNote"><span>⚑</span><div><strong>LEGION LOGISTICS</strong><small>Large crews stay powerful, but each additional worker adds less output.</small></div></div>}
          <div className="workerArt">{Array.from({ length: Math.min(totalWorkers, 16) }).map((_, i) => <i key={i}>♟</i>)}</div>
          {JOBS.map((job) => (
            <div className="job" key={job.id}>
              <span className="jobDot" style={{ background: job.color }} />
              <span>{job.name}<small>{(effectiveCrew(workers[job.id]) * gatherRate).toFixed(1)}/s</small></span>
              <div><button onClick={() => assign(job.id, -1)}>−</button><b>{workers[job.id]}</b><button onClick={() => assign(job.id, 1)}>+</button></div>
            </div>
          ))}
          <div className="job constructionJob">
            <span className="jobDot" />
            <span>Construction<small>{constructionSpeed.toFixed(2)}× build speed</small></span>
            <div><button onClick={() => assignConstruction(-1)}>−</button><b>{constructionWorkers}</b><button onClick={() => assignConstruction(1)}>+</button></div>
          </div>
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

          {activeTab === "build" && (
            <div className="constructionPanel">
              <div className="constructionHead">
                <span>CONSTRUCTION LEDGER</span>
                <strong>{buildSlots} active slot{buildSlots > 1 ? "s" : ""} · {constructionQueue.length}/4 ordered</strong>
              </div>
              {constructionQueue.length === 0 ? (
                <div className="emptyQueue"><span>⌁</span><small>Purchase a project to begin its foundation.</small></div>
              ) : (
                <div className="queueProjects">
                  {constructionQueue.map((project, index) => (
                    <div className={`queueProject ${index < buildSlots ? "active" : "waiting"}`} key={project.queueId}>
                      <span>{project.icon}</span>
                      <div><strong>{project.name}</strong><small>{index < buildSlots ? `${Math.floor(project.progress)}% · ${constructionSpeed.toFixed(2)}× speed` : "WAITING FOR A BUILD SLOT"}</small><i><b style={{ width: `${project.progress}%` }} /></i></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "build" ? (
            <div className="cards">
              {BUILDINGS.filter((building) => !building.campaigns || building.campaigns.includes(campaignId)).map((building) => {
                const affordable = canAfford(building);
                const inQueue = queuedCount(building.id);
                const capped = buildings[building.id] + inQueue >= building.max;
                const objectiveNeed = activeCampaign.goal[building.id];
                return (
                  <button className={`buildCard ${affordable && !capped ? "ready" : ""} ${objectiveNeed ? "objectiveBuild" : ""}`} key={building.id} onClick={() => build(building)} disabled={capped}>
                    <span className={`buildingIcon ${building.id}`}>{building.icon}</span>
                    <span className="buildCopy"><small>{building.roman}</small><strong>{building.name}</strong><em>{building.desc}</em><span className="cost">{capped && inQueue ? `${inQueue} QUEUED` : inQueue ? `${inQueue} queued · ${formatCost(costFor(building))}` : capped ? "COMPLETE" : `${formatCost(costFor(building))} · ${building.seconds}s base`}</span></span>
                    <b>{objectiveNeed ? `${buildings[building.id]}${inQueue ? `+${inQueue}` : ""}/${objectiveNeed} GOAL` : `${buildings[building.id]}${inQueue ? `+${inQueue}` : ""}/${building.max}`}</b>
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
              {!running && <div className="dangerZone">
                <div><strong>BEGIN A NEW TIMELINE</strong><small>Return to Day 1 with four builders. This cannot be undone.</small></div>
                <button onClick={() => setShowReset(true)}>RESET ALL PROGRESS</button>
              </div>}
            </div>
          ) : (
            <div className="chronicle">
              <div className="campaignMap">
                {CAMPAIGNS.map((campaign) => {
                  const unlocked = !campaign.unlock || legacy.completedCampaigns.includes(campaign.unlock);
                  const complete = legacy.completedCampaigns.includes(campaign.id);
                  const stats = legacy.campaignStats[campaign.id];
                  return (
                    <button className={`${unlocked ? "unlocked" : ""} ${campaign.id === campaignId ? "current" : ""}`} key={campaign.id} disabled={!unlocked || running} onClick={() => selectCampaign(campaign)}>
                      <span>{complete ? "✓" : unlocked ? campaign.chapter : "×"}</span>
                      <div><small>CHAPTER {campaign.chapter}</small><strong>{campaign.name}</strong><em>{complete ? "CONQUERED" : unlocked ? campaign.subtitle : "LOCKED"}</em>{stats && <b>{stats.attempts} days · {Math.round(stats.bestProgress * 100)}% best{stats.bestTimeRemaining ? ` · ${stats.bestTimeRemaining}s left` : ""}</b>}</div>
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

      {pendingRun && (
        <div className="overlay">
          <div className="nightCard resumeCard">
            <span className="wreath">☼</span>
            <small>A DAY PAUSED IN MEMORY</small>
            <h2>THE BUILDERS AWAIT.</h2>
            <p>Your active {CAMPAIGNS.find((campaign) => campaign.id === pendingRun.campaignId)?.name || "Rome"} attempt was safely paused.</p>
            <div className="results"><span><small>DAY</small><b>{legacy.day}</b></span><span><small>LIGHT LEFT</small><b>{Math.floor(pendingRun.time)}s</b></span><span><small>PROJECTS</small><b>{pendingRun.constructionQueue?.length || 0}</b></span></div>
            <button onClick={() => restoreRun(pendingRun)}>RESUME THE DAY <span>→</span></button>
            <button className="secondaryAction" onClick={abandonSavedRun}>LET SUNSET CLAIM THIS ATTEMPT</button>
            <em>Time remained paused while you were away.</em>
          </div>
        </div>
      )}

      {showReset && (
        <div className="overlay">
          <div className="nightCard resetCard">
            <span className="wreath">⌛</span>
            <small>IRREVERSIBLE DECISION</small>
            <h2>ERASE THIS TIMELINE?</h2>
            <p>This removes every worker, laurel, upgrade, achievement, district, campaign victory, record, and active project. You will return to Day 1 with four builders.</p>
            <div className="resetSummary"><span>{totalWorkers} workers</span><span>{legacy.laurels} laurels</span><span>{legacy.completedCampaigns.length} chapters</span></div>
            <button className="destructiveAction" onClick={resetAllProgress}>YES — ERASE ALL PROGRESS</button>
            <button className="secondaryAction" onClick={() => setShowReset(false)}>KEEP THIS TIMELINE</button>
            <em>Sound and music preferences will be preserved.</em>
          </div>
        </div>
      )}

      {ended && (
        <div className="overlay">
          <div className="nightCard">
            <span className="wreath">❧</span>
            <small>{won ? "THE IMPOSSIBLE DAY" : "SUNSET • ATTEMPT COMPLETE"}</small>
            <h2>{won ? `${activeCampaign.name.toUpperCase()} STANDS.` : `${activeCampaign.name.toUpperCase()} WASN’T BUILT TODAY.`}</h2>
            <p>{won ? `Against time itself, your builders completed the works of ${activeCampaign.name} before nightfall.` : lastResult?.progress >= 0.9 ? "So close that tomorrow already feels different." : "The roads vanish. The walls return to dust. But skilled hands remember."}</p>
            {lastResult && (
              <div className={`attemptVerdict ${won ? "victory" : ""}`}>
                <span>{won ? lastResult.timeRemaining <= 3 ? "BY THE FINAL RAY" : "BUILT BEFORE SUNSET" : lastResult.progress >= 0.9 ? "ALMOST IMPOSSIBLE" : "WHAT STOPPED THE BUILD"}</span>
                {!won && <strong>{Math.round(lastResult.progress * 100)}% complete</strong>}
                {won && <strong>{lastResult.timeRemaining}s of daylight remained</strong>}
                {(lastResult.newProgressRecord || lastResult.newTimeRecord) && <em>NEW PERSONAL RECORD</em>}
              </div>
            )}
            {!won && lastResult?.remaining?.length > 0 && (
              <div className="failureReport">
                <small>UNFINISHED BEFORE SUNSET</small>
                {lastResult.underway?.slice(0, 2).map((project) => (
                  <div className="underwayResult" key={`${project.name}-${project.progress}`}><span>{project.name}</span><strong>{project.progress}% built</strong></div>
                ))}
                {lastResult.remaining.slice(0, 4).map((objective) => (
                  <div key={objective.name}><span>{objective.name}</span><strong>{objective.remaining} remaining</strong></div>
                ))}
              </div>
            )}
            <div className="results"><span><small>RENOWN</small><b>{score}</b></span><span><small>PROGRESS</small><b>{Math.round((lastResult?.progress || objectiveProgress) * 100)}%</b></span><span><small>LAURELS</small><b>+{lastResult?.earned || 0}</b></span></div>
            <button onClick={tomorrow}>{won && campaignId !== "mediterranean" ? "MARCH TO THE NEXT CHAPTER" : won ? "RULE THE EMPIRE" : "TRY AGAIN TOMORROW"} <span>→</span></button>
            <em>{won ? "History remembers the impossible." : "Now you know what tomorrow requires."}</em>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
