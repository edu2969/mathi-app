"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { useSound } from "../providers";

const levels = [
  { 
    id: 1, 
    title: "The Beginning of Numbers", 
    image: "/level_01.png", 
    unlocked: true,
    problems: [
      { name: "+", symbol: "+", unlocked: true },
      { name: "-", symbol: "-", unlocked: true },
      { name: "×", symbol: "×", unlocked: false },
      { name: "÷", symbol: "÷", unlocked: false },
      { name: "x²", symbol: "x²", unlocked: false },
      { name: "x³", symbol: "x³", unlocked: false },
      { name: "√", symbol: "√", unlocked: false },
      { name: "?", symbol: "?", unlocked: false }
    ]
  },
  { 
    id: 2, 
    title: "The Jungle of Irrationals", 
    image: "/level_02.png", 
    unlocked: false,
    problems: [
      { name: "Q₁", symbol: "π", unlocked: false },
      { name: "Q₂", symbol: "e", unlocked: false },
      { name: "Q₃", symbol: "√2", unlocked: false },
      { name: "Q₄", symbol: "φ", unlocked: false },
      { name: "Q₅", symbol: "√3", unlocked: false },
      { name: "Q₆", symbol: "√5", unlocked: false },
      { name: "Q₇", symbol: "ℵ", unlocked: false },
      { name: "Q₈", symbol: "∞", unlocked: false }
    ]
  },
  { 
    id: 3, 
    title: "The Castle of Harmony", 
    image: "/level_03.png", 
    unlocked: false,
    problems: [
      { name: "÷9", symbol: "÷9", unlocked: false },
      { name: "×25", symbol: "×25", unlocked: false },
      { name: "√n", symbol: "√n", unlocked: false },
      { name: "X=a×b", symbol: "X=a×b", unlocked: false },
      { name: "34÷56", symbol: "34÷56", unlocked: false },
      { name: "11×??", symbol: "11×??", unlocked: false },
      { name: "a/b", symbol: "a/b", unlocked: false },
      { name: "xⁿ", symbol: "xⁿ", unlocked: false }
    ]
  },
];

// Desafíos de la grilla inferior
const challenges = [
  { id: 1, name: "Suma Básica", symbol: "+", stars: 3, unlocked: true },
  { id: 2, name: "Resta Simple", symbol: "-", stars: 2, unlocked: true },
  { id: 3, name: "Multi x2", symbol: "×", stars: 1, unlocked: false },
  { id: 4, name: "División", symbol: "÷", stars: 0, unlocked: false },
  { id: 5, name: "Cuadrados", symbol: "x²", stars: 0, unlocked: false },
  { id: 6, name: "Raíces", symbol: "√", stars: 0, unlocked: false },
  { id: 7, name: "Fracciones", symbol: "a/b", stars: 0, unlocked: false },
  { id: 8, name: "Secreto", symbol: "?", stars: 0, unlocked: false },
];

