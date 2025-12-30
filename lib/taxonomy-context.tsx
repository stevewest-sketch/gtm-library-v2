'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TypeDisplayConfig {
  label: string;
  color: string;
  bg: string;
}

interface FormatDisplayConfig {
  label: string;
  color: string;
  iconType: string;
}

interface TaxonomyData {
  types: Record<string, TypeDisplayConfig>;
  formats: Record<string, FormatDisplayConfig>;
  isLoaded: boolean;
}

const TaxonomyContext = createContext<TaxonomyData>({
  types: {},
  formats: {},
  isLoaded: false,
});

// Global cache to persist across component remounts
let globalCache: { types: Record<string, TypeDisplayConfig>; formats: Record<string, FormatDisplayConfig> } | null = null;

export function TaxonomyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<TaxonomyData>({
    types: globalCache?.types || {},
    formats: globalCache?.formats || {},
    isLoaded: !!globalCache,
  });

  useEffect(() => {
    // If we have cached data, don't refetch immediately
    if (globalCache) return;

    const fetchTaxonomy = async () => {
      try {
        const response = await fetch('/api/taxonomy/display');
        if (response.ok) {
          const result = await response.json();
          globalCache = result;
          setData({
            types: result.types || {},
            formats: result.formats || {},
            isLoaded: true,
          });
        }
      } catch (error) {
        console.error('Failed to load taxonomy display data:', error);
        setData(prev => ({ ...prev, isLoaded: true }));
      }
    };

    fetchTaxonomy();
  }, []);

  return (
    <TaxonomyContext.Provider value={data}>
      {children}
    </TaxonomyContext.Provider>
  );
}

export function useTaxonomy() {
  return useContext(TaxonomyContext);
}

// Helper to get type display config with database fallback
export function useTypeDisplay(typeSlug: string | undefined) {
  const { types, isLoaded } = useTaxonomy();

  if (!typeSlug) return null;

  const normalizedSlug = typeSlug.toLowerCase().replace(/\s+/g, '-');

  // Check database types first
  if (types[normalizedSlug]) {
    return types[normalizedSlug];
  }

  // Return null if not found - let caller handle fallback
  return null;
}

// Helper to get format display config with database fallback
export function useFormatDisplay(formatSlug: string | undefined) {
  const { formats, isLoaded } = useTaxonomy();

  if (!formatSlug) return null;

  const normalizedSlug = formatSlug.toLowerCase().replace(/\s+/g, '-');

  // Check database formats first
  if (formats[normalizedSlug]) {
    return formats[normalizedSlug];
  }

  // Return null if not found - let caller handle fallback
  return null;
}
