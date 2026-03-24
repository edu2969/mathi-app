"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
import Image from "next/image";
import FinishedResults from "../../components/FinishedResults";
import { useSound } from "../../providers";
import NumericKeypad from "../../components/NumericKeypad";
import CountDown from "../../components/CountDown";

function generateProblem() {
  // Generar 8 sumandos como en el original (números del 2 al 8)
  const CANTIDAD_DIGITOS = 8;
  const sumandos = Array.from({ length: CANTIDAD_DIGITOS }, () =>
    Math.floor(Math.random() * 7) + 2
  );
  const correct = sumandos.reduce((prev, current) => prev + current, 0);
  return { sumandos, correct };
}

const TOTAL_QUESTIONS = 3;
const COUNTDOWN_STEPS = ["3", "2", "1", "Go!"];

function formatElapsedTime(timeMs: number) {
  if (timeMs < 1000) {
    return `${Math.round(timeMs)} ms`;
  }

  return `${(timeMs / 1000).toFixed(timeMs >= 10000 ? 1 : 2)} s`;
}



function SumasPageContent() {
  const router = useRouter();
  const { playResultSound, stopAllSounds, isMuted, toggleMute } = useSound();

  const [questionIndex, setQuestionIndex] = useState(0);
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

  const problem = useMemo(() => generateProblem(), [questionIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start timing when countdown finishes and question is ready
  useEffect(() => {
    if (!isCountdownActive && !finished && !isSubmitted) {
      questionStartTimeRef.current = performance.now();
    }
  }, [finished, isCountdownActive, isSubmitted, questionIndex]);

  const handleDigit = useCallback((digit: string) => {
    if (isCountdownActive || isSubmitted) return;
    if (userAnswer.length < 4) { // Límite de 4 dígitos para sumas de 8 números
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
        const newStars = finalScore < TOTAL_QUESTIONS ? 1 : avgTimeMs > 20000 ? 2 : 3;

        setAverageTimeMs(avgTimeMs);
        setStars(newStars);
        setFinished(true);

        // Reproducir sonido según las estrellas obtenidas
        playResultSound(newStars);
      } else {
        setQuestionIndex((i) => i + 1);
        setUserAnswer('');
        setIsSubmitted(false);
        setIsCorrect(null);
        setCurrentResponseTimeMs(null);
      }
    }, 1500);
  }, [isCountdownActive, isSubmitted, userAnswer, problem.correct, questionIndex, score, playResultSound]);

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
    router.push("/niveles");
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
          onClick={() => router.push('/niveles')}
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
      <main className="flex-1 flex flex-col md:flex-row w-full pt-18 pb-0 md:pt-8 md:pb-0 gap-2 md:gap-0">
        
        {/* Ejercicio */}
        <section className="w-full md:w-3/5 flex flex-col px-4 md:px-0">
          <div className="flex flex-row items-start w-full max-w-lg mx-auto mb-2">
            {/* Número de ejercicio vertical */}
            <div className="flex flex-col items-start justify-start mr-4 min-w-17.5">
              <span className="text-md sm:text-lg text-slate-700 mb-1"><b>Ejercicio</b></span>
              <span className="text-6xl sm:text-6xl text-black font-bold leading-none" style={{ fontFamily: 'var(--font-dotgothic)' }}>
                {questionIndex + 1}<small className="text-xl px-2">/</small>{TOTAL_QUESTIONS}
              </span>
            </div>
            {/* Área de suma */}
            <div className="flex flex-col items-center flex-1">
              <div className="flex flex-row items-end justify-center gap-2 sm:gap-4 mb-2 sm:mb-4 w-full">
                <span className="text-4xl sm:text-6xl font-bold text-black pb-4 sm:pb-8 font-mono">+</span>
                <div className="flex flex-col space-y-0.5 sm:space-y-1">
                  {problem.sumandos.map((sumando, index) => (
                    <div key={index} className="text-right">
                      <span className="text-3xl sm:text-5xl text-black font-bold" style={{ fontFamily: 'var(--font-dotgothic)' }}>
                        {isCountdownActive ? '?' : sumando}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Línea horizontal debajo de los sumandos */}
              <div className="w-20 sm:w-32 h-1 bg-black mb-2 sm:mb-4 ml-8 sm:ml-16"></div>
              {/* Totalizador estilo display calculadora */}
              <div className="flex items-center space-x-2 sm:space-x-4 bg-linear-to-b from-[#e0e0e0] to-[#b6b6b6] px-4 py-3 rounded-lg border-2 border-black ml-8 sm:ml-16 shadow-inner min-w-30">
                <span className="text-2xl sm:text-4xl font-bold text-black font-mono">=</span>
                <div className="min-w-12 sm:min-w-24 text-right">
                  <span className="text-2xl sm:text-4xl font-bold text-black font-mono">
                    {isCountdownActive ? '?' : userAnswer || ' '}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Teclado numérico */}
        <section className="fixed w-full bottom-0 bg-black flex items-end md:items-center justify-center px-0 md:px-0 md:pb-0">
          <div className="w-full max-w-md px-0">
            <NumericKeypad
              onDigit={handleDigit}
              onDelete={handleDelete}
              onSubmit={handleSubmit}
              disabled={isCountdownActive || isSubmitted}
            />
          </div>
        </section>


      </main>

      {isCountdownActive && (
        <CountDown steps={COUNTDOWN_STEPS} onFinish={() => setIsCountdownActive(false)} />
      )}

      {/* Feedback */}
      {isCorrect !== null && (
        <div className={`absolute top-1/2 left-1/2 z-40 transform -translate-x-1/2 p-4 rounded-xl ${isCorrect ? 'bg-emerald-500/20 border-emerald-400' : 'bg-red-500/20 border-red-400'} border-2 w-11/12 max-w-xs sm:max-w-md`}>
          <p className={`text-lg sm:text-xl font-bold text-center ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
            {isCorrect ? '¡Correcto! 🎉' : `Incorrecto — era ${problem.correct}`}
          </p>
          {currentResponseTimeMs !== null && (
            <p className="mt-2 text-center text-xs sm:text-sm font-semibold text-white">
              Tiempo: {formatElapsedTime(currentResponseTimeMs)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function SumasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-[#b6d7a8]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
        </div>
      }
    >
      <SumasPageContent />
    </Suspense>
  );
}
