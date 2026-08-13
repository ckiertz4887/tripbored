# Road Trip Arcade — Project Foundations (Planning Phase Through v1/v2)

This covers everything *before* the Beta Round 2 backlog — origin, research, the scoring model, and how the prototype got to its current state. Pairs with `roadtrip-arcade-backlog.md`, which picks up from the beta test forward.

---

## Origin & Concept

Started from the classic license plate spotting game, expanded to include other vehicle-spotting categories (boats on trailers, planes, trains, semis, etc.), playable collaboratively or standard/competitive.

---

## Competitive Landscape Research

Existing apps in this space: RoadTrip: License Plate Game, PlateSpot, States & Plates, License Plate Mania, USA License Plate Game.

**The pattern across every competitor's reviews:** no persistent trip history/scrapbook across multiple trips, weak or paywalled multiplayer, and nobody has built genuinely accurate rarity scoring — most just use "farthest plate found" (straight-line distance), which is a weak proxy. This gap is the strategic opening: multi-vehicle-type spotting (not just plates), real route-aware rarity scoring, and persistent trip history are the three things that would differentiate from every existing app.

---

## License Plate Rarity Scoring — The Gravity Model

**Why distance-only fails:** a California plate seen in Connecticut isn't rare just because of distance — CA is common because it's a huge state with massive outbound travel volume. A West Virginia plate is rarer despite being closer, because WV has a small population and isn't a major through-state. Distance is a weak proxy; origin population and corridor connectivity matter more.

**The formula (gravity model, borrowed from transportation planning):**
`Expected frequency(A→B) = k × (Population_A × Attractiveness_B) / Distance_AB^β`
Simplified for the game: `Rarity score = 1 / Expected_sightings(origin state, your route)`

Inputs:
1. Origin state population or registered vehicle count
2. Road-network distance from the *route*, not straight-line from start/end points
3. Corridor multiplier — states along the same interstate as the route get boosted regardless of raw distance (e.g., FL/GA/SC/NC plates inflated all along I-95 due to snowbird migration)
4. Seasonal adjustment (snowbird patterns, college move-in/out weekends, etc.)

**Data sources to calibrate this:**
- US Census population estimates
- State DMV registered vehicle counts
- National Household Travel Survey (NHTS) — real long-distance trip data by state pair
- FHWA highway network data — real road-network distance vs. straight-line

**The real moat:** crowdsourced sighting data. Start with a population/distance/corridor prior, then Bayesian-update the rarity weights as real plate sightings accumulate by region over time. No competitor has this — it's a dataset that only gets better with usage and can't be replicated without years of real user data.

**Worked example** (Guilford, CT → Outer Banks, NC, ~500mi, I-95 corridor): local states (CT/NY/NJ/MA/RI) score 1–3 pts; corridor states (PA/VA/NC/MD/DE/FL/GA/SC) score 5–10 despite some being far away; moderate states (OH/TX/IL/MI/TN/IN) score 15–30; rare (ME/VT/NH/WI/MN/MO/KY/WV) score 35–55; very rare (MT/WY/ND/SD/ID/NM/NV/UT/OR) score 60–90; jackpot (HI/AK/territories) score 100+.

---

## Dynamic Weighting — Live Trip Discussion

**Input UX options (cheapest to best):**
1. Manual entry — two autocomplete fields (start/destination) at trip creation, one-time
2. GPS-assisted — location permission once, live position replaces manual entry
3. Hybrid — manual entry sets initial context, GPS refines continuously once granted

**Recalculating over a long trip:** static (calculate once, never update) goes stale on multi-day trips. Fully live (continuous GPS-based recalculation) is most accurate but needs a rule to avoid feeling broken: **points lock in at the moment of tap** — a plate found on day 1 keeps its day-1 score even if the live rarity index shifts later. The practical middle ground: recalculate on meaningful triggers only (state-line crossing via geofencing, or every few hours), not continuous polling — saves battery, still captures the "shifting weight as you travel" behavior.

**Technical approach without needing constant live routing:** one-time call to a routing API (Mapbox/Google Directions or open-source OSRM) at trip start gets a real road-following polyline, cached locally. All subsequent distance/corridor math runs on-device from the cached polyline — no more network calls needed for scoring itself. Bundle static reference data (population/registration figures, major interstate polylines) in the app for offline capability.

**Decision:** ship v1 with the static start/destination model. Treat GPS-live recalculation via geofencing as a clearly-scoped v2 once there's validation that people care about the score feeling "alive" over a multi-day trip.

---

## Plate Artwork — Licensing Considerations

State-issued plate designs sit in a legal gray area — some states treat their artwork as protected (trademark/copyright), DMV reuse policies vary widely. Options, cheapest to most robust:
1. Commission stylized illustrations rather than photographic reproductions (lowest legal risk)
2. License from a specialty plate-image vendor (insurance/DMV-verification industry already has this solved)
3. Contact individual state DMVs directly (most tedious — 50 separate conversations)
4. User-submitted photos (turns sighting-logging into the image source itself, though redistribution at scale still carries some of the same questions)

No real plate artwork has been sourced yet — current prototype uses placeholders/flat counters instead.

---

## Prototype Build History

**v1 — Minimalist iPad design:** Paper-white background, pine-green accent for "found," amber accent reserved for jackpot rarity only, system font throughout, monospace reserved for numbers/scores. Pack toggles at top to keep the board from showing 40+ categories at once. Plates always visible as the core game; other packs opt-in.

**v2 — Retro arcade-portal pivot:** Based on a reference screenshot of an old 2000s web game portal (chunky navy borders, hard drop shadows with no blur, bright primary colors, Verdana, bevel-style buttons). Score display became an actual LCD-style "hit counter" — black box, glowing green digits, zero-padded. Rare items get a red "RARE" corner ribbon. Found state uses a circular check-stamp.

**Plate Versions mechanic evolution:** Originally designed as a "gallery" — each state as a row with a primary plate image + 3–5 alternate design swatches. Since no real plate images have been sourced, this was simplified to a flat counter: tap + every time you spot a *different* design of a state's plate, worth 1 point each, no primary/alternate hierarchy implied (since without images, nobody can tell which version is "primary" anyway).

**Simplification pass (most recent before Beta Round 2):**
- License plates: flat 5 points each (route-aware rarity tiers set aside for now, to revisit later)
- Found state is always green, never red, regardless of item rarity — red is reserved only for the pre-found "RARE" tag on a couple of jackpot-tier items
- All category packs are always visible — removed the pack-toggle setup step entirely
- Roadside Landmarks changed from tally-counted to boolean (found or not)
- Total possible score now displays alongside current score
