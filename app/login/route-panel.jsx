// Pure SVG + CSS. No JS, no randomness, so server and client markup match
// exactly. Metaphor kept from the reference implementation (a freight network)
// but the geometry is redrawn: here the lanes converge on a single spine, which
// reads as a pay scale rather than a route map.
const LANES = [
  { d: 'M-40 250 C 130 250, 190 430, 330 430 S 520 400, 660 400', cls: 'aeg-lane' },
  { d: 'M-40 430 C 120 430, 200 450, 330 450 S 540 470, 660 470', cls: 'aeg-lane aeg-lane-2' },
  { d: 'M-40 620 C 140 620, 190 480, 330 480 S 500 530, 660 530', cls: 'aeg-lane aeg-lane-3' },
  { d: 'M-40 790 C 150 790, 200 520, 330 520 S 510 610, 660 610', cls: 'aeg-lane aeg-lane-4' },
];

const HUBS = [
  { x: 330, y: 430, r: 5.5, delay: '0s' },
  { x: 330, y: 450, r: 4, delay: '0.8s' },
  { x: 330, y: 480, r: 4.5, delay: '1.6s' },
  { x: 330, y: 520, r: 4, delay: '2.4s' },
  { x: 560, y: 470, r: 5, delay: '3.2s' },
];

const SWEEPS = [110, 260, 410, 560, 710, 860];

export default function RoutePanel() {
  return (
    <svg
      viewBox="0 0 600 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 select-none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="aeg-dots" width="34" height="34" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="1.1" fill="#ffffff" opacity="0.07" />
        </pattern>
        <radialGradient id="aeg-glow">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="600" height="900" fill="url(#aeg-dots)" />

      {SWEEPS.map((y) => (
        <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
      ))}

      {LANES.map((l, i) => (
        <g key={i}>
          <path d={l.d} fill="none" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="1.25" />
          <path
            className={l.cls}
            d={l.d}
            fill="none"
            stroke={i % 2 === 0 ? '#C4123F' : '#ffffff'}
            strokeOpacity={i % 2 === 0 ? 0.62 : 0.28}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="4 12"
          />
          <circle className="aeg-ship" r="2.6" fill="#ffffff">
            <animateMotion dur={`${13 + i * 2}s`} begin={`${i * 1.7}s`} repeatCount="indefinite" path={l.d} />
          </circle>
          <circle className="aeg-ship" r="9" fill="url(#aeg-glow)">
            <animateMotion dur={`${13 + i * 2}s`} begin={`${i * 1.7}s`} repeatCount="indefinite" path={l.d} />
          </circle>
        </g>
      ))}

      {HUBS.map((h, i) => (
        <g key={i}>
          <circle
            className="aeg-ring"
            cx={h.x}
            cy={h.y}
            r="6"
            fill="none"
            stroke="#C4123F"
            strokeWidth="1"
            style={{ animationDelay: h.delay }}
          />
          <circle cx={h.x} cy={h.y} r={h.r + 2.5} fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1" />
          <circle cx={h.x} cy={h.y} r={h.r} fill="#C4123F" fillOpacity="0.9" />
        </g>
      ))}
    </svg>
  );
}
