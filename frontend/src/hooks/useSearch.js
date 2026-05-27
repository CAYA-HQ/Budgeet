/**
 * useSearch.js
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { searchApi } from "../lib/api";

export function useSearch({ type = "all", month, category, delay = 400 } = {}) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const abortRef  = useRef(null);
  const timerRef  = useRef(null);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setError("");
  }, []);

  useEffect(() => {
    // Clear timer on every query change
    clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError("");
      return;
    }

    // Debounce
    timerRef.current = setTimeout(async () => {
      // Cancel previous in-flight request
      if (abortRef.current) abortRef.current.abort();

      setLoading(true);
      setError("");

      try {
        const data = await searchApi.search({ q: query.trim(), type, month, category });

        // Merge expenses + incomes into a single unified list
        const expenses = (data.expenses || []).map((e) => ({
          ...e,
          type: "expense",
          name: e.label,
        }));
        const incomes = (data.incomes || []).map((i) => ({
          ...i,
          type: "income",
          name: i.description || "Income",
        }));

        // Sort by date descending
        const merged = [...expenses, ...incomes].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        setResults(merged);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message || "Search failed.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [query, type, month, category, delay]);

  return { query, setQuery, results, loading, error, clear };
}