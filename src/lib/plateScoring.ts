import { PLATE_GEO } from "../data/plate-geo";

// Tier structure: always 67 plates, always sums to 475 pts
// 25×2 + 25×5 + 10×10 + 5×20 + 2×50 = 475
const TIER_POINTS = [2, 5, 10, 20, 50];
const TIER_SIZES  = [25, 25, 10,  5,  2];
const SOFTENING_KM = 50;

function distToSegmentKm(
  pLat: number, pLng: number,
  aLat: number, aLng: number,
  bLat: number, bLng: number,
): number {
  const midLat = (Math.min(pLat, aLat, bLat) + Math.max(pLat, aLat, bLat)) / 2;
  const kx = 111.0 * Math.cos((midLat * Math.PI) / 180);
  const ky = 111.0;

  const cx = (pLng - aLng) * kx;
  const cy = (pLat - aLat) * ky;
  const dx = (bLng - aLng) * kx;
  const dy = (bLat - aLat) * ky;

  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.sqrt(cx * cx + cy * cy);

  const t = Math.max(0, Math.min(1, (cx * dx + cy * dy) / lenSq));
  return Math.sqrt((cx - dx * t) ** 2 + (cy - dy * t) ** 2);
}

/** Returns a map of cardId → points for every plate card, based on the route. */
export function computePlatePoints(
  originLat: number, originLng: number,
  destLat: number,   destLng: number,
): Record<string, number> {
  const scored = PLATE_GEO.map((p) => {
    const dist = distToSegmentKm(p.lat, p.lng, originLat, originLng, destLat, destLng);
    return { cardId: p.cardId, score: (p.vmt * p.corridorFactor) / (dist + SOFTENING_KM) ** 2 };
  });

  // Sort highest score (most common) → lowest score (rarest)
  scored.sort((a, b) => b.score - a.score);

  const result: Record<string, number> = {};
  let rank = 0;
  for (let tier = 0; tier < TIER_POINTS.length; tier++) {
    for (let i = 0; i < TIER_SIZES[tier]; i++) {
      result[scored[rank++].cardId] = TIER_POINTS[tier];
    }
  }
  return result;
}
