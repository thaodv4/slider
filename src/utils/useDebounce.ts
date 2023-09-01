import { useEffect, useRef, useState } from "react";

const DelayDefault = 500

export const useDebounce = (value: unknown, delay = DelayDefault): unknown => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerReference = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerReference.current) {
      clearTimeout(timerReference.current);
    }

    timerReference.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timerReference.current) {
        clearTimeout(timerReference.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};