"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSound } from "@/app/providers/SoundProvider";
import SoundEffectsProvider, {
    useSoundEffects,
    type SoundMap,
} from "../providers/SoundEffectProvider";

interface FinishedResultsProps {
    stars?: number;
    score: number;
    totalQuestions: number;
    averageTimeMs: number;
    onRetry: () => void;
    onBack: () => void;
}

// Definido fuera del componente para que la referencia sea estable.
const RESULT_SOUNDS: SoundMap = {
    result_1: { src: "/sounds/result_1.mp3", volume: 0.7 },
    result_2: { src: "/sounds/result_2.mp3", volume: 0.7 },
    result_3: { src: "/sounds/result_3.mp3", volume: 0.7 },
};

const EVALUATION_DELAY_MS = 2000;
const LEAVE_FADE_MS = 500;

function formatElapsedTime(timeMs: number) {
    if (timeMs < 1000) {
        return `${Math.round(timeMs)} ms`;
    }
    return `${(timeMs / 1000).toFixed(timeMs >= 10000 ? 1 : 2)} s`;
}

// ============================================================
// CONTENIDO (vive dentro del SoundEffectsProvider)
// ============================================================

const FinishedResultsContent: React.FC<FinishedResultsProps> = ({
    stars,
    score,
    totalQuestions,
    averageTimeMs,
    onRetry,
    onBack,
}) => {
    const { play, fadeOutAll } = useSoundEffects();

    const [isLoading, setIsLoading] = useState(true);
    const [isLeaving, setIsLeaving] = useState(false);
    const isLeavingRef = useRef(false);

    // Fondo y sonido según las estrellas
    let bgImg = "/result_bg-1.png";
    let soundId = "result_1";
    if (stars === 2) {
        bgImg = "/result_bg-2.png";
        soundId = "result_2";
    }
    if (stars === 3) {
        bgImg = "/result_bg-3.png";
        soundId = "result_3";
    }

    // Simula el tiempo de evaluación (2 segundos)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, EVALUATION_DELAY_MS);

        return () => clearTimeout(timer);
    }, []);

    // Reproduce el sonido al terminar la evaluación.
    // Si las estrellas llegan tarde (respuesta del servidor), `soundId`
    // cambia y se reemplaza el sonido anterior (stopOthers).
    useEffect(() => {
        if (isLoading || isLeavingRef.current) return;

        play(soundId, { stopOthers: true });
    }, [isLoading, soundId, play]);

    // Fade out de los sonidos de resultado y luego ejecutar la acción.
    const leaveWith = useCallback(
        async (action: () => void) => {
            if (isLeavingRef.current) return;

            isLeavingRef.current = true;
            setIsLeaving(true);

            try {
                await fadeOutAll(LEAVE_FADE_MS);
            } finally {
                action();
                isLeavingRef.current = false;
                setIsLeaving(false);
            }
        },
        [fadeOutAll],
    );

    const handleRetry = useCallback(() => {
        void leaveWith(onRetry);
    }, [leaveWith, onRetry]);

    const handleBack = useCallback(() => {
        void leaveWith(onBack);
    }, [leaveWith, onBack]);

    // Loading UI
    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gray-900">
                {/* Loading Spinner and Text */}
                <div className="relative z-20 flex flex-col items-center justify-center gap-4 px-2 sm:px-4 py-6 w-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
                    <h2 className="text-xl sm:text-2xl font-bold text-yellow-300 drop-shadow-lg">
                        Evaluando desempeño
                    </h2>
                </div>
            </div>
        );
    }

    // Final Results UI
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Fondo con overlay oscuro */}
            <Image
                src={bgImg}
                alt="Fondo resultado"
                fill
                priority
                className="object-cover z-0"
                style={{ filter: "brightness(0.45)" }}
            />
            {/* Overlay negro semitransparente extra */}
            <div className="absolute inset-0 bg-black/10 z-10" />
            {/* Contenido */}
            <div className="relative z-20 flex flex-col items-center justify-center gap-6 px-2 sm:px-4 py-6 w-full">
                <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 text-center drop-shadow-lg">
                    ¡Intento completado!
                </h2>
                <div className="flex gap-2 justify-center">
                    {[1, 2, 3].map((i) => (
                        <Image
                            key={i}
                            src="/estrella.png"
                            alt="Estrella"
                            width={40}
                            height={40}
                            className={
                                i <= (stars || 0)
                                    ? "drop-shadow-md"
                                    : "opacity-30 grayscale"
                            }
                            style={{ height: "auto" }}
                        />
                    ))}
                </div>
                <p className="text-lg sm:text-xl text-white text-center drop-shadow">
                    {score} / {totalQuestions} respuestas correctas
                </p>
                <p className="text-base sm:text-lg text-slate-100 text-center drop-shadow">
                    Tiempo promedio: {formatElapsedTime(averageTimeMs)}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none justify-center">
                    <button
                        type="button"
                        onClick={handleRetry}
                        disabled={isLeaving}
                        className="rounded-xl bg-yellow-400 px-4 sm:px-6 py-2 sm:py-3 font-bold text-green-900 shadow-md transition-colors hover:bg-yellow-300 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Reintentar
                    </button>
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={isLeaving}
                        className="rounded-xl border-2 border-yellow-400/60 px-4 sm:px-6 py-2 sm:py-3 font-bold text-yellow-300 transition-colors hover:bg-green-700 w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// COMPONENTE EXPORTADO
// El mute se comparte con el SoundProvider global.
// ============================================================

const FinishedResults: React.FC<FinishedResultsProps> = (props) => {
    const { isMuted } = useSound();

    return (
        <SoundEffectsProvider sounds={RESULT_SOUNDS} muted={isMuted}>
            <FinishedResultsContent {...props} />
        </SoundEffectsProvider>
    );
};

export default FinishedResults;
