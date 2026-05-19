import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";


type Theme = "dark" | "light";

interface ThemeContextValue { 
    theme: Theme;
    toggleTheme: () => void;
}


const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children } : {children: ReactNode }) {

    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme");
        return saved === "light" ? "light" : "dark";
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((current) => (current === "dark" ? "light": "dark"));
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if(context === null) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }
    return context;
}