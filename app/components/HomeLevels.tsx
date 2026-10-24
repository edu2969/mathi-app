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

    const { data: levels = [] } = useQuery<LevelsResponse[]>({
        queryKey: ["user-levels"],
        queryFn: async () => {
            const res = await fetch("/api/levels");

            if (!res.ok) {
                throw new Error("Error fetching levels");
            }

            const data = await res.json();
            return data.levels;
        },
        initialData: [],
    });

    const { data: challenges = [] } = useQuery<ChallengesResponse[]>({
        queryKey: ["user-challenges", levels[selectedLevel]?._id],
        queryFn: async () => {
            const levelId = levels[selectedLevel]?._id;

            if (!levelId) {
                return [];
            }

            const res = await fetch(`/api/challenges/byId/${levelId}`);

            if (!res.ok) {
                throw new Error("Error fetching challenges");
            }

            const data = await res.json();
            console.log("Fetched challenges:", data.challenges);
            return data.challenges;
        },
        initialData: [],
        enabled: levels.length > 0 && !!levels[selectedLevel]?._id,
    });

    // Actualizar música al cambiar de nivel
    useEffect(() => {
        if (!levels.length || !levels[selectedLevel]) {
            return;
        }

        const newLevel = selectedLevel + 1;

        setCurrentLevel(newLevel);
        playLevelSound(newLevel);
    }, [
        levels.length,
        selectedLevel,
        playLevelSound,
        setCurrentLevel,
    ]);

    const navigateToExercise = async (challengeId: string) => {
        const levelId = levels[selectedLevel]?._id;

        if (isNavigating || !levelId) {
            return;
        }

        setIsNavigating(true);

        try {
            await fadeOutLevelSound();
        } finally {
            router.push(`/attempt/${levelId}/${challengeId}`);
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
        const nextIndex = levelId - 1;

        if (nextIndex < 0 || nextIndex >= levels.length) {
            return;
        }

        setSelectedLevel(nextIndex);
    };

    const handleChallengeSelect = (challengeId: string) => {
        const challenge = challenges.find(
            (item) => item._id === challengeId
        );

        if (challenge?.unlocked && !isNavigating) {
            void navigateToExercise(challengeId);
        }
    };

    return (
        <div
            className="
                relative flex h-dvh w-full
                flex-col overflow-hidden
                lg:flex-row
            "
            style={{
                backgroundImage: "url('/bg-vertical.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Control de audio */}
            <button
                type="button"
                onClick={toggleMute}
                className="
                    fixed right-4 top-4 z-40
                    rounded-full bg-black/50 p-3
                    backdrop-blur-sm
                    transition-colors duration-200
                    hover:bg-black/70
                "
                aria-label="Control de audio"
                aria-pressed={isMuted}
            >
                <span className="text-xl text-white">
                    {isMuted ? "🔇" : isPlaying ? "🔊" : "🔉"}
                </span>
            </button>

            {/* Selector de niveles
                Móvil: parte superior.
                Desktop: columna izquierda. */}
            <aside
                className="
                    flex w-full shrink-0
                    h-[44%] min-h-0
                    items-center justify-center
                    px-2 pt-2

                    lg:h-full
                    lg:w-[28%]
                    xl:w-[25%]
                    lg:px-3 lg:py-6
                "
            >
                <div className="flex h-full w-full min-h-0 items-center justify-center">
                    <LevelCarrouselSelector
                        levels={levels}
                        isNavigating={isNavigating}
                        playLevelSound={playLevelSound}
                        setCurrentLevel={setCurrentLevel}
                        onLevelSelect={handleLevelSelect}
                    />
                </div>
            </aside>

            {/* Grilla de desafíos
                Móvil: parte inferior.
                Desktop: ocupa el ancho restante. */}
<main
    className="
        flex min-h-0 min-w-0
        w-full flex-1
        items-center justify-center
        px-2 pb-16 pt-1

        lg:px-4 lg:py-3
    "
>
                <ChallengeGrid
                    challenges={challenges}
                    isNavigating={isNavigating}
                    onChallengeSelect={handleChallengeSelect}
                />
            </main>

            {/* Botón salir */}
            <button
                type="button"
                onClick={() => {
                    void handleSignOut();
                }}
                disabled={isSigningOut || isNavigating}
                className="
                    fixed bottom-4 right-4 z-50
                    flex flex-col items-center
                    rounded-2xl bg-black/45
                    px-3 py-2 text-white
                    shadow-lg backdrop-blur-sm
                    transition-colors duration-200
                    hover:bg-black/65
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                "
                style={{ touchAction: "manipulation" }}
                aria-label="Salir"
            >
                <span className="text-3xl leading-none">⏻</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.2em]">
                    Salir
                </span>
            </button>
        </div>
    );
}

export default function HomeLevels() {
    return (
        <Suspense
            fallback={
                <div
                    className="
                        flex h-dvh items-center justify-center
                        bg-linear-to-b from-green-800 to-green-950
                    "
                >
                    <div
                        className="
                            h-10 w-10 animate-spin rounded-full
                            border-4 border-yellow-400
                            border-t-transparent
                        "
                    />
                </div>
            }
        >
            <NivelesPageContent />
        </Suspense>
    );
}