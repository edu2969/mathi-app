import Image from "next/image";
import { useEffect, useState } from "react";

export interface Level {
    id: number;
    title: string;
    image: string;
    unlocked: boolean;
    problems: any[];
}

interface LevelCarrouselProps {
    levels: Level[];
    onLevelSelect: (levelId: number) => void;
    playLevelSound: (level: number) => void;
    setCurrentLevel: (level: number) => void;
    isNavigating: boolean;
}

export default function LevelCarrousel({
    levels,
    onLevelSelect,
    playLevelSound,
    setCurrentLevel,
    isNavigating,
}: LevelCarrouselProps) {
    const [selectedLevel, setSelectedLevel] = useState(0);

    useEffect(() => {
        const newLevel = selectedLevel + 1;
        setCurrentLevel(newLevel);
        playLevelSound(newLevel);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedLevel]);

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

    return (
        <div className="flex flex-col items-center justify-center w-full" style={{ minHeight: 320, height: 'min(50vw, 60vh)', maxHeight: 520 }}>
            <div className="relative w-full max-w-55 flex justify-center items-center" style={{ height: '100%' }}>
                {/* Flecha izquierda */}
                {selectedLevel > 0 && (
                    <button
                        onClick={prevLevel}
                        className="absolute -left-1/2 z-20 bg-transparent p-2 rounded-full transition-all duration-200 hover:scale-110"
                        aria-label="Nivel anterior"
                    >
                        <Image
                            src="/flecha_izquierda.png"
                            alt="Anterior"
                            width={48}
                            height={48}
                            className="drop-shadow-lg w-16 h-16"
                            style={{ height: 'auto' }}
                        />
                    </button>
                )}

                {/* Niveles */}
                <div className="relative w-full h-full">
                    {levels.map((level, index) => {
                        const isActive = index === selectedLevel;
                        const isNext = index === selectedLevel + 1;
                        const isPrev = index === selectedLevel - 1;

                        return (
                            <div
                                key={level.id}
                                className={`absolute inset-0 transition-all duration-500 ${isActive
                                        ? 'opacity-100 scale-100 z-20'
                                        : isNext || isPrev
                                            ? 'opacity-30 scale-75 z-10'
                                            : 'opacity-0 scale-50 z-0'
                                    } ${isNext ? 'translate-x-8' : isPrev ? '-translate-x-8' : 'translate-x-0'
                                    }`}
                                style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                            >
                                <div
                                    className={`w-full h-full flex flex-col justify-end items-center ${level.unlocked && !isNavigating ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    onClick={() => onLevelSelect(level.id)}
                                    style={{ position: 'relative', height: '100%' }}
                                >
                                    <div className="relative w-full aspect-3/4 min-h-55 sm:min-h-80 md:min-h-95 lg:min-h-105" style={{ height: '100%' }}>
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
                                                <Image src="/candado.png" alt="Bloqueado" width={48} height={72} className="w-16 h-24 md:w-16 md:h-24" />
                                            </div>
                                        )}
                                        {/* Estrellas siempre fijas al fondo de la imagen */}
                                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-20 flex justify-center w-auto gap-2 z-20">
                                            {[1,2,3].map(i => (
                                                <Image
                                                    key={i}
                                                    src="/estrella_nivel_off.png"
                                                    alt="Estrella apagada"
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 md:w-10 md:h-10"
                                                    style={{ height: 'auto' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Flecha derecha */}
                {selectedLevel < levels.length - 1 && (
                    <button
                        onClick={nextLevel}
                        className="absolute -right-1/2 z-20 bg-transparent p-2 rounded-full transition-all duration-200 hover:scale-110"
                        aria-label="Nivel siguiente"
                    >
                        <Image
                            src="/flecha_derecha.png"
                            alt="Siguiente"
                            width={48}
                            height={48}
                            className="drop-shadow-lg w-16 h-16"
                        />
                    </button>
                )}
            </div>
        </div>
    );
}
