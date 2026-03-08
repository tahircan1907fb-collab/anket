"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
     const [scrolled, setScrolled] = useState(false);
     const [menuOpen, setMenuOpen] = useState(false);

     useEffect(() => {
          let ticking = false;

          const updateScrollState = () => {
               const nextScrolled = window.scrollY > 40;
               setScrolled((current) => (current === nextScrolled ? current : nextScrolled));
               ticking = false;
          };

          const handleScroll = () => {
               if (ticking) {
                    return;
               }

               ticking = true;
               window.requestAnimationFrame(updateScrollState);
          };

          window.addEventListener("scroll", handleScroll, { passive: true });
          updateScrollState();

          return () => {
               window.removeEventListener("scroll", handleScroll);
          };
     }, []);

     return (
          <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
               <div className="navbar-inner container">
                    <Link href="/" className="navbar-brand">
                         <span className="navbar-logo" aria-hidden="true">◇</span>
                         <span className="navbar-name">AmbarScope</span>
                    </Link>

                    <div className="navbar-controls">
                         <ThemeToggle />
                         <button
                              className={`navbar-toggle ${menuOpen ? "is-open" : ""}`}
                              onClick={() => setMenuOpen((open) => !open)}
                              aria-label="Menüyü aç/kapat"
                              type="button"
                         >
                              <span /><span /><span />
                         </button>
                    </div>
                    <ul className={`navbar-links ${menuOpen ? "is-open" : ""}`}>
                         <li><a href="#anket" onClick={() => setMenuOpen(false)}>İhtiyaç Analizi</a></li>
                         <li><Link href="/admin" onClick={() => setMenuOpen(false)}>Admin Paneli</Link></li>
                    </ul>
               </div>
          </nav >
     );
}
