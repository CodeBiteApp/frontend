// 결과 화면 랜덤을 위한 시간 데이터
export function getDailyCharacterIndex(count: number): number {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  const hash = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return hash % count;
}
