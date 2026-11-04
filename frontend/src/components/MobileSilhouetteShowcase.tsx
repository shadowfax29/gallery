import React, { useEffect, useMemo, useState } from "react";

type ImageItem = { src: string; alt?: string };

interface MobileSilhouetteShowcaseProps {
  images: ImageItem[];
  className?: string;
  speedSec?: number; // total loop duration (lower = faster)
}

/**
 * Continuous vertical feed loop:
 * - Randomized image order
 * - Each image appears ONCE per cycle (no double repeat)
 * - 70:30 split (image+mini-content : small content)
 * - Minimal skeleton between rows
 * - Infinite smooth scroll with no jump
 */
const MobileSilhouetteShowcase: React.FC<MobileSilhouetteShowcaseProps> = ({
  images,
  className = "",
  speedSec = 10,
}) => {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});

  // Shuffle images (Fisher–Yates)
  const shuffledImages = useMemo(() => {
    const arr = [...safeImages];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [safeImages]);

  // Preload all images
  useEffect(() => {
    if (!shuffledImages.length) return;
    let cancelled = false;

    shuffledImages.forEach((img) => {
      if (!img?.src || loadedMap[img.src]) return;
      const i = new Image();
      i.src = img.src;
      i.onload = () => {
        if (cancelled) return;
        setLoadedMap((m) => ({ ...m, [img.src]: true }));
      };
      i.onerror = () => {
        if (cancelled) return;
        setLoadedMap((m) => ({ ...m, [img.src]: true }));
      };
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffledImages]);

  if (!shuffledImages.length) return null;

  /** Build feed:
   * Each image used ONCE.
   * Even index -> image on LEFT (70%)
   * Odd index  -> image on RIGHT (70%)
   */
  const feedItems: any[] = [];
  for (let i = 0; i < shuffledImages.length; i++) {
    const img = shuffledImages[i];

    if (i % 2 === 0) {
      feedItems.push({ type: "pair", left: img, right: null });
    } else {
      feedItems.push({ type: "pair", left: null, right: img });
    }

    // minimal skeleton between each row
    feedItems.push({ type: "skeleton" });
  }

  // Duplicate for seamless loop
  const loopItems = [...feedItems, ...feedItems];

  // Mini content block
  const MiniContent = ({ compact = false }: { compact?: boolean }) => (
    <div className={`w-full ${compact ? "space-y-1.5" : "space-y-2"}`}>
      <div className={`${compact ? "h-2.5" : "h-3"} rounded-md bg-gray-200 animate-pulse`} />
      <div className={`${compact ? "h-6" : "h-7"} rounded-md bg-gray-200 animate-pulse`} />
      {!compact && (
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-5 rounded-md bg-gray-200 animate-pulse" />
          <div className="h-5 rounded-md bg-gray-200 animate-pulse" />
        </div>
      )}
    </div>
  );

  // Big image section (70%)
  const ImageSection = ({ img }: { img: ImageItem }) => {
    const loaded = !!loadedMap[img.src];
    return (
      <div className="flex-[7] bg-gray-100 rounded-2xl shadow-inner p-2 flex flex-col items-center justify-center gap-2">
        {loaded ? (
          <img
            src={img.src}
            alt={img.alt ?? "image"}
            className="w-[150px] h-[85px] object-contain"
            draggable={false}
          />
        ) : (
          <div className="w-full flex-1 bg-gray-200 animate-pulse rounded-xl" />
        )}
        <MiniContent compact />
      </div>
    );
  };

  // Small content section (30%)
  const SmallContentSection = () => (
    <div className="flex-[3] bg-gray-100 rounded-2xl shadow-inner p-2 flex items-center justify-center">
      <MiniContent compact />
    </div>
  );

  return (
    <div className={`relative ${className}`}>
      {/* orange aura */}
      <div className="absolute -inset-10 bg-gradient-to-b from-[#FF6B2C]/35 via-transparent to-transparent blur-3xl opacity-90" />

      {/* phone */}
      <div className="relative mx-auto w-[300px] sm:w-[340px] aspect-[9/19] rounded-[46px] bg-white shadow-[0_40px_110px_rgba(0,0,0,0.6)] border border-white/70 overflow-hidden">
        {/* inner rim */}
        <div className="absolute inset-[6px] rounded-[40px] bg-white shadow-inner ring-1 ring-black/5" />
        {/* notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black/90 rounded-full z-30 shadow-inner" />
        {/* status bar */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-white/95 z-20" />

        {/* viewport */}
        <div className="absolute inset-0 pt-16 px-4 pb-6">
          <div className="relative h-full rounded-2xl overflow-hidden bg-gray-50">
            {/* scrolling feed */}
            <div
              className="absolute inset-0 flex flex-col gap-2 will-change-transform"
              style={{ animation: `msScroll ${speedSec}s linear infinite` }}
            >
              {loopItems.map((item: any, idx) => {
                if (item.type === "pair") {
                  return (
                    <div
                      key={`pair-${idx}`}
                      className="mx-auto w-full max-w-[260px] flex gap-3 px-1"
                    >
                      {item.left ? (
                        <>
                          <ImageSection img={item.left} />
                          <SmallContentSection />
                        </>
                      ) : (
                        <>
                          <SmallContentSection />
                          <ImageSection img={item.right} />
                        </>
                      )}
                    </div>
                  );
                }

                // minimal skeleton
                return (
                  <div
                    key={`sk-${idx}`}
                    className="mx-auto w-full max-w-[260px] px-1 space-y-2"
                  >
                    <div className="h-3 rounded-md bg-gray-200 animate-pulse" />
                    <div className="h-7 rounded-md bg-gray-200 animate-pulse" />
                  </div>
                );
              })}
            </div>

            {/* scanline grain */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(to_bottom,rgba(0,0,0,0.7)_1px,transparent_1px)] bg-[size:100%_3px]" />
          </div>
        </div>

        {/* home indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-black/20 rounded-full z-30" />
        {/* highlight */}
        <div className="absolute inset-0 rounded-[46px] pointer-events-none bg-[radial-gradient(120%_80%_at_-10%_-10%,rgba(255,255,255,0.9),transparent_50%)] opacity-70" />

        {/* keyframes */}
        <style>{`
          @keyframes msScroll {
            0%   { transform: translateY(0%); }
            100% { transform: translateY(-50%); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default MobileSilhouetteShowcase;
