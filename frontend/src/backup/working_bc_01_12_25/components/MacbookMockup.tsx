import React, { useEffect, useState } from "react";
import macbookFrame from "../assets/macbook-pro-16.png";

interface MacbookMockupProps {
  video: string;
}

/**
 * REAL MACBOOK PRO MOCKUP USING PNG FRAME
 * - Perfect video alignment
 * - Slide-up + open animation
 */
const MacbookMockup: React.FC<MacbookMockupProps> = ({ video }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full flex justify-center mac-perspective">
      <div className={`mac-shell ${open ? "mac-shell-open" : ""}`}>
        {/* 🌟 MACBOOK PNG FRAME */}
        <div className="relative w-full">
          <img
            src={macbookFrame}
            alt="MacBook Pro Frame"
            className="w-full h-auto block select-none pointer-events-none"
          />

          {/* 🎥 PERFECTLY ALIGNED VIDEO INSIDE SCREEN */}
          <div
            className="absolute mac-video-mask"
            style={{
              top: "2.8%",
              left: "11.1%",
              right: "11.1%",
              bottom: "13.3%",
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            <video
                src={video}
                autoPlay
                loop
                muted
                playsInline
                preload="none"
                controls={false}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate"
                className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      <style>{`
        .mac-perspective {
          perspective: 1800px;
        }

        .mac-shell {
          max-width: 980px;
          width: 100%;
          transform: translateY(80px) scale(0.96) rotateX(20deg);
          opacity: 0;
          transition:
            transform 0.9s cubic-bezier(0.16,1,0.3,1),
            opacity 0.9s ease-out;
          transform-origin: bottom center;
        }

        .mac-shell-open {
          transform: translateY(0) scale(1) rotateX(0deg);
          opacity: 1;
        }

        @media (max-width: 768px) {
          .mac-shell { max-width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MacbookMockup;
