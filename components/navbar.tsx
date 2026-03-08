"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function Navbar() {
     const [scrolled, setScrolled] = useState(false);
     const [menuOpen, setMenuOpen] = useState(false);

     useEffect(() => {
          const handleScroll = () => setScrolled(window.scrollY > 40);
          window.addEventListener("scroll", handleScroll, { passive: true });
          handleScroll();
          return () => window.removeEventListener("scroll", handleScroll);
     }, []);

     return (
          <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
               <div className="navbar-inner container">
                    <Link href="/" className="navbar-brand">
                         <span className="navbar-logo" aria-hidden="true">◇</span>
                         <span className="navbar-name">AmbarScope</span>
                    </Link>

                    <button
                         className={`navbar-toggle ${menuOpen ? "is-open" : ""}`}
                         onClick={() => setMenuOpen((open) => !open)}
                         aria-label="Menüyü aç/kapat"
                         type="button"
                    >
                         <span /><span /><span />
                    </button>

                    <ul className={`navbar-links ${menuOpen ? "is-open" : ""}`}>
                         <li><a href="#anket" onClick={() => setMenuOpen(false)}>İhtiyaç Analizi</a></li>
                         <li><Link href="/admin" onClick={() => setMenuOpen(false)}>Admin Paneli</Link></li>
                    </ul>
               </div>
          </nav>
     );
}
