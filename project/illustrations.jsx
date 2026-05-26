/* ============================================================
   Luxera — SVG jewelry illustrations
   Stylized line + filled forms, never photoreal
============================================================ */

const ILLUS_INK = 'currentColor';
const ILLUS_GEM = 'oklch(0.55 0.08 65)';

// ---- Helpers ------------------------------------------------
const Plate = ({ children, vb = '0 0 200 200' }) => (
  <svg viewBox={vb} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1">
    {children}
  </svg>
);

// ---- Necklaces ----------------------------------------------
const NecklaceA = () => (
  <Plate>
    <path d="M30 40 Q100 130 170 40" strokeWidth="0.7" />
    <circle cx="100" cy="130" r="2.5" fill="currentColor" stroke="none" />
    <path d="M92 138 L100 168 L108 138 Z" fill="currentColor" stroke="none" opacity="0.85" />
    <path d="M92 138 L108 138 L100 145 Z" fill="white" stroke="none" opacity="0.55" />
  </Plate>
);

const NecklaceB = () => (
  <Plate>
    <path d="M28 36 Q100 110 172 36" strokeWidth="0.7" />
    <g transform="translate(100 122)">
      <circle r="14" strokeWidth="0.8" />
      <circle r="6" fill="currentColor" stroke="none" opacity="0.9" />
      <circle r="3" fill="white" stroke="none" opacity="0.6" />
    </g>
  </Plate>
);

const NecklaceC = () => (
  <Plate>
    <path d="M30 38 Q100 120 170 38" strokeWidth="0.7" />
    <g transform="translate(100 118)">
      <path d="M0 -16 L13 0 L0 28 L-13 0 Z" strokeWidth="0.8" fill="currentColor" fillOpacity="0.18" />
      <path d="M-13 0 L13 0" strokeWidth="0.6" />
      <path d="M0 -16 L0 28" strokeWidth="0.6" opacity="0.5" />
    </g>
  </Plate>
);

const NecklaceD = () => (
  <Plate>
    <path d="M28 34 Q100 96 172 34" strokeWidth="0.7" />
    {[0, 1, 2, 3, 4].map(i => {
      const t = i / 4;
      const x = 60 + t * 80;
      const y = 70 + Math.sin(Math.PI * t) * 22;
      const r = 3 + (i === 2 ? 4 : 0);
      return <circle key={i} cx={x} cy={y} r={r} strokeWidth="0.7" fill={i === 2 ? 'currentColor' : 'none'} fillOpacity="0.7" />;
    })}
  </Plate>
);

// ---- Rings --------------------------------------------------
const RingA = () => (
  <Plate>
    <ellipse cx="100" cy="120" rx="46" ry="14" strokeWidth="1" />
    <ellipse cx="100" cy="120" rx="38" ry="10" strokeWidth="0.6" opacity="0.5" />
    <path d="M88 80 L100 60 L112 80 L106 92 L94 92 Z" fill="currentColor" stroke="none" opacity="0.85" />
    <path d="M88 80 L112 80 L100 92 Z" fill="white" stroke="none" opacity="0.55" />
    <path d="M88 80 L100 60 L94 92 Z" fill="white" stroke="none" opacity="0.25" />
  </Plate>
);

const RingB = () => (
  <Plate>
    <ellipse cx="100" cy="118" rx="48" ry="16" strokeWidth="1" />
    <ellipse cx="100" cy="118" rx="40" ry="12" strokeWidth="0.6" opacity="0.4" />
    <circle cx="100" cy="78" r="14" strokeWidth="0.8" />
    <circle cx="100" cy="78" r="6" fill="currentColor" stroke="none" opacity="0.85" />
  </Plate>
);

const RingC = () => (
  <Plate>
    <ellipse cx="100" cy="118" rx="46" ry="14" strokeWidth="1" />
    {[-22, 0, 22].map((dx, i) => (
      <g key={i} transform={`translate(${100 + dx} ${94})`}>
        <circle r={i === 1 ? 7 : 5} strokeWidth="0.7" fill="currentColor" fillOpacity={i === 1 ? 0.85 : 0.55} />
      </g>
    ))}
  </Plate>
);

const RingD = () => (
  <Plate>
    <ellipse cx="100" cy="120" rx="44" ry="14" strokeWidth="1" />
    <path d="M70 110 Q100 50 130 110" strokeWidth="0.7" />
    <circle cx="100" cy="78" r="3" fill="currentColor" stroke="none" />
    <circle cx="84" cy="92" r="2" fill="currentColor" stroke="none" />
    <circle cx="116" cy="92" r="2" fill="currentColor" stroke="none" />
  </Plate>
);

// ---- Bracelets ----------------------------------------------
const BraceletA = () => (
  <Plate>
    <ellipse cx="100" cy="100" rx="64" ry="32" strokeWidth="1" />
    <ellipse cx="100" cy="100" rx="50" ry="24" strokeWidth="0.5" opacity="0.4" />
    <circle cx="100" cy="68" r="6" fill="currentColor" stroke="none" />
    <circle cx="100" cy="68" r="2.5" fill="white" opacity="0.6" stroke="none" />
  </Plate>
);

const BraceletB = () => (
  <Plate>
    {[0, 1, 2, 3, 4, 5, 6].map(i => {
      const angle = (i / 7) * Math.PI;
      const cx = 100 + Math.cos(angle - Math.PI) * 64;
      const cy = 100 + Math.sin(angle - Math.PI) * 32;
      return <circle key={i} cx={cx} cy={cy} r={i % 2 === 0 ? 5 : 3} strokeWidth="0.7" fill={i % 2 === 0 ? 'currentColor' : 'none'} fillOpacity="0.7" />;
    })}
    <path d="M36 100 Q100 132 164 100" strokeWidth="0.5" opacity="0.3" />
  </Plate>
);

