export function getDailyCharacterIndex(count: number): number {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const hash = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % count;
}
