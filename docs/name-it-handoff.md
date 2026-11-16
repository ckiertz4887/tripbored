# Name It (A–Z) — session notes for Claude Code

Context for picking up where a Cowork session left off. Read this, then `docs/backlog.md` and `CLAUDE.md` for the rest of the project's standing context.

## What's done

All three changes below are already saved to disk in this repo, and `tsc --noEmit` passes clean. **They have not been built or deployed** — see "Still needed" below.

**1. Fixed a deck-repeat bug** (`src/pages/CategoryLetter.tsx`)
Each deck (categories, letters) walks through one shuffled pass before reshuffling, so repeats within a pass were never possible — but nothing stopped a fresh shuffle from starting with the same card that had just ended the previous pass. `shuffledAvoiding()` now swaps that card out of the first slot when it happens, so no card can repeat until every other card in the deck has been shown.

**2. Added a "Flip Both" button**
Sits below the two decks, flips category + letter together in sync. The individual per-deck tap targets still work exactly as before.

**3. Redesigned the deck cards to look like real playing cards, not arcade panels**
This went through two iterations — the first pass kept the app's navy/chunky-border/hard-shadow arcade look and just added a fanned-stack effect; the user then clarified they wanted the actual *card* aesthetic to change, not just gain a stack effect. Second pass:
- Ivory cardstock face (`--card-face`) with a thin ruled double-border, replacing the navy/LCD bevel panels
- Soft blurred table shadow instead of the app's usual hard zero-blur offset shadow
- Serif type (Georgia) for the dealt value, replacing bold Verdana / the letter deck's glowing monospace LCD digit
- Two ink colors standing in for a deck's two suits — navy for category cards, warm amber-brown for letter cards (`--card-ink-a` / `--card-ink-b`). Deliberately **not** red — `CLAUDE.md` reserves red exclusively for the RARE ribbon on the spotting board, and that constraint was respected here.
- A real "card back": diamond-lattice pattern, small round monogram badge, deck label — shown before a card is flipped, and permanently on the two fanned cards peeking out behind the top card (so the ones "underneath" always look face-down, like a real deck)
- Printed corner index only on the face-up state, mirrored top-left/bottom-right like a card's rank

Files touched: `src/pages/CategoryLetter.tsx`, `src/pages/Home.tsx` (now derives its category count from `CATEGORIES.length` instead of a hardcoded "40"), `src/styles.css` (new `.cl-deck` styling + two new CSS vars in `:root`).

## Still needed

**Build + deploy.** Nothing has gone out yet — a hard refresh on the live site won't show any of this. From this project's actual Terminal (not a sandboxed tool session):
```
npm run build && firebase deploy
```
or the equivalent `npm run deploy` script already in `package.json`. A prior attempt to build from a sandboxed environment failed on a `@rollup/rollup-linux-arm64-gnu` native-binary mismatch (that sandbox's `node_modules` had macOS binaries) — shouldn't recur running natively on the Mac.

**Git.** All of the above is uncommitted working-tree changes (`git status` shows `CategoryLetter.tsx` as untracked, `Home.tsx`/`styles.css` as modified) on top of a repo that's a single `Initial commit`. Worth a commit once it's confirmed working live.

## Waiting on the user

A list of 100 candidate categories for the "Name It" deck (currently has 39) was generated and handed to the user for review — items 1–39 are what's live today, 40–100 are new suggestions including musicals/plays, bands/artists, and actors/actresses as requested. **They have not yet said which to keep.** Once they do, the `CATEGORIES` array at the top of `src/pages/CategoryLetter.tsx` is the only place that needs updating (it's a flat string array); `Home.tsx`'s category count will update itself automatically.
