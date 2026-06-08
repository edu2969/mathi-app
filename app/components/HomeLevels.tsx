"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ChallengeGrid from "./ChallengeGrid";
import LevelCarrouselSelector from "./LevelCarrouselSelector";
import { useSound } from "@/app/providers/SoundProvider";
import { useQuery } from "@tanstack/react-query";
import { ChallengesResponse, LevelsResponse } from "../types/types";

function NivelesPageContent() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(0); 
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const {
    fadeOutLevelSound,
    isMuted,
    isPlaying,
    playLevelSound,
    setCurrentLevel,
    toggleMute,
  } = useSound();  

  const { data: levels, isLoading: isLoadingLevels } = useQuery<LevelsResponse[]>({
    queryKey: ["user-levels"],
    queryFn: async () => {
      const res = await fetch("/api/levels");
        if (!res.ok) {
            throw new Error("Error fetching levels");
        }
        const data = await res.json();
        console.log("Fetched levels:", data);
        return data.levels;
    },
    initialData: [],
  });

  const { data: challenges, isLoading: isLoadingChallenges } = useQuery<ChallengesResponse[]>({
    queryKey: ["user-challenges", selectedLevel],
    queryFn: async () => {
      if(levels.length === 0) {
        return [];
      }
      const res = await fetch(`/api/challenges/byId/${levels[selectedLevel]?._id}`);
        if (!res.ok) {
            throw new Error("Error fetching challenges");
        }
        const data = await res.json();
        console.log("Fetched challenges:", data);
        return data.challenges;
    },
    initialData: [],
    enabled: levels.length > 0,
  });

  // Efecto para cambiar la música cuando cambia el nivel seleccionado
  useEffect(() => {
    const newLevel = (selectedLevel ?? 0) + 1; // Convertir índice a número de nivel
    setCurrentLevel(newLevel);
    playLevelSound(newLevel);
  }, [playLevelSound, selectedLevel, setCurrentLevel]);

  const navigateToExercise = async (challengeId: string) => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      await fadeOutLevelSound();
    } finally {
      router.push(`/attemp/${challengeId}`);
    }
  };

  const handleSignOut = async () => {
    if (isNavigating || isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await fadeOutLevelSound();
      await signOut({ callbackUrl: "/" });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleLevelSelect = (levelId: number) => {
    setSelectedLevel(levelId - 1); // Convertir número de nivel a índice
    const level = levels.find(l => l.order === levelId);
    if (level?.unlocked) {
      void navigateToExercise(level._id);
    }
  };

  const handleChallengeSelect = (challengeId: string) => {
    const challenge = challenges.find(c => c._id === challengeId);
    if (challenge?.unlocked) {
      void navigateToExercise(challengeId);
    }
  };

  return (
    <div
      className="h-dvh md:h-screen flex flex-col relative overflow-hidden"
      style={{
        backgroundImage: "url('/bg-vertical.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Botón de control de audio */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-40 bg-black/50 backdrop-blur-sm p-3 rounded-full transition-all duration-200 hover:bg-black/70"
        aria-label="Control de audio"
      >
        <span className="text-white text-xl">
          {isMuted ? "🔇" : isPlaying ? "🔊" : "🔉"}
        </span>
      </button>

      {/* Carrusel de nivel seleccionado, ocupa 50vh */}
      <LevelCarrouselSelector
        levels={levels}
        isNavigating={isNavigating}
        playLevelSound={playLevelSound}
        setCurrentLevel={setCurrentLevel}
        onLevelSelect={handleLevelSelect}
      />

      {/* Grilla de desafíos, ocupa el resto */}
      <ChallengeGrid
        challenges={challenges}
        isNavigating={isNavigating}
        onChallengeSelect={handleChallengeSelect}
      />

      {/* Botón salir siempre visible y sobre todo */}
      <button
        type="button"
        onClick={() => {
          void handleSignOut();
        }}
        disabled={isSigningOut}
        className="fixed right-4 bottom-4 z-50 flex flex-col items-center rounded-2xl bg-black/45 px-3 py-2 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg"
        style={{ touchAction: 'manipulation' }}
        aria-label="Salir"
      >
        <span className="text-3xl leading-none">⏻</span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Salir</span>
      </button>
    </div>
  );
}

export default function HomeLevels() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-linear-to-b from-green-800 to-green-950">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
        </div>
      }
    >
      <NivelesPageContent />
    </Suspense>
  );
}