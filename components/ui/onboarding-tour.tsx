"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { useTourStore } from "@/lib/store/tour-store";
import { getTourSteps, TourStep } from "@/lib/tour-config";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour({ tourId = "owner-tour" }: { tourId?: string }) {
  const {
    isActive,
    currentStepIndex,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    completedTours,
  } = useTourStore();

  const steps = getTourSteps(tourId);
  const totalSteps = steps.length;
  const currentStep: TourStep | undefined = steps[currentStepIndex];

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-start on first load if tour has not been completed
  useEffect(() => {
    setIsMounted(true);
    const hasCompleted = !!completedTours[tourId];
    if (!hasCompleted && !isActive) {
      const timer = setTimeout(() => {
        startTour(tourId);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourId, completedTours, startTour, isActive]);

  // Update element target rect and scroll into view when step changes or window resizes
  const updateTarget = useCallback(() => {
    if (!isActive || !currentStep) {
      setTargetRect(null);
      return;
    }

    const el = document.querySelector(currentStep.target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      const rect = el.getBoundingClientRect();
      const padding = 8;
      const targetData: TargetRect = {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      };
      setTargetRect(targetData);

      // Compute Tooltip position
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      const cardW = Math.min(360, screenW - 32);
      const cardH = 220; // estimated card height

      let top = targetData.top + targetData.height + 12;
      let left = targetData.left + targetData.width / 2 - cardW / 2;

      // Vertical overflow check
      if (top + cardH > screenH - 16) {
        // Place above target
        top = Math.max(16, targetData.top - cardH - 12);
      }

      // Horizontal overflow check
      if (left < 16) left = 16;
      if (left + cardW > screenW - 16) left = screenW - cardW - 16;

      setTooltipPos({ top, left });
    } else {
      // Element not found on DOM — fallback to screen center
      setTargetRect(null);
      setTooltipPos({
        top: window.innerHeight / 2 - 110,
        left: Math.max(16, window.innerWidth / 2 - 180),
      });
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    if (!isActive) return;
    updateTarget();

    const handleResize = () => updateTarget();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [isActive, currentStepIndex, updateTarget]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        nextStep(totalSteps);
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, totalSteps, nextStep, prevStep, skipTour]);

  if (!isMounted || !isActive || !currentStep) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
        {/* Dark Mask with Cutout Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="tour-mask">
              {/* White background = masked (dimmed) */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {/* Black rect = hole cut out for target spotlight */}
              {targetRect && (
                <rect
                  x={targetRect.left}
                  y={targetRect.top}
                  width={targetRect.width}
                  height={targetRect.height}
                  rx="12"
                  ry="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(16, 32, 28, 0.75)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Pulsing ring around target element */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: `${targetRect.top}px`,
              left: `${targetRect.left}px`,
              width: `${targetRect.width}px`,
              height: `${targetRect.height}px`,
            }}
            className="rounded-xl border-2 border-brand shadow-[0_0_20px_rgba(31,111,95,0.5)] pointer-events-none z-[10000]"
          />
        )}

        {/* Tooltip Card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            width: "calc(100vw - 32px)",
            maxWidth: "360px",
          }}
          className="bg-surface border border-border/80 rounded-2xl p-5 shadow-2xl z-[10001] text-text-primary backdrop-blur-md"
        >
          {/* Card Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                Step {currentStepIndex + 1} of {totalSteps}
              </span>
            </div>
            <button
              onClick={skipTour}
              className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-border/40 transition-colors"
              aria-label="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Description */}
          <h3 className="text-base font-bold font-heading text-text-primary mb-1.5 leading-snug">
            {currentStep.title}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed mb-4">
            {currentStep.description}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-border/50 h-1.5 rounded-full overflow-hidden mb-4">
            <div
              className="bg-brand h-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/40">
            <button
              onClick={skipTour}
              className="text-xs font-medium text-text-muted hover:text-text-primary transition-colors py-1.5 px-2 rounded-lg"
            >
              Skip tour
            </button>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="p-2 rounded-xl bg-background border border-border/60 hover:bg-border/30 text-text-primary transition-colors"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => nextStep(totalSteps)}
                style={{ background: "var(--brand-gradient, linear-gradient(135deg, #1F6F5F 0%, #2E9C82 100%))" }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md hover:opacity-95 transition-opacity active:scale-[0.98]"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Got it!
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
