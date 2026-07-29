# Save Data

## Storage

Provider: browser `localStorage`

Current key:

```text
rome-in-a-day-v2
```

Legacy migration key:

```text
rome-in-a-day-v1
```

The current value is a versioned envelope containing permanent progress, preferences, and an optional active run.

## Current Envelope

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

`legacy` retains the permanent shape documented below. `run` is either `null` or a complete paused-day snapshot.

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
| `campaignStats` | Attempts, victories, best progress, and best remaining time by campaign |
| `runHistory` | Up to 30 recent local attempt summaries used for balance feedback |
| `empire` | Persistent influence, conquered provinces, and the selected province challenge |
| `city` | Mastered Rome districts and the next cumulative city stage |
| `upgrades` | Permanent upgrade levels by ID |

## Active Run Shape

The run snapshot includes:

- `savedAt`
- `campaignId`
- `planId`
- Remaining `time`
- Four resource totals
- Four resource-worker assignments
- Construction-worker assignment
- Temporary Laborer, Mason, Hauler, and Engineer assignments
- Construction queue and project percentages
- Completed building counts
- Midday event
- Pending midday dilemma, if the player closes the game before choosing
- Protected objective-building reservation
- Temporary gathering, cost, and construction modifiers
- Selected final order
- Last announced day phase

Snapshots are written shortly after meaningful state changes, including construction progress ticks.

`middayDilemmaId` and `reservedBuildingId` are optional, resume-safe fields. Older snapshots load with no pending choice or protected building.

Newly ordered construction projects record the exact `paidCost` used at purchase time. This lets cancellation return 70% of the unfinished portion without recalculating against later modifiers. Older saved projects without `paidCost` remain loadable, but cannot produce a material refund.

Professions belong to the active day. They survive closing and resuming that attempt, but are cleared when the player advances to tomorrow or starts a different campaign.

## Resume Behavior

An active saved run does not begin automatically. The return screen offers:

- Resume the Day
- Let Sunset Claim This Attempt

Time remains paused while the app is closed. Resuming restores the exact remaining daylight rather than simulating offline production.

Abandoning restores the snapshot and immediately resolves it as an ordinary failed sunset so completed work can still produce laurels and statistics.

## Migration Behavior

The loader checks `rome-in-a-day-v2` first. If it is missing, the original `rome-in-a-day-v1` legacy object is migrated automatically into the version-2 envelope.

Loading merges stored legacy data over `freshLegacy`. Missing fields receive current defaults.

Upgrade data is normalized separately so new upgrade IDs receive their defaults and stored levels remain valid. On load, every level is clamped to its current cap: level 10 for repeatable upgrades and level 1 for Foremen.

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
5. If an upgrade cap changes, normalize old saves explicitly and document the change.
6. Test a blank save and a legacy save.

## Full Reset

The Legacy tab exposes a confirmed full-progress reset.

It removes:

- Both local-storage keys
- Workers and upgrades
- Laurels
- Achievements and districts
- Campaign completions and records
- The active run

It then initializes a fresh version-2 save at Day 1 with four builders. Sound and music preferences remain in React state and are written back into the new envelope.

Empire influence and province conquests are permanent progress and are removed by the full reset.
Rome district mastery is also permanent progress. Mastery accelerates rebuilding but never preconstructs a district.

## Data Not Currently Saved

- Install-prompt availability
- Temporary toast and animation state
- The open interface tab
