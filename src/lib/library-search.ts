import { protocols, type Protocol } from '@/data/protocols';

const REQUEST_LIMIT = 9500;

interface SearchUsage {
  count: number;
  month: number;
}

function getRequestCount(): SearchUsage {
  try {
    const data = localStorage.getItem('rezilience_search_usage');
    if (!data) return { count: 0, month: new Date().getMonth() };
    const parsed: SearchUsage = JSON.parse(data);
    if (parsed.month !== new Date().getMonth()) {
      return { count: 0, month: new Date().getMonth() };
    }
    return parsed;
  } catch {
    return { count: 0, month: new Date().getMonth() };
  }
}

function incrementRequestCount(): number {
  const usage = getRequestCount();
  usage.count += 1;
  localStorage.setItem('rezilience_search_usage', JSON.stringify(usage));
  return usage.count;
}

/** Weighted client-side fallback search */
export function fallbackSearch(query: string): Protocol[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return protocols
    .map((protocol) => {
      let score = 0;
      const name = protocol.name.toLowerCase();

      if (name === q) score += 100;
      else if (name.startsWith(q)) score += 50;
      else if (name.includes(q)) score += 25;

      if (protocol.keywords.some((k) => k.includes(q))) score += 15;
      if (protocol.quickFacts.useCase.toLowerCase().includes(q)) score += 20;
      if (protocol.description.toLowerCase().includes(q)) score += 10;
      if (protocol.category.toLowerCase().includes(q)) score += 5;

      return { protocol, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.protocol);
}

/** Hybrid search: Algolia primary, TS fallback */
export async function searchProtocols(query: string): Promise<{
  results: Protocol[];
  searchMethod: 'algolia' | 'fallback';
  limitReached: boolean;
}> {
  const usage = getRequestCount();

  const algoliaAppId = import.meta.env.VITE_ALGOLIA_APP_ID || 'T66N1QX69X';
  const algoliaSearchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || '7920e48930df873606b53623036302ab';

  if (algoliaAppId && algoliaSearchKey && usage.count < REQUEST_LIMIT) {
    try {
      const { liteClient } = await import('algoliasearch/lite');
      const client = liteClient(algoliaAppId, algoliaSearchKey);
      const { results: searchResults } = await client.search({
        requests: [{ indexName: 'protocols', query, hitsPerPage: 20 }],
      });

      incrementRequestCount();

      const hits = (searchResults[0] as any)?.hits ?? [];
      const matched = hits
        .map((hit: any) => protocols.find((p) => p.id === hit.objectID))
        .filter(Boolean) as Protocol[];

      return { results: matched, searchMethod: 'algolia', limitReached: false };
    } catch {
      // Fall through to fallback
    }
  }

  return {
    results: fallbackSearch(query),
    searchMethod: 'fallback',
    limitReached: usage.count >= REQUEST_LIMIT,
  };
}

export function getSearchUsageStats() {
  const usage = getRequestCount();
  return {
    count: usage.count,
    limit: 10000,
    percentage: (usage.count / 10000) * 100,
    remaining: 10000 - usage.count,
  };
}
