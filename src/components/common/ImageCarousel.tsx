"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  altText?: string;
  variant?: "card" | "fullsize";
  indicatorStyle?: "dots" | "bars";
  className?: string;
  aspectRatio?: "video" | "square" | "auto";
}

/**
 * A reusable image carousel component with click and swipe navigation
 * CSS has been integrated directly into the component
 */
export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  altText = "Image",
  variant = "card",
  indicatorStyle = "dots",
  className = "",
  aspectRatio = "video",
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const [screenWidth, setScreenWidth] = useState(1024); // Default to desktop size

  // Set isMounted when component mounts (client-side only)
  useEffect(() => {
    setIsMounted(true);
    // Set screen width
    setScreenWidth(window.innerWidth);

    // Update screen width on resize
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Navigation functions as useCallback to prevent unnecessary recreations
  const prevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  }, [images.length]);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  }, [images.length]);

  // Touch event handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null; // Reset end position
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;

    const touchDiff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 50; // Minimum distance (in px) to be considered a swipe

    if (Math.abs(touchDiff) > minSwipeDistance) {
      if (touchDiff > 0) {
        // Swipe left - go to next image
        nextImage();
      } else {
        // Swipe right - go to previous image
        prevImage();
      }
    }

    // Reset touch positions
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    // Only add keyboard listeners if carousel is fullsize and visible
    if (variant !== "fullsize" || !carouselRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [variant, prevImage, nextImage]);

  // CSS definitions - moved from external file to inline styles
  const containerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "var(--muted, #f1f5f9)",
    borderRadius: "8px",
    touchAction: "pan-y",
    ...(aspectRatio === "video" ? { aspectRatio: "16/9" } : {}),
    ...(aspectRatio === "square" ? { aspectRatio: "1/1" } : {}),
  };

  const imageContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
  };

  const indicatorsStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "10px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    zIndex: 10,
  };

  const getIndicatorStyle = (isActive: boolean): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "none",
      background: "none",
      padding: 0,
    };

    if (indicatorStyle === "bars") {
      return {
        ...baseStyle,
        width: isMounted
          ? screenWidth <= 480
            ? "16px"
            : screenWidth <= 768
            ? "20px"
            : "25px"
          : "25px", // Default for SSR
        height: isMounted ? (screenWidth <= 768 ? "3px" : "4px") : "4px", // Default for SSR
        borderRadius: "2px",
        backgroundColor: isActive ? "white" : "rgba(255, 255, 255, 0.5)",
      };
    } else {
      // Dots
      return {
        ...baseStyle,
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: isActive ? "white" : "rgba(255, 255, 255, 0.5)",
        transform: isActive ? "scale(1.2)" : "scale(1)",
      };
    }
  };

  const swipeHintStyle: React.CSSProperties = {
    position: "absolute",
    bottom: "35px",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 9,
    pointerEvents: "none",
    animation: "fadeInOut 3s ease-in-out forwards",
  };

  const swipeHintSpanStyle: React.CSSProperties = {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white",
    fontSize: "0.75rem",
    padding: "4px 10px",
    borderRadius: "12px",
    opacity: 0.9,
  };

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    border: "none",
    width: isMounted
      ? screenWidth <= 480
        ? "24px"
        : screenWidth <= 768
        ? "28px"
        : "30px"
      : "30px", // Default for SSR
    height: isMounted
      ? screenWidth <= 480
        ? "24px"
        : screenWidth <= 768
        ? "28px"
        : "30px"
      : "30px", // Default for SSR
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    opacity: 0.7,
    transition: "opacity 0.3s",
    zIndex: 10,
    fontSize: isMounted
      ? screenWidth <= 480
        ? "10px"
        : screenWidth <= 768
        ? "12px"
        : "14px"
      : "14px", // Default for SSR
  };

  // Define keyframes for fadeInOut animation and responsive styles for carousel buttons
  useEffect(() => {
    if (!isMounted) return;

    // Create style element for keyframes and responsive styles
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; visibility: hidden; }
      }

      /* Hide carousel buttons on mobile */
      @media (max-width: 767px) {
        .carousel-button {
          display: none !important;
        }
      }
      
      /* Show carousel buttons on tablet and desktop */
      @media (min-width: 768px) {
        .carousel-button {
          display: flex !important;
        }
      }
    `;
    document.head.appendChild(styleElement);

    // Cleanup
    return () => {
      document.head.removeChild(styleElement);
    };
  }, [isMounted]);

  // Only show navigation if there are multiple images
  if (images.length <= 1) {
    return (
      <div style={{ ...containerStyle, ...{ className } }}>
        <div style={imageContainerStyle}>
          <Image
            src={images[0]}
            alt={`${altText} 1`}
            fill
            style={{
              objectFit: "cover",
              transition: "transform 0.3s ease",
              userSelect: "none",
            }}
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={carouselRef}
      className={className}
      style={containerStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={imageContainerStyle}>
        <Image
          src={images[currentImageIndex]}
          alt={`${altText} ${currentImageIndex + 1}`}
          fill
          style={{
            objectFit: "cover",
            transition: "transform 0.3s ease",
            userSelect: "none",
          }}
          sizes="(max-width: 768px) 100vw, 800px"
          priority={currentImageIndex === 0}
          draggable={false}
        />
      </div>

      {/* Navigation buttons - will show on tablet/desktop and hide on mobile via CSS */}
      <button
        className="carousel-button prev-button"
        onClick={prevImage}
        aria-label="Previous image"
        style={{ ...buttonStyle, left: "10px" }}
      >
        &#10094;
      </button>
      <button
        className="carousel-button next-button"
        onClick={nextImage}
        aria-label="Next image"
        style={{ ...buttonStyle, right: "10px" }}
      >
        &#10095;
      </button>

      {/* Image indicators */}
      {images.length > 1 && (
        <div style={indicatorsStyle}>
          {images.map((_, index) => (
            <button
              key={index}
              style={getIndicatorStyle(index === currentImageIndex)}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Visual swipe hint for mobile users */}
      {images.length > 1 && isMounted && (
        <div style={swipeHintStyle}>
          <span style={swipeHintSpanStyle}>Swipe to navigate</span>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
