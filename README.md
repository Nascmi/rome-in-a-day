# Rome Wasn't Built in a Day

> Build Rome before sunset. Fail. Learn. Return stronger tomorrow.

Rome Wasn't Built in a Day is a browser-based incremental construction game. Every attempt begins on an empty field and ends at sunset. Physical progress disappears overnight, but the builders retain knowledge, permanent upgrades, unlocked districts, achievements, and completed campaigns.

The game is designed around a prestige reset that belongs to the fiction: Rome was not built in a day, but perhaps it can be tomorrow.

## Play

- Live game: https://rome-in-a-day-nathan.web.app
- GitHub: https://github.com/Nascmi/rome-in-a-day
- Firebase project: `rome-in-a-day-nathan`

The game is touch-friendly, installable as a Progressive Web App, and playable offline after the first successful load.

## Current Features

- Three campaign chapters: Rome, Italia, and Mare Nostrum
- Four gathered resources: timber, stone, clay, and food
- Fourteen construction projects, including chapter-specific major works
- Permanent builder and engineering upgrades
- Three pre-dawn strategies with meaningful tradeoffs
- Midday events that alter resources, gathering, or costs
- Six districts with permanent account-wide benefits
- Six achievements with laurel rewards
- Animated builders, construction effects, synthesized sound, and ambient music
- Automatic local progress saving
- Installable and offline-capable PWA
- Responsive desktop and phone interfaces

## Development

Requirements:

- Node.js compatible with Next.js 16
- npm
- Firebase CLI for deployment

```powershell
npm install
npm run dev
```

Production validation:

```powershell
npm run build
```

The production build is statically exported to `out/`.

## Documentation

- [Game Design](docs/GAME_DESIGN.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Save Data](docs/SAVE_DATA.md)
- [Deployment and Release](docs/DEPLOYMENT.md)
- [Current Working Checkpoint](docs/CURRENT_WORKING_CHECKPOINT.md)
- [Roadmap](docs/ROADMAP.md)

## Project Status

The game is a functioning public prototype with a complete three-chapter campaign loop. The next development priority is improving moment-to-moment construction depth, balance telemetry, run-state recovery, and campaign-specific presentation.

