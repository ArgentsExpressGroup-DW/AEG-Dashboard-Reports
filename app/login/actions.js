'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../../lib/db';
import { createSession } from '../../lib/session';
import { missingEnv } from '../../lib/config';

export async function login(formData) {
  if (missingEnv().length) {
    return { error: 'This dashboard is not configured yet. Contact HR Operations.' };
  }

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const nextRaw = String(formData.get('next') || '/');
  const next = nextRaw.startsWith('/') ? nextRaw : '/';   // open-redirect guard

  if (!email || !password) return { error: 'Enter your email and password.' };

  const s = db();
  const { data, error } = await s.rpc('verify_app_user', {
    p_email: email,
    p_password: password,
  });

  const ok = !error && Array.isArray(data) && data.length === 1;
  const h = headers();
  await s.from('app_login_audit').insert({
    email,
    succeeded: ok,
    ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    user_agent: h.get('user-agent'),
  });

  if (!ok) {
    if (error) return { error: error.message };
    return { error: "That email and password combination wasn't recognized." };
  }

  await s.from('app_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data[0].id);
  await createSession(data[0]);
  redirect(next);
}
