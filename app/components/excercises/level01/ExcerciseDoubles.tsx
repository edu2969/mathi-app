"use client";

import { useMemo } from "react";

export default function ExcerciseDoubles({
    index,
    problem,
    isCountdownActive,
    userAnswer,
    totalQuestions,
    digits = 1
}: {
    index: number;
    problem: {
        numeros: [number, number];
    };
    isCountdownActive: boolean;
    userAnswer: string;
    totalQuestions: number;
    digits?: number;
}) {
    const numero = problem.numeros[0];

    const expresionIndex = useMemo(
        () => Math.floor(Math.random() * 4),
        [index, numero]
    );

    const numeroVisible = isCountdownActive ? '?' : numero;

    const expresion = [
        <>2 × {numeroVisible} =</>,
        <>{numeroVisible} × 2 =</>,
        <>El doble de {numeroVisible} =</>,
        <>Dos veces {numeroVisible} =</>
    ][expresionIndex];

    return (
        <section className="w-full h-[75vh] md:w-3/5 flex flex-col px-4 md:px-0">
            <div className="flex flex-row items-start w-full max-w-lg mx-auto mb-2">
                {/* Número de ejercicio */}
                <div className="flex flex-col items-start justify-start mr-4 min-w-17.5">
                    <span className="text-md sm:text-lg text-slate-700 mb-1">
                        <b>Ejercicio</b>
                    </span>

                    <span
                        className="text-6xl sm:text-6xl text-black font-bold leading-none"
                        style={{ fontFamily: 'var(--font-dotgothic)' }}
                    >
                        {index + 1}
                        <small className="text-xl px-2">/</small>
                        {totalQuestions}
                    </span>
                </div>

                {/* Área del ejercicio */}
                <div className="flex flex-col items-center flex-1">
                    <div className="flex items-center justify-center min-h-28 mb-2 sm:mb-4">
                        <span
                            className="text-3xl sm:text-5xl text-black font-bold text-center"
                            style={{ fontFamily: 'var(--font-dotgothic)' }}
                        >
                            {expresion}
                        </span>
                    </div>

                    {/* Display de respuesta */}
                    <div className="flex items-center space-x-2 sm:space-x-4 bg-linear-to-b from-[#e0e0e0] to-[#b6b6b6] px-4 py-3 rounded-lg border-2 border-black shadow-inner min-w-30">
                        <span className="text-2xl sm:text-4xl font-bold text-black font-mono">
                            =
                        </span>

                        <div className="min-w-12 sm:min-w-24 text-right">
                            <span className="text-2xl sm:text-4xl font-bold text-black font-mono">
                                {isCountdownActive ? '?' : userAnswer || ' '}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}