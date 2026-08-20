import './globals.css';

export const metadata = {
  title: 'HR Operations & Department Structure — Argents Express Group',
  description: 'Salary scale, department structure and pay-band alignment.',
  robots: 'noindex, nofollow',
};

// Applied before paint so there is no light flash on a dark-mode load.
// Key is shared with other AEG dashboards on this origin.
const THEME_SCRIPT = `try{var t=localStorage.getItem('aeg-theme');
if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){
document.documentElement.classList.add('dark');}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
