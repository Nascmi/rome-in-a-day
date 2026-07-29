# Game Design

## High Concept

The player tries to build Rome in one day.

At sunset, the unfinished city disappears. Only knowledge survives. Each failed attempt produces laurels, permanent upgrades, more workers, and a better understanding of how to use the daylight. Eventually, the impossible becomes possible.

After Rome is completed, the premise expands:

1. Build Rome in a day.
2. Unite Italia in a day.
3. Command the Mediterranean in a day.

## Design Pillars

### Failure must feel productive

Sunset is not a punishment screen. It converts visible progress into permanent knowledge. Even an unsuccessful attempt should improve the next one.

### Progress must be visible

The player should see a field become a settlement, a settlement become a city, and a city become an empire. Numbers support the fantasy, but the skyline communicates it.

### Automation is earned

Early play asks the player to tap, assign workers, and make frequent choices. Permanent upgrades gradually shift attention toward planning, optimization, and campaign strategy.

### Every chapter must feel structurally different

Later campaigns are not larger copies of Rome. They have different goals, major projects, daylight limits, costs, and strategic demands.

## The Run Loop

1. Choose a campaign.
2. Select pre-dawn orders.
3. Begin the day.
4. Assign builders to timber, stone, clay, and food.
5. Assign part of the workforce to construction.
6. Tap resource panels for supplemental gathering.
7. Order roads, infrastructure, civic buildings, and campaign projects.
8. Manage active build slots and the construction queue.
9. React to a midday event.
10. Read the evening pressure and commit to the remaining objectives.
11. Choose one final order near sunset.
12. Complete every campaign objective before sunset or fail productively.
13. Read the sunset diagnosis and personal-record result.
14. Spend laurels on permanent upgrades.
15. Begin another attempt.

## Construction

Purchasing a building pays its resources and places a project in the construction ledger. It does not immediately satisfy an objective.

- The ledger holds up to four ordered projects.
- One project builds actively by default.
- Architects level 3 unlocks a second simultaneous build slot.
- Every project shows its estimated start and finish time against the current crew and available slots.
- The player can move projects earlier or later at any time; partial progress travels with the project.
- Cancelling a project recovers 70% of the resources paid for its unfinished portion. Work already completed is not refunded.
- The crew forecast previews whether one additional builder would materially improve the active project's finish time.
- Assigning workers to Construction increases build speed.
- Projects continue slowly with no assigned construction workers.
- Completed projects leave scaffolding and become permanent skyline buildings for the remainder of the day.
- Campaign objectives count only completed buildings.

Base durations range from two seconds for a road to 32 seconds for the Imperial Basilica. Actual time depends on the assigned construction crew and temporary modifiers.

Profession assignments also report whether their specialty is currently in use or waiting for useful work. Laborers watch timber and clay crews, Masons watch active stone construction, Haulers watch workforce scale, and Engineers watch major works and the second build slot.

Construction speed:

```text
(0.35 + effective construction crew × 0.22) × temporary construction modifier
```

## Emotional Arc of the Day

## Command Intelligence

The construction ledger interprets the plan instead of presenting raw numbers alone:

- Required projects are marked as critical-path work.
- A whole-objective forecast estimates whether all queued and still-unordered work fits before sunset.
- The player may protect the stockpile for one required building; unrelated purchases cannot consume those resources.
- Bottleneck advice distinguishes missing materials, absent builders, non-objective work occupying a slot, and mathematically late work.
- During Final Light, non-objective building cards recede.
- A contextual foreman reacts to idle crews and the projected completion margin.

Each Rome district also carries a command identity, progressing from opening logistics and balanced market stockpiles through stone-heavy civic works and Senate resource protection to the complete Eternal City critical path.

Victories receive a Bronze, Silver, Gold, or Laurel mastery grade according to the share of daylight remaining. Grades celebrate execution and never gate progression. Failed days retain a short timeline of actionable losses such as idle hands, stalled construction, unordered objective work, and large unused surpluses.

The clock is the principal antagonist. Each attempt has four presented acts:

- Morning: the selected plan begins with confidence.
- Afternoon: the opening is over and the player adapts.
- Evening: the remaining objective count becomes explicit.
- Final Light: the sky, clock, sound, and message system become urgent.

The final ten seconds produce audible ticks. The last three ticks use a higher warning tone.

## Campaigns

### Chapter I — Rome

Rome is the primary campaign and contains seven cumulative stages:

1. First Settlement
2. Market District
3. Residential Rome
4. Civic District
5. Water & Faith
6. Senate District
7. The Eternal City

