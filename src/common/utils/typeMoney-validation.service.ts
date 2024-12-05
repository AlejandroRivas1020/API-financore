export function parseMoney(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  const cleanedValue = value.replace(/[^\d.-]/g, '');
  const parsedValue = parseFloat(cleanedValue);
  if (isNaN(parsedValue)) {
    throw new Error(`It is not possible to parse '${value}' to a number.`);
  }
  return parsedValue;
}
