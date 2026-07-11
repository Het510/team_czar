// languages.js — 20 supported languages for Jarvis AI Companion
// Each entry: { code, name, nativeName, flag, wakeWords }
// wakeWords: phrases recognized in that language to activate Jarvis

export const LANGUAGES = [
  {
    code: "en-US",
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    wakeWords: ["hey jarvis", "ok jarvis", "jarvis", "hello jarvis"],
  },
  {
    code: "hi-IN",
    name: "Hindi",
    nativeName: "हिन्दी",
    flag: "🇮🇳",
    wakeWords: ["हे जार्विस", "जार्विस", "hey jarvis", "jarvis"],
  },
  {
    code: "es-ES",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    wakeWords: ["hey jarvis", "jarvis", "oye jarvis", "hola jarvis"],
  },
  {
    code: "fr-FR",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    wakeWords: ["hey jarvis", "jarvis", "bonjour jarvis", "salut jarvis"],
  },
  {
    code: "de-DE",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    wakeWords: ["hey jarvis", "jarvis", "hallo jarvis", "guten tag jarvis"],
  },
  {
    code: "pt-BR",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇧🇷",
    wakeWords: ["hey jarvis", "jarvis", "oi jarvis", "olá jarvis"],
  },
  {
    code: "ja-JP",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    wakeWords: ["ジャービス", "hey jarvis", "jarvis", "ねえジャービス"],
  },
  {
    code: "zh-CN",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    wakeWords: ["嘿贾维斯", "贾维斯", "hey jarvis", "jarvis"],
  },
  {
    code: "ko-KR",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    wakeWords: ["헤이 자비스", "자비스", "hey jarvis", "jarvis"],
  },
  {
    code: "ar-SA",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    wakeWords: ["هيا جارفيس", "جارفيس", "hey jarvis", "jarvis"],
  },
  {
    code: "ru-RU",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    wakeWords: ["привет джарвис", "джарвис", "hey jarvis", "jarvis"],
  },
  {
    code: "it-IT",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    wakeWords: ["ehi jarvis", "ciao jarvis", "hey jarvis", "jarvis"],
  },
  {
    code: "nl-NL",
    name: "Dutch",
    nativeName: "Nederlands",
    flag: "🇳🇱",
    wakeWords: ["hey jarvis", "hoi jarvis", "jarvis"],
  },
  {
    code: "pl-PL",
    name: "Polish",
    nativeName: "Polski",
    flag: "🇵🇱",
    wakeWords: ["hej jarvis", "jarvis", "hey jarvis"],
  },
  {
    code: "tr-TR",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    wakeWords: ["hey jarvis", "merhaba jarvis", "jarvis"],
  },
  {
    code: "sv-SE",
    name: "Swedish",
    nativeName: "Svenska",
    flag: "🇸🇪",
    wakeWords: ["hej jarvis", "hey jarvis", "jarvis"],
  },
  {
    code: "da-DK",
    name: "Danish",
    nativeName: "Dansk",
    flag: "🇩🇰",
    wakeWords: ["hey jarvis", "hej jarvis", "jarvis"],
  },
  {
    code: "fi-FI",
    name: "Finnish",
    nativeName: "Suomi",
    flag: "🇫🇮",
    wakeWords: ["hei jarvis", "hey jarvis", "jarvis"],
  },
  {
    code: "id-ID",
    name: "Indonesian",
    nativeName: "Bahasa Indonesia",
    flag: "🇮🇩",
    wakeWords: ["hei jarvis", "hey jarvis", "jarvis", "hai jarvis"],
  },
  {
    code: "bn-IN",
    name: "Bengali",
    nativeName: "বাংলা",
    flag: "🇧🇩",
    wakeWords: ["হেই জার্ভিস", "জার্ভিস", "hey jarvis", "jarvis"],
  },
];

/** Get language config by BCP-47 code */
export function getLang(code) {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

/** Get short display label (e.g. "EN", "HI") */
export function getLangLabel(code) {
  return code.split("-")[0].toUpperCase();
}
