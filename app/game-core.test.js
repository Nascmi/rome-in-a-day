import { describe, expect, it } from "vitest";
import {
  CAMPAIGNS,
  campaignProgress,
  campaignEffects,
  createSaveEnvelope,
  isCampaignComplete,
  LEGACY_SAVE_KEY,
  loadSave,
  normalizeLegacy,
  professionEffects,
  resetSave,
  restoreRunState,
  SAVE_KEY,
  upgradeCost
} from "./game-core";

const upgrades = [
  { id: "hands", base: 3, max: 10 },
  { id: "rations", base: 4, max: 10 },
  { id: "carts", base: 3, max: 10 },
  { id: "foremen", base: 6, max: 1 },
  { id: "architects", base: 8, max: 10 },
  { id: "legion", base: 12, max: 10 }
];

const freshLegacy = {
  day: 1,
  laurels: 0,
  best: 0,
  total: 0,
  victories: 0,
  achievements: [],
  completedCampaigns: [],
  campaignStats: {},
  upgrades: Object.fromEntries(upgrades.map(({ id }) => [id, 0]))
};

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    has: (key) => values.has(key)
  };
}

describe("save progression", () => {
  it("starts a blank save on Day 1 with four base builders", () => {
    const save = loadSave(memoryStorage(), freshLegacy, upgrades);

    expect(save.legacy).toEqual(freshLegacy);
    expect(4 + save.legacy.upgrades.rations * 2 + save.legacy.upgrades.legion * 4).toBe(4);
    expect(save.run).toBeNull();
  });

  it("migrates a version-1 legacy save into the version-2 model", () => {
    const storage = memoryStorage({
      [LEGACY_SAVE_KEY]: JSON.stringify({
        day: 7,
        laurels: 19,
        victories: 1,
        upgrades: { hands: 3 }
      })
    });
    const save = loadSave(storage, freshLegacy, upgrades);
    const envelope = createSaveEnvelope({
      legacy: save.legacy,
      soundOn: save.preferences.soundOn,
      musicOn: save.preferences.musicOn,
      run: save.run
    });

    expect(save.legacy.day).toBe(7);
    expect(save.legacy.completedCampaigns).toEqual(["rome"]);
    expect(save.legacy.upgrades.hands).toBe(3);
    expect(save.legacy.upgrades.legion).toBe(0);
    expect(envelope.version).toBe(2);
  });

  it("clamps old upgrades without changing laurels or unrelated progress", () => {
    const legacy = normalizeLegacy({
      day: 12,
      laurels: 83,
      total: 144,
      best: 9001,
      achievements: ["first_stone"],
      upgrades: { hands: 99, foremen: 8, carts: -4 }
    }, freshLegacy, upgrades);

    expect(legacy.upgrades.hands).toBe(10);
    expect(legacy.upgrades.foremen).toBe(1);
    expect(legacy.upgrades.carts).toBe(0);
    expect(legacy.laurels).toBe(83);
    expect(legacy.total).toBe(144);
    expect(legacy.best).toBe(9001);
    expect(legacy.achievements).toEqual(["first_stone"]);
  });

  it("removes both save generations during a full reset", () => {
    const storage = memoryStorage({
      [SAVE_KEY]: "{}",
      [LEGACY_SAVE_KEY]: "{}",
      unrelated: "safe"
    });

    resetSave(storage);

    expect(storage.has(SAVE_KEY)).toBe(false);
    expect(storage.has(LEGACY_SAVE_KEY)).toBe(false);
    expect(storage.has("unrelated")).toBe(true);
    expect(normalizeLegacy(null, freshLegacy, upgrades)).toEqual(freshLegacy);
  });
});

describe("active run recovery", () => {
  const campaign = { dayLength: 125 };
  const plan = { time: 0 };
  const emptyBuildings = { road: 0, forum: 0 };

  it("preserves construction percentage and the exact remaining daylight", () => {
    const run = {
      running: true,
      time: 42,
      constructionWorkers: 6,
      constructionQueue: [{ id: "forum", name: "Great Forum", progress: 63.5 }],
      buildings: { road: 8 },
      resources: { stone: 21 }
    };
    const storage = memoryStorage({
      [SAVE_KEY]: JSON.stringify(createSaveEnvelope({
        legacy: freshLegacy,
        soundOn: false,
        musicOn: true,
        run
      }))
    });

    const loaded = loadSave(storage, freshLegacy, upgrades);
    const restored = restoreRunState(loaded.run, campaign, plan, emptyBuildings);

    expect(restored.time).toBe(42);
    expect(restored.constructionQueue[0].progress).toBe(63.5);
    expect(restored.constructionWorkers).toBe(6);
    expect(restored.buildings).toEqual({ road: 8, forum: 0 });
    expect(loaded.preferences).toEqual({ soundOn: false, musicOn: true });
  });

  it("does not subtract elapsed real-world time while closed", () => {
    const oldTimestamp = Date.now() - 1000 * 60 * 60 * 24;
    const restored = restoreRunState({
      savedAt: oldTimestamp,
      running: true,
      time: 17
    }, campaign, plan, emptyBuildings);

    expect(restored.time).toBe(17);
  });

  it("restores temporary day professions and defaults older runs", () => {
    const trained = restoreRunState({
      running: true,
      time: 30,
      professions: { masons: 3, engineers: 4 }
    }, campaign, plan, emptyBuildings);
    const older = restoreRunState({ running: true, time: 30 }, campaign, plan, emptyBuildings);

    expect(trained.professions).toEqual({
      laborers: 0, masons: 3, haulers: 0, engineers: 4
    });
    expect(older.professions).toEqual({
      laborers: 0, masons: 0, haulers: 0, engineers: 0
    });
  });
});

