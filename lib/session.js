import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { CFG } from './config';

const COOKIE = 'hr_session';
const MAX_AGE = 60 * 60 * 8; // 8 hours
const key = () => new TextEncoder().encode(CFG.secret);

export async function createSession(user) {
  const token = await new SignJWT({
    uid: user.id, email: user.email, name: user.full_name, role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  cookies().set(COOKIE, token, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: MAX_AGE,
  });
}

export async function getSession() {
  const c = cookies().get(COOKIE);
  if (!c || !CFG.secret) return null;
  try {
    const { payload } = await jwtVerify(c.value, key());
    return payload;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set(COOKIE, '', { httpOnly: true, secure: true, path: '/', maxAge: 0 });
}
