import React, { useEffect, useRef, useState } from "react";
import iphoneFrame from "../assets/iphone_mob.png";

type IphoneMockupProps = {
  video: string; // can be .mp4 or .gif
  className?: string;
};

const IphoneMockup: React.FC<IphoneMockupProps> = ({ video, className = "" }) => {
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
    return () => v.removeEventListener("canplay", onCanPlay);
  }, [video, isGif]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Enter/Open animation wrapper */}
      <div className="relative animate-[iphoneEnter_900ms_cubic-bezier(0.2,0.8,0.2,1)_both]">
        
        {/* ✅ Screen mask FIRST (so content is behind the frame) */}
        <div
          className="absolute"
          style={{
            inset: "0.5% 4.5% 1.5%",
            borderRadius: "15px",
            overflow: "hidden",
            background: "rgb(0,0,0)",
            zIndex: 1,
          }}
        >
          {isGif ? (
            <img
              src={video}
              alt="Mobile preview"
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                ready ? "opacity-100" : "opacity-0"
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
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                ready ? "opacity-100" : "opacity-0"
              }`}
            />
          )}
        </div>

        {/* ✅ Mockup frame SECOND (so it's on top) */}
        <img
          src={iphoneFrame}
          alt="iPhone Mockup"
          className="relative w-full h-auto select-none pointer-events-none"
          style={{ zIndex: 2 }}
          draggable={false}
        />

        {/* subtle glass highlight */}
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_80%_at_-10%_-10%,rgba(255,255,255,0.35),transparent_55%)] opacity-70"
          style={{ zIndex: 3 }}
        />
      </div>

      <style>{`
        @keyframes iphoneEnter {
          0%   { opacity: 0; transform: translateY(70px) rotate(-8deg) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default IphoneMockup;
