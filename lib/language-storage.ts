export type Language = "en" | "es" | "hi" | "sw"

export interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export const languages: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
]

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en"
  return (localStorage.getItem("banking-app-language") as Language) || "en"
}

export function setStoredLanguage(language: Language): void {
  if (typeof window === "undefined") return
  localStorage.setItem("banking-app-language", language)
}

export function getStoredUser(): { name: string; pin: string } | null {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("banking-app-user")
  return user ? JSON.parse(user) : null
}

export function setStoredUser(user: { name: string; pin: string }): void {
  if (typeof window === "undefined") return
  localStorage.setItem("banking-app-user", JSON.stringify(user))
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("banking-app-user")
}
