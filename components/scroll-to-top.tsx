"use client";

import { useEffect, useState } from "react";

export function ScrollToTop() {
     const [visible, setVisible] = useState(false);

     useEffect(() => {
          const handleScroll = () => setVisible(window.scrollY > 400);
          window.addEventListener("scroll", handleScroll, { passive: true });
          return () => window.removeEventListener("scroll", handleScroll);
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
