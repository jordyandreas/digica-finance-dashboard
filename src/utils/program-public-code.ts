import { randomBytes } from "crypto";

const PUBLIC_CODE_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const PUBLIC_CODE_LENGTH = 6;

export function generatePublicCode(length = PUBLIC_CODE_LENGTH): string {
  const bytes = randomBytes(length);
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += PUBLIC_CODE_ALPHABET[bytes[index] % PUBLIC_CODE_ALPHABET.length];
  }

  return code;
}