const BraceletC = () => (
  <Plate>
    <ellipse cx="100" cy="100" rx="62" ry="30" strokeWidth="1" />
    <ellipse cx="100" cy="100" rx="62" ry="30" strokeWidth="0.6" strokeDasharray="3 2" opacity="0.4" />
    <rect x="86" y="62" width="28" height="14" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" />
    <line x1="92" y1="69" x2="108" y2="69" strokeWidth="0.5" />
  </Plate>
);

// ---- Earrings -----------------------------------------------
const EarringA = () => (
  <Plate>
    <g transform="translate(70 60)">
      <circle r="6" strokeWidth="0.8" />
      <path d="M0 6 L0 50" strokeWidth="0.6" />
      <path d="M-10 50 L10 50 L0 80 Z" fill="currentColor" stroke="none" opacity="0.85" />
    </g>
    <g transform="translate(130 60)">
      <circle r="6" strokeWidth="0.8" />
      <path d="M0 6 L0 50" strokeWidth="0.6" />
      <path d="M-10 50 L10 50 L0 80 Z" fill="currentColor" stroke="none" opacity="0.85" />
    </g>
  </Plate>
);

const EarringB = () => (
  <Plate>
    <g transform="translate(70 60)">
      <circle r="6" strokeWidth="0.8" />
      <ellipse cx="0" cy="40" rx="14" ry="22" strokeWidth="0.7" />
      <circle cx="0" cy="40" r="3" fill="currentColor" stroke="none" />
    </g>
    <g transform="translate(130 60)">
      <circle r="6" strokeWidth="0.8" />
      <ellipse cx="0" cy="40" rx="14" ry="22" strokeWidth="0.7" />
      <circle cx="0" cy="40" r="3" fill="currentColor" stroke="none" />
    </g>
  </Plate>
);

const EarringC = () => (
  <Plate>
    {[70, 130].map((cx, k) => (
      <g key={k} transform={`translate(${cx} 50)`}>
        <circle r="5" strokeWidth="0.7" />
        {[0, 1, 2].map(i => (
          <circle key={i} cx="0" cy={20 + i * 18} r={5 - i * 1.2} strokeWidth="0.6" fill="currentColor" fillOpacity={0.7 - i * 0.18} />
        ))}
      </g>
    ))}
  </Plate>
);

// ---- Sets ---------------------------------------------------
const SetA = () => (
  <Plate vb="0 0 220 200">
    <path d="M40 40 Q110 120 180 40" strokeWidth="0.7" />
    <circle cx="110" cy="118" r="6" fill="currentColor" stroke="none" />
    <g transform="translate(60 168)"><circle r="6" strokeWidth="0.8" /></g>
    <g transform="translate(160 168)"><circle r="6" strokeWidth="0.8" /></g>
    <ellipse cx="110" cy="172" rx="14" ry="6" strokeWidth="0.7" />
  </Plate>
);

const SetB = () => (
  <Plate vb="0 0 220 200">
    <ellipse cx="60" cy="80" rx="36" ry="22" strokeWidth="0.8" />
    <circle cx="60" cy="64" r="4" fill="currentColor" stroke="none" />
    <path d="M120 50 Q160 110 200 50" strokeWidth="0.7" />
    <path d="M155 92 L160 80 L165 92 L160 102 Z" fill="currentColor" stroke="none" />
    <ellipse cx="160" cy="160" rx="28" ry="10" strokeWidth="0.8" />
    <circle cx="160" cy="138" r="5" fill="currentColor" stroke="none" />
  </Plate>
);

// ---- Generic SVG glyph icons --------------------------------
const Icon = ({ name, size = 18 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'search':
      return <svg {...props}><circle cx="10.5" cy="10.5" r="7" /><path d="M20 20 L15.5 15.5" /></svg>;
    case 'user':
      return <svg {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21 C4 16.5 8 14 12 14 C16 14 20 16.5 20 21" /></svg>;
    case 'heart':
      return <svg {...props}><path d="M12 21 C5 16 2 12 2 8 A4 4 0 0 1 12 6 A4 4 0 0 1 22 8 C22 12 19 16 12 21 Z" /></svg>;
    case 'bag':
      return <svg {...props}><path d="M5 8 L19 8 L18 21 L6 21 Z" /><path d="M9 8 V6 A3 3 0 0 1 15 6 V8" /></svg>;
    case 'globe':
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M3 12 H21" /><path d="M12 3 C15 7 15 17 12 21 C9 17 9 7 12 3 Z" /></svg>;
    case 'close':
      return <svg {...props}><path d="M6 6 L18 18 M18 6 L6 18" /></svg>;
    case 'plus':
      return <svg {...props}><path d="M12 5 V19 M5 12 H19" /></svg>;
    case 'minus':
      return <svg {...props}><path d="M5 12 H19" /></svg>;
    case 'arrow':
      return <svg {...props}><path d="M19 12 H5 M11 6 L5 12 L11 18" /></svg>;
    case 'spark':
      return <svg {...props}><path d="M12 3 L13.5 10.5 L21 12 L13.5 13.5 L12 21 L10.5 13.5 L3 12 L10.5 10.5 Z" /></svg>;
    default:
      return null;
  }
};

// Export to window
Object.assign(window, {
  NecklaceA, NecklaceB, NecklaceC, NecklaceD,
  RingA, RingB, RingC, RingD,
  BraceletA, BraceletB, BraceletC,
  EarringA, EarringB, EarringC,
  SetA, SetB,
  Icon,
});
