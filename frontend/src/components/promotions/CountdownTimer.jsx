import { useEffect, useState } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

export function CountdownTimer({ endDate, compact = false, onExpire }) {
  const target = endDate instanceof Date ? endDate : new Date(endDate);

  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const tick = () => {
      const next = Math.max(0, target - Date.now());
      setRemaining(next);
      if (next === 0) onExpire?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, onExpire]);

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  if (compact) {
    return (
      <span className="font-mono font-bold tabular-nums" aria-live="polite">
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    );
  }

  return (
    <div className="flex gap-2" role="timer" aria-live="polite">
      {[
        { label: 'Hrs', value: hours },
        { label: 'Min', value: minutes },
        { label: 'Sec', value: seconds },
      ].map((unit) => (
        <div key={unit.label} className="text-center min-w-[52px] rounded-xl bg-black/20 backdrop-blur px-2 py-1.5">
          <div className="text-xl md:text-2xl font-bold tabular-nums">{pad(unit.value)}</div>
          <div className="text-[10px] uppercase tracking-wide opacity-80">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}
