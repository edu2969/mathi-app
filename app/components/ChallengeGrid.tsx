"use client";

import Image from "next/image";
import { ChallengesResponse } from "../types/types";
import ProportionalSymbol from "./prefabs/ProportionalSymbol";
import ChallengeTileBack from "./prefabs/ChallengeTileBack";

interface ChallengeGridProps {
challenges: ChallengesResponse[];
isNavigating: boolean;
onChallengeSelect: (challengeId: string, index: number) => void;
}

export default function ChallengeGrid({
challenges,
isNavigating,
onChallengeSelect,
}: ChallengeGridProps) {
const visibleChallenges = challenges.slice(0, 28);

return (
    <div
        className="
            h-full w-full min-h-0 min-w-0
            flex items-center justify-center
        "
    >
        <div
            className="
                grid h-full w-full min-h-0 min-w-0
                grid-cols-4 grid-rows-7
                sm:grid-cols-5 sm:grid-rows-6
                md:grid-cols-6 md:grid-rows-5
                lg:grid-cols-7 lg:grid-rows-4
                gap-1 sm:gap-1.5
                content-center justify-items-center items-center
            "
        >
            {visibleChallenges.map((challenge, index) => (
                <button
                    key={`problema_${challenge._id}`}
                    type="button"
                    onClick={() => {
                        if (challenge.unlocked && !isNavigating) {
                            onChallengeSelect(challenge._id, index);
                        }
                    }}
                    disabled={!challenge.unlocked || isNavigating}
                    aria-label={`${challenge.name}${challenge.unlocked ? "" : ", bloqueado"}`}
                    className={`
                        relative
                        h-full w-full min-h-0 min-w-0
                        max-w-36
                        rounded-xl
                        transition-transform duration-200
                        focus-visible:outline-2
                        focus-visible:outline-offset-2
                        focus-visible:outline-blue-500
                        ${
                            challenge.unlocked && !isNavigating
                                ? "cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
                                : "cursor-not-allowed opacity-60"
                        }
                    `}
                    style={{
                        aspectRatio: "120 / 147",
                        maxHeight: "100%",
                        width: "auto",
                    }}
                >
                    <ChallengeTileBack className="w-full h-full">

                    <div
                        className="
                            absolute top-[20%] left-1/2
                            -translate-x-1/2
                            flex items-center justify-center
                            text-black
                        "
                    >
                        <ProportionalSymbol symbol={challenge.symbol} />
                    </div>
                    </ChallengeTileBack>

                    <div
                        className="
                            absolute bottom-[7%] left-1/2
                            -translate-x-1/2
                            flex items-center justify-center
                            gap-[2px] w-full
                        "
                    >
                        {Array.from({ length: 3 }, (_, starIndex) => (
                            <Image
                                key={starIndex}
                                src={
                                    starIndex < challenge.stars
                                        ? "/estrella_nivel_on.png"
                                        : "/estrella_nivel_off.png"
                                }
                                alt=""
                                aria-hidden="true"
                                width={20}
                                height={20}
                                className="
                                    w-[18%] max-w-5 h-auto
                                    drop-shadow-md
                                "
                            />
                        ))}
                    </div>

                    {!challenge.unlocked && (
                        <div
                            className="
                                absolute inset-0
                                flex items-center justify-center
                                bg-black/50 rounded-4xl
                            "
                        >
                            <Image
                                src="/candado.png"
                                alt=""
                                aria-hidden="true"
                                width={50}
                                height={67}
                                className="w-[42%] h-auto"
                            />
                        </div>
                    )}
                </button>
            ))}
        </div>
    </div>
);

}