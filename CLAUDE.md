# TripBored

A road trip spotting game. Players tap cards for what they see out the window —
license plates, vehicles, wildlife, roadside places, family moments — and rack
up points, alone or on a shared board with the whole car. 425 cards across 19
categories.

Read this file first, every session. It's the durable context; the code
changes faster than this file should.

## Stack

Vite + React + TypeScript, Firebase (Auth + Firestore + Hosting). No separate
backend — deliberately. See `README.md` for setup and deploy steps.

## Where things live

```
scripts/card-catalog.mjs   Source of truth for every card, name, and point value
scripts/build-cards.mjs    Generates src/data/cards.ts from card-catalog.mjs
src/data/cards.ts          GENERATED. Never hand-edit — run `npm run build:cards`
src/lib/firebase.ts        Firebase init, offline persistence config
src/lib/auth.tsx           Google + anonymous auth, guest-to-account linking
src/lib/game.ts            Firestore reads/writes: games, finds, events, scoring
src/components/CardTile.tsx  Individual card — the scroll-vs-tap fix lives here
src/pages/Home.tsx         Landing page
src/pages/Game.tsx         The board itself
src/pages/Profile.tsx      Lifetime stats, trip history
src/styles.css             The whole design system, one file
docs/foundations.md        Original planning doc: origin, rarity model, prototype history
docs/backlog.md            Beta-test notes: card ideas, corrections, open questions, bonus rounds
docs/card-catalog-reference.csv  Flat reference sheet, same data as card-catalog.mjs
```

**Changing a card's name, points, or category?** Edit `scripts/card-catalog.mjs`,
run `npm run build:cards`, done. Don't touch `src/data/cards.ts` directly — it
gets regenerated and your edit disappears.

**A card's `id` is derived from its name.** Renaming a card changes its id and
orphans any `finds` already written against the old id in Firestore. If real
games have been played, a rename needs a migration, not just a catalog edit.

## Constraints that came from real use, not preference

These aren't style opinions — each one traces back to a specific finding from
building and beta-testing the prototype with a kid in a car. Don't relax them
without knowing why they're there.

- **Offline-first is non-negotiable.** This game is played in exactly the
  places cell service disappears. Firestore is configured with
  `persistentLocalCache` — every tap writes to IndexedDB immediately and syncs
  when service returns. Nothing in the UI should ever block on the network.
- **Scroll must never register as a tap.** `CardTile` uses pointer events with
  a movement threshold, not `onClick`. This came directly from beta feedback —
  fast scrolling on a touch board was flipping cards by accident.
- **Untapping must subtract points, correctly, every time.** Score is always
  *recomputed* from the `finds` collection, never incremented/decremented in
  place. This was a real bug in the original prototype; the architecture now
  makes the bug class impossible rather than patching each instance.
- **Found is always green. Red is reserved for the RARE ribbon only.** Never
  repurpose red for anything else (errors, warnings) without a different
  color — the found/rare color coding is load-bearing for a kid glancing at
  the board at highway speed.
- **Never require driver interaction.** Passenger-only by design. Any future
  feature (voice input, notifications, whatever) gets evaluated against
  "would this pull a driver's attention" before anything else.
- **Retro arcade-portal aesthetic.** Chunky navy borders, hard drop shadows
  with zero blur, Verdana, bevel buttons, LCD-style score counter in glowing
  green digits. This is a deliberate choice, not a placeholder look — see
  `docs/foundations.md` for the reference and reasoning.

## Data model

```
users/{uid}                      profile, lifetime totals
games/{gameId}                   name, ownerUid, status, memberIds, members
games/{gameId}/finds/{cardId}    one doc per found card — points, who, when
games/{gameId}/events/{eventId}  append-only tap/untap log, powers undo
```

A game's id *is* its permission — 16 random characters, unguessable, no invite
flow. Anyone with the link can open and tap. Only the owner can rename or
finalize a game, enforced in `firestore.rules`, not just hidden in the UI.

## Not built yet

Roughly in priority order — check `docs/backlog.md` before starting any of
these, since the original brainstorm often has specifics (point ranges,
naming, edge cases) worth preserving:

- Route-aware plate scoring (the gravity model in `docs/foundations.md`) —
  plates are flat 5s today
- Bonus rounds / mini-games — billboards, brands, trivia, word games
- Trip photo + branded share card on finalize
- GPS tagging (tap-and-hold to attach where a card was spotted)
- Versus mode — teams/cars competing rather than one shared board
- Deeper stats/insights beyond lifetime totals
- Plate version gallery (per-state alternate-design counter)

## Working style

The person building this does not want assumptions made silently. If a
request is ambiguous and the answer would change what gets built (not just
how), ask rather than guess — especially for anything touching the card
catalog, scoring, or the constraints above. Small implementation details are
fine to decide and move on.
