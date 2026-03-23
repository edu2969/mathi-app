"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import Image from "next/image";

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

// Componente del teclado numérico (adaptado de EjercicioDojo.tsx)
function NumericKeypad({ onDigit, onDelete, onSubmit, disabled }: {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  // Layout exacto del original: [1, 2, 3, 4, 5, 6, 7, 8, 9, "D", 0, "O"]
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "D", 0, "O"];

  return (
    <div className="flex flex-row flex-wrap justify-center w-full h-full px-4 py-6 bg-slate-600">
      {keys.map((key, index) => {
        const isDelete = key === "D";
        const isOk = key === "O";

        return (
          <button
            key={`tecla_${key}`}
            disabled={disabled}
            onClick={() => {
              if (isDelete) onDelete();
              else if (isOk) onSubmit();
              else onDigit(key.toString());
            }}
            className={`
              w-[30%] h-16 m-[1.5%] text-white text-2xl font-bold text-center
              transition-all duration-200 shadow-lg
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              ${isDelete ?
                'bg-linear-to-b from-red-400 via-red-500 to-red-600 hover:from-red-300 hover:to-red-500' :
                isOk ?
                  'bg-linear-to-b from-emerald-500 via-emerald-600 to-slate-700 hover:from-emerald-400 hover:to-emerald-500' :
                  'bg-linear-to-b from-slate-300 via-slate-400 to-slate-500 hover:from-slate-200 hover:to-slate-400'
              }
              rounded-tl-lg rounded-tr-lg rounded-bl-4xl rounded-br-4xl
            `}
            style={{ fontFamily: 'monospace' }}
          >
            {isDelete ? '⌫' : isOk ? '✓' : key}
          </button>
        );
      })}
    </div>
  );
}

export default function SumasPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  const problem = useMemo(() => generateProblem(), [questionIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDigit = useCallback((digit: string) => {
    if (isSubmitted) return;
    if (userAnswer.length < 4) { // Límite de 4 dígitos para sumas de 8 números
      setUserAnswer(prev => prev + digit);
    }
  }, [isSubmitted, userAnswer.length]);

  const handleDelete = useCallback(() => {
    if (isSubmitted) return;
    setUserAnswer(prev => prev.slice(0, -1));
  }, [isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (isSubmitted || !userAnswer) return;

    setIsSubmitted(true);
    const correct = parseInt(userAnswer) === problem.correct;
    setIsCorrect(correct);

    if (correct) {
      setScore((s) => s + 1);
    }

    // Move to next question after delay
    setTimeout(() => {
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        const finalScore = correct ? score + 1 : score;
        const pct = finalScore / TOTAL_QUESTIONS;
        setStars(pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.5 ? 1 : 0);
        setFinished(true);
      } else {
        setQuestionIndex((i) => i + 1);
        setUserAnswer('');
        setIsSubmitted(false);
        setIsCorrect(null);
      }
    }, 1500);
  }, [isSubmitted, userAnswer, problem.correct, questionIndex, score]);

  function restart() {
    setQuestionIndex(0);
    setScore(0);
    setStars(0);
    setUserAnswer('');
    setIsSubmitted(false);
    setIsCorrect(null);
    setFinished(false);
  }

  // Finished screen
  if (finished) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-green-800 to-green-950 px-4">
        <h2 className="text-3xl font-bold text-yellow-300">¡Nivel completado!</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Image
              key={i}
              src="/estrella.png"
              alt="Estrella"
              width={48}
              height={48}
              className={i <= stars ? "drop-shadow-md" : "opacity-30 grayscale"}
            />
          ))}
        </div>
        <p className="text-xl text-white">
          {score} / {TOTAL_QUESTIONS} respuestas correctas
        </p>
        <div className="flex gap-4">
          <button
            onClick={restart}
            className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-green-900 shadow-md transition-colors hover:bg-yellow-300"
          >
            Reintentar
          </button>
          <button
            onClick={() => router.push("/niveles")}
            className="rounded-xl border-2 border-yellow-400/60 px-6 py-3 font-bold text-yellow-300 transition-colors hover:bg-green-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-linear-to-b from-green-800 to-green-950">
      {/* Top bar - header transparente */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center px-6 py-4 bg-transparent">
        <button
          onClick={() => router.push("/niveles")}
          className="flex items-center gap-2 text-sm font-medium text-white hover:text-yellow-300 transition-colors"
        >
          <Image
            src="/flecha_izquierda.png"
            alt="Volver"
            width={40}
            height={40}
            className="drop-shadow-lg"
            style={{ height: 'auto' }}
          />
          <span className="text-2xl">Salir</span>
        </button>
      </header>

      {/* Ejercicio - 60% de altura */}
      <div className="bg-slate-400 w-full flex-3 pt-8">
        
        {/* Layout en columnas: 1/5 para ejercicio + 4/5 para sumatoria */}
        <div className="h-full flex">
          
          {/* Columna izquierda: 1/5 - Número del ejercicio */}
          <div className="w-1/5 flex flex-col justify-start pl-8 pt-16">
            <div className="flex flex-col items-start">
              <span className="text-lg text-slate-800 mb-2">EJERCICIO</span>
              <span className="text-6xl text-slate-800 font-bold" style={{ fontFamily: 'monospace' }}>
                {questionIndex + 1}/{TOTAL_QUESTIONS}
              </span>
            </div>
          </div>
          
          {/* Columna derecha: 4/5 - Sumatoria */}
          <div className="w-4/5 flex flex-col justify-center items-center">
            
            {/* Área de suma (signo + y números) */}
            <div className="flex items-end space-x-4 mb-4">
              <span className="text-6xl font-bold text-slate-800 pb-8" style={{ fontFamily: 'monospace' }}>+</span>
              
              {/* Columna de 8 sumandos */}
              <div className="flex flex-col space-y-1">
                {problem.sumandos.map((sumando, index) => (
                  <div key={index} className="text-right">
                    <span className="text-5xl text-slate-800 font-bold" style={{ fontFamily: 'monospace' }}>
                      {sumando}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Línea horizontal debajo de los sumandos */}
            <div className="w-32 h-1 bg-slate-800 mb-4 ml-16"></div>
            
            {/* Totalizador alineado con la lista de números */}
            <div className="flex items-center space-x-4 bg-slate-500 px-4 py-3 rounded-lg border-2 border-slate-600 ml-16">
              <span className="text-4xl font-bold text-slate-800" style={{ fontFamily: 'monospace' }}>=</span>
              <div className="min-w-24 text-right">
                <span className="text-4xl font-bold text-slate-800" style={{ fontFamily: 'monospace' }}>
                  {userAnswer || ' '}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teclado - 40% de altura */}
      <div className="flex-2">
        <NumericKeypad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          disabled={isSubmitted}
        />
      </div>

      {/* Feedback */}
      {isCorrect !== null && (
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 p-4 rounded-xl ${isCorrect ? 'bg-emerald-500/20 border-emerald-400' : 'bg-red-500/20 border-red-400'} border-2`}>
          <p className={`text-xl font-bold text-center ${isCorrect ? "text-emerald-300" : "text-red-300"}`}>
            {isCorrect ? "¡Correcto! 🎉" : `Incorrecto — era ${problem.correct}`}
          </p>
        </div>
      )}
    </div>
  );
}
