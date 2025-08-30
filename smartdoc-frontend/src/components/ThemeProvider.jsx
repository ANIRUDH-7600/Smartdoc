"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "smartdoc-ui-theme",
}) {
  const [theme, setTheme] = useState(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // Try to get the theme from local storage
      const storedTheme = localStorage.getItem(storageKey)
      // Return the stored theme if it exists, otherwise return the default theme
      return storedTheme || defaultTheme
    }
    // Return the default theme if we're on the server side
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    // Remove the previous theme class
    root.classList.remove("light", "dark")

    // Add the current theme class
    root.classList.add(theme)

    // Store the theme in local storage
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (newTheme) => setTheme(newTheme),
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}