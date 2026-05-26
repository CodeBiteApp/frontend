export type StageInfo = {
  title: string;
  chapter: string; // 'A' ~ 'H'
};

export const STAGE_INFO: Record<number, StageInfo> = {
  // A. Java 기초
  1: { title: "자바의 기초", chapter: "A" },
  2: { title: "Java 프로그래밍이란", chapter: "A" },
  3: { title: "Java SE와 Java EE 차이", chapter: "A" },
  4: { title: "Java와 C/C++ 차이", chapter: "A" },
  5: { title: "Java 언어의 장단점", chapter: "A" },
  6: { title: "접근 제어자", chapter: "A" },
  7: { title: "Java 데이터 타입", chapter: "A" },
  8: { title: "Java SE", chapter: "A" },
  9: { title: "Java EE", chapter: "A" },
  10: { title: "public", chapter: "A" },
  11: { title: "protected", chapter: "A" },
  12: { title: "default", chapter: "A" },
  13: { title: "private", chapter: "A" },
  14: { title: "기본형", chapter: "A" },
  15: { title: "참조형", chapter: "A" },

  // B. 객체지향(OOP)
  16: { title: "객체지향(OOP)", chapter: "B" },
  17: { title: "객체지향이란", chapter: "B" },
  18: { title: "객체와 클래스와 인스턴스", chapter: "B" },
  19: { title: "추상화", chapter: "B" },
  20: { title: "캡슐화", chapter: "B" },
  21: { title: "상속", chapter: "B" },
  22: { title: "다형성", chapter: "B" },
  23: { title: "SOLID", chapter: "B" },
  24: { title: "SRP", chapter: "B" },
  25: { title: "OCP", chapter: "B" },
  26: { title: "LSP", chapter: "B" },
  27: { title: "ISP", chapter: "B" },
  28: { title: "DIP", chapter: "B" },
  29: { title: "객체지향 vs 절차지향", chapter: "B" },
  30: { title: "객체지향 장점과 한계", chapter: "B" },

  // C. 클래스와 키워드
  31: { title: "클래스와 키워드", chapter: "C" },
  32: { title: "static과 non-static", chapter: "C" },
  33: { title: "main 메서드가 static인 이유", chapter: "C" },
  34: { title: "final", chapter: "C" },
  35: { title: "finally", chapter: "C" },
  36: { title: "finalize", chapter: "C" },
  37: { title: "실무 요약", chapter: "C" },

  // D. 타입 심화
  38: { title: "타입 심화", chapter: "D" },
  39: { title: "Wrapper Class", chapter: "D" },
  40: { title: "Byte", chapter: "D" },
  41: { title: "Short", chapter: "D" },
  42: { title: "Integer", chapter: "D" },
  43: { title: "Long", chapter: "D" },
  44: { title: "Float", chapter: "D" },
  45: { title: "Double", chapter: "D" },
  46: { title: "Character", chapter: "D" },
  47: { title: "Boolean", chapter: "D" },
  48: { title: "Boxing과 Unboxing", chapter: "D" },
  49: { title: "AutoBoxing과 AutoUnboxing", chapter: "D" },
  50: { title: "== 와 equals()", chapter: "D" },
  51: { title: "Call by Value", chapter: "D" },

  // E. 컬렉션과 문자열
  52: { title: "컬렉션과 문자열", chapter: "E" },
  53: { title: "List", chapter: "E" },
  54: { title: "ArrayList", chapter: "E" },
  55: { title: "LinkedList", chapter: "E" },
  56: { title: "Vector", chapter: "E" },
  57: { title: "Set", chapter: "E" },
  58: { title: "HashSet", chapter: "E" },
  59: { title: "LinkedHashSet", chapter: "E" },
  60: { title: "TreeSet", chapter: "E" },
  61: { title: "Map", chapter: "E" },
  62: { title: "HashMap", chapter: "E" },
  63: { title: "LinkedHashMap", chapter: "E" },
  64: { title: "TreeMap", chapter: "E" },
  65: { title: "Hashtable", chapter: "E" },
  66: { title: "ConcurrentHashMap", chapter: "E" },
  67: { title: "String과 StringBuilder와 StringBuffer", chapter: "E" },

  // F. JVM / 메모리 / GC
  68: { title: "JVM과 메모리와 GC", chapter: "F" },
  69: { title: "JVM 구조", chapter: "F" },
  70: { title: "GC", chapter: "F" },
  71: { title: "세대 기반 메모리 관리", chapter: "F" },
  72: { title: "Java 9 기본 GC", chapter: "F" },
  73: { title: "G1GC", chapter: "F" },

  // G. 현대 Java 기능
  74: { title: "현대 Java 기능", chapter: "G" },
  75: { title: "Annotation", chapter: "G" },
  76: { title: "Reflection", chapter: "G" },
  77: { title: "Stream", chapter: "G" },
  78: { title: "Lambda", chapter: "G" },
  79: { title: "동기화와 비동기", chapter: "G" },

  // H. 직렬화
  80: { title: "직렬화", chapter: "H" },
  81: { title: "Serialization", chapter: "H" },
  82: { title: "Deserialization", chapter: "H" },
  83: { title: "serialVersionUID", chapter: "H" },
  84: { title: "직렬화 실무 주의", chapter: "H" },
};

export const CHAPTER_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

export const CHAPTER_COLORS = [
  "#58CC02", "#1CB0F6", "#00CD9C", "#FFC800",
  "#FF9600", "#FF4B4B", "#FF86D0", "#CE82FF",
  "#2B70C9", "#FF6B00",
];

export const CHAPTER_NAMES = [
  "Java 기초", "객체지향(OOP)", "클래스와 키워드", "타입 심화",
  "컬렉션과 문자열", "JVM과 메모리와 GC", "현대 Java 기능", "직렬화",
];
export type ChapterLetter = (typeof CHAPTER_LETTERS)[number];

// 챕터별 conceptId 목록 (STAGE_INFO 순서 기준)
export const CHAPTER_STAGES: Record<ChapterLetter, number[]> = (() => {
  const map = {} as Record<ChapterLetter, number[]>;
  for (const letter of CHAPTER_LETTERS) map[letter] = [];
  for (const [id, info] of Object.entries(STAGE_INFO)) {
    map[info.chapter as ChapterLetter].push(Number(id));
  }
  return map;
})();
