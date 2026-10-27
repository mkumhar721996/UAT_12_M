const STOP_WORDS = new Set([
  "that",
  "this",
  "with",
  "from",
  "have",
  "will",
  "when",
  "then",
  "given",
  "should",
  "wants",
  "into",
  "their",
  "there",
  "which",
]);

export function keywordsOf(text: string): string[] {
  const words = text.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  return [...new Set(words)].filter((word) => !STOP_WORDS.has(word));
}

export function sharesKeyword(criteria: string[], title: string, description: string): boolean {
  const keywords = keywordsOf(`${title} ${description}`);
  return criteria.some((criterion) => {
    const lower = criterion.toLowerCase();
    return keywords.some((keyword) => lower.includes(keyword));
  });
}
