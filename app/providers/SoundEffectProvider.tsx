"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

// ============================================================
// TIPOS
// ============================================================

export interface SoundConfig {
  src: string;
  loop?: boolean;
  volume?: number;
}

export type SoundMap = Record<string, SoundConfig>;

export interface PlayOptions {
  /** Reinicia el sonido si ya está sonando. Por defecto true. */
  restart?: boolean;
  /** Detiene (sin fade) todos los demás sonidos antes de reproducir. */
  stopOthers?: boolean;
  /** Volumen solo para esta reproducción (se restaura al detenerse). */
  volume?: number;
}

interface SoundEffectsContextType {
  /** Carga un sonido nuevo (o actualiza uno existente) en tiempo de ejecución. */
  registerSound: (id: string, config: SoundConfig) => void;
  play: (id: string, options?: PlayOptions) => void;
  /** Detiene un sonido de inmediato y lo deja listo para volver a sonar. */
  stop: (id: string) => void;
  stopAll: () => void;
  /** Baja el volumen hasta 0 y detiene. La promesa siempre se resuelve. */
  fadeOut: (id: string, durationMs?: number) => Promise<void>;
  fadeOutAll: (durationMs?: number) => Promise<void>;
  isSoundPlaying: (id: string) => boolean;
  playingIds: string[];
  /** true si hay al menos un sonido sonando. */
  isPlaying: boolean;
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

interface FadeState {
  intervalId: ReturnType<typeof setInterval>;
  promise: Promise<void>;
  resolve: () => void;
}

interface SoundEntry {
  audio: HTMLAudioElement;
  baseVolume: number;
  /** Se incrementa en cada stop/play para invalidar play() pendientes. */
  token: number;
  fade: FadeState | null;
  removeListeners: () => void;
}

const DEFAULT_FADE_MS = 450;
const FADE_TICK_MS = 30;

// ============================================================
// CONTEXTO Y HOOK
// ============================================================

const SoundEffectsContext = createContext<
  SoundEffectsContextType | undefined
>(undefined);

export const useSoundEffects = () => {
  const context = useContext(SoundEffectsContext);

  if (!context) {
    throw new Error(
      "useSoundEffects must be used within a SoundEffectsProvider",
    );
  }

  return context;
};

// ============================================================
// PROVIDER
// ============================================================

export default function SoundEffectsProvider({
  children,
  sounds,
  defaultMuted = false,
  muted: mutedProp,
}: {
  children: ReactNode;
  /** Sonidos a cargar al montar. Idealmente definidos fuera del componente. */
  sounds?: SoundMap;
  defaultMuted?: boolean;
  /** Si se pasa, controla el mute desde fuera (p. ej. useSound().isMuted). */
  muted?: boolean;
}) {
  const [isMuted, setIsMutedState] = useState(mutedProp ?? defaultMuted);
  const [playingIds, setPlayingIds] = useState<string[]>([]);

  const entriesRef = useRef<Map<string, SoundEntry>>(new Map());
  const mutedRef = useRef(isMuted);

  // ----------------------------------------------------------
  // ESTADO "SONANDO"
  // ----------------------------------------------------------

  const syncPlaying = useCallback(() => {
    const ids: string[] = [];

    entriesRef.current.forEach((entry, id) => {
      if (!entry.audio.paused && !entry.audio.ended) {
        ids.push(id);
      }
    });

    setPlayingIds((prev) =>
      prev.length === ids.length && prev.every((id, i) => id === ids[i])
        ? prev
        : ids,
    );
  }, []);

  // ----------------------------------------------------------
  // PRIMITIVAS INTERNAS
  // ----------------------------------------------------------

  /** Cancela un fade en curso y resuelve su promesa. */
  const cancelFade = useCallback((entry: SoundEntry) => {
    if (!entry.fade) return;

    clearInterval(entry.fade.intervalId);
    const { resolve } = entry.fade;
    entry.fade = null;
    resolve();
  }, []);

  /** Pausa, rebobina, restaura volumen e invalida play() pendientes. */
  const halt = useCallback((entry: SoundEntry) => {
    entry.token += 1;
    entry.audio.pause();
    entry.audio.currentTime = 0;
    entry.audio.volume = entry.baseVolume;
  }, []);

  const destroyEntry = useCallback(
    (entry: SoundEntry) => {
      cancelFade(entry);
      entry.removeListeners();
      entry.token += 1;
      entry.audio.pause();
      entry.audio.removeAttribute("src");
      entry.audio.load();
    },
    [cancelFade],
  );

  // ----------------------------------------------------------
  // REGISTRO DE SONIDOS
  // ----------------------------------------------------------

  const registerSound = useCallback(
    (id: string, config: SoundConfig) => {
      const baseVolume = config.volume ?? 1;
      const existing = entriesRef.current.get(id);

      if (existing) {
        existing.audio.loop = config.loop ?? false;
        existing.baseVolume = baseVolume;

        const sameSrc =
          existing.audio.getAttribute("src") === config.src;

        if (!sameSrc) {
          cancelFade(existing);
          halt(existing);
          existing.audio.src = config.src;
        }

        return;
      }

      const audio = new Audio(config.src);
      audio.preload = "auto";
      audio.loop = config.loop ?? false;
      audio.volume = baseVolume;

      const onChange = () => syncPlaying();
      audio.addEventListener("play", onChange);
      audio.addEventListener("pause", onChange);
      audio.addEventListener("ended", onChange);

      entriesRef.current.set(id, {
        audio,
        baseVolume,
        token: 0,
        fade: null,
        removeListeners: () => {
          audio.removeEventListener("play", onChange);
          audio.removeEventListener("pause", onChange);
          audio.removeEventListener("ended", onChange);
        },
      });
    },
    [cancelFade, halt, syncPlaying],
  );

  // Carga inicial y limpieza total al desmontar.
  useEffect(() => {
    const entries = entriesRef.current;

    if (sounds) {
      Object.entries(sounds).forEach(([id, config]) =>
        registerSound(id, config),
      );
    }

    return () => {
      entries.forEach((entry) => destroyEntry(entry));
      entries.clear();
    };
    // `sounds` se vuelve a registrar de forma idempotente si cambia.
  }, [sounds, registerSound, destroyEntry]);

  // ----------------------------------------------------------
  // REPRODUCIR / DETENER
  // ----------------------------------------------------------

  const stop = useCallback(
    (id: string) => {
      const entry = entriesRef.current.get(id);
      if (!entry) return;

      cancelFade(entry);
      halt(entry);
      syncPlaying();
    },
    [cancelFade, halt, syncPlaying],
  );

  const stopAll = useCallback(() => {
    entriesRef.current.forEach((entry) => {
      cancelFade(entry);
      halt(entry);
    });
    syncPlaying();
  }, [cancelFade, halt, syncPlaying]);

  const play = useCallback(
    (id: string, options: PlayOptions = {}) => {
      const entry = entriesRef.current.get(id);

      if (!entry) {
        console.warn(`Sonido no registrado: ${id}`);
        return;
      }

      if (mutedRef.current) return;

      const { restart = true, stopOthers = false, volume } = options;

      if (stopOthers) {
        entriesRef.current.forEach((other, otherId) => {
          if (otherId === id) return;
          cancelFade(other);
          halt(other);
        });
      }

      // Si ya suena y no se pide reinicio, no hacemos nada.
      if (!restart && !entry.audio.paused && !entry.fade) {
        return;
      }

      cancelFade(entry);

      entry.token += 1;
      const token = entry.token;

      entry.audio.volume = volume ?? entry.baseVolume;
      entry.audio.currentTime = 0;

      entry.audio
        .play()
        .then(() => {
          // Si mientras cargaba se llamó a stop/fadeOut, abortamos.
          if (token !== entry.token) {
            entry.audio.pause();
            entry.audio.currentTime = 0;
            entry.audio.volume = entry.baseVolume;
            syncPlaying();
          }
        })
        .catch((error: unknown) => {
          if (
            error instanceof DOMException &&
            error.name === "AbortError"
          ) {
            return; // pause() llegó antes de que arrancara: es normal.
          }

          console.warn(`Error reproduciendo "${id}":`, error);
        });

      syncPlaying();
    },
    [cancelFade, halt, syncPlaying],
  );

  // ----------------------------------------------------------
  // FADE OUT
  // ----------------------------------------------------------

  const fadeOut = useCallback(
    (id: string, durationMs = DEFAULT_FADE_MS): Promise<void> => {
      const entry = entriesRef.current.get(id);

      if (!entry) return Promise.resolve();

      // Ya hay un fade en curso: devolvemos esa misma promesa.
      if (entry.fade) return entry.fade.promise;

      // No está sonando (o aún no arrancó): invalidamos play() pendientes.
      if (entry.audio.paused || durationMs <= 0) {
        halt(entry);
        syncPlaying();
        return Promise.resolve();
      }

      const startVolume = entry.audio.volume;
      const startTime = performance.now();

      let resolveFn: () => void = () => {};
      const promise = new Promise<void>((resolve) => {
        resolveFn = resolve;
      });

      const intervalId = setInterval(() => {
        const progress = Math.min(
          1,
          (performance.now() - startTime) / durationMs,
        );

        entry.audio.volume = Math.max(0, startVolume * (1 - progress));

        if (progress >= 1) {
          clearInterval(intervalId);
          entry.fade = null;
          halt(entry);
          syncPlaying();
          resolveFn();
        }
      }, FADE_TICK_MS);

      entry.fade = { intervalId, promise, resolve: resolveFn };

      return promise;
    },
    [halt, syncPlaying],
  );

  const fadeOutAll = useCallback(
    async (durationMs = DEFAULT_FADE_MS) => {
      const ids = Array.from(entriesRef.current.keys());
      await Promise.all(ids.map((id) => fadeOut(id, durationMs)));
    },
    [fadeOut],
  );

  // ----------------------------------------------------------
  // MUTE
  // ----------------------------------------------------------

  const setMuted = useCallback(
    (muted: boolean) => {
      mutedRef.current = muted;
      setIsMutedState(muted);

      if (muted) {
        stopAll();
      }
    },
    [stopAll],
  );

  const toggleMute = useCallback(() => {
    setMuted(!mutedRef.current);
  }, [setMuted]);

  // Mute controlado desde fuera (opcional).
  useEffect(() => {
    if (mutedProp !== undefined && mutedProp !== mutedRef.current) {
      setMuted(mutedProp);
    }
  }, [mutedProp, setMuted]);

  // ----------------------------------------------------------
  // CONSULTAS Y VALOR DEL CONTEXTO
  // ----------------------------------------------------------

  const isSoundPlaying = useCallback(
    (id: string) => playingIds.includes(id),
    [playingIds],
  );

  const value = useMemo<SoundEffectsContextType>(
    () => ({
      registerSound,
      play,
      stop,
      stopAll,
      fadeOut,
      fadeOutAll,
      isSoundPlaying,
      playingIds,
      isPlaying: playingIds.length > 0,
      isMuted,
      setMuted,
      toggleMute,
    }),
    [
      registerSound,
      play,
      stop,
      stopAll,
      fadeOut,
      fadeOutAll,
      isSoundPlaying,
      playingIds,
      isMuted,
      setMuted,
      toggleMute,
    ],
  );

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
    </SoundEffectsContext.Provider>
  );
}
