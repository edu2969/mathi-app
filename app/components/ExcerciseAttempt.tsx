"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import Image from "next/image";
import FinishedResults from "./FinishedResults";
import { useSound } from "@/app/providers/SoundProvider";
import NumericKeypad from "./NumericKeypad";
import CountDown from "./CountDown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

import ExcerciseAdditionBasic from "./excercises/level01/ExcerciseAdditionBasic";
import ExcerciseSubtractionBasic from "./excercises/level01/ExcerciseSubtractionBasic";
import ExcerciseMultiplicationBasic from "./excercises/level01/ExcerciseMultiplicationBasic";
import ExcerciseDivisionBasic from "./excercises/level01/ExcerciseDivisionBasic";
import ExcerciseDoubles from "./excercises/level01/ExcerciseDoubles";
import ExcerciseHalf from "./excercises/level01/ExcerciseHalf";

// ============================================================
// TIPOS
// ============================================================

type AdditionProblem = {
  sumandos: number[];
  correct: number;
};

type BinaryOpProblem = {
  numeros: [number, number];
  correct: number;
};

type Problem = AdditionProblem | BinaryOpProblem;

// ============================================================
// FUNCIONES AUXILIARES PARA GENERAR PROBLEMAS
// ============================================================

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(values: T[]): T =>
  values[randomInt(0, values.length - 1)];

function createAddition(sumandos: number[]): AdditionProblem {
  return {
    sumandos,
    correct: sumandos.reduce((total, value) => total + value, 0),
  };
}

function createBinary(
  a: number,
  b: number,
  correct: number,
): BinaryOpProblem {
  return {
    numeros: [a, b],
    correct,
  };
}

// ============================================================
// GENERADOR DE PROBLEMAS
// Identificadores basados en el JSON de desafíos
// ============================================================

