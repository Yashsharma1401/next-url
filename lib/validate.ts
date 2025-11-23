// lib/validate.ts
export const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export function isValidCode(code: string) {
  return CODE_REGEX.test(code);
}

export function isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
