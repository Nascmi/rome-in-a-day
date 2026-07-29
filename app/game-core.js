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
    dayModifier: { gather: 1, cost: 1, construction: 1, ...(run.dayModifier || {}) },
    lastPush: run.lastPush || null,
    announcedPhase: run.announcedPhase || "dawn"
  };
}
