import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveMinigameReturn, getGameUrl } from "../lib/minigameNav";

export const CATEGORIES = [
  "Animals",
  "Foods & Drinks",
  "Sports",
  "Jobs & Careers",
  "Things in a Kitchen",
  "Musical Instruments",
  "Things You Wear",
  "Vehicles",
  "Countries",
  "Things in Nature",
  "Movies & TV Shows",
  "Fruits & Vegetables",
  "School Subjects",
  "Things at the Beach",
  "Famous People",
  "Toys & Games",
  "Superheroes & Villains",
  "Things That Fly",
  "Things at a Party",
  "Plants & Flowers",
  "Things in a City",
  "Stores & Brands",
  "Books & Stories",
  "Dinosaurs",
  "Things in Space",
  "Candy & Sweets",
  "Dog Breeds",
  "Cartoon Characters",
  "Things You Pack for a Trip",
  "Types of Games",
  "Languages",
  "Dance Styles",
  "Things in a Bathroom",
  "Things at a Hospital",
  "Things at a Carnival",
  "Sports Teams",
  "Things That Are Round",
  "Things That Are Cold",
  "Disney Movies",
];

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const FLIP_MS = 320;

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Shuffles `arr`, but if the result would start with `avoid` (the card that
 * was just shown, right before this new pass begins), swaps it out of the
 * first slot. Without this, two independently-fair shuffles can legally
 * place the same card at the end of one pass and the start of the next —
 * which reads to a player as "didn't we just see this?" even though every
 * card was technically shown once per pass.
 */
function shuffledAvoiding<T>(arr: T[], avoid: T | null): T[] {
  const next = shuffled(arr);
  if (avoid !== null && next.length > 1 && next[0] === avoid) {
    const swapWith = 1 + Math.floor(Math.random() * (next.length - 1));
    [next[0], next[swapWith]] = [next[swapWith], next[0]];
  }
  return next;
}

type Deck = { cards: string[]; pos: number };

function makeDeck(arr: string[]): Deck {
  return { cards: shuffled(arr), pos: -1 };
}

/**
 * Walks forward through the current shuffled pass one card at a time. Only
 * once every card in the pass has been shown does it deal a fresh shuffled
 * pass — so a repeat is only ever possible after the full deck has gone by,
 * never before, and `shuffledAvoiding` closes the one legal seam where the
 * last card of one pass could otherwise match the first card of the next.
 */
function advance(deck: Deck, source: string[]): Deck {
  const next = deck.pos + 1;
  if (next >= deck.cards.length) {
    const lastShown = deck.cards[deck.cards.length - 1] ?? null;
    return { cards: shuffledAvoiding(source, lastShown), pos: 0 };
  }
  return { ...deck, pos: next };
}

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function CategoryLetter() {
  const nav = useNavigate();
  const gameUrl = useRef(getGameUrl());
  useEffect(() => {
    document.title = "Name It (A–Z) · TripBored";
    return () => { document.title = "TripBored"; };
  }, []);
  const [catDeck, setCatDeck] = useState<Deck>(() => makeDeck(CATEGORIES));
  const [letDeck, setLetDeck] = useState<Deck>(() => makeDeck(LETTERS));
  const [catAnim, setCatAnim] = useState(false);
  const [letAnim, setLetAnim] = useState(false);

  const category = catDeck.pos >= 0 ? catDeck.cards[catDeck.pos] : null;
  const letter = letDeck.pos >= 0 ? letDeck.cards[letDeck.pos] : null;
  const catProgress = catDeck.pos >= 0 ? `${catDeck.pos + 1} / ${catDeck.cards.length}` : null;
  const letProgress = letDeck.pos >= 0 ? `${letDeck.pos + 1} / ${letDeck.cards.length}` : null;

  function flipCat() {
    if (catAnim) return;
    setCatAnim(true);
    setTimeout(() => setCatDeck((d) => advance(d, CATEGORIES)), FLIP_MS / 2);
    setTimeout(() => setCatAnim(false), FLIP_MS);
  }

  function flipLet() {
    if (letAnim) return;
    setLetAnim(true);
    setTimeout(() => setLetDeck((d) => advance(d, LETTERS)), FLIP_MS / 2);
    setTimeout(() => setLetAnim(false), FLIP_MS);
  }

  /** Flips both decks together, in sync — the individual buttons still work on their own. */
  function flipBoth() {
    if (catAnim || letAnim) return;
    flipCat();
    flipLet();
  }

  function reshuffle() {
    setCatDeck(makeDeck(CATEGORIES));
    setLetDeck(makeDeck(LETTERS));
  }

  return (
    <div className="cl-page">
      <div className="cl-header">
        <button className="btn btn-secondary btn-sm" onClick={() => nav("/")}>Home</button>
        <h1 className="cl-title">Name It <span className="cl-title-plus">(A–Z)</span></h1>
        <div className="cl-header-right">
          {gameUrl.current && (
            <button className="btn btn-secondary btn-sm" onClick={() => {
              saveMinigameReturn("/name-it", "Name It");
              nav(gameUrl.current!);
            }}>Board</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={reshuffle} title="Reshuffle both decks">
            ↺ Reshuffle
          </button>
        </div>
      </div>

      <div className="cl-decks">
        <button
          className={cx("cl-deck", category && "cl-deck-faceup")}
          onClick={flipCat}
          aria-label="Flip category deck"
        >
          <div className={cx("cl-deck-face", catAnim && "cl-flipping")}>
            {category && (
              <>
                <span className="cl-corner cl-corner-tl" aria-hidden="true">◆</span>
                <span className="cl-corner cl-corner-br" aria-hidden="true">◆</span>
              </>
            )}
            <span className="cl-deck-value">
              {category ?? (
                <span className="cl-card-back">
                  <span className="cl-card-back-mark" aria-hidden="true">TB</span>
                  <span className="cl-card-back-label">Category</span>
                  <span className="cl-deck-hint">Tap to flip</span>
                </span>
              )}
            </span>
            {catProgress && <span className="cl-deck-progress">{catProgress}</span>}
          </div>
        </button>

        <button
          className={cx("cl-deck cl-deck-letter", letter && "cl-deck-faceup")}
          onClick={flipLet}
          aria-label="Flip letter deck"
        >
          <div className={cx("cl-deck-face", letAnim && "cl-flipping")}>
            {letter && (
              <>
                <span className="cl-corner cl-corner-tl" aria-hidden="true">{letter}</span>
                <span className="cl-corner cl-corner-br" aria-hidden="true">{letter}</span>
              </>
            )}
            <span className="cl-deck-value">
              {letter
                ? <span className="cl-letter">{letter}</span>
                : (
                  <span className="cl-card-back">
                    <span className="cl-card-back-mark" aria-hidden="true">TB</span>
                    <span className="cl-card-back-label">Letter</span>
                    <span className="cl-deck-hint">Tap to flip</span>
                  </span>
                )
              }
            </span>
            {letProgress && <span className="cl-deck-progress">{letProgress}</span>}
          </div>
        </button>
      </div>

      <button
        className="btn btn-yellow btn-lg btn-block cl-flip-both"
        onClick={flipBoth}
        disabled={catAnim || letAnim}
      >
        Flip Both
      </button>

      <div className="cl-footer">
        {category && letter ? (
          <div className="cl-prompt">
            Name something in <strong>{category}</strong> that starts with <strong>{letter}</strong>
          </div>
        ) : (
          <div className="cl-instructions">
            Tap each deck to flip (or Flip Both) · Name something in the category starting with the letter
          </div>
        )}
      </div>
    </div>
  );
}
