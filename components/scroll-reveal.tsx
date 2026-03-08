"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type ScrollRevealProps = {
     children: ReactNode;
     className?: string;
     delay?: number;
     threshold?: number;
};

export function ScrollReveal({ children, className = "", delay = 0, threshold = 0.15 }: ScrollRevealProps) {
     const ref = useRef<HTMLDivElement>(null);
     const [revealed, setRevealed] = useState(false);

     useEffect(() => {
          const element = ref.current;
          if (!element) return;

          const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (prefersReducedMotion) {
               setRevealed(true);
               return;
          }

          const observer = new IntersectionObserver(
               ([entry]) => {
                    if (entry.isIntersecting) {
                         setRevealed(true);
                         observer.unobserve(element);
                    }
               },
               { threshold }
          );

          observer.observe(element);
          return () => observer.unobserve(element);
     }, [threshold]);

     return (
          <div
               ref={ref}
               className={`reveal ${revealed ? "is-revealed" : ""} ${className}`}
               style={{ transitionDelay: `${delay}ms` }}
          >
               {children}
          </div>
     );
}
