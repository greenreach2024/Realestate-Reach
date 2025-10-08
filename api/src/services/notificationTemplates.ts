interface WishlistContext {
  area: string;
  matchCount: number;
  topFitPercentage: number;
}

export function buildNewMatchCopy({ area, matchCount, topFitPercentage }: WishlistContext): string {
  const safeMatchCount = Math.max(0, matchCount);
  const safeTopFit = Math.round(Math.max(0, Math.min(100, topFitPercentage)));
  return `${safeMatchCount} homes fit your wishlist in ${area} (top fit ${safeTopFit}%). Owners decide what to share. Update your wishlist to improve fit.`;
}

export default { buildNewMatchCopy };
