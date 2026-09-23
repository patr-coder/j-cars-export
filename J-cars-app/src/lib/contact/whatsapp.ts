// E.164 numbers are at most 15 digits; anything under 8 can't be a full
// international number.
export function whatsappHref(number: string, message?: string): string | null {
  const digits = number.replace(/\D/g, "").replace(/^00/, "");
  if (digits.length < 8 || digits.length > 15) return null;
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
