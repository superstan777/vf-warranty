export const normalizeIncNumber = (incNumber: string) => {
  const match = incNumber.match(/INC(\d+)/i);
  if (!match) return incNumber;

  const num = match[1];
  const padded = num.padStart(5, "0");

  return `INC${padded}`;
};
