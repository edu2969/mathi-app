import Image from "next/image";
import React from "react";

interface FinishedResultsProps {
	stars: number;
	score: number;
	totalQuestions: number;
	averageTimeMs: number;
	onRetry: () => void;
	onBack: () => void;
}

function formatElapsedTime(timeMs: number) {
	if (timeMs < 1000) {
		return `${Math.round(timeMs)} ms`;
	}
	return `${(timeMs / 1000).toFixed(timeMs >= 10000 ? 1 : 2)} s`;
}

const FinishedResults: React.FC<FinishedResultsProps> = ({ stars, score, totalQuestions, averageTimeMs, onRetry, onBack }) => {
	let bgImg = "/result_bg-1.png";
	if (stars === 2) bgImg = "/result_bg-2.png";
	if (stars === 3) bgImg = "/result_bg-3.png";

	return (
		<div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
			{/* Fondo con overlay oscuro */}
			<Image
				src={bgImg}
				alt="Fondo resultado"
				fill
				priority
				className="object-cover z-0"
				style={{ filter: 'brightness(0.45)' }}
			/>
			{/* Overlay negro semitransparente extra */}
			<div className="absolute inset-0 bg-black/10 z-10" />
			{/* Contenido */}
			<div className="relative z-20 flex flex-col items-center justify-center gap-6 px-2 sm:px-4 py-6 w-full">
				<h2 className="text-2xl sm:text-3xl font-bold text-yellow-300 text-center drop-shadow-lg">¡Nivel completado!</h2>
				<div className="flex gap-2 justify-center">
					{[1, 2, 3].map((i) => (
						<Image
							key={i}
							src="/estrella.png"
							alt="Estrella"
							width={40}
							height={40}
							className={i <= stars ? "drop-shadow-md" : "opacity-30 grayscale"}
							style={{ height: 'auto' }}
						/>
					))}
				</div>
				<p className="text-lg sm:text-xl text-white text-center drop-shadow">{score} / {totalQuestions} respuestas correctas</p>
				<p className="text-base sm:text-lg text-slate-100 text-center drop-shadow">Tiempo promedio: {formatElapsedTime(averageTimeMs)}</p>
				<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-xs sm:max-w-none justify-center">
					<button
						onClick={onRetry}
						className="rounded-xl bg-yellow-400 px-4 sm:px-6 py-2 sm:py-3 font-bold text-green-900 shadow-md transition-colors hover:bg-yellow-300 w-full sm:w-auto"
					>
						Reintentar
					</button>
					<button
						onClick={onBack}
						className="rounded-xl border-2 border-yellow-400/60 px-4 sm:px-6 py-2 sm:py-3 font-bold text-yellow-300 transition-colors hover:bg-green-700 w-full sm:w-auto"
					>
						Volver
					</button>
				</div>
			</div>
		</div>
	);
};

export default FinishedResults;