function NivelesPageContent() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(0); // Índice del nivel seleccionado en carrusel
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

  // Efecto para cambiar la música cuando cambia el nivel seleccionado
  useEffect(() => {
    const newLevel = selectedLevel + 1; // Convertir índice a número de nivel
    setCurrentLevel(newLevel);
    playLevelSound(newLevel);
  }, [playLevelSound, selectedLevel, setCurrentLevel]);

  const nextLevel = () => {
    if (selectedLevel < levels.length - 1) {
      setSelectedLevel(selectedLevel + 1);
    }
  };

  const prevLevel = () => {
    if (selectedLevel > 0) {
      setSelectedLevel(selectedLevel - 1);
    }
  };

  const navigateToExercise = async () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      await fadeOutLevelSound();
    } finally {
      router.push("/ejercicio/sumas");
    }
  };

  const handleSignOut = async () => {
    if (isNavigating || isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await fadeOutLevelSound();
      await signOut({ callbackUrl: "/login" });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleLevelSelect = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (level?.unlocked) {
      void navigateToExercise();
    }
  };

  const handleChallengeSelect = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge?.unlocked) {
      void navigateToExercise();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col relative"
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
      <div className="flex flex-col items-center justify-center w-full pt-0 pb-2 px-2 sm:px-6" style={{ height: '45vh', minHeight: 220 }}>
        <div className="relative w-full max-w-55 sm:max-w-[320px] md:max-w-xl flex justify-center items-center h-full">
          {/* Flecha izquierda */}
          {selectedLevel > 0 && (
            <button
              onClick={prevLevel}
              className="absolute left-0 -translate-x-11/12 md:-translate-x-2/3 z-20 bg-transparent p-2 md:p-3 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Nivel anterior"
            >
              <Image
                src="/flecha_izquierda.png"
                alt="Anterior"
                width={48}
                height={48}
                className="drop-shadow-lg w-10 h-10 md:w-16 md:h-16"
              />
            </button>
          )}

          {/* Niveles */}
          <div className="relative w-11/12 sm:w-4/5 md:w-2/3 aspect-20/25 max-w-55 sm:max-w-[320px] md:max-w-100 mx-auto h-full lg:mt-12">
            {levels.map((level, index) => {
              const isActive = index === selectedLevel;
              const isNext = index === selectedLevel + 1;
              const isPrev = index === selectedLevel - 1;

              return (
                <div
                  key={level.id}
                  className={`absolute inset-0 transition-all duration-500 ${
                    isActive
                      ? 'opacity-100 scale-100 z-20'
                      : isNext || isPrev
                      ? 'opacity-30 scale-75 z-10'
                      : 'opacity-0 scale-50 z-0'
                  } ${
                    isNext ? 'translate-x-8' : isPrev ? '-translate-x-8' : 'translate-x-0'
                  }`}
                  style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                >
                  <div
                    className={`h-full w-full ${level.unlocked && !isNavigating ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    onClick={() => handleLevelSelect(level.id)}
                  >
                    <Image
                      src={level.image}
                      alt={level.title}
                      fill
                      sizes="(max-width: 600px) 90vw, (max-width: 900px) 60vw, 400px"
                      className={`object-contain w-full h-full ${level.unlocked ? 'drop-shadow-lg' : 'filter grayscale opacity-70'}`}
                      priority={isActive}
                    />

                    {/* Lock overlay */}
                    {!level.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image src="/candado.png" alt="Bloqueado" width={48} height={72} className="w-18 h-24 md:w-16 md:h-16" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Flecha derecha */}
          {selectedLevel < levels.length - 1 && (
            <button
              onClick={nextLevel}
              className="absolute right-0 translate-x-11/12 md:translate-x-2/3 z-20 bg-transparent p-2 md:p-3 rounded-full transition-all duration-200 hover:scale-110"
              aria-label="Nivel siguiente"
            >
              <Image
                src="/flecha_derecha.png"
                alt="Siguiente"
                width={48}
                height={48}
                className="drop-shadow-lg w-10 h-10 md:w-16 md:h-16"
              />
            </button>
          )}
        </div>
      </div>

      {/* Grilla de desafíos, ocupa el resto */}
      <div className="flex-1 w-full px-2 pb-4 md:p-6 overflow-y-auto flex flex-col items-center" style={{ minHeight: '40vh' }}>
        <div className="w-full max-w-2xl grid grid-cols-3 grid-rows-3 md:grid-cols-4 gap-2 md:gap-4 h-full justify-items-center">
          {challenges.map((challenge, index) => {
            // Para la última fila (ítems 6 y 7), centrarlos en 3-3-2 y siempre al centro
            let extraGrid = '';
            return (
              <div
                key={challenge.id}
                onClick={() => handleChallengeSelect(challenge.id)}
                className={`relative aspect-120/147 w-10/12 sm:w-9/12 md:w-8/12 max-w-55 transition-all duration-200 overflow-hidden rounded-2xl shadow-md ${
                  challenge.unlocked && !isNavigating ? "cursor-pointer hover:scale-105" : "opacity-60"
                } ${extraGrid}`}
              >
                <Image
                  src="/desafio_back_vacio.png"
                  alt={challenge.name}
                  fill
                  sizes="(max-width: 600px) 45vw, (max-width: 900px) 22vw, 120px"
                  className="object-contain w-full h-full"
                  priority={index < 2}
                />

                {/* Símbolo del problema encima en negro */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-full">
                  <span className="text-black text-6xl sm:text-5xl md:text-7xl font-bold drop-shadow-lg mt-1.5 md:mt-0">{challenge.symbol}</span>
                </div>

                {/* Estrellas en la parte inferior */}
                {challenge.stars > 0 && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 -ml-2">
                    {Array.from({ length: challenge.stars }, (_, starIndex) => (
                      <Image
                        key={starIndex}
                        src="/estrella.png"
                        alt="Estrella"
                        width={20}
                        height={20}
                        className="drop-shadow-md w-5 h-5 md:w-6 md:h-6"
                      />
                    ))}
                  </div>
                )}

                {/* Lock overlay */}
                {!challenge.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
                    <Image src="/candado.png" alt="Bloqueado" width={40} height={40} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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

export default function NivelesPage() {
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
