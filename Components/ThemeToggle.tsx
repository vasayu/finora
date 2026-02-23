"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Magnetic from "./Magnetic";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Magnetic strength={20}>
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 text-foreground hover:bg-white/10 dark:hover:bg-white/20 transition-colors"
        aria-label="Toggle theme"
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </Magnetic>
  );
}
