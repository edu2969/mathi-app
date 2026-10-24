import type { ReactNode } from "react";

interface ChallengeTileBackProps {
    /** Contenido centrado sobre la parte verde (número, icono, etc.). */
    children?: ReactNode;
    /** Controla el tamaño. El ancho define todo: la altura sale de la proporción. */
    className?: string;
}

/**
 * Fondo de desafío vacío: botón verde claro con marco dorado
 * y una base verde oscura que le da profundidad.
 * Solo divs, bordes redondeados y Tailwind.
 *
 * Todo se dimensiona en porcentajes, así que escala con el ancho:
 *   <ChallengeTileBack className="w-24" />
 *   <ChallengeTileBack className="w-40">3</ChallengeTileBack>
 */
export default function ChallengeTileBack({
    children,
    className = "w-40",
}: ChallengeTileBackProps) {
    return (
        <div className={`relative aspect-[165/200] ${className}`}>
            {/* Base verde oscura (asoma por debajo del botón) */}
            <div
                className="
                    absolute inset-x-[1%] bottom-0 top-[40%]
                    overflow-hidden rounded-b-[18%] rounded-t-[10%]
                    bg-gradient-to-b from-[#235a36] to-[#173f27]
                    shadow-[0_2px_3px_rgba(0,0,0,0.35)]
                "
            >
                {/* Textura de franjas verticales muy sutil en la parte baja */}
                <div
                    className="
                        absolute inset-x-0 bottom-0 h-[45%]
                        bg-[repeating-linear-gradient(90deg,transparent_0,transparent_5px,rgba(0,0,0,0.12)_5px,rgba(0,0,0,0.12)_6px)]
                    "
                />
            </div>

            {/* Botón: cuadrado que ocupa la parte superior */}
            <div
                className="
                    absolute inset-x-0 top-0 aspect-square
                    rounded-[24%]
                    bg-gradient-to-b from-[#ffdc45] via-[#f4b908] to-[#d89c00]
                    shadow-[0_0_0_1.5px_#9a7100,0_4px_0_#b88600,0_6px_6px_rgba(0,0,0,0.3)]
                "
            >
                {/* Zona verde interior */}
                <div
                    className="
                        absolute inset-[5.5%] overflow-hidden
                        rounded-[19%]
                        bg-gradient-to-b from-[#b7dd7e] to-[#a6d065]
                        shadow-[inset_0_0_0_1.5px_#86a845,inset_0_-3px_6px_rgba(90,130,30,0.25)]
                    "
                >
                    {/* Mitad superior más clara (efecto brillo) */}
                    <div
                        className="
                            absolute inset-x-0 top-0 h-[52%]
                            bg-gradient-to-b from-[#d3eca6] to-[#c1e28f]
                        "
                    />

                    {/* Reflejo fino en el borde superior */}
                    <div
                        className="
                            absolute inset-x-[8%] top-[4%] h-[6%]
                            rounded-full bg-white/35
                        "
                    />
                </div>

                {/* Contenido centrado */}
                {children && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
