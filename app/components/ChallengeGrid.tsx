import Image from "next/image";
import { ChallengesResponse } from "../types/types";
import ProportionalSymbol from "./prefabs/ProportionalSymbol";

interface ChallengeGridProps {
	challenges: ChallengesResponse[];
	isNavigating: boolean;
	onChallengeSelect: (challengeId: string, index: number) => void;
}

export default function ChallengeGrid({ challenges, isNavigating, onChallengeSelect }: ChallengeGridProps) {
	return (
		<div className="flex-1 w-full px-2 overflow-y-hidden flex flex-col items-center" style={{ minHeight: '50vh' }}>
			<div className="w-full max-w-2xl grid grid-cols-3 xl:grid-cols-4 grid-rows-3 gap-0 md:gap-y-24 h-full justify-items-center">
				{challenges.map((challenge, index) => {
					return (
						<div
							key={`problema_${index}`}
							onClick={() => onChallengeSelect(challenge._id, index)}
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
							<div className="absolute top-1/5 left-1/2 -translate-x-1/2 flex items-center justify-center text-black">
								<ProportionalSymbol symbol={challenge.symbol} />
							</div>
							{/* Estrellas en la parte inferior */}
							<div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5">
								{Array.from({ length: 3 }, (_, starIndex) => (
									<Image
										key={starIndex}
										src={starIndex < challenge.stars ? "/estrella_nivel_on.png" : "/estrella_nivel_off.png"}
										alt="Estrella"
										width={20}
										height={20}
										className="w-5 h-5 drop-shadow-md"
										style={{ height: 'auto' }}
									/>
								))}
							</div>
							{/* Lock overlay */}
							{!challenge.unlocked && (
								<div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl">
									<Image
										src="/candado.png"
										alt="Bloqueado"
										width={50}
										height={67}
										className="w-20 h-auto sm:w-10 md:w-12"
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};
