# Current Working Checkpoint

Last updated: July 29, 2026

## Status

The game is live, public, installable, and synchronized with GitHub.

- Live URL: https://rome-in-a-day-nathan.web.app
- GitHub: https://github.com/Nascmi/rome-in-a-day
- Firebase project: `rome-in-a-day-nathan`
- Current gameplay commit: `e51e0e9`
- Current Firebase version: `f2c0583dd424671a`
- Branch: `main`

## Most Recent Gameplay Work

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

### The current run is not persisted

Refreshing or installing an update during a run loses current resources, buildings, assignments, and time.

### Campaign selection is not persisted

The game chooses the furthest unlocked campaign at startup rather than remembering the last selected chapter.

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

1. Add run-state persistence and safe recovery.
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