Every stage includes all requirements from the preceding stage. Earlier districts must therefore be rebuilt before a new district can be added.

District mastery grants efficiency knowledge but never places a building automatically. Only The Eternal City—containing roads, housing, workshops, market, Forum, aqueducts, temples, Senate House, and Colosseum—counts as building Rome in one day and unlocks Italia.

### Chapter II — Italia

Day length: 125 seconds.

Construction costs are scaled by `1.65`.

Objectives:

- 18 roads
- 12 insulae
- 6 workshops
- 4 aqueducts
- 2 temples
- 2 granaries
- 1 Great Forum
- 1 Frontier Fort

Italia is about coordinated regional development. Its major projects are food storage, civic organization, and frontier security.

### Chapter III — Mare Nostrum

Day length: 180 seconds.

Construction costs are scaled by `1.90`.

Objectives:

- 18 roads
- 6 workshops
- 4 aqueducts
- 2 temples
- 1 Colosseum
- 2 Grand Harbors
- 1 Imperial Shipyard
- 1 Great Lighthouse
- 1 Imperial Basilica

Mare Nostrum is the current endgame. It requires land infrastructure, naval infrastructure, civic monuments, and substantially more material throughput.

## Pre-Dawn Orders

### Measured Plans

- Normal gathering
- Normal building costs
- Full campaign time

### Forced March

- Gathering is 35% faster
- The day is 15 seconds shorter

### Frugal Works

- Building costs are 15% lower
- Manual tapping is 20% weaker

## Midday Events

One deterministic two-choice dilemma occurs at approximately 55% of the day. The clock pauses while the player chooses a lasting tradeoff involving resources, gathering, cost, or construction speed.

- Supply Caravan: adds 18 of every resource.
- Guild Inspiration: gathering is 25% faster for the remainder of the day.
- A Brilliant Engineer: construction costs are 15% lower for the remainder of the day.

The event is selected from the current attempt number and campaign chapter. It therefore varies across attempts without requiring random save data.

## Final Orders

At 20 seconds remaining, the player may issue exactly one final order:

- Rally the Crews: gathering and construction are 45% faster until sunset.
- Strip the Scaffolds: immediately recover 30 of every resource.
- Simplify the Plans: construction costs are 15% lower until sunset.

The decision does not pause the clock. It is the player’s final commitment, not a free planning break.

## Permanent Progression

Laurels are awarded at sunset from:

- Renown earned during the attempt
- Total buildings completed
- Campaign-completion reward
- Achievement rewards

Permanent upgrades:

- Calloused Hands: gathering speed
- Dawn Rations: starting workforce
- Better Carts: manual tap power
- Foremen: automatic initial job assignment
- Architects: building cost reduction
- Builder Legion: additional starting workers

Repeatable upgrades cap at level 10. Foremen is a one-time unlock and caps at level 1.

The price of the next level is `ceil(base cost × 1.75 ^ current level)`. Early knowledge remains attainable, while the final levels become long-term campaign goals.

Construction discounts may stack, but their combined multiplier cannot fall below 65%. This prevents late-game upgrades, Frugal Works, and the Engineer event from trivializing entire chapters.

## Workforce Scaling

Saved workers are never deleted or hard-capped.

Large assigned crews use diminishing coordination returns:

```text
effective crew = assigned workers                    when assigned <= 8
effective crew = 8 + (assigned workers - 8)^0.72    when assigned > 8

roster coordination = 100%                           when total assigned <= 16
roster coordination = (16 / total assigned)^0.45     when total assigned > 16
```

The first curve limits oversized crews on a single task. The second closes the loophole created by splitting a legion among several jobs. This preserves the excitement of a large workforce while preventing linear worker growth from reducing a civilization-scale campaign to a few seconds.

## Completion and Failure

A campaign or Rome district stage completes when every entry in its objective map reaches the required count. The game then:

- Marks the district as mastered, or the campaign as completed
- Awards the campaign completion bonus
- Records a victory
- Shows the completion screen
- Unlocks the next district; only the final Rome stage unlocks the next chapter

At ordinary sunset, the physical run resets while the legacy state persists.

The sunset report explains:

- Completion percentage
- Up to four unfinished objective counts
- Projects still under construction and their final percentages
- Laurels earned
- Whether the attempt set a progress record
- Whether a victory set a fastest-completion record
- Whether a victory occurred in the final three seconds

## Current End State

Completing the full city of Rome unlocks Italia. Completing Italia unlocks Mare Nostrum. Completing Mare Nostrum unlocks the postgame Empire map, where province modifiers create new one-day challenges and victories earn Imperial Influence.
