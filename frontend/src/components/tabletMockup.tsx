import React, { useEffect, useRef, useState } from "react";
import tabletFrame from "../assets/tablet.png";

type TabletMockupProps = {
    video: string; // can be .mp4 or .gif
    className?: string;
};

const TabletMockup: React.FC<TabletMockupProps> = ({
    video,
    className = "",
}) => {
    const vidRef = useRef<HTMLVideoElement | null>(null);
    const [ready, setReady] = useState(false);

    const isGif = video.toLowerCase().endsWith(".gif");

    useEffect(() => {
        setReady(false);

        if (isGif) {
            const img = new Image();
            img.src = video;
            img.onload = () => setReady(true);
            img.onerror = () => setReady(true);
            return;
        }

        const v = vidRef.current;
        if (!v) return;

        const onCanPlay = () => setReady(true);

        v.addEventListener("canplay", onCanPlay);

        return () => {
            v.removeEventListener("canplay", onCanPlay);
        };
    }, [video, isGif]);

    return (
        <div className={`relative w-full ${className}`}>
            {/* Enter/Open animation wrapper */}
            <div className="relative animate-[tabletEnter_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]">

                {/* Screen */}
                <div
                    className="absolute overflow-hidden"
                    style={{
                        "borderRadius": "18px",
                        "zIndex": "1",
                        "top": "14.2%",
                        "left": "19.4%",
                        "width": "61.4%",
                        "height": "70.2%",

                    }}
                >
                    {isGif ? (
                        <img
                            src={video}
                            alt="Tablet preview"
                            className={`w-full h-full object-cover bg-white transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"
                                }`}
                            draggable={false}
                        />
                    ) : (
                        <video
                            ref={vidRef}
                            src={video}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            poster=""
                            className={`w-full h-full object-cover bg-white transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"
                                }`}
                        />
                    )}
                </div>

                {/* Tablet Frame */}
                <img
                    src={tabletFrame}
                    alt="Tablet Mockup"
                    className="relative w-full h-auto select-none pointer-events-none"
                    style={{ zIndex: 2 }}
                    draggable={false}
                />

                {/* Glass Highlight */}
                <div
                    className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_80%_at_-10%_-10%,rgba(255,255,255,0.35),transparent_55%)] opacity-70"
                    style={{ zIndex: 3 }}
                />
            </div>

            <style>{`
        @keyframes tabletEnter {
          0% {
            opacity: 0;
            transform: translateY(70px) rotate(-4deg) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotate(0deg) scale(1);
          }
        }
      `}</style>
        </div>
    );
};

export default TabletMockup;