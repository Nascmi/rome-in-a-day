# Current Working Checkpoint

Last updated: July 29, 2026

## Status

The game is live, public, installable, and synchronized with GitHub.

- Live URL: https://rome-in-a-day-nathan.web.app
- GitHub: https://github.com/Nascmi/rome-in-a-day
- Firebase project: `rome-in-a-day-nathan`
- Current gameplay commit: `b076496`
- Current Firebase version: `fa31c26efa4b102c`
- Branch: `main`

## July 29 Progress Pin

This is the safe return point for the next session. The production build passed, GitHub contains the live gameplay source, and Firebase was verified to serve the `rome-in-a-day-v9` service worker.

The next implementation sequence is recorded in [`NEXT_STEPS.md`](NEXT_STEPS.md). Begin with the automated progression and campaign regression tests before adding the next gameplay system.

## July 29 Campaign-Depth Milestone

The live release at commit `f259cfc` adds worker professions, campaign-specific pressure, meaningful partial-completion percentages, a sticky objective checklist, local run history, and reliable auto-dismiss notices.

The current local follow-up adds:

- Contextual guidance for idle crews, professions, construction, and campaign pressure.
- Campaign-specific sunset lessons.
- Distinct Rome, Italia, and Mare Nostrum landscape treatments.
- Regression coverage for sunset diagnosis.

Before the next release, run the automated suite, production build, and responsive visual review, then increment the PWA cache.

## Local Empire-Layer Work

The current uncommitted milestone adds the first playable post-Mare-Nostrum layer:

- Four selectable provinces with distinct one-day modifiers.
- Persistent imperial influence and conquered-province records.
- Backward-compatible Empire save normalization.
- A responsive province map in the Chronicle.
- Province victory rewards without weakening the daily reset.

## Local Rome Rebuild

The current local milestone restores the original progression:

- Rome is now seven cumulative district challenges.
- District timers are tuned to `60 / 66 / 72 / 80 / 89 / 99 / 110` seconds, with only 5 bonus seconds from Senate mastery, so later stages demand increasingly efficient execution.
- Roster-wide legion logistics now reduce gathering and construction efficiency above 16 simultaneously assigned workers; 44 active builders operate at roughly 63% individual efficiency instead of bypassing diminishing returns by splitting across jobs.
- Market and Senate House projects complete the city’s civic ladder.
- Earlier districts must be rebuilt every day.
- Mastery makes known work more efficient but never automatic.
- Only the full Eternal City victory unlocks Italia and the Empire.
- District victories reveal sourced “Rome Remembers” historical notes.
- Historical dates use `B.C.` and `A.D.` exclusively.

## Most Recent Gameplay Work

The current release rebalances permanent Legacy progression:

- Capped all repeatable Legacy upgrades at level 10.
- Changed Foremen into a one-time level-1 unlock.
- Replaced linear prices with the exponential formula `ceil(base × 1.75 ^ current level)`.
- Added clear current-level, cap, and MAX LEVEL labels.
- Normalized older saves to the new caps without touching laurels or other progress.
- Updated the PWA cache to `rome-in-a-day-v9`.

The current live release adds save reliability and a clean-slate reset:

- Added the versioned `rome-in-a-day-v2` save envelope.
- Added automatic migration from `rome-in-a-day-v1`.
- Persisted the complete active day, including construction percentages.
- Added Resume the Day and Let Sunset Claim This Attempt.
- Paused daylight safely while the app is closed.
- Persisted sound and music preferences.
- Added a confirmed full-progress reset in the Legacy tab.
- Reset returns the player to Day 1 with four builders.
- Updated the PWA cache to `rome-in-a-day-v8`.

The current live release converts instant purchases into timed construction:

- Added a four-project construction ledger.
- Added dedicated construction-worker assignment.
- Added one active build slot by default.
- Added a second active slot at Architects level 3.
- Added base durations to all thirteen buildings.
- Added active, waiting, and progress states.
- Added visible skyline scaffolding.
- Campaign objectives now count completed structures only.
- Sunset reports projects that remained under construction.
- Rally the Crews now accelerates gathering and construction.
- Updated the PWA cache to `rome-in-a-day-v7`.

The current live release makes the clock the principal antagonist:

- Added explicit Morning, Afternoon, Evening, and Final Light phases.
- Added phase-specific skies, messages, clock urgency, and final ticks.
- Added a one-time final order at 20 seconds.
- Added campaign-specific attempts, victories, progress records, and completion-time records.
- Added a sunset diagnosis listing unfinished objectives.
- Added close-finish and personal-record recognition.
- Added `DESIGN_GUARDRAILS.md`.
- Updated the PWA cache to `rome-in-a-day-v5`.

The preceding live release addressed late-game campaigns completing in under ten seconds with a 68-builder save.

Changes:

- Preserved all saved workers.
- Added diminishing coordination returns above eight workers per resource.
- Added campaign cost scaling.
- Prevented combined construction discounts from falling below 65%.
- Expanded Italia from four goal types to eight.
- Expanded Mare Nostrum to nine goal types.
- Added eight chapter-specific major projects.
- Added distinct visual silhouettes and construction-card colors.
- Marked objective buildings and displayed their required counts.
- Updated the PWA cache to `rome-in-a-day-v4`.

## Current Campaign Content

### Rome

Primary project: Colosseum.

### Italia

New projects:

- Granary
- Great Forum
- Frontier Fort

### Mare Nostrum

New projects:

- Grand Harbor
- Imperial Shipyard
- Great Lighthouse
- Imperial Basilica

## Known Limitations

### Large source component

Game data, simulation logic, persistence, audio, and presentation are concentrated in `app/page.js`.

### No telemetry

Balance decisions depend on direct play reports. There is no measurement of attempt duration, build order, failure point, upgrade distribution, or campaign completion time.

### No true post-Mediterranean layer

“Rule the Empire” currently begins another attempt. There is no geographic conquest or province-management map.

### Limited onboarding

The first screen communicates the theme, but there is no guided tutorial or contextual explanation of every multiplier.

### PWA icon coverage

The app currently uses one scalable SVG icon. Dedicated PNG sizes and platform-specific screenshots would improve install presentation.

## Highest-Value Next Steps

1. Add automated migration, resume, reset, and campaign-victory tests.
2. Split game data and simulation out of `page.js`.
3. Add a visible objective checklist that remains accessible while scrolled.
4. Add lightweight local run statistics before considering external analytics.
5. Add chapter-specific resources or worker professions.
6. Build a real post-Mare-Nostrum Empire layer.
7. Conduct a focused balance pass using the existing 68-builder save.

## Resume Instructions

At the start of the next session:

1. Read this checkpoint.
2. Run `git status -sb`.
3. Confirm `main` matches `origin/main`.
4. Run `npm run build`.
5. Test the live game using the advanced save.
6. Select one next-step objective rather than adding several unrelated systems.

## Important Regression

Campaign victory recognition and delayed completion must remain separate React effects. A previous combined effect canceled its own timer when `won` changed and caused Italia to continue until sunset after every objective had been completed.
