// Auto-generate URL-safe slugs from titles.
// "The Glory"  -> "the-glory"
// "Squid Game 3" -> "squid-game-3"

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', ә: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'e',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', қ: 'k', л: 'l', м: 'm', н: 'n',
  ң: 'n', о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ұ: 'u',
  ү: 'u', ф: 'f', х: 'h', һ: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '',
  ы: 'y', і: 'i', э: 'e', ю: 'yu', я: 'ya',
};

export function slugify(input: string): string {
  if (!input) return '';
  const lower = input.toLowerCase().trim();
  let out = '';
  for (const ch of lower) {
    out += CYRILLIC_TO_LATIN[ch] ?? ch;
  }
  return out
    .replace(/['"`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80);
}

export function ensureUniqueSlug(base: string, exists: (slug: string) => Promise<boolean>) {
  return (async () => {
    const root = slugify(base) || 'item';
    let candidate = root;
    let i = 2;
    while (await exists(candidate)) {
      candidate = `${root}-${i++}`;
      if (i > 9999) {
        candidate = `${root}-${Date.now()}`;
        break;
      }
    }
    return candidate;
  })();
}
