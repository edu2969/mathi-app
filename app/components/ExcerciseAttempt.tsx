"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import Image from "next/image";
import FinishedResults from "./FinishedResults";
import { useSound } from "@/app/providers/SoundProvider";
import NumericKeypad from "./NumericKeypad";
import CountDown from "./CountDown";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ExcerciseAdditionBasic from "./excercises/level01/ExcerciseAdditionBasic";
// NOTA: asumo que estos tres componentes existen o los vas a crear siguiendo
// el mismo patrón/carpetas que ExcerciseAdditionBasic. Ajusta las rutas/nombres
// si en tu proyecto se llaman distinto.
import ExcerciseSubtractionBasic from "./excercises/level01/ExcerciseSubtractionBasic";
import ExcerciseMultiplicationBasic from "./excercises/level01/ExcerciseMultiplicationBasic";
import ExcerciseDivisionBasic from "./excercises/level01/ExcerciseDivisionBasic";

type AdditionProblem = { sumandos: number[]; correct: number };
type BinaryOpProblem = { numeros: [number, number]; correct: number };
type Problem = AdditionProblem | BinaryOpProblem;

function generateProblem(keyLevel: string): Problem {  
  if (keyLevel == "prob_add_01") {
    // Generar 8 sumandos como en el original (números del 2 al 8)
    const CANTIDAD_DIGITOS = 8;
    const sumandos = Array.from({ length: CANTIDAD_DIGITOS }, () =>
      Math.floor(Math.random() * 7) + 2
    );
    const correct = sumandos.reduce((prev, current) => prev + current, 0);
    return { sumandos, correct };

  } else if (keyLevel === "prob_sub_01" || keyLevel === "prob_sub_02") {
    // Resta: dos números de un dígito (0-9), el primero siempre >= al segundo
    let minuendo = Math.floor(Math.random() * 10);
    let sustraendo = Math.floor(Math.random() * 10);
    if (minuendo < sustraendo) {
      [minuendo, sustraendo] = [sustraendo, minuendo];
    }
    const correct = minuendo - sustraendo;
    return { numeros: [minuendo, sustraendo], correct };

  } else if (keyLevel == "prob_mul_01") {
    // Multiplicación: dos números de un dígito (0-9)
    const factor1 = Math.floor(Math.random() * 10);
    const factor2 = Math.floor(Math.random() * 10);
    const correct = factor1 * factor2;
    return { numeros: [factor1, factor2], correct };

  } else if (keyLevel == "prob_div_01") {
    // División: divisor y cociente de un dígito, dividendo = divisor * cociente
    // (garantiza resultado entero exacto). Se evita divisor = 0.
    const divisor = Math.floor(Math.random() * 9) + 1; // 1-9
    const cociente = Math.floor(Math.random() * 10);   // 0-9
    const dividendo = divisor * cociente;
    return { numeros: [dividendo, divisor], correct: cociente };
  }

  throw new Error(`Nivel de desafío no soportado: ${keyLevel}`);
}

const TOTAL_QUESTIONS = 3;
const COUNTDOWN_STEPS = ["3", "2", "1", "Go!"];

function formatElapsedTime(timeMs: number) {
  if (timeMs < 1000) {
    return `${Math.round(timeMs)} ms`;
  }

  return `${(timeMs / 1000).toFixed(timeMs >= 10000 ? 1 : 2)} s`;
}

