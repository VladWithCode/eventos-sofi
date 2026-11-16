import "server-only";
import { randomBytes, scrypt, scryptSync, timingSafeEqual, type ScryptOptions } from "node:crypto";

// Stored as "scrypt$N$r$p$salt$hash" (base64) so parameters can be raised later
// without invalidating existing hashes.
const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { ...options, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

function encode(salt: Buffer, key: Buffer) {
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return encode(salt, await derive(password, salt, PARAMS));
}

/** Only for the one-time admin bootstrap, which runs inside the synchronous DB init. */
export function hashPasswordSync(password: string): string {
  const salt = randomBytes(16);
  return encode(salt, scryptSync(password.normalize("NFKC"), salt, KEY_LENGTH, PARAMS));
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, keyB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await derive(password, Buffer.from(saltB64, "base64"), { N: Number(n), r: Number(r), p: Number(p) });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Burns comparable CPU time when the email is unknown, so timing does not reveal which emails exist. */
export async function fakeVerify(password: string): Promise<void> {
  await derive(password, randomBytes(16), PARAMS);
}
