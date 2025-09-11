import { useState, useEffect, useRef } from 'react';

export default function useTimer(active) {
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (active) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  const reset = () => setTime(0);

  return { time, reset };
}