function ExerciseAttemptPageContent({
  challengeId,
  levelId
}: {
  challengeId: string;
  levelId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { stopAllSounds, isMuted, toggleMute } = useSound();
  const [questionIndex, setQuestionIndex] = useState(0);
  // Generate a new random problem for each question, but not on every render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const problem = useMemo(() => generateProblem(challengeId), [challengeId, questionIndex]);

  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [averageTimeMs, setAverageTimeMs] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [currentResponseTimeMs, setCurrentResponseTimeMs] = useState<number | null>(null);

  const answerTimesRef = useRef<number[]>([]);
  const questionStartTimeRef = useRef<number | null>(null);

  const attempRegistrationMutation = useMutation({
    mutationFn: async (data: { score: number; averageTimeMs: number; }) => {
      console.log("DATA", challengeId, data);
      const res = await fetch(`/api/attempts/${challengeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          levelId,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to register attempt");
      }
      return res.json();
    },
    onSuccess: (resp) => {
      console.log("Attempt registered successfully", resp);
      if (typeof resp.status?.stars === "number") {
        setStars(Math.max(0, Math.min(3, Math.floor(resp.status.stars))));
      }
      void queryClient.invalidateQueries({ queryKey: ["user-challenges"] });
      void queryClient.invalidateQueries({ queryKey: ["user-levels"] });
    },
    onError: (error) => {
      console.error("Error registering attempt:", error);
    },
  });

  // Start timing when countdown finishes and question is ready
  useEffect(() => {
    if (!isCountdownActive && !finished && !isSubmitted) {
      questionStartTimeRef.current = performance.now();
    }
  }, [finished, isCountdownActive, isSubmitted, questionIndex]);

  const handleDigit = useCallback((digit: string) => {
    if (isCountdownActive || isSubmitted) return;
    if (userAnswer.length < 4) { // Límite de 4 dígitos (cubre el máximo de nivel 0: sumas de 8 números)
      setUserAnswer(prev => prev + digit);
    }
  }, [isCountdownActive, isSubmitted, userAnswer.length]);

  const handleDelete = useCallback(() => {
    if (isCountdownActive || isSubmitted) return;
    setUserAnswer(prev => prev.slice(0, -1));
  }, [isCountdownActive, isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (isCountdownActive || isSubmitted || !userAnswer) return;

    setIsSubmitted(true);
    const responseTimeMs = questionStartTimeRef.current
      ? performance.now() - questionStartTimeRef.current
      : 0;
    const updatedAnswerTimes = [...answerTimesRef.current, responseTimeMs];
    answerTimesRef.current = updatedAnswerTimes;

    const correct = parseInt(userAnswer) === problem.correct;
    setIsCorrect(correct);
    setCurrentResponseTimeMs(responseTimeMs);

    if (correct) {
      setScore((s) => s + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        const finalScore = correct ? score + 1 : score;
        const avgTimeMs = updatedAnswerTimes.reduce((total, time) => total + time, 0) / updatedAnswerTimes.length;

        setAverageTimeMs(avgTimeMs);
        setFinished(true);

        attempRegistrationMutation.mutate({
          score: finalScore,
          averageTimeMs: avgTimeMs
        });
      } else {
        setQuestionIndex((i) => i + 1);
        setUserAnswer('');
        setIsSubmitted(false);
        setIsCorrect(null);
        setCurrentResponseTimeMs(null);        
      }
    }, 1500);
  }, [
    attempRegistrationMutation,
    isCountdownActive,
    isSubmitted,
    userAnswer,
    questionIndex,
    problem,
    score,
  ]);

  function restart() {
    setQuestionIndex(0);
    setScore(0);
    setStars(0);
    setAverageTimeMs(0);
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setFinished(false);
    setIsCountdownActive(true);
    setCurrentResponseTimeMs(null);
    answerTimesRef.current = [];
    questionStartTimeRef.current = null;
  }

  const handleRetry = useCallback(() => {
    stopAllSounds();
    restart();
  }, [stopAllSounds]);

  const handleBackToLevels = useCallback(() => {
    stopAllSounds();
    router.push("/levels");
  }, [router, stopAllSounds]);

  // Finished screen
  if (finished) {
    return (
      <FinishedResults
        stars={stars}
        score={score}
        totalQuestions={TOTAL_QUESTIONS}
        averageTimeMs={averageTimeMs}
        onRetry={handleRetry}
        onBack={handleBackToLevels}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#b6d7a8] relative">
      {/* Top bar - header transparente */}
      <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-2 sm:px-6 py-3 sm:py-4 bg-transparent">
        <button
          onClick={() => router.push('/levels')}
          className="flex items-center gap-2 text-xs sm:text-sm font-medium text-black hover:text-white transition-colors"
        >
          <Image
            src="/flecha_izquierda.png"
            alt="Volver"
            width={42}
            height={42}
            className="drop-shadow-lg w-12 h-12"
            style={{ height: 'auto' }}
          />
          <span className="text-lg sm:text-2xl">Salir</span>
        </button>
        {/* Botón de control de audio */}
        <button
          onClick={toggleMute}
          className="bg-black/50 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-200 hover:bg-black/70"
        >
          <span className="text-white text-xl">
            {isMuted ? '🔇' : '🔉'}
          </span>
        </button>
      </header>

      {/* Ejercicio y teclado */}
      <main className="flex flex-col md:flex-row w-full pt-18 pb-0 md:pt-8 md:pb-0 gap-2 md:gap-0">

        {challengeId === "prob_add_01" && (
          <ExcerciseAdditionBasic
            index={questionIndex}
            problem={problem as AdditionProblem}
            isCountdownActive={isCountdownActive}
            totalQuestions={TOTAL_QUESTIONS}
            userAnswer={userAnswer}
          />
        )}
        {(challengeId === "prob_sub_01" || challengeId === "prob_sub_02") && (
          <ExcerciseSubtractionBasic
            index={questionIndex}
            problem={problem as BinaryOpProblem}
            isCountdownActive={isCountdownActive}
            totalQuestions={TOTAL_QUESTIONS}
            userAnswer={userAnswer}
          />
        )}
        {challengeId === "prob_mul_01" && (
          <ExcerciseMultiplicationBasic
            index={questionIndex}
            problem={problem as BinaryOpProblem}
            isCountdownActive={isCountdownActive}
            totalQuestions={TOTAL_QUESTIONS}
            userAnswer={userAnswer}
          />
        )}
        {challengeId === "prob_div_01" && (
          <ExcerciseDivisionBasic
            index={questionIndex}
            problem={problem as BinaryOpProblem}
            isCountdownActive={isCountdownActive}
            totalQuestions={TOTAL_QUESTIONS}
            userAnswer={userAnswer}
          />
        )}

        <NumericKeypad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          disabled={isCountdownActive || isSubmitted}
        />
      </main>

      {isCountdownActive && (
        <CountDown steps={COUNTDOWN_STEPS} onFinish={() => setIsCountdownActive(false)} />
      )}

      {/* Feedback */}
      {isCorrect !== null && (
        <AnimatePresence>
          {isCorrect !== null && (
           <motion.div
      key="feedback-modal"
      initial={{ opacity: 0, scale: 0.3 }}
      animate={isCorrect ? 
        { 
          opacity: 1, 
          scale: [0.3, 1.2, 1],  // Solo dos keyframes para bounce
          rotate: [0, -5, 5, -3, 3, 0],
          transition: { 
            type: "tween" as const,  // ← Cambiar a tween
            duration: 0.5,
            ease: "easeOut"
          }
        } : 
        { 
          opacity: 1, 
          scale: 1,
          x: [0, -10, 10, -8, 8, -4, 4, 0],
          transition: { 
            type: "tween" as const,  // ← Cambiar a tween
            duration: 0.4,
            ease: "easeInOut"
          }
        }
      }
      exit={{ opacity: 0, scale: 0.3 }}
      className={`absolute top-1/2 left-1/2 z-40 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-xl ${
        isCorrect ? 'bg-emerald-500/90 border-emerald-400' : 'bg-red-500/80 border-red-400'
      } border-2 w-11/12 max-w-xs sm:max-w-md`}
    >
              
                <p className={`text-3xl sm:text-4xl font-bold text-center ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                  {isCorrect ? '¡Correcto! 🎉' : `Incorrecto: es`}
                </p>
                <p className={`text-5xl sm:text-4xl font-bold text-center ${isCorrect ? 'text-emerald-100' : 'text-red-100'}`}>
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


      )}
    </div>
  );
}

export default function ExcerciseAttemp({
  challengeId,
  levelId
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
        levelId={levelId} />

    </Suspense>
  );
}