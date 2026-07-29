# Next Steps

Last updated: July 29, 2026

## Return Point

Rome in a Day is live and synchronized:

- Live game: https://rome-in-a-day-nathan.web.app
- GitHub: https://github.com/Nascmi/rome-in-a-day
- Gameplay commit: `37c62ed`
- Firebase version: `3549bceddacfc4f6`
- PWA cache: `rome-in-a-day-v13`
- Save format: `rome-in-a-day-v2`

The current game has three campaigns, timed construction, campaign objectives, active-run resume, permanent Legacy upgrades, and a confirmed full reset.

## Recommended Next Milestone: Validate the Complete-City Ladder

The current local milestone replaces the one-Colosseum Rome objective with seven cumulative district stages. Before expanding Empire content, play every stage from a blank save and verify:

- Each new objective clearly contains the mastered districts that came before it.
- Market and Senate House costs create new decisions rather than simple waiting.
- Mastery bonuses make repetition faster without making it automatic.
- The Eternal City remains difficult but achievable through planning.
- Italia stays locked until the complete city—not an early district—is built in one day.
- Historical notes appear at the correct victories and use `B.C.` and `A.D.` notation.

## Completed Milestone: Make Progression Trustworthy

Before adding another major system, protect the progression loop with automated tests. Recent fixes changed victory timing, saved-run recovery, reset behavior, and Legacy caps. Those systems now carry enough player progress that regressions would be costly.

### Acceptance Criteria

- A blank save starts on Day 1 with four builders.
- Version-1 saves migrate into the version-2 envelope.
- Active construction progress survives save and resume.
- Daylight does not continue while the game is closed.
- Reset removes both save keys and restores all defaults.
- Repeatable Legacy upgrades cannot exceed level 10.
- Foremen cannot exceed level 1.
- Upgrade prices match `ceil(base × 1.75 ^ current level)`.
- Old over-cap saves are clamped without changing laurels or unrelated progress.
- Rome, Italia, and Mare Nostrum each end immediately when all objectives are completed.
- A failed run reaches the sunset report without being mistaken for a victory.

## Then: Improve the Moment-to-Moment Decisions

Once the safety net is in place, add worker professions as the next meaningful gameplay layer:

- Laborers gather wood and clay efficiently.
- Masons accelerate stone buildings.
- Haulers improve resource delivery and reduce crew-coordination loss.
- Engineers accelerate major projects and unlock a second construction slot.

Professions should be assigned during the day and wiped at sunset. Knowledge that improves each profession may survive through Legacy upgrades. This keeps the central promise intact: the city disappears, but the builders learn.

### Design Goal

A large workforce should give the player more options, not simply make every campaign end in seconds.

## Campaign Differentiation After Professions

Use professions to make each chapter structurally distinct.

### Rome

- Housing and population pressure
- Senate mandates
- Monument-focused engineering

### Italia

- Multiple settlements
- Roads and food distribution between settlements
- Frontier defense

### Mare Nostrum

- Ports and shipping lanes
- Fleet construction
- Trade, piracy, and lighthouse coverage

## Presentation Pass

After the next gameplay milestone:

- Keep the active objective checklist visible while scrolling.
- Add clearer feedback when a project gains or loses workers.
- Give each campaign a more distinct landscape and skyline.
- Expand victory and sunset sequences.
- Add complete PWA icon sizes and install screenshots.
- Review touch targets, reduced motion, color contrast, and sound controls.

## Later Milestones

1. Add local run-history and balance statistics.
2. Split game data, simulation, persistence, and UI out of `app/page.js`.
3. Build the province-map Empire layer after Mare Nostrum.
4. Add cross-device saves only when accounts are justified.
5. Add privacy-respecting analytics and error monitoring before a broader release.

## First Commands When Returning

```powershell
git status -sb
git pull --ff-only
npm.cmd run build
```

Then read:

1. `docs/CURRENT_WORKING_CHECKPOINT.md`
2. `docs/NEXT_STEPS.md`
3. `docs/DESIGN_GUARDRAILS.md`
4. `docs/SAVE_DATA.md`

## Do Not Regress

- Campaign victory recognition and delayed completion must remain separate React effects.
- The city resets every day; only permanent knowledge survives.
- Physical active-run state exists solely to support closing and resuming the app.
- Construction discounts must not reduce their combined multiplier below 65%.
- Large crews must retain diminishing coordination returns.
- Repeatable Legacy upgrades cap at 10; Foremen caps at 1.
- Monetization must not turn failure or time pressure into a purchase prompt.