function generateProblem(keyLevel: string): Problem {
  switch (keyLevel) {
    // --------------------------------------------------------
    // SUMAS
    // --------------------------------------------------------

    case "prob_add_1": {
      // Sumatoria de dos dígitos.
      const a = randomInt(2, 9);
      const b = randomInt(2, 9);

      return createAddition([a, b]);
    }

    case "prob_add_2": {
      // Suma de ocho dígitos.
      const sumandos = Array.from(
        { length: 8 },
        () => randomInt(2, 8),
      );

      return createAddition(sumandos);
    }

    case "prob_add_3": {
      // Sumatoria entre centenas.
      const a = randomInt(100, 999);
      const b = randomInt(100, 999);

      return createAddition([a, b]);
    }

    case "prob_add_4": {
      // Sumar decenas, centenas o millares exactos.
      const a = randomInt(2, 999);
      const b = pick([10, 100, 1000]);

      return createAddition([a, b]);
    }

    case "prob_add_5": {
      // Sumar 99 o 999 mediante compensación.
      const a = randomInt(10, 999);
      const b = pick([99, 999]);

      return createAddition([a, b]);
    }

    // --------------------------------------------------------
    // RESTAS
    // --------------------------------------------------------

    case "prob_sub_1": {
      // Resta de dos dígitos sin resultado negativo.
      const minuendo = randomInt(0, 9);
      const sustraendo = randomInt(0, minuendo);

      return createBinary(
        minuendo,
        sustraendo,
        minuendo - sustraendo,
      );
    }

    case "prob_sub_2": {
      // Resta entre números de dos o tres cifras.
      const minuendo = randomInt(10, 999);
      const sustraendo = randomInt(0, minuendo);

      return createBinary(
        minuendo,
        sustraendo,
        minuendo - sustraendo,
      );
    }

    case "prob_sub_3": {
      // Restar 999 equivale a restar 1000 y sumar 1.
      const minuendo = randomInt(1000, 9999);

      return createBinary(
        minuendo,
        999,
        minuendo - 999,
      );
    }

    // --------------------------------------------------------
    // MULTIPLICACIONES
    // --------------------------------------------------------

    case "prob_mul_1": {
      // Dobles de un dígito.
      const n = randomInt(0, 9);

      return createBinary(n, 2, n * 2);
    }

    case "prob_mul_2": {
      // Dobles de números hasta cinco.
      const n = randomInt(0, 5);

      return createBinary(n, 2, n * 2);
    }

    case "prob_mul_3": {
      // Dobles de números de dos cifras.
      const n = randomInt(10, 49);

      return createBinary(n, 2, n * 2);
    }

    case "prob_mul_4": {
      // Dobles de números de dos cifras terminados en 6-9.
      const decenas = randomInt(1, 9);
      const unidades = randomInt(6, 9);
      const n = decenas * 10 + unidades;

      return createBinary(n, 2, n * 2);
    }

    case "prob_mul_5": {
      // Tablas de multiplicar del 1 al 10.
      const a = randomInt(1, 10);
      const b = randomInt(1, 10);

      return createBinary(a, b, a * b);
    }

    case "prob_mul_6": {
      // Número de dos cifras por un dígito.
      const a = randomInt(10, 99);
      const b = randomInt(2, 9);

      return createBinary(a, b, a * b);
    }

    case "prob_mul_7": {
      // Multiplicar por 10 o 100.
      const a = randomInt(1, 999);
      const b = pick([10, 100]);

      return createBinary(a, b, a * b);
    }

    case "prob_mul_8": {
      // Multiplicar por 25.
      const a = randomInt(1, 40);

      return createBinary(a, 25, a * 25);
    }

    // --------------------------------------------------------
    // DIVISIONES
    // --------------------------------------------------------

    case "prob_div_1": {
      // División exacta con números pequeños.
      const divisor = randomInt(1, 9);
      const cociente = randomInt(1, 9);
      const dividendo = divisor * cociente;

      return createBinary(dividendo, divisor, cociente);
    }

    case "prob_div_2": {
      // Divisiones exactas basadas en las tablas.
      const divisor = randomInt(2, 10);
      const cociente = randomInt(1, 10);
      const dividendo = divisor * cociente;

      return createBinary(dividendo, divisor, cociente);
    }

    case "prob_div_3": {
      // Mitades de números pares.
      const dividendo = randomInt(1, 500) * 2;

      return createBinary(
        dividendo,
        2,
        dividendo / 2,
      );
    }

    case "prob_div_4": {
      // División exacta por tres.
      const cociente = randomInt(1, 99);
      const dividendo = cociente * 3;

      return createBinary(dividendo, 3, cociente);
    }

    case "prob_div_5": {
      // División por potencias de diez.
      const divisor = pick([10, 100]);
      const cociente = randomInt(1, 999);
      const dividendo = cociente * divisor;

      return createBinary(dividendo, divisor, cociente);
    }

    case "prob_div_6": {
      // División exacta por cinco.
      const cociente = randomInt(1, 199);
      const dividendo = cociente * 5;

      return createBinary(dividendo, 5, cociente);
    }

    case "prob_div_7": {
      // División exacta por 25.
      const cociente = randomInt(1, 40);
      const dividendo = cociente * 25;

      return createBinary(dividendo, 25, cociente);
    }

    case "prob_div_8": {
      // División exacta por 90.
      const cociente = randomInt(1, 99);
      const dividendo = cociente * 90;

      return createBinary(dividendo, 90, cociente);
    }

    case "prob_div_9": {
      // División exacta por 9, 99 o 999.
      const divisor = pick([9, 99, 999]);
      const cociente = randomInt(1, 9);
      const dividendo = divisor * cociente;

      return createBinary(dividendo, divisor, cociente);
    }

    case "prob_div_10": {
      // División exacta por centenas o millares.
      const divisor = pick([100, 200, 300, 400, 500, 1000]);
      const cociente = randomInt(1, 99);
      const dividendo = divisor * cociente;

      return createBinary(dividendo, divisor, cociente);
    }

    default:
      throw new Error(
        `Nivel de desafío no soportado: ${keyLevel}`,
      );
  }
}

// ============================================================
// CONSTANTES Y FORMATO
// ============================================================

const TOTAL_QUESTIONS = 3;
const COUNTDOWN_STEPS = ["3", "2", "1", "Go!"];
const FEEDBACK_DELAY_MS = 1500;

function formatElapsedTime(timeMs: number): string {
  if (timeMs < 1000) {
    return `${Math.round(timeMs)} ms`;
  }

  return `${(timeMs / 1000).toFixed(timeMs >= 10000 ? 1 : 2)} s`;
}

