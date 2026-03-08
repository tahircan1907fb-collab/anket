"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
  const label = resolvedTheme === "dark" ? "Acik temaya gec" : "Koyu temaya gec";

  return (
    <button
      className="theme-toggle"
      aria-label={mounted ? label : "Temayi degistir"}
      title={mounted ? label : "Temayi degistir"}
      type="button"
      onClick={() => mounted && setTheme(nextTheme)}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__thumb">
          {mounted && resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </span>
      </span>
    </button>
  );
}
