import { useEffect, useState } from 'react';

/**
 * OPTIMIZED: Debounce hook with configurable delay
 * Reduces unnecessary re-renders and computations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * OPTIMIZED: Smart debounce with different delays for different change types
 * - Small changes: longer delay (batch updates)
 * - Large changes: shorter delay (show immediately)
 */
export function useSmartDebounce<T extends string>(
  value: T,
  options: {
    minDelay?: number;
    maxDelay?: number;
    threshold?: number; // character count threshold
  } = {}
): T {
  const {
    minDelay = 300,
    maxDelay = 1000,
    threshold = 50,
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [prevValue, setPrevValue] = useState<T>(value);

  useEffect(() => {
    // Calculate change size
    const changeSize = Math.abs(value.length - prevValue.length);

    // Adaptive delay: smaller changes = longer wait, larger changes = shorter wait
    const delay = changeSize < threshold
      ? maxDelay // Small change: wait longer to batch
      : minDelay; // Large change: update quickly

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setPrevValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, minDelay, maxDelay, threshold, prevValue]);

  return debouncedValue;
}
