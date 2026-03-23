"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const LEVEL_SOUND_VOLUME = 0.6;

// Tipos para el contexto de sonidos
interface SoundContextType {
  currentLevel: number;
  setCurrentLevel: (level: number) => void;
  playLevelSound: (level: number) => void;
  playResultSound: (result: number) => void;
  fadeOutLevelSound: (durationMs?: number) => Promise<void>;
  stopAllSounds: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

// Crear el contexto
const SoundContext = createContext<SoundContextType | undefined>(undefined);

// Hook para usar el contexto
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return context;
};

// Provider de sonidos
function SoundProvider({ children }: { children: React.ReactNode }) {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Referencias para los objetos de audio
  const levelSoundsRef = useRef<{ [key: number]: HTMLAudioElement }>({});
  const resultSoundsRef = useRef<{ [key: number]: HTMLAudioElement }>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Inicializar los sonidos
  useEffect(() => {
    // Cargar sonidos de niveles
    for (let i = 1; i <= 3; i++) {
      const audio = new Audio(`/sounds/level_0${i}.mp3`);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = LEVEL_SOUND_VOLUME;
      levelSoundsRef.current[i] = audio;

      // Event listeners para control de reproducción
      audio.addEventListener("play", () => setIsPlaying(true));
      audio.addEventListener("pause", () => setIsPlaying(false));
      audio.addEventListener("ended", () => setIsPlaying(false));
    }

    // Cargar sonidos de resultado
    for (let i = 1; i <= 3; i++) {
      const audio = new Audio(`/sounds/result_${i}.mp3`);
      audio.preload = "auto";
      audio.volume = 0.7;
      resultSoundsRef.current[i] = audio;
    }

    // Cleanup al desmontar
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      Object.values(levelSoundsRef.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
      Object.values(resultSoundsRef.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const clearFadeInterval = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  }, []);

  // Función para reproducir sonido de nivel
  const stopAllSounds = useCallback(() => {
    clearFadeInterval();
    Object.values(levelSoundsRef.current).forEach((audio) => audio.pause());
    Object.values(resultSoundsRef.current).forEach((audio) => audio.pause());
    Object.values(levelSoundsRef.current).forEach((audio) => {
      audio.currentTime = 0;
      audio.volume = LEVEL_SOUND_VOLUME;
    });
    currentAudioRef.current = null;
    setIsPlaying(false);
  }, [clearFadeInterval]);

  const playLevelSound = useCallback((level: number) => {
    if (isMuted || !levelSoundsRef.current[level]) return;

    clearFadeInterval();

    // Parar cualquier sonido que esté sonando
    stopAllSounds();

    const audio = levelSoundsRef.current[level];
    currentAudioRef.current = audio;

    audio.volume = LEVEL_SOUND_VOLUME;
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.warn(`Error playing level sound ${level}:`, error);
    });
  }, [clearFadeInterval, isMuted, stopAllSounds]);

  // Función para reproducir sonido de resultado
  const playResultSound = useCallback((result: number) => {
    if (isMuted || !resultSoundsRef.current[result]) return;

    const audio = resultSoundsRef.current[result];
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.warn(`Error playing result sound ${result}:`, error);
    });
  }, [isMuted]);

  const fadeOutLevelSound = useCallback((durationMs = 450) => {
    clearFadeInterval();

    const audio = currentAudioRef.current;
    if (!audio || audio.paused) {
      currentAudioRef.current = null;
      setIsPlaying(false);
      return Promise.resolve();
    }

    const initialVolume = audio.volume || LEVEL_SOUND_VOLUME;
    const totalSteps = Math.max(1, Math.floor(durationMs / 50));
    const volumeStep = initialVolume / totalSteps;

    return new Promise<void>((resolve) => {
      fadeIntervalRef.current = setInterval(() => {
        const nextVolume = Math.max(0, audio.volume - volumeStep);
        audio.volume = nextVolume;

        if (nextVolume <= 0.01) {
          clearFadeInterval();
          audio.pause();
          audio.currentTime = 0;
          audio.volume = LEVEL_SOUND_VOLUME;
          currentAudioRef.current = null;
          setIsPlaying(false);
          resolve();
        }
      }, 50);
    });
  }, [clearFadeInterval]);

  // Función para mutear/desmutear
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (newMuted) {
        stopAllSounds();
      }
      return newMuted;
    });
  }, [stopAllSounds]);

  const value: SoundContextType = {
    currentLevel,
    setCurrentLevel,
    playLevelSound,
    playResultSound,
    fadeOutLevelSound,
    stopAllSounds,
    isMuted,
    toggleMute,
    isPlaying,
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }, []);

  return (
    <SessionProvider>
      <SoundProvider>{children}</SoundProvider>
    </SessionProvider>
  );
}
