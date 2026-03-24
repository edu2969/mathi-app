import React, { useEffect, useState } from "react";

interface CountDownProps {
  steps?: string[];
  onFinish: () => void;
}

const DEFAULT_STEPS = ["3", "2", "1", "Go!"];

export default function CountDown({ steps = DEFAULT_STEPS, onFinish }: CountDownProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Play sound at the start of the countdown
    if (step === 0) {
      try {
        const audio = new Audio("/sounds/counter_down.mp3");
        audio.play();
      } catch (e) {
        // ignore playback errors
      }
    }
    if (step >= steps.length - 1) {
      const finishTimer = window.setTimeout(() => {
        onFinish();
      }, 900);
      return () => window.clearTimeout(finishTimer);
    }
    const timer = window.setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [step, steps.length, onFinish]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] pointer-events-none">
      <div
        key={steps[step]}
        className="countdown-burst select-none text-9xl sm:text-7xl font-black uppercase tracking-[0.2em] text-yellow-300"
        style={{
          WebkitTextStroke: '2px rgba(15, 23, 42, 0.85)',
          textShadow: '0 10px 24px rgba(15, 23, 42, 0.6), 0 0 30px rgba(250, 204, 21, 0.3)',
        }}
      >
        {steps[step]}
      </div>
    </div>
  );
}
