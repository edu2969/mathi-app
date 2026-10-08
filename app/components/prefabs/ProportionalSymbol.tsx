import { useLayoutEffect, useRef, useState } from "react";

// Símbolo con ancho fijo (80% del contenedor) y aspect ratio original preservado
export default function ProportionalSymbol({ symbol }: { symbol: string }) {
	const textRef = useRef<SVGTextElement>(null);
	const [scale, setScale] = useState<number | null>(null);

	const TARGET_WIDTH = 80; // 80% del viewBox (0-100)
	const BASE_FONT_SIZE = 48; // tamaño base arbitrario, se cancela en el ratio

	useLayoutEffect(() => {
		if (textRef.current) {
			const bbox = textRef.current.getBBox();
			if (bbox.width > 0) {
				setScale(TARGET_WIDTH / bbox.width);
			}
		}
	}, [symbol]);

	return (
		<svg
			viewBox="0 0 100 100"
			preserveAspectRatio="xMidYMid meet"
			className="w-full h-full overflow-visible"
		>
			<g
				transform={`translate(50,50) scale(${scale ?? 1}) translate(-50,-50)`}
				style={{
					opacity: scale === null ? 0 : 1,
					transition: "opacity 0.15s ease",
				}}
			>
				<text
					ref={textRef}
					x="50"
					y="50"
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize={BASE_FONT_SIZE}
					className="font-bold symbol-font"
					fill="currentColor"
					style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))" }}
				>
					{symbol}
				</text>
			</g>
		</svg>
	);
}