import { describe, expect, it } from "vitest";
import {
  CAMPAIGNS,
  campaignProgress,
  campaignEffects,
  CITY_STAGES,
  cityMasteryEffects,
  createSaveEnvelope,
  conquerProvince,
  diagnoseFailure,
  FRESH_EMPIRE,
  isCampaignComplete,
  LEGACY_SAVE_KEY,
  loadSave,
  normalizeLegacy,
  professionEffects,
  normalizeEmpire,
  normalizeCity,
  provinceEffects,
  resetSave,
  restoreRunState,
  SAVE_KEY,
  upgradeCost,
  workforceCoordination
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

  it("adds a clean Empire state to saves created before provinces", () => {
    const legacy = normalizeLegacy({ day: 8 }, freshLegacy, upgrades);
    expect(legacy.empire).toEqual(FRESH_EMPIRE);
  });

  it("normalizes invalid Empire progress without erasing valid influence", () => {
    const empire = normalizeEmpire({
      influence: 27.9,
      conquered: ["gallia", "unknown"],
      activeProvince: "gallia"
    });
    expect(empire).toEqual({
      influence: 27,
      conquered: ["gallia"],
      activeProvince: null
    });
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

describe("Empire provinces", () => {
  it("uses neutral modifiers when no province is selected", () => {
    expect(provinceEffects(null)).toEqual({ cost: 1, time: 0, gather: 1 });
  });

  it("gives every province a meaningful one-day modifier", () => {
    for (const provinceId of ["gallia", "hispania", "aegyptus", "asia"]) {
      const effects = provinceEffects(provinceId);
      expect(effects.cost !== 1 || effects.time !== 0 || effects.gather !== 1).toBe(true);
    }
  });

  it("awards influence once when a province is conquered", () => {
    const conquered = conquerProvince({ influence: 5, conquered: [], activeProvince: "gallia" }, "gallia");
    const repeated = conquerProvince(conquered, "gallia");
    expect(conquered).toEqual({ influence: 17, conquered: ["gallia"], activeProvince: null });
    expect(repeated).toEqual(conquered);
  });
});

describe("Rome district ladder", () => {
  it("makes every stage cumulative and ends with the complete city", () => {
    for (let index = 1; index < CITY_STAGES.length; index += 1) {
      const previous = CITY_STAGES[index - 1].goal;
      const current = CITY_STAGES[index].goal;
      for (const [buildingId, count] of Object.entries(previous)) {
        expect(current[buildingId]).toBeGreaterThanOrEqual(count);
      }
    }
    expect(CITY_STAGES.at(-1).goal).toMatchObject({
      market: 1, forum: 1, senate: 1, colosseum: 1
    });
  });

  it("keeps later district time increases tight despite the larger city", () => {
    expect(CITY_STAGES.map((stage) => stage.dayLength)).toEqual([60, 66, 72, 80, 89, 99, 110]);
    for (let index = 1; index < CITY_STAGES.length; index += 1) {
      expect(CITY_STAGES[index].dayLength - CITY_STAGES[index - 1].dayLength).toBeLessThanOrEqual(11);
    }
    expect(CITY_STAGES.at(-1).dayLength + cityMasteryEffects(["senate"]).extraTime).toBe(115);
  });

  it("starts new players at the settlement and advances to the first unmastered stage", () => {
    expect(normalizeCity(null, [])).toEqual({ mastered: [], activeStage: "settlement" });
    expect(normalizeCity({ mastered: ["settlement", "market"] }, [])).toEqual({
      mastered: ["settlement", "market"],
      activeStage: "housing"
    });
  });

  it("grandfathers existing Rome victors into the completed city", () => {
    const city = normalizeCity(null, ["rome"]);
    expect(city.mastered).toEqual(CITY_STAGES.map((stage) => stage.id));
    expect(city.activeStage).toBe("eternal");
  });

  it("turns mastery into efficiency without prebuilding districts", () => {
    const effects = cityMasteryEffects(["settlement", "market", "housing", "civic", "water", "senate"]);
    expect(effects.gather).toBeGreaterThan(1);
    expect(effects.delivery).toBeGreaterThan(1);
    expect(effects.extraTime).toBeGreaterThan(0);
    expect(effects.roadSpeed).toBeLessThan(1);
    expect(effects.housingSpeed).toBeLessThan(1);
    expect(effects.stoneSpeed).toBeLessThan(1);
  });

  it("uses B.C. and A.D. notation in every dated historical fact", () => {
    const datedFacts = CITY_STAGES.map((stage) => stage.fact).filter((fact) => /\d/.test(fact));
    expect(datedFacts.length).toBeGreaterThan(0);
    for (const fact of datedFacts) {
      expect(fact).not.toMatch(/\bBCE\b|\bCE\b/);
      expect(fact).toMatch(/B\.C\.|A\.D\./);
    }
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

describe("workforce coordination", () => {
  it("keeps ordinary crews fully effective and applies roster-wide diminishing returns to legions", () => {
    expect(workforceCoordination(16)).toBe(1);
    expect(workforceCoordination(44)).toBeCloseTo(0.634, 2);
    expect(44 * workforceCoordination(44)).toBeGreaterThan(16);
    expect(44 * workforceCoordination(44)).toBeLessThan(30);
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

describe("sunset diagnosis", () => {
  it("explains pressure, empty food, idle construction, and missing professions", () => {
    const insights = diagnoseFailure({
      campaignId: "italia",
      pressure: { efficiency: 0.72, detail: "Hungry crews work at reduced strength." },
      resources: { food: 0 },
      constructionWorkers: 0,
      professions: { laborers: 0, masons: 0, haulers: 0, engineers: 0 },
      constructionQueue: [{ buildingId: "forum", progress: 50 }]
    });

    expect(insights).toHaveLength(3);
    expect(insights.join(" ")).toContain("Hungry");
    expect(insights.join(" ")).toContain("Food ran out");
    expect(insights.join(" ")).toContain("construction crew");
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
