# Save Data

## Storage

Provider: browser `localStorage`

Key:

```text
rome-in-a-day-v1
```

The value is JSON containing only permanent legacy progress.

## Current Shape

```json
{
  "day": 1,
  "laurels": 0,
  "best": 0,
  "total": 0,
  "victories": 0,
  "achievements": [],
  "completedCampaigns": [],
  "upgrades": {
    "hands": 0,
    "rations": 0,
    "carts": 0,
    "foremen": 0,
    "architects": 0,
    "legion": 0
  }
}
```

## Field Meanings

| Field | Meaning |
|---|---|
| `day` | Attempt number displayed to the player |
| `laurels` | Unspent permanent-upgrade currency |
| `best` | Highest renown reached in a single attempt |
| `total` | Lifetime completed-building count |
| `victories` | Total successful campaign completions |
| `achievements` | Array of earned achievement IDs |
| `completedCampaigns` | Array of completed campaign IDs |
| `upgrades` | Permanent upgrade levels by ID |

## Migration Behavior

Loading merges stored data over `freshLegacy`. Missing fields receive current defaults.

Upgrade data is merged separately so new upgrade IDs can be added without erasing older levels.

Older saves created before campaigns are migrated as follows:

- If `victories > 0` and `completedCampaigns` is missing, Rome is treated as completed.
- Players with completed Rome begin on Italia.
- Players with completed Rome and Italia begin on Mare Nostrum.

## Compatibility Rules

When changing persistence:

1. Do not rename the existing key casually.
2. Add new fields to `freshLegacy`.
3. Merge nested objects explicitly.
4. Provide migration logic for renamed or reinterpreted fields.
5. Never reduce saved worker or upgrade levels without an explicit player-facing reset design.
6. Test a blank save and a legacy save.

## Data Not Currently Saved

- Active campaign selection
- Current buildings
- Current resource totals
- Remaining time
- Worker assignments
- Selected plan
- Current midday event
- Audio preferences

## Recommended Next Save Revision

Add a versioned envelope:

```json
{
  "version": 2,
  "legacy": {},
  "preferences": {
    "soundOn": true,
    "musicOn": false
  },
  "run": null
}
```

A resumable `run` should include a timestamp so elapsed real time can be reconciled safely rather than freezing or duplicating production.