// ============================================================
// PÁGINA DEL INTENTO
// ============================================================

function ExerciseAttemptPageContent({
  challengeId,
  levelId,
}: {
  challengeId: string;
  levelId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // fadeOutLevelSound es el mismo mecanismo que ya funciona
  // en la página de niveles (navigateToExercise / handleSignOut).
  const { playLevelSound, fadeOutLevelSound, isMuted, toggleMute } =
    useSound();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [averageTimeMs, setAverageTimeMs] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentResponseTimeMs, setCurrentResponseTimeMs] =
    useState<number | null>(null);

  const answerTimesRef = useRef<number[]>([]);
  const questionStartTimeRef = useRef<number | null>(null);

  // --- Control de trabajo pendiente ---
  const timeoutRef = useRef<number | null>(null);
  // Intento vigente: se incrementa al reintentar o salir.
  const attemptIdRef = useRef(0);
  // El componente se está yendo o ya se desmontó.
  const isLeavingRef = useRef(false);
  // Evita dobles clics mientras corre el fade out (sin esperar re-render).
  const isBusyRef = useRef(false);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Genera un problema nuevo al cambiar de pregunta o desafío.
  const problem = useMemo(
    () => generateProblem(challengeId),
    [challengeId, questionIndex],
  );

  // ----------------------------------------------------------
  // REGISTRO DEL INTENTO
  // ----------------------------------------------------------

  const attemptRegistrationMutation = useMutation({
    mutationFn: async (data: {
      score: number;
      averageTimeMs: number;
      attemptId: number;
    }) => {
      const { attemptId: _attemptId, ...body } = data;

      const res = await fetch(`/api/attempts/${challengeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          levelId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to register attempt");
      }

      return res.json();
    },

    onSuccess: (resp, variables) => {
      // Siempre refrescamos los datos del servidor...
      void queryClient.invalidateQueries({
        queryKey: ["user-challenges"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["user-levels"],
      });

      // ...pero solo tocamos la UI si el intento sigue vigente.
      if (
        isLeavingRef.current ||
        variables.attemptId !== attemptIdRef.current
      ) {
        return;
      }

      if (typeof resp.status?.stars === "number") {
        setStars(
          Math.max(0, Math.min(3, Math.floor(resp.status.stars))),
        );
      }

      playLevelSound(0); // Sonido de finalización del intento.
    },

    onError: (error) => {
      console.error("Error registering attempt:", error);
    },
  });

  // ----------------------------------------------------------
  // CRONÓMETRO DE RESPUESTA
  // ----------------------------------------------------------

  useEffect(() => {
    if (!isCountdownActive && !finished && !isSubmitted) {
      questionStartTimeRef.current = performance.now();
    }
  }, [
    finished,
    isCountdownActive,
    isSubmitted,
    questionIndex,
  ]);

  // ----------------------------------------------------------
  // TECLADO NUMÉRICO
  // ----------------------------------------------------------

  const handleDigit = useCallback(
    (digit: string) => {
      if (isCountdownActive || isSubmitted) return;

      // Hasta cuatro dígitos de respuesta.
      if (userAnswer.length < 4) {
        setUserAnswer((prev) => prev + digit);
      }
    },
    [isCountdownActive, isSubmitted, userAnswer.length],
  );

  const handleDelete = useCallback(() => {
    if (isCountdownActive || isSubmitted) return;

    setUserAnswer((prev) => prev.slice(0, -1));
  }, [isCountdownActive, isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (isCountdownActive || isSubmitted || !userAnswer) {
      return;
    }

    setIsSubmitted(true);

    const responseTimeMs = questionStartTimeRef.current
      ? performance.now() - questionStartTimeRef.current
      : 0;

    const updatedAnswerTimes = [
      ...answerTimesRef.current,
      responseTimeMs,
    ];

    answerTimesRef.current = updatedAnswerTimes;

    const correct = Number(userAnswer) === problem.correct;

    setIsCorrect(correct);
    setCurrentResponseTimeMs(responseTimeMs);

    const nextScore = correct ? score + 1 : score;

    if (correct) {
      setScore(nextScore);
    }

    // Mostrar feedback antes de avanzar (cancelable).
    clearPendingTimeout();

    timeoutRef.current = window.setTimeout(() => {
      timeoutRef.current = null;

      // Si el usuario ya salió, no hacemos nada.
      if (isLeavingRef.current) return;

      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        const avgTimeMs =
          updatedAnswerTimes.reduce(
            (total, time) => total + time,
            0,
          ) / updatedAnswerTimes.length;

        setScore(nextScore);
        setAverageTimeMs(avgTimeMs);
        setFinished(true);

        attemptRegistrationMutation.mutate({
          score: nextScore,
          averageTimeMs: avgTimeMs,
          attemptId: attemptIdRef.current,
        });
      } else {
        setQuestionIndex((index) => index + 1);
        setUserAnswer("");
        setIsSubmitted(false);
        setIsCorrect(null);
        setCurrentResponseTimeMs(null);
      }
    }, FEEDBACK_DELAY_MS);
  }, [
    attemptRegistrationMutation,
    clearPendingTimeout,
    isCountdownActive,
    isSubmitted,
    userAnswer,
    questionIndex,
    problem,
    score,
  ]);

  // ----------------------------------------------------------
  // REINICIAR Y SALIR
  // ----------------------------------------------------------

  const restart = useCallback(() => {
    setQuestionIndex(0);
    setScore(0);
    setStars(0);
    setAverageTimeMs(0);
    setUserAnswer("");
    setIsSubmitted(false);
    setIsCorrect(null);
    setFinished(false);
    setIsCountdownActive(true);
    setCurrentResponseTimeMs(null);

    answerTimesRef.current = [];
    questionStartTimeRef.current = null;
  }, []);

  const handleRetry = useCallback(async () => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setIsNavigating(true);

    clearPendingTimeout();
    // Invalida cualquier respuesta de mutación pendiente del intento anterior.
    attemptIdRef.current += 1;

    try {
      await fadeOutLevelSound();
    } finally {
      // Si mientras tanto el usuario salió, no reiniciamos nada.
      if (!isLeavingRef.current) {
        restart();
      }

      isBusyRef.current = false;
      setIsNavigating(false);
    }
  }, [clearPendingTimeout, fadeOutLevelSound, restart]);

  const handleBackToLevels = useCallback(async () => {
    if (isBusyRef.current) return;
    isBusyRef.current = true;
    setIsNavigating(true);

    // Igual que en la página de niveles: fade out y luego navegar.
    isLeavingRef.current = true;
    attemptIdRef.current += 1;
    clearPendingTimeout();

    try {
      await fadeOutLevelSound();
    } finally {
      router.push("/levels");
    }
  }, [clearPendingTimeout, fadeOutLevelSound, router]);

  // ----------------------------------------------------------
  // RESULTADOS FINALES
  // ----------------------------------------------------------

  if (finished) {
    return (
      <FinishedResults
        stars={stars}
        score={score}
        totalQuestions={TOTAL_QUESTIONS}
        averageTimeMs={averageTimeMs}
        onRetry={() => {
          void handleRetry();
        }}
        onBack={() => {
          void handleBackToLevels();
        }}
      />
    );
  }

  // ----------------------------------------------------------
  // RENDERIZADO DEL EJERCICIO
  // ----------------------------------------------------------

  const exerciseProps = {
    index: questionIndex,
    isCountdownActive,
    totalQuestions: TOTAL_QUESTIONS,
    userAnswer,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#b6d7a8] relative">
      {/* Barra superior */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-2 sm:px-6 py-3 sm:py-4 bg-transparent">
        <button
          type="button"
          onClick={() => {
            void handleBackToLevels();
          }}
          disabled={isNavigating}
          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-black hover:text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Image
            src="/flecha_izquierda.png"
            alt="Volver"
            width={42}
            height={42}
            className="drop-shadow-lg w-12 h-12"
            style={{ height: "auto" }}
          />

          <span className="text-lg sm:text-2xl">Salir</span>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          className="bg-black/50 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-200 hover:bg-black/70"
        >
          <span className="text-white text-xl">
            {isMuted ? "🔇" : "🔉"}
          </span>
        </button>
      </header>

      {/* Ejercicio y teclado */}
      <main className="flex flex-col md:flex-row w-full pt-18 pb-0 md:pt-8 md:pb-0 gap-2 md:gap-0">
        {/* SUMAS: prob_add_1 a prob_add_5 */}
        {challengeId.startsWith("prob_add_") && (
          <ExcerciseAdditionBasic
            {...exerciseProps}
            problem={problem as AdditionProblem}
          />
        )}

        {/* RESTAS: prob_sub_1 a prob_sub_3 */}
        {challengeId.startsWith("prob_sub_") && (
          <ExcerciseSubtractionBasic
            {...exerciseProps}
            problem={problem as BinaryOpProblem}
          />
        )}

        {/* DOBLES: prob_mul_1 */}
        {challengeId === "prob_mul_1" && (
          <ExcerciseDoubles
            {...exerciseProps}
            digits={1}
            problem={problem as BinaryOpProblem}
          />
        )}

        {/* RESTO DE MULTIPLICACIONES: prob_mul_2 a prob_mul_8 */}
        {challengeId.startsWith("prob_mul_") &&
          challengeId !== "prob_mul_1" && (
            <ExcerciseMultiplicationBasic
              {...exerciseProps}
              problem={problem as BinaryOpProblem}
            />
          )}

        {/* MITADES: prob_div_3 */}
        {challengeId === "prob_div_3" && (
          <ExcerciseHalf
            {...exerciseProps}
            problem={problem as BinaryOpProblem}
          />
        )}

        {/* RESTO DE DIVISIONES */}
        {challengeId.startsWith("prob_div_") &&
          challengeId !== "prob_div_3" && (
            <ExcerciseDivisionBasic
              {...exerciseProps}
              problem={problem as BinaryOpProblem}
            />
          )}

        <NumericKeypad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          disabled={isCountdownActive || isSubmitted || isNavigating}
        />
      </main>

      {/* Cuenta regresiva */}
      {isCountdownActive && (
        <CountDown
          steps={COUNTDOWN_STEPS}
          onFinish={() => setIsCountdownActive(false)}
        />
      )}

      {/* Feedback de respuesta */}
      <AnimatePresence>
        {isCorrect !== null && (
          <motion.div
            key="feedback-modal"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={
              isCorrect
                ? {
                    opacity: 1,
                    scale: [0.3, 1.2, 1],
                    rotate: [0, -5, 5, -3, 3, 0],
                    transition: {
                      type: "tween",
                      duration: 0.5,
                      ease: "easeOut",
                    },
                  }
                : {
                    opacity: 1,
                    scale: 1,
                    x: [0, -10, 10, -8, 8, -4, 4, 0],
                    transition: {
                      type: "tween",
                      duration: 0.4,
                      ease: "easeInOut",
                    },
                  }
            }
            exit={{ opacity: 0, scale: 0.3 }}
            className={`absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 p-4 rounded-xl ${
              isCorrect
                ? "bg-emerald-500/90 border-emerald-400"
                : "bg-red-500/80 border-red-400"
            } border-2 w-11/12 max-w-xs sm:max-w-md`}
          >
            <p
              className={`text-3xl sm:text-4xl font-bold text-center ${
                isCorrect ? "text-emerald-100" : "text-red-100"
              }`}
            >
              {isCorrect ? "¡Correcto! 🎉" : "Incorrecto: es"}
            </p>

            <p
              className={`text-5xl sm:text-4xl font-bold text-center ${
                isCorrect ? "text-emerald-100" : "text-red-100"
              }`}
            >
              {problem.correct}
            </p>

            {currentResponseTimeMs !== null && (
              <p className="mt-2 text-center text-md sm:text-sm font-semibold text-white/70">
                Tiempo: {formatElapsedTime(currentResponseTimeMs)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// COMPONENTE EXPORTADO
// Se conserva el nombre ExcerciseAttemp para compatibilidad
// ============================================================

export default function ExcerciseAttemp({
  challengeId,
  levelId,
}: {
  challengeId: string;
  levelId: string;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-[#b6d7a8]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
        </div>
      }
    >
      <ExerciseAttemptPageContent
        challengeId={challengeId}
        levelId={levelId}
      />
    </Suspense>
  );
}
