export const LEGACY_SAVE_KEY = "rome-in-a-day-v1";
export const SAVE_KEY = "rome-in-a-day-v2";

export const CAMPAIGNS = [
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

export const CITY_STAGES = [
  {
    id: "settlement", name: "First Settlement", dayLength: 60, reward: 8,
    brief: "Lay roads, raise homes, and establish the first workshop.",
    goal: { road: 3, hut: 2, workshop: 1 },
    fact: "The Forum valley began as marshland. It was reclaimed in the late 7th century B.C. before becoming the center of Roman public life.",
    source: "Parco archeologico del Colosseo"
  },
  {
    id: "market", name: "Market District", dayLength: 66, reward: 10,
    brief: "Rebuild the settlement and establish Rome’s market.",
    goal: { road: 5, hut: 3, workshop: 1, market: 1 },
    fact: "Rome developed specialized markets. The Forum Holitorium was reserved for the trade of vegetables and legumes.",
    source: "Roma Capitale"
  },
  {
    id: "housing", name: "Residential Rome", dayLength: 72, reward: 13,
    brief: "Rebuild the market quarter and shelter a growing population.",
    goal: { road: 7, hut: 7, workshop: 2, market: 1 },
    fact: "Many Romans lived in rented apartment buildings called insulae. Crowding and scarce land pushed housing upward, sometimes through many floors.",
    source: "Roma Capitale"
  },
  {
    id: "civic", name: "Civic District", dayLength: 80, reward: 16,
    brief: "Add the Forum where commerce, law, religion, and public life meet.",
    goal: { road: 9, hut: 8, workshop: 3, market: 1, forum: 1 },
    fact: "The Roman Forum was not built from one plan. Political, religious, commercial, and judicial monuments accumulated there across centuries.",
    source: "Parco archeologico del Colosseo"
  },
  {
    id: "water", name: "Water & Faith", dayLength: 89, reward: 20,
    brief: "Bring water to Rome and raise temples worthy of the city.",
    goal: { road: 11, hut: 9, workshop: 3, market: 1, forum: 1, aqueduct: 2, temple: 1 },
    fact: "Rome’s first aqueduct, the Aqua Appia, was built in 312 B.C. Almost its entire course ran underground.",
    source: "Frontinus and the Topographical Dictionary of Ancient Rome"
  },
  {
    id: "senate", name: "Senate District", dayLength: 99, reward: 24,
    brief: "Rebuild the civic city and give the Senate a permanent home.",
    goal: { road: 13, hut: 10, workshop: 4, market: 1, forum: 1, aqueduct: 3, temple: 1, senate: 1 },
    fact: "Julius Caesar began his new Forum in 54 B.C. because the old Forum had become inadequate; the project also relocated the Senate’s Curia.",
    source: "Roma Capitale"
  },
  {
    id: "eternal", name: "The Eternal City", dayLength: 110, reward: 35,
    brief: "Build the complete city and crown Rome with the Colosseum.",
    goal: { road: 15, hut: 12, workshop: 5, market: 1, forum: 1, aqueduct: 4, temple: 2, senate: 1, colosseum: 1 },
    fact: "The Colosseum belonged to the Flavian building program and was inaugurated under Titus in A.D. 80—centuries after Rome’s earliest settlement.",
    source: "Parco archeologico del Colosseo"
  }
];

export const FRESH_CITY = {
  mastered: [],
  activeStage: "settlement"
};

export function normalizeCity(city, completedCampaigns = []) {
  const validIds = CITY_STAGES.map((stage) => stage.id);
  const mastered = Array.isArray(city?.mastered)
    ? city.mastered.filter((id) => validIds.includes(id))
    : completedCampaigns.includes("rome") ? validIds : [];
  const firstUnmastered = CITY_STAGES.find((stage) => !mastered.includes(stage.id));
  const requested = validIds.includes(city?.activeStage) ? city.activeStage : null;
  return {
    mastered,
    activeStage: requested && !mastered.includes(requested)
      ? requested
      : firstUnmastered?.id || "eternal"
  };
}

export function cityMasteryEffects(mastered = []) {
  return {
    gather: mastered.includes("market") ? 1.08 : 1,
    delivery: mastered.includes("civic") ? 1.08 : 1,
    extraTime: mastered.includes("senate") ? 5 : 0,
    roadSpeed: mastered.includes("settlement") ? 0.82 : 1,
    housingSpeed: mastered.includes("housing") ? 0.82 : 1,
    stoneSpeed: mastered.includes("water") ? 0.88 : 1
  };
}

export const PROVINCES = [
  { id: "gallia", name: "Gallia", icon: "♜", reward: 12, brief: "Hard stone and distant roads test Roman logistics.", modifier: { cost: 1.1, time: 0, gather: 1 } },
  { id: "hispania", name: "Hispania", icon: "☼", reward: 14, brief: "The western march begins late; daylight is shorter.", modifier: { cost: 1, time: -18, gather: 1 } },
  { id: "aegyptus", name: "Aegyptus", icon: "▲", reward: 16, brief: "The Nile feeds crews, but monumental works demand more.", modifier: { cost: 1.08, time: 0, gather: 1.12 } },
  { id: "asia", name: "Asia", icon: "✦", reward: 18, brief: "Prosperous cities expect the work to be finished swiftly.", modifier: { cost: 1.05, time: -10, gather: 1.06 } }
];

export const FRESH_EMPIRE = {
  influence: 0,
  conquered: [],
  activeProvince: null
};

export function normalizeEmpire(empire) {
  const conquered = Array.isArray(empire?.conquered)
    ? empire.conquered.filter((id) => PROVINCES.some((province) => province.id === id))
    : [];
  const activeProvince = PROVINCES.some((province) => province.id === empire?.activeProvince)
    && !conquered.includes(empire.activeProvince)
    ? empire.activeProvince
    : null;
  return {
    influence: Math.max(0, Math.floor(Number(empire?.influence) || 0)),
    conquered,
    activeProvince
  };
}

export function provinceEffects(provinceId) {
  return PROVINCES.find((province) => province.id === provinceId)?.modifier
    || { cost: 1, time: 0, gather: 1 };
}

export function conquerProvince(empire, provinceId) {
  const current = normalizeEmpire(empire);
  const province = PROVINCES.find((item) => item.id === provinceId);
  if (!province || current.conquered.includes(provinceId)) return current;
  return {
    influence: current.influence + province.reward,
    conquered: [...current.conquered, provinceId],
    activeProvince: null
  };
}

export function upgradeCost(upgrade, level) {
  return Math.ceil(upgrade.base * Math.pow(1.75, level));
}

export function normalizeLegacy(legacySave, freshLegacy, upgrades) {
  if (!legacySave) return {
    ...freshLegacy,
    achievements: [],
    completedCampaigns: [],
    campaignStats: {},
    upgrades: { ...freshLegacy.upgrades }
  };

  const completedCampaigns = legacySave.completedCampaigns
    || (legacySave.victories > 0 ? ["rome"] : []);
  const normalizedUpgrades = Object.fromEntries(upgrades.map((upgrade) => [
    upgrade.id,
    Math.max(0, Math.min(upgrade.max, Number(legacySave.upgrades?.[upgrade.id]) || 0))
  ]));

  return {
    ...freshLegacy,
    ...legacySave,
    completedCampaigns,
    campaignStats: legacySave.campaignStats || {},
    runHistory: Array.isArray(legacySave.runHistory) ? legacySave.runHistory.slice(0, 30) : [],
    empire: normalizeEmpire(legacySave.empire),
    city: normalizeCity(legacySave.city, completedCampaigns),
    achievements: legacySave.achievements || [],
    upgrades: normalizedUpgrades
  };
}

export function loadSave(storage, freshLegacy, upgrades) {
  const envelope = JSON.parse(storage.getItem(SAVE_KEY));
  const isV2 = envelope?.version === 2;
  const legacySave = isV2
    ? envelope.legacy
    : JSON.parse(storage.getItem(LEGACY_SAVE_KEY));
  const legacy = normalizeLegacy(legacySave, freshLegacy, upgrades);
  const run = isV2 && envelope.run?.running && envelope.run.time > 0
    ? envelope.run
    : null;

  return {
    legacy,
    preferences: {
      soundOn: isV2 ? (envelope.preferences?.soundOn ?? true) : true,
      musicOn: isV2 ? (envelope.preferences?.musicOn ?? false) : false
    },
    run
  };
}

export function createSaveEnvelope({ legacy, soundOn, musicOn, run }) {
  return {
    version: 2,
    legacy,
    preferences: { soundOn, musicOn },
    run: run || null
  };
}

export function resetSave(storage) {
  storage.removeItem(SAVE_KEY);
  storage.removeItem(LEGACY_SAVE_KEY);
}

export function isCampaignComplete(campaign, buildings) {
  return Object.entries(campaign.goal)
    .every(([id, needed]) => (buildings[id] || 0) >= needed);
}

export function campaignProgress(campaign, buildings, constructionQueue = []) {
  const goalEntries = Object.entries(campaign.goal);
  const progress = goalEntries.reduce((sum, [id, needed]) => {
    const underway = constructionQueue
      .filter((project) => project.buildingId === id)
      .reduce((total, project) => total + Math.max(0, Math.min(100, project.progress || 0)) / 100, 0);
    return sum + Math.min(1, ((buildings[id] || 0) + underway) / needed);
  }, 0);
  return progress / goalEntries.length;
}

export const EMPTY_PROFESSIONS = {
  laborers: 0,
  masons: 0,
  haulers: 0,
  engineers: 0
};

export function professionEffects(professions, totalWorkers) {
  const safeTotal = Math.max(1, totalWorkers);
  const trained = Object.values(professions).reduce((sum, count) => sum + count, 0);
  return {
    trained,
    untrained: Math.max(0, totalWorkers - trained),
    laborerGather: 1 + (professions.laborers / safeTotal) * 0.5,
    delivery: 1 + professions.haulers * 0.025,
    coordinationExponent: Math.min(0.88, 0.72 + professions.haulers * 0.008),
    masonry: 1 + professions.masons * 0.06,
    engineering: 1 + professions.engineers * 0.075,
    engineerSlot: professions.engineers >= 4
  };
}

export function workforceCoordination(assignedWorkers) {
  const assigned = Math.max(0, Number(assignedWorkers) || 0);
  return assigned <= 16 ? 1 : Math.pow(16 / assigned, 0.45);
}

export function workforcePreset(totalWorkers, mode) {
  const total = Math.max(0, Math.floor(Number(totalWorkers) || 0));
  const construction = mode === "build"
    ? Math.round(total * 0.5)
    : mode === "balanced"
      ? Math.max(0, Math.round(total * 0.25))
      : 0;
  const gatherers = mode === "stand-down" ? 0 : total - construction;
  const base = Math.floor(gatherers / 4);
  const remainder = gatherers % 4;
  const jobs = ["wood", "stone", "clay", "food"];

  return {
    workers: Object.fromEntries(jobs.map((job, index) => [job, base + (index < remainder ? 1 : 0)])),
    constructionWorkers: mode === "stand-down" ? 0 : construction
  };
}

export function constructionSchedule(projects, buildSlots, speeds) {
  const slotCount = Math.max(1, Math.floor(Number(buildSlots) || 1));
  const lanes = Array.from({ length: slotCount }, () => 0);
  return projects.map((project, index) => {
    const lane = lanes.indexOf(Math.min(...lanes));
    const startsIn = lanes[lane];
    const speed = Math.max(0.01, Number(speeds[index]) || 0.01);
    const duration = Math.max(0, project.seconds * (1 - Math.max(0, Math.min(100, project.progress || 0)) / 100) / speed);
    const finishesIn = startsIn + duration;
    lanes[lane] = finishesIn;
    return { lane, startsIn, duration, finishesIn };
  });
}

export function salvageProject(project, salvageRate = 0.7) {
  const unbuilt = 1 - Math.max(0, Math.min(100, Number(project?.progress) || 0)) / 100;
  const rate = Math.max(0, Math.min(1, Number(salvageRate) || 0));
  return Object.fromEntries(Object.entries(project?.paidCost || {}).map(([resource, amount]) => [
    resource,
    Math.floor(Math.max(0, Number(amount) || 0) * unbuilt * rate)
  ]));
}

export function moveQueueProject(projects, index, direction) {
  const nextIndex = index + direction;
  if (index < 0 || index >= projects.length || nextIndex < 0 || nextIndex >= projects.length) return projects;
  const next = [...projects];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

export function masteryGrade(timeRemaining, dayLength, victory) {
  if (!victory) return null;
  const ratio = Math.max(0, Number(timeRemaining) || 0) / Math.max(1, Number(dayLength) || 1);
  if (ratio >= 0.25) return { id: "laurel", name: "Laurel", detail: "Rome rose with a quarter-day to spare." };
  if (ratio >= 0.12) return { id: "gold", name: "Gold", detail: "The plan held comfortably before sunset." };
  if (ratio >= 0.04) return { id: "silver", name: "Silver", detail: "The city stood with precious light remaining." };
  return { id: "bronze", name: "Bronze", detail: "Rome rose beneath the final rays." };
}

export function objectiveShortfall(goal, buildings, queue = []) {
  const queued = queue.reduce((counts, project) => ({
    ...counts,
    [project.buildingId]: (counts[project.buildingId] || 0) + 1
  }), {});
  return Object.fromEntries(Object.entries(goal).map(([id, needed]) => [
    id,
    Math.max(0, needed - (buildings[id] || 0) - (queued[id] || 0))
  ]).filter(([, missing]) => missing > 0));
}

export function sunsetTimeline({ idleSeconds = 0, stalledSeconds = 0, surplus = 0, unfinished = 0 }) {
  const events = [];
  if (idleSeconds >= 5) events.push(`${idleSeconds}s passed with idle hands.`);
  if (stalledSeconds >= 3) events.push(`Construction stood without builders for ${stalledSeconds}s.`);
  if (unfinished > 0) events.push(`${unfinished} objective project${unfinished === 1 ? "" : "s"} never reached the ledger.`);
  if (surplus >= 80) events.push(`${Math.floor(surplus)} gathered materials remained unused at sunset.`);
  return events.slice(0, 3);
}

export function campaignEffects(campaignId, buildings, totalWorkers, resources) {
  if (campaignId === "rome") {
    const capacity = 4 + (buildings.hut || 0) * 3;
    const crowded = Math.max(0, totalWorkers - capacity);
    return {
      title: "Housing",
      value: `${Math.min(totalWorkers, capacity)} / ${capacity} sheltered`,
      detail: crowded ? `${crowded} builders are crowded; gathering and construction slow.` : "Every builder has room to recover.",
      efficiency: Math.max(0.65, 1 - crowded * 0.025),
      delivery: 1,
      foodDrain: 0
    };
  }
  if (campaignId === "italia") {
    const roadCoverage = Math.min(1, (buildings.road || 0) / 18);
    const supplied = (resources.food || 0) > 0;
    return {
      title: "Peninsula Supply",
      value: supplied ? `${Math.round(roadCoverage * 100)}% road coverage` : "Food stores empty",
      detail: supplied ? "Roads improve delivery between settlements." : "Hungry crews work at reduced strength.",
      efficiency: supplied ? 1 : 0.72,
      delivery: 1 + roadCoverage * 0.18,
      foodDrain: totalWorkers * 0.018
    };
  }
  const portCapacity = 8 + (buildings.harbor || 0) * 12 + (buildings.shipyard || 0) * 8;
  const overCapacity = Math.max(0, totalWorkers - portCapacity);
  const beaconBonus = (buildings.lighthouse || 0) * 0.12;
  return {
    title: "Port Throughput",
    value: `${Math.min(totalWorkers, portCapacity)} / ${portCapacity} supplied`,
    detail: overCapacity ? `${overCapacity} builders wait on overloaded docks.` : "The ports can supply every active crew.",
    efficiency: Math.max(0.7, 1 - overCapacity * 0.018),
    delivery: 1 + (buildings.harbor || 0) * 0.08 + beaconBonus,
    foodDrain: 0
  };
}

export function diagnoseFailure({ campaignId, pressure, resources, constructionWorkers, professions, constructionQueue }) {
  const insights = [];
  if ((pressure?.efficiency || 1) < 1) {
    insights.push(pressure.detail);
  }
  if (campaignId === "italia" && (resources?.food || 0) <= 0) {
    insights.push("Food ran out; keep gatherers on food or finish roads earlier to strengthen delivery.");
  }
  if ((constructionQueue?.length || 0) > 0 && (constructionWorkers || 0) === 0) {
    insights.push("Projects were ordered without a construction crew.");
  }
  const trained = Object.values(professions || {}).reduce((sum, count) => sum + count, 0);
  if (trained === 0) {
    insights.push("No professions were assigned; specialize part of the workforce for the chapter’s bottleneck.");
  }
  return insights.slice(0, 3);
}

export function restoreRunState(run, campaign, plan, emptyBuildings) {
  return {
    time: Math.max(1, Math.min(
      run.time || campaign.dayLength + plan.time,
      campaign.dayLength + plan.time
    )),
    resources: { wood: 0, stone: 0, clay: 0, food: 0, ...(run.resources || {}) },
    workers: { wood: 0, stone: 0, clay: 0, food: 0, ...(run.workers || {}) },
    constructionWorkers: Math.max(0, run.constructionWorkers || 0),
    professions: Object.fromEntries(Object.keys(EMPTY_PROFESSIONS).map((id) => [
      id,
      Math.max(0, Math.floor(Number(run.professions?.[id]) || 0))
    ])),
    constructionQueue: Array.isArray(run.constructionQueue) ? run.constructionQueue.slice(0, 4) : [],
    buildings: { ...emptyBuildings, ...(run.buildings || {}) },
    dayEvent: run.dayEvent || null,
    middayDilemmaId: run.middayDilemmaId || null,
    reservedBuildingId: run.reservedBuildingId || null,
    dayModifier: { gather: 1, cost: 1, construction: 1, ...(run.dayModifier || {}) },
    lastPush: run.lastPush || null,
    announcedPhase: run.announcedPhase || "dawn"
  };
}
