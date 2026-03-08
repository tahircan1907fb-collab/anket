"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
     const [visible, setVisible] = useState(false);

     useEffect(() => {
          let ticking = false;

          const updateVisibility = () => {
               const nextVisible = window.scrollY > 400;
               setVisible((current) => (current === nextVisible ? current : nextVisible));
               ticking = false;
          };

          const handleScroll = () => {
               if (ticking) {
                    return;
               }

               ticking = true;
               window.requestAnimationFrame(updateVisibility);
          };

          window.addEventListener("scroll", handleScroll, { passive: true });
          updateVisibility();

          return () => {
               window.removeEventListener("scroll", handleScroll);
          };
     }, []);

     return (
          <button
               className={`scroll-top-btn ${visible ? "is-visible" : ""}`}
               onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
               aria-label="Sayfanın başına dön"
               type="button"
          >
               ↑
          </button>
     );
}