describe("day professions", () => {
  it("turns each role into a distinct tactical bonus", () => {
    const effects = professionEffects({
      laborers: 4, masons: 3, haulers: 2, engineers: 4
    }, 16);

    expect(effects.laborerGather).toBeGreaterThan(1);
    expect(effects.masonry).toBeGreaterThan(1);
    expect(effects.delivery).toBeGreaterThan(1);
    expect(effects.coordinationExponent).toBeGreaterThan(0.72);
    expect(effects.engineering).toBeGreaterThan(1);
    expect(effects.engineerSlot).toBe(true);
    expect(effects.untrained).toBe(3);
  });

  it("requires four engineers for the temporary second slot", () => {
    expect(professionEffects({
      laborers: 0, masons: 0, haulers: 0, engineers: 3
    }, 4).engineerSlot).toBe(false);
  });
});

describe("campaign pressure", () => {
  it("starts a fresh four-builder Rome without a housing penalty", () => {
    const effects = campaignEffects("rome", { hut: 0 }, 4, { food: 15 });
    expect(effects.efficiency).toBe(1);
  });

  it("makes Rome housing relieve workforce crowding", () => {
    const crowded = campaignEffects("rome", { hut: 0 }, 16, { food: 15 });
    const housed = campaignEffects("rome", { hut: 4 }, 16, { food: 15 });
    expect(crowded.efficiency).toBeLessThan(1);
    expect(housed.efficiency).toBe(1);
  });

  it("makes Italia roads and food matter independently", () => {
    const opening = campaignEffects("italia", { road: 0 }, 12, { food: 15 });
    const connected = campaignEffects("italia", { road: 18 }, 12, { food: 15 });
    const hungry = campaignEffects("italia", { road: 18 }, 12, { food: 0 });
    expect(connected.delivery).toBeGreaterThan(opening.delivery);
    expect(hungry.efficiency).toBeLessThan(connected.efficiency);
    expect(opening.foodDrain).toBeGreaterThan(0);
  });

  it("makes Mare Nostrum ports and lighthouse improve throughput", () => {
    const overloaded = campaignEffects("mediterranean", { harbor: 0 }, 24, {});
    const supplied = campaignEffects("mediterranean", { harbor: 2, shipyard: 1, lighthouse: 1 }, 24, {});
    expect(overloaded.efficiency).toBeLessThan(1);
    expect(supplied.efficiency).toBe(1);
    expect(supplied.delivery).toBeGreaterThan(overloaded.delivery);
  });
});

describe("Legacy upgrades", () => {
  it.each(upgrades)("$id uses ceil(base × 1.75 ^ level)", (upgrade) => {
    for (let level = 0; level <= upgrade.max; level += 1) {
      expect(upgradeCost(upgrade, level))
        .toBe(Math.ceil(upgrade.base * Math.pow(1.75, level)));
    }
  });
});

describe("campaign outcomes", () => {
  it.each(CAMPAIGNS)("$id wins as soon as every completed-building goal is met", (campaign) => {
    const buildings = Object.fromEntries(Object.entries(campaign.goal));
    expect(isCampaignComplete(campaign, buildings)).toBe(true);
  });

  it.each(CAMPAIGNS)("$id does not mistake an unfinished sunset for victory", (campaign) => {
    const buildings = Object.fromEntries(Object.entries(campaign.goal));
    const firstGoal = Object.keys(campaign.goal)[0];
    buildings[firstGoal] -= 1;

    expect(isCampaignComplete(campaign, buildings)).toBe(false);
  });

  it("counts completed structures only, not queued construction", () => {
    const campaign = CAMPAIGNS[0];
    const buildings = { colosseum: 0 };
    const constructionQueue = [{ id: "colosseum", progress: 99.9 }];

    expect(constructionQueue[0].progress).toBeGreaterThan(99);
    expect(isCampaignComplete(campaign, buildings)).toBe(false);
  });

  it("shows meaningful progress for objective construction underway", () => {
    const campaign = CAMPAIGNS[0];
    const buildings = { colosseum: 0 };
    const constructionQueue = [{ buildingId: "colosseum", progress: 46 }];

    expect(campaignProgress(campaign, buildings, constructionQueue)).toBe(0.46);
    expect(isCampaignComplete(campaign, buildings)).toBe(false);
  });

  it("clamps queued objective progress at the campaign requirement", () => {
    const campaign = { goal: { harbor: 2 } };
    const buildings = { harbor: 1 };
    const constructionQueue = [
      { buildingId: "harbor", progress: 80 },
      { buildingId: "harbor", progress: 70 }
    ];

    expect(campaignProgress(campaign, buildings, constructionQueue)).toBe(1);
  });
});
