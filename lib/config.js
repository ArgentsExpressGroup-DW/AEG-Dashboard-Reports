export const CFG = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_SECRET_KEY,
  secret: process.env.SESSION_SECRET,
};
export function missingEnv() {
  const m = [];
  if (!CFG.url) m.push('SUPABASE_URL');
  if (!CFG.key) m.push('SUPABASE_SECRET_KEY');
  if (!CFG.secret) m.push('SESSION_SECRET');
  return m;
}
