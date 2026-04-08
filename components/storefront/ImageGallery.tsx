"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Maximize2, X, Loader2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  altPrefix?: string;
}

export function ImageGallery({ images, altPrefix }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomImageLoaded, setZoomImageLoaded] = useState(false);
  const [zoomPending, setZoomPending] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [pinchState, setPinchState] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const zoomImgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPinchRef = useRef<{
    distance: number;
    x: number;
    y: number;
  } | null>(null);
  const lastPanRef = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef = useRef(0);
  const scaleRef = useRef(1);
  const touchStartYRef = useRef(0);

  useEffect(() => {
    scaleRef.current = pinchState.scale;
  }, [pinchState.scale]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const scrollPosition = Math.abs(scrollRef.current.scrollLeft);
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollPosition / width);
    if (newIndex !== currentIndex) setCurrentIndex(newIndex);
  }, [currentIndex]);

  const scrollTo = (index: number) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      const isRTL =
        window.getComputedStyle(scrollRef.current).direction === "rtl";
      const scrollValue = index * scrollRef.current.offsetWidth;
      scrollRef.current.scrollTo({
        left: isRTL ? -scrollValue : scrollValue,
        behavior: "smooth",
      });
    }
  };

  const preloadAndZoom = useCallback(() => {
    const src = images[currentIndex];
    if (!src) return;

    setZoomPending(true);
    setZoomImageLoaded(false);
    setPinchState({ scale: 1, translateX: 0, translateY: 0 });

    const img = new window.Image();
    img.onload = () => {
      setZoomImageLoaded(true);
      setZoomPending(false);
      setIsZoomed(true);
    };
    img.onerror = () => {
      setZoomPending(false);
      setZoomImageLoaded(true);
      setIsZoomed(true);
    };
    img.src = src;
  }, [images, currentIndex]);

  const closeZoom = useCallback(() => {
    setIsZoomed(false);
    setZoomImageLoaded(false);
    setZoomPending(false);
    setPinchState({ scale: 1, translateX: 0, translateY: 0 });
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  }, []);

  useEffect(() => {
    const img = images[currentIndex];
    if (!img) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = img;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [images, currentIndex]);

  useEffect(() => {
    if (!isZoomed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoom();
    };

    // Calculate current scroll position to maintain it
    const scrollY = window.scrollY;

    // Apply lock
    document.body.style.overflow = "hidden";
    // For iOS Safari - prevent scrolling on body when modal is open
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.top = `-${scrollY}px`;

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      // Restore scroll position
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZoomed, closeZoom]);

  useEffect(() => {
    if (!isZoomed || !containerRef.current) return;

    const el = containerRef.current;

    const getTouchCenter = (touches: TouchList) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });
    const getDistance = (touches: TouchList) =>
      Math.hypot(
        touches[1].clientX - touches[0].clientX,
        touches[1].clientY - touches[0].clientY,
      );

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        lastPinchRef.current = {
          distance: getDistance(e.touches),
          ...getTouchCenter(e.touches),
        };
      } else if (e.touches.length === 1) {
        lastPanRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
        touchStartYRef.current = e.touches[0].clientY;
        const now = Date.now();
        if (now - lastTapRef.current < 300) {
          setPinchState((prev) => ({
            ...prev,
            scale: prev.scale > 1 ? 1 : 2,
            translateX: prev.scale > 1 ? 0 : prev.translateX,
            translateY: prev.scale > 1 ? 0 : prev.translateY,
          }));
          lastTapRef.current = 0;
          return;
        }
        lastTapRef.current = now;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastPinchRef.current) {
        e.preventDefault();
        const dist = getDistance(e.touches);
        const center = getTouchCenter(e.touches);
        const delta = dist / lastPinchRef.current.distance;
        setPinchState((prev) => {
          const newScale = Math.min(4, Math.max(0.5, prev.scale * delta));
          return {
            ...prev,
            scale: newScale,
            translateX:
              prev.translateX + (center.x - lastPinchRef.current!.x) * 0.5,
            translateY:
              prev.translateY + (center.y - lastPinchRef.current!.y) * 0.5,
          };
        });
        lastPinchRef.current = { distance: dist, ...center };
      } else if (
        e.touches.length === 1 &&
        lastPanRef.current &&
        scaleRef.current > 1
      ) {
        e.preventDefault();
        const dx = e.touches[0].clientX - lastPanRef.current.x;
        const dy = e.touches[0].clientY - lastPanRef.current.y;
        setPinchState((prev) => ({
          ...prev,
          translateX: prev.translateX + dx,
          translateY: prev.translateY + dy,
        }));
        lastPanRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      } else if (e.touches.length === 1) {
        const dy = e.touches[0].clientY - touchStartYRef.current;
        if (dy > 80) closeZoom();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) lastPinchRef.current = null;
      if (e.touches.length < 1) lastPanRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isZoomed, closeZoom]);

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-4 flex-1">
      {/* Thumbnails */}
      <div className="flex justify-center lg:flex-col gap-2 overflow-x-auto py-2 lg:py-0 scrollbar-hide shrink-0 lg:w-[60px] items-start lg:items-center bg-background  px-4 lg:px-0 lg:pr-2">
        {images.map((image, idx) => {
          const isActive = currentIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              className={cn(
                "relative justify-center items-center overflow-hidden transition-colors w-[52px] h-[52px] rounded-[8px] border-[1.5px] bg-[#f7f3ee] shrink-0",
                isActive
                  ? "border-[#7c3a1e] w-[62px] h-[62px]"
                  : "border-[#e8dfd4]",
              )}
              aria-label={`Select product image ${idx + 1}`}
              aria-current={isActive ? "true" : "false"}
            >
              <div className="absolute inset-0 bg-transparent" />
              <Image
                src={image}
                alt={
                  altPrefix
                    ? `${altPrefix} – thumbnail ${idx + 1}`
                    : `Product thumbnail ${idx + 1}`
                }
                fill
                sizes="(max-width: 640px) 80px, 80px"
                className="object-cover object-center"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>

      {/* Main Image Slider */}
      <div className="relative rounded-xl flex-1 overflow-hidden bg-[#e8e2da] group lg:rounded-2xl lg:border lg:border-[#e8dfd4]">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory w-full h-[100vw] lg:h-auto lg:aspect-square no-scrollbar bg-gradient-to-br from-[#ddd5c8] to-[#c8bfb5]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {images.map((image, idx) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const isActive = currentIndex === idx;
            return (
              <div
                key={idx}
                className="relative w-full shrink-0 snap-center aspect-4/5 sm:aspect-square cursor-zoom-in active:opacity-95 overflow-hidden"
                onClick={preloadAndZoom}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && preloadAndZoom()}
                aria-label="Zoom image"
              >
                <div className="absolute inset-0 bg-muted/10 animate-pulse" />
                <Image
                  src={image}
                  alt={
                    altPrefix
                      ? `${altPrefix} – image ${idx + 1}`
                      : `Product image ${idx + 1}`
                  }
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                  className="object-cover object-center transition-all duration-500 ease-out relative z-10"
                  priority={idx === 0}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={preloadAndZoom}
          className="absolute top-4 left-4 z-20 w-9 h-9 bg-[#fdfaf7]/90 border border-[#e8dfd4] backdrop-blur text-[#1e1810] flex items-center justify-center rounded-full shadow-sm lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
          aria-label="Zoom image"
        >
          <Maximize2 className="w-[16px] h-[16px]" />
        </button>

        <div className="absolute bottom-[14px] left-0 right-0 flex justify-center gap-[5px] z-20">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={cn(
                "h-[6px] transition-all duration-300",
                currentIndex === idx
                  ? "w-[18px] bg-[#7c3a1e] rounded-[3px]"
                  : "w-[6px] bg-[#1e1810]/25 rounded-full"
              )}
            />
          ))}
        </div>
      </div>

      {/* Zoom pending overlay - shows until image is ready */}
      {zoomPending && (
        <div
          className="fixed inset-0 z-55 bg-black/90 flex items-center justify-center animate-in fade-in duration-150"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2
            className="w-10 h-10 text-white/80 animate-spin"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Zoom Modal - only shown after image loaded via React Portal */}
      {isZoomed &&
        zoomImageLoaded &&
        mounted &&
        createPortal(
          <div
            ref={containerRef}
            className="fixed inset-0 z-99999 bg-black/95 flex flex-col w-screen h-screen m-0 p-0 overscroll-none touch-none"
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed product image"
          >
            <div className="flex justify-end p-4 lg:p-6 absolute top-0 right-0 z-100000 shrink-0">
              <button
                onClick={closeZoom}
                className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-3 rounded-full touch-manipulation"
                aria-label="Close zoom"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div
              className="flex-1 w-full h-full min-h-0 overflow-auto flex items-center justify-center p-0 touch-pan-y touch-pan-x"
              onClick={closeZoom}
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div
                className="relative flex items-center justify-center w-full h-full"
                onClick={(e) => e.stopPropagation()}
                style={{
                  transform: `scale(${pinchState.scale}) translate(${pinchState.translateX}px, ${pinchState.translateY}px)`,
                  transformOrigin: "center center",
                  transition: "transform 0.1s ease-out",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Intentional: native img for zoom modal to ensure image loads before display and support pinch/pan gestures */}
                <img
                  ref={zoomImgRef}
                  src={images[currentIndex]}
                  alt={
                    altPrefix ? `${altPrefix} – zoomed` : "Zoomed product image"
                  }
                  className="max-w-full max-h-screen w-auto h-auto object-contain select-none"
                  style={{ touchAction: "none" }}
                  draggable={false}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
