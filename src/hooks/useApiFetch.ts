"use client";

import { type DependencyList, useEffect, useState } from "react";

export function useApiFetch<T>(
  url: string,
  deps: DependencyList = [],
  options?: {
    defaultValue?: T;
    enabled?: boolean;
    headers?: HeadersInit;
  },
) {
  const [data, setData] = useState<T | null>(options?.defaultValue ?? null);
  const [loading, setLoading] = useState(Boolean(options?.enabled ?? true));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false) {
      return;
    }

    const controller = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          signal: controller.signal,
          cache: "no-store",
          headers: options?.headers,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const result = (await response.json()) as T;
        setData(result);
      } catch (caughtError) {
        if ((caughtError as Error).name === "AbortError") {
          return;
        }

        setError(caughtError as Error);
        setData(options?.defaultValue ?? null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => controller.abort();
  }, deps);

  return {
    data,
    loading,
    error,
  };
}
