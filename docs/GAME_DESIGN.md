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
5. Tap resource panels for supplemental gathering.
6. Construct roads, infrastructure, civic buildings, and campaign projects.
7. React to a midday event.
8. Read the evening pressure and commit to the remaining objectives.
9. Choose one final order near sunset.
10. Complete every campaign objective before sunset or fail productively.
11. Read the sunset diagnosis and personal-record result.
12. Spend laurels on permanent upgrades.
13. Begin another attempt.

## Emotional Arc of the Day

The clock is the principal antagonist. Each attempt has four presented acts:

- Morning: the selected plan begins with confidence.
- Afternoon: the opening is over and the player adapts.
- Evening: the remaining objective count becomes explicit.
- Final Light: the sky, clock, sound, and message system become urgent.

The final ten seconds produce audible ticks. The last three ticks use a higher warning tone.

## Campaigns

### Chapter I — Rome

Day length: 90 seconds.

Objective:

- Build one Colosseum.

Rome is the introductory campaign. It teaches resource gathering, assignment, construction costs, roads, workshops, and the reset loop.

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

One deterministic event occurs at approximately 55% of the day:

- Supply Caravan: adds 18 of every resource.
- Guild Inspiration: gathering is 25% faster for the remainder of the day.
- A Brilliant Engineer: construction costs are 15% lower for the remainder of the day.

The event is selected from the current attempt number and campaign chapter. It therefore varies across attempts without requiring random save data.

## Final Orders

At 20 seconds remaining, the player may issue exactly one final order:

- Rally the Crews: gathering is 45% faster until sunset.
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

Construction discounts may stack, but their combined multiplier cannot fall below 65%. This prevents late-game upgrades, Frugal Works, and the Engineer event from trivializing entire chapters.

## Workforce Scaling

Saved workers are never deleted or hard-capped.

Large assigned crews use diminishing coordination returns:

```text
effective crew = assigned workers                    when assigned <= 8
effective crew = 8 + (assigned workers - 8)^0.72    when assigned > 8
```

This preserves the excitement of a large workforce while preventing linear worker growth from reducing a civilization-scale campaign to a few seconds.

## Completion and Failure

A campaign completes when every entry in its objective map reaches the required count. The game then:

- Marks the campaign as completed
- Awards the campaign completion bonus
- Records a victory
- Shows the completion screen
- Unlocks the next chapter

At ordinary sunset, the physical run resets while the legacy state persists.

The sunset report explains:

- Completion percentage
- Up to four unfinished objective counts
- Laurels earned
- Whether the attempt set a progress record
- Whether a victory set a fastest-completion record
- Whether a victory occurred in the final three seconds

## Current End State

Completing Mare Nostrum currently displays “Rule the Empire” and begins another attempt. A larger geographic empire layer is a future system, not yet implemented.
