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

The `legacy` object is stored in `localStorage` under `rome-in-a-day-v1`.

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

### Run state

Run state exists only in React memory:

- Selected campaign
- Selected pre-dawn plan
- Remaining time
- Running and ended flags
- Resources
- Worker assignments
- Buildings constructed this attempt
- Current event and temporary modifiers
- Audio and install prompt state

Refreshing during an attempt loses the physical city and current resource totals. This is currently consistent with the fiction but can feel accidental when caused by a browser refresh rather than sunset.

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

### Construction cost

Each building begins with a base resource-cost map.

The final cost combines:

- Architect reduction
- Pre-dawn plan modifier
- Midday event modifier
- Minimum combined discount of 65%
- Campaign cost scale

Every final resource value is rounded upward and cannot be lower than one.

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

The current cache name is `rome-in-a-day-v5`. Increment this value when a release requires old offline assets to be discarded.

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
