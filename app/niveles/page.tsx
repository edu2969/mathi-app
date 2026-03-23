"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

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

export default function NivelesPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState(0); // Índice del nivel seleccionado en carrusel

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

  const handleLevelSelect = (levelId: number) => {
    const level = levels.find(l => l.id === levelId);
    if (level?.unlocked) {
      router.push("/ejercicio/sumas");
    }
  };

  const handleChallengeSelect = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge?.unlocked) {
      router.push("/ejercicio/sumas");
    }
  };

  return (
    <div 
      className="h-screen flex flex-col"
      style={{
        backgroundImage: "url('/bg-vertical.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Carrusel de nivel seleccionado - 40% altura */}
      <div className="flex-2 flex flex-col justify-center items-center px-6 relative pt-6">
        <div className="relative w-full flex justify-center items-center">
          {/* Flecha izquierda */}
          {selectedLevel > 0 && (
            <button
              onClick={prevLevel}
              className="absolute -left-5 z-10 bg-transparent p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Image 
                src="/flecha_izquierda.png" 
                alt="Anterior" 
                width={64} 
                height={64} 
                className="drop-shadow-lg"
              />
            </button>
          )}
          
          {/* Niveles */}
          <div className="relative w-2/3 h-80 overflow-hidden">
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
                >
                  <div className={`h-full ${level.unlocked ? 'cursor-pointer grayscale-0' : 'cursor-not-allowed grayscale'}`} onClick={() => handleLevelSelect(level.id)}>
                    <Image
                      src={level.image}
                      alt={level.title}
                      width={400}
                      height={510}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Lock overlay */}
                    {!level.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image src="/candado.png" alt="Bloqueado" width={64} height={64} className="drop-shadow-lg" />
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
              className="absolute -right-5 z-10 bg-transparent p-3 rounded-full transition-all duration-200 hover:scale-110"
            >
              <Image 
                src="/flecha_derecha.png" 
                alt="Siguiente" 
                width={64} 
                height={64} 
                className="drop-shadow-lg"
              />
            </button>
          )}
        </div>
      </div>

      {/* Grilla de desafíos - 60% altura */}
      <div className="flex-3 bg-black/20 p-6 overflow-y-auto">        
        <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
          {challenges.map((challenge, index) => (
            <div
              key={challenge.id}
              onClick={() => handleChallengeSelect(challenge.id)}
              className={`relative w-30 h-36.75 transition-all duration-200 overflow-hidden ${
                challenge.unlocked ? "cursor-pointer hover:scale-105" : "opacity-60"
              }`}
            >
              <Image
                src="/desafio_back_vacio.png"
                alt={challenge.name}
                width={120}
                height={147}
                className="w-full h-full object-cover"
              />
              
              {/* Símbolo del problema encima en negro */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <span className="text-black text-7xl font-bold drop-shadow-lg mt-1">{challenge.symbol}</span>
              </div>
              
              {/* Estrellas en la parte inferior */}
              {challenge.stars > 0 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {Array.from({ length: challenge.stars }, (_, starIndex) => (
                    <Image
                      key={starIndex}
                      src="/estrella.png"
                      alt="Estrella"
                      width={24}
                      height={24}
                      className="drop-shadow-md"
                    />
                  ))}
                </div>
              )}
              
              {/* Lock overlay */}
              {!challenge.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-4xl">
                  <Image src="/candado.png" alt="Bloqueado" width={96} height={96} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
