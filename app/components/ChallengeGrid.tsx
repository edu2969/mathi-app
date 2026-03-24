import Image from "next/image";
import React from "react";

export interface Challenge {
	id: number;
	name: string;
	symbol: string;
	stars: number;
	unlocked: boolean;
}

interface ChallengeGridProps {
	challenges: Challenge[];
	isNavigating: boolean;
	onChallengeSelect: (challengeId: number) => void;
}

export default function ChallengeGrid({ challenges, isNavigating, onChallengeSelect }: ChallengeGridProps) {
	return (
		<div className="flex-1 w-full px-2 overflow-y-hidden flex flex-col items-center" style={{ minHeight: '50vh' }}>
			<div className="w-full max-w-2xl grid grid-cols-4 grid-rows-3 gap-8 h-full justify-items-center">
				{challenges.map((challenge, index) => {
					return (
						<div
							key={challenge.id}
							onClick={() => onChallengeSelect(challenge.id)}
							className={`relative aspect-120/147 w-10/12 sm:w-9/12 md:w-8/12 max-w-55 transition-all duration-200 overflow-hidden rounded-2xl shadow-md 
                                ${challenge.unlocked && !isNavigating ? "cursor-pointer hover:scale-105" : "opacity-60"}`}
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
								<span className="w-full text-center text-black font-bold drop-shadow-lg text-[240%]">{challenge.symbol}</span>
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
											className="drop-shadow-md w-5 h-5"
											style={{ height: 'auto' }}
										/>
									))}
								</div>
							)}
							{/* Lock overlay */}
							{!challenge.unlocked && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl">
									<Image src="/candado.png" alt="Bloqueado" width={50} height={67} style={{ height: 'auto' }}/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};
