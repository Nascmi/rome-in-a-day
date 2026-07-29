# Technical Architecture

## Stack

- Next.js 16.2.12
- React 19.2.4
- Static export
- Firebase Hosting
- Browser `localStorage`
- Browser Web Audio API
- Service Worker and Web App Manifest

There is no backend, database, authentication system, analytics service, or paid API.

## Application Structure

```text
app/
  game-core.js             Pure persistence, progression, pressure, and diagnosis logic
  game-core.test.js        Automated regression coverage
  globals.css              Complete visual system and responsive layout
  layout.js                Metadata, PWA declarations, and root layout
  page.js                  Game data, state, simulation, progression, and UI
public/
  icons/rome-icon.svg      Installable app icon
  manifest.webmanifest     PWA manifest
  sw.js                    Offline cache service worker
.openai/
  hosting.json             Connected OpenAI Sites project identifier
docs/                      Project documentation
firebase.json              Firebase Hosting configuration
.firebaserc                Default Firebase project
next.config.mjs            Static-export configuration
```

The prototype intentionally keeps the game in one client component. This made the first iterations fast, but `app/page.js` is now large enough that the next structural refactor should separate data, simulation hooks, persistence, and presentation.

## Runtime State

### Persistent state

The version-2 save envelope is stored in `localStorage` under `rome-in-a-day-v2`. The loader falls back to `rome-in-a-day-v1` for automatic migration.

Persistent data includes:

- Attempt number
- Laurels
- Best renown
- Lifetime building count
- Total victories
- Earned achievements
- Completed campaigns
- Per-campaign attempts, victories, best progress, and best remaining time
- Permanent upgrade levels
- Recent local run summaries used for balance feedback
- Empire influence, conquered provinces, and the active province challenge
- Rome district mastery and active cumulative city stage

### Run state

Run state exists in React memory and is mirrored into the optional `run` snapshot:

- Selected campaign
- Selected pre-dawn plan
- Remaining time
- Running and ended flags
- Resources
- Worker assignments
- Construction-worker assignment
- Temporary profession assignments
- Construction queue, progress, and active slots
- Buildings constructed this attempt
- Current event and temporary modifiers
- Audio and install prompt state

Refreshing during an attempt presents a resume screen. Offline time is paused intentionally; no resources or construction progress are simulated while closed.

## Simulation

### Clock

The campaign clock decrements once per second. Reaching zero calls `finishDay(false)`.

### Gathering

Resources update every 500 milliseconds:

```text
resource gain per tick = effective crew × gathering multiplier × 0.5
```

The gathering multiplier combines:

- Calloused Hands
- Road bonuses
- Workshop bonuses
- Forum district bonus
- Selected pre-dawn plan
- Active midday event
- Profession delivery and resource bonuses
- Campaign-specific housing, supply, or port-throughput effects

### Construction cost

Each building begins with a base resource-cost map.

The final cost combines:

- Architect reduction
- Pre-dawn plan modifier
- Midday event modifier
- Minimum combined discount of 65%
- Campaign cost scale

Every final resource value is rounded upward and cannot be lower than one.

### Construction progress

Each building definition includes a base `seconds` value.

The construction ledger accepts four projects. Architects level 3 allows the first two projects to advance simultaneously; otherwise only the first advances.

Every 250 milliseconds:

```text
progress gain = (construction speed / base seconds) × 25
```

Construction speed combines:

- A baseline of `0.35`
- Effective assigned construction crew multiplied by `0.22`
- Temporary construction modifiers
- Mason and Engineer profession bonuses
- Campaign pressure efficiency

When progress reaches 100%, the project is removed from the queue and its completed building count increments. Campaign victory only reads completed counts.

### Day phases

The emotional phase is derived from elapsed campaign time:

- Morning: before 45% elapsed
- Afternoon: 45% to 78% elapsed
- Evening: after 78% elapsed
- Final Light: 15 seconds or less

At 20 seconds, the final-order overlay becomes eligible. A selected order mutates the temporary run modifier or resources and cannot be selected twice.

### Victory

`campaignComplete` compares the current `buildings` map to the active campaign’s `goal` map.

Victory uses two effects:

1. Completion recognition sets `won`.
2. A separate effect performs the delayed transition into `finishDay(true)`.

These must remain separate. Combining them previously caused the Italia victory timer to cancel itself during the `won` state update.

### Empire provinces

Completing Mare Nostrum unlocks province selection in the Chronicle. A selected province modifies the next Mediterranean-length attempt through cost, daylight, or gathering multipliers. The physical city still resets at sunset.

Province victories update the persistent `empire` object through pure, idempotent conquest logic. A province awards influence only once.

### Rome district ladder

Rome uses seven cumulative goal maps. Each new stage includes every requirement from the preceding stage and adds another district or civic system. Only victory in `The Eternal City` adds Rome to `completedCampaigns` and unlocks Italia.

District mastery stores efficiency knowledge only. Every attempt still begins with an empty `buildings` map.

## Audio

Audio is generated at runtime through the Web Audio API:

- Gathering taps play short tones.
- Construction plays layered impact tones.
- Achievements and victories play a three-note chime.
- Optional music cycles through a low-volume note sequence.

No audio files are downloaded.

Browsers require user interaction before audio can begin. The interface therefore treats audio as optional and user-controlled.

## PWA and Offline Behavior

`public/manifest.webmanifest` enables standalone installation.

`public/sw.js` uses a network-first strategy:

1. Attempt to retrieve the current resource.
2. Store the successful response in the current cache.
3. Fall back to the cached resource when offline.
4. Fall back to `/` when no exact cached match exists.

The current cache name is `rome-in-a-day-v8`. Increment this value when a release requires old offline assets to be discarded.

## Responsive Design

The desktop layout uses:

- Skyline and clock
- Four-column resources
- Workforce sidebar
- Two-column construction ledger

Below 760 pixels:

- Resources become a two-column grid
- Workforce and ledger stack vertically
- Construction cards become one column
- Campaign and achievement grids collapse
- Header controls become compact

## Recommended Refactor Boundary

Before adding substantially more campaigns, split `page.js` into:

```text
game/data/
  campaigns.js
  buildings.js
  progression.js
game/hooks/
  useGameClock.js
  usePersistence.js
  useAudio.js
game/components/
  CampaignMap.js
  CitySkyline.js
  WorkforcePanel.js
  ConstructionLedger.js
  SunsetModal.js
```

The refactor should preserve the existing save key and migration behavior.
