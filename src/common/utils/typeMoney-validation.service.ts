export function parseMoney(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  const cleanedValue = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleanedValue);
}
