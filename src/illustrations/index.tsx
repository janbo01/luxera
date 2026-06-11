import type { FC, SVGProps } from 'react'

type PlateProps = { children: React.ReactNode; vb?: string }

const Plate: FC<PlateProps> = ({ children, vb = '0 0 200 240' }) => (
  <svg
    viewBox={vb}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

// ── Necklaces ──────────────────────────────────────────────────

export const NecklaceA: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate>
    {/* Chain arc */}
    <path d="M30 50 C55 140, 145 140, 170 50" strokeWidth="0.9" />
    {/* Small chain links along arc */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const t = i / 8
      const x = 30 + t * 140
      const y = 50 + Math.sin(Math.PI * t) * 90
      return (
        <circle key={i} cx={x} cy={y} r="1.2" fill="currentColor" stroke="none" opacity="0.25" />
      )
    })}
    {/* Pendant drop */}
    <line x1="100" y1="140" x2="100" y2="158" strokeWidth="0.7" opacity="0.6" />
    {/* Pendant — teardrop diamond */}
    <path
      d="M100 165 L89 176 L100 200 L111 176 Z"
      strokeWidth="0.9"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path d="M89 176 L111 176" strokeWidth="0.6" opacity="0.5" />
    <path d="M100 165 L100 200" strokeWidth="0.5" opacity="0.3" />
    {/* Gem sparkle */}
    <circle cx="100" cy="183" r="3.5" fill="currentColor" stroke="none" opacity="0.6" />
    <ellipse
      cx="97"
      cy="179"
      rx="2"
      ry="1.2"
      fill="white"
      stroke="none"
      opacity="0.45"
      transform="rotate(-20,97,179)"
    />
  </Plate>
)

export const NecklaceB: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate>
    {/* Chain arc — elegant sweep */}
    <path d="M28 46 C55 138, 145 138, 172 46" strokeWidth="0.9" />
    {/* Chain texture dots */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
      const t = i / 10
      const x = 28 + t * 144
      const y = 46 + Math.sin(Math.PI * t) * 92
      return <circle key={i} cx={x} cy={y} r="1" fill="currentColor" stroke="none" opacity="0.2" />
    })}
    {/* Pendant connector */}
    <line x1="100" y1="138" x2="100" y2="154" strokeWidth="0.7" opacity="0.5" />
    <circle cx="100" cy="152" r="3" strokeWidth="0.7" fill="none" />
    {/* Pendant outer ring */}
    <circle cx="100" cy="178" r="26" strokeWidth="1" />
    {/* Pendant inner detail */}
    <circle cx="100" cy="178" r="18" strokeWidth="0.6" opacity="0.4" />
    {/* Central gem */}
    <circle cx="100" cy="178" r="10" fill="currentColor" stroke="none" opacity="0.75" />
    {/* Gem facets */}
    <path
      d="M92 178 L100 170 L108 178 L100 186 Z"
      stroke="currentColor"
      strokeWidth="0.5"
      fill="none"
      opacity="0.35"
    />
    {/* Shine */}
    <ellipse
      cx="96"
      cy="174"
      rx="3"
      ry="2"
      fill="white"
      stroke="none"
      opacity="0.55"
      transform="rotate(-25,96,174)"
    />
  </Plate>
)

export const NecklaceC: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate>
    <path d="M28 44 C55 130, 145 130, 172 44" strokeWidth="0.9" />
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const t = i / 8
      const x = 28 + t * 144
      const y = 44 + Math.sin(Math.PI * t) * 86
      return (
        <circle key={i} cx={x} cy={y} r="1.1" fill="currentColor" stroke="none" opacity="0.22" />
      )
    })}
    <line x1="100" y1="130" x2="100" y2="150" strokeWidth="0.7" opacity="0.5" />
    {/* Marquise pendant */}
    <path
      d="M84 176 Q100 156, 116 176 Q100 196, 84 176 Z"
      strokeWidth="0.9"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <path d="M84 176 Q100 168, 116 176" strokeWidth="0.6" opacity="0.4" />
    <circle cx="100" cy="176" r="5" fill="currentColor" stroke="none" opacity="0.65" />
    <ellipse
      cx="97"
      cy="173"
      rx="2.5"
      ry="1.5"
      fill="white"
      stroke="none"
      opacity="0.5"
      transform="rotate(-20,97,173)"
    />
  </Plate>
)

export const NecklaceD: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate>
    <path d="M26 42 C55 124, 145 124, 174 42" strokeWidth="0.9" />
    {/* Station necklace — gems along chain */}
    {[0, 1, 2, 3, 4].map((i) => {
      const t = i / 4
      const x = 40 + t * 120
      const y = 42 + Math.sin(Math.PI * t) * 82
      const r = i === 2 ? 7 : i === 1 || i === 3 ? 5 : 3.5
      return (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r={r}
            strokeWidth={i === 2 ? 1 : 0.7}
            fill="currentColor"
            fillOpacity={i === 2 ? 0.7 : 0.45}
          />
          {i === 2 && (
            <ellipse
              cx={x - 2}
              cy={y - 2}
              rx="2.5"
              ry="1.5"
              fill="white"
              stroke="none"
              opacity="0.5"
            />
          )}
        </g>
      )
    })}
    <path d="M26 42 C55 124, 145 124, 174 42" strokeWidth="0.9" fill="none" />
  </Plate>
)

// ── Rings ──────────────────────────────────────────────────────

export const RingA: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 220">
    {/* Ring band — two ellipses for 3D effect */}
    <ellipse cx="100" cy="140" rx="50" ry="16" strokeWidth="1.1" />
    <ellipse cx="100" cy="140" rx="42" ry="11" strokeWidth="0.6" opacity="0.35" />
    {/* Band sides */}
    <path d="M50 140 Q50 108, 68 94" strokeWidth="1" />
    <path d="M150 140 Q150 108, 132 94" strokeWidth="1" />
    {/* Setting prongs */}
    <path d="M74 94 L68 80 L78 76" strokeWidth="0.7" opacity="0.6" />
    <path d="M126 94 L132 80 L122 76" strokeWidth="0.7" opacity="0.6" />
    {/* Gem — cushion cut */}
    <path
      d="M78 96 L100 68 L122 96 L116 110 L84 110 Z"
      strokeWidth="0.9"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path d="M84 110 L100 68 L116 110" strokeWidth="0.5" opacity="0.3" />
    <path d="M78 96 L122 96" strokeWidth="0.5" opacity="0.3" />
    <circle cx="100" cy="90" r="7" fill="currentColor" stroke="none" opacity="0.75" />
    <ellipse
      cx="96"
      cy="86"
      rx="3.5"
      ry="2"
      fill="white"
      stroke="none"
      opacity="0.55"
      transform="rotate(-20,96,86)"
    />
  </Plate>
)

export const RingB: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 220">
    {/* Band */}
    <ellipse cx="100" cy="142" rx="52" ry="17" strokeWidth="1.1" />
    <ellipse cx="100" cy="142" rx="44" ry="12" strokeWidth="0.6" opacity="0.35" />
    <path d="M48 142 Q48 110, 72 94" strokeWidth="1" />
    <path d="M152 142 Q152 110, 128 94" strokeWidth="1" />
    {/* Bezel setting */}
    <circle cx="100" cy="82" r="16" strokeWidth="1" />
    <circle
      cx="100"
      cy="82"
      r="11"
      strokeWidth="0.6"
      fill="currentColor"
      fillOpacity="0.08"
      opacity="0.8"
    />
    {/* Gem */}
    <circle cx="100" cy="82" r="7" fill="currentColor" stroke="none" opacity="0.75" />
    <path
      d="M94 82 L100 76 L106 82 L100 88 Z"
      stroke="currentColor"
      strokeWidth="0.4"
      fill="none"
      opacity="0.3"
    />
    <ellipse
      cx="97"
      cy="79"
      rx="3"
      ry="1.8"
      fill="white"
      stroke="none"
      opacity="0.55"
      transform="rotate(-25,97,79)"
    />
  </Plate>
)

export const RingC: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 220">
    {/* Band */}
    <ellipse cx="100" cy="142" rx="50" ry="16" strokeWidth="1.1" />
    <ellipse cx="100" cy="142" rx="42" ry="11" strokeWidth="0.6" opacity="0.35" />
    <path d="M50 142 Q50 110, 66 96" strokeWidth="1" />
    <path d="M150 142 Q150 110, 134 96" strokeWidth="1" />
    {/* Three-stone setting */}
    {[
      { cx: 76, cy: 88, r: 8, main: false },
      { cx: 100, cy: 80, r: 11, main: true },
      { cx: 124, cy: 88, r: 8, main: false },
    ].map((gem, i) => (
      <g key={i}>
        <circle cx={gem.cx} cy={gem.cy} r={gem.r + 2} strokeWidth="0.7" fill="none" opacity="0.5" />
        <circle
          cx={gem.cx}
          cy={gem.cy}
          r={gem.r}
          fill="currentColor"
          stroke="none"
          opacity={gem.main ? 0.75 : 0.55}
        />
        <ellipse
          cx={gem.cx - 2}
          cy={gem.cy - 2}
          rx={gem.main ? 3.5 : 2.5}
          ry={gem.main ? 2 : 1.5}
          fill="white"
          stroke="none"
          opacity="0.5"
          transform={`rotate(-25,${gem.cx - 2},${gem.cy - 2})`}
        />
      </g>
    ))}
  </Plate>
)

export const RingD: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 220">
    {/* Eternity band */}
    <ellipse cx="100" cy="138" rx="52" ry="17" strokeWidth="1.1" />
    <ellipse cx="100" cy="138" rx="44" ry="12" strokeWidth="0.6" opacity="0.35" />
    <path d="M48 138 Q48 106, 60 94" strokeWidth="1" />
    <path d="M152 138 Q152 106, 140 94" strokeWidth="1" />
    {/* Pavé gems along the top of the band */}
    {[68, 80, 92, 100, 108, 120, 132].map((cx, i) => (
      <g key={i}>
        <circle
          cx={cx}
          cy={94 + Math.abs(cx - 100) * 0.08}
          r="4.5"
          strokeWidth="0.6"
          fill="currentColor"
          fillOpacity="0.6"
        />
        <circle
          cx={cx - 1}
          cy={92 + Math.abs(cx - 100) * 0.08}
          r="1.5"
          fill="white"
          stroke="none"
          opacity="0.45"
        />
      </g>
    ))}
  </Plate>
)

// ── Bracelets ─────────────────────────────────────────────────

export const BraceletA: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 200">
    {/* Main bangle */}
    <ellipse cx="100" cy="110" rx="70" ry="36" strokeWidth="1.2" />
    <ellipse cx="100" cy="110" rx="62" ry="30" strokeWidth="0.6" opacity="0.3" />
    {/* Opening clasp */}
    <path d="M100 74 L100 68" strokeWidth="1.2" />
    <circle cx="100" cy="66" r="3.5" strokeWidth="0.8" fill="currentColor" fillOpacity="0.2" />
    {/* Top accent gem */}
    <circle cx="100" cy="74" r="7" strokeWidth="0.9" fill="currentColor" fillOpacity="0.1" />
    <circle cx="100" cy="74" r="4" fill="currentColor" stroke="none" opacity="0.7" />
    <ellipse cx="98" cy="72" rx="2" ry="1.2" fill="white" stroke="none" opacity="0.55" />
    {/* Engraving pattern */}
    {[-40, -20, 0, 20, 40].map((dx, i) => (
      <line
        key={i}
        x1={100 + dx}
        y1={145}
        x2={100 + dx}
        y2={150}
        strokeWidth="0.5"
        opacity="0.25"
        stroke="currentColor"
      />
    ))}
  </Plate>
)

export const BraceletB: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 200">
    {/* Tennis bracelet */}
    <path d="M30 110 Q40 74, 100 68 Q160 74, 170 110" strokeWidth="0.8" opacity="0.5" />
    {/* Individual stones in settings */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const t = i / 8
      const angle = Math.PI * t
      const cx = 100 - Math.cos(angle) * 70
      const cy = 110 - Math.sin(angle) * 42
      const isMain = i === 4
      return (
        <g key={i}>
          <rect
            x={cx - 5}
            y={cy - 5}
            width="10"
            height="10"
            strokeWidth="0.7"
            rx="1"
            fill="currentColor"
            fillOpacity={isMain ? 0.12 : 0.08}
            transform={`rotate(${angle * 57.3 + 90},${cx},${cy})`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={isMain ? 4.5 : 3.5}
            fill="currentColor"
            stroke="none"
            opacity={isMain ? 0.75 : 0.55}
          />
          <circle
            cx={cx - 1}
            cy={cy - 1}
            r={isMain ? 1.8 : 1.3}
            fill="white"
            stroke="none"
            opacity="0.5"
          />
        </g>
      )
    })}
  </Plate>
)

export const BraceletC: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 200">
    {/* Chain bracelet */}
    <ellipse cx="100" cy="108" rx="68" ry="34" strokeWidth="1.1" />
    {/* Oval links */}
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const angle = (i / 8) * Math.PI
      const cx = 100 - Math.cos(angle) * 68
      const cy = 108 - Math.sin(angle) * 34
      return (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="6"
          ry="4"
          strokeWidth="0.7"
          fill="none"
          opacity="0.4"
          transform={`rotate(${angle * 57.3},${cx},${cy})`}
        />
      )
    })}
    {/* Center charm */}
    <path
      d="M88 82 L100 66 L112 82 L108 92 L92 92 Z"
      strokeWidth="0.9"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <circle cx="100" cy="80" r="4" fill="currentColor" stroke="none" opacity="0.7" />
    <ellipse cx="98" cy="78" rx="1.8" ry="1.1" fill="white" stroke="none" opacity="0.5" />
  </Plate>
)

// ── Earrings ──────────────────────────────────────────────────

export const EarringA: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 230">
    {[66, 134].map((cx) => (
      <g key={cx}>
        {/* Ear wire */}
        <path
          d={`M${cx} 44 Q${cx + 12} 36, ${cx + 12} 52 Q${cx + 12} 68, ${cx} 66`}
          strokeWidth="0.9"
          fill="none"
        />
        {/* Post */}
        <circle cx={cx} cy={44} r="3.5" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" />
        {/* Drop connector */}
        <line x1={cx} y1={68} x2={cx} y2={84} strokeWidth="0.7" opacity="0.5" />
        {/* Teardrop drop */}
        <path
          d={`M${cx - 14} 102 Q${cx} 82, ${cx + 14} 102 Q${cx} 130, ${cx - 14} 102 Z`}
          strokeWidth="0.9"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path d={`M${cx - 14} 102 Q${cx} 110, ${cx + 14} 102`} strokeWidth="0.5" opacity="0.35" />
        <circle cx={cx} cy={106} r="5" fill="currentColor" stroke="none" opacity="0.7" />
        <ellipse
          cx={cx - 1.5}
          cy={cx === 66 ? 103 : 103}
          rx="2.2"
          ry="1.4"
          fill="white"
          stroke="none"
          opacity="0.55"
          transform="rotate(-20)"
        />
      </g>
    ))}
  </Plate>
)

export const EarringB: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 230">
    {[66, 134].map((cx) => (
      <g key={cx}>
        {/* Ear wire */}
        <path
          d={`M${cx} 42 Q${cx + 14} 34, ${cx + 14} 52 Q${cx + 14} 70, ${cx} 68`}
          strokeWidth="0.9"
          fill="none"
        />
        <circle cx={cx} cy={42} r="4" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" />
        {/* Long oval drop */}
        <ellipse cx={cx} cy={110} rx="16" ry="28" strokeWidth="1" />
        <ellipse cx={cx} cy={110} rx="10" ry="20" strokeWidth="0.6" opacity="0.3" />
        {/* Center gem */}
        <circle cx={cx} cy={108} r="6" fill="currentColor" stroke="none" opacity="0.72" />
        <path
          d={`M${cx - 5} 108 L${cx} 102 L${cx + 5} 108 L${cx} 114 Z`}
          stroke="currentColor"
          strokeWidth="0.4"
          fill="none"
          opacity="0.3"
        />
        <ellipse
          cx={cx - 2}
          cy={105}
          rx="2.5"
          ry="1.5"
          fill="white"
          stroke="none"
          opacity="0.55"
          transform={`rotate(-20,${cx - 2},105)`}
        />
        {/* Bottom accent */}
        <circle cx={cx} cy={134} r="3" fill="currentColor" stroke="none" opacity="0.4" />
      </g>
    ))}
  </Plate>
)

export const EarringC: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 230">
    {[66, 134].map((cx) => (
      <g key={cx}>
        <path
          d={`M${cx} 42 Q${cx + 12} 34, ${cx + 12} 50 Q${cx + 12} 66, ${cx} 64`}
          strokeWidth="0.9"
          fill="none"
        />
        <circle cx={cx} cy={42} r="4" strokeWidth="0.8" fill="currentColor" fillOpacity="0.15" />
        {/* Cascading drops */}
        {[0, 1, 2].map((j) => {
          const y = 78 + j * 38
          const r = 9 - j * 2
          return (
            <g key={j}>
              {j > 0 && (
                <line x1={cx} y1={y - 10} x2={cx} y2={y - r} strokeWidth="0.6" opacity="0.4" />
              )}
              <circle
                cx={cx}
                cy={y}
                r={r}
                strokeWidth={j === 0 ? 0.9 : 0.7}
                fill="currentColor"
                fillOpacity={0.7 - j * 0.18}
                stroke="none"
              />
              <ellipse
                cx={cx - 2}
                cy={y - 2}
                rx={r * 0.4}
                ry={r * 0.26}
                fill="white"
                stroke="none"
                opacity="0.5"
                transform={`rotate(-20,${cx - 2},${y - 2})`}
              />
            </g>
          )
        })}
      </g>
    ))}
  </Plate>
)

// ── Sets ──────────────────────────────────────────────────────

export const SetA: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 220 220">
    {/* Necklace arc */}
    <path d="M40 46 Q110 128, 180 46" strokeWidth="0.9" />
    <circle cx="110" cy="126" r="8" strokeWidth="0.8" fill="currentColor" fillOpacity="0.1" />
    <circle cx="110" cy="126" r="4.5" fill="currentColor" stroke="none" opacity="0.7" />
    <ellipse cx="108" cy="124" rx="2" ry="1.2" fill="white" stroke="none" opacity="0.55" />
    {/* Earrings suggestion */}
    <g transform="translate(52 170)">
      <circle r="6" strokeWidth="0.8" fill="currentColor" fillOpacity="0.08" />
      <circle r="3" fill="currentColor" stroke="none" opacity="0.65" />
    </g>
    <g transform="translate(168 170)">
      <circle r="6" strokeWidth="0.8" fill="currentColor" fillOpacity="0.08" />
      <circle r="3" fill="currentColor" stroke="none" opacity="0.65" />
    </g>
    {/* Ring arc */}
    <ellipse cx="110" cy="198" rx="18" ry="8" strokeWidth="0.9" />
    <circle cx="110" cy="190" r="5" strokeWidth="0.7" fill="currentColor" fillOpacity="0.15" />
    <circle cx="110" cy="190" r="2.5" fill="currentColor" stroke="none" opacity="0.65" />
  </Plate>
)

export const SetB: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 220 220">
    {/* Bracelet oval */}
    <ellipse cx="60" cy="86" rx="38" ry="22" strokeWidth="1" />
    <ellipse cx="60" cy="86" rx="30" ry="16" strokeWidth="0.6" opacity="0.25" />
    {/* Bracelet gem */}
    <circle cx="60" cy="64" r="7" strokeWidth="0.8" fill="currentColor" fillOpacity="0.12" />
    <circle cx="60" cy="64" r="4" fill="currentColor" stroke="none" opacity="0.7" />
    <ellipse cx="58" cy="62" rx="2" ry="1.3" fill="white" stroke="none" opacity="0.55" />
    {/* Necklace */}
    <path d="M118 48 Q160 118, 202 48" strokeWidth="0.9" />
    {/* Pendant */}
    <path
      d="M160 100 L153 90 L160 78 L167 90 Z"
      strokeWidth="0.9"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <circle cx="160" cy="90" r="4" fill="currentColor" stroke="none" opacity="0.7" />
    <ellipse cx="158" cy="88" rx="2" ry="1.2" fill="white" stroke="none" opacity="0.5" />
    {/* Ring */}
    <ellipse cx="160" cy="178" rx="30" ry="12" strokeWidth="0.9" />
    <circle cx="160" cy="152" r="9" strokeWidth="0.8" fill="currentColor" fillOpacity="0.1" />
    <circle cx="160" cy="152" r="5" fill="currentColor" stroke="none" opacity="0.7" />
    <ellipse cx="158" cy="150" rx="2.5" ry="1.5" fill="white" stroke="none" opacity="0.55" />
  </Plate>
)

// ── Search Empty ───────────────────────────────────────────────

export const SearchEmpty: FC<SVGProps<SVGSVGElement>> = () => (
  <Plate vb="0 0 200 200">
    {/* Magnifying glass circle */}
    <circle cx="88" cy="88" r="44" strokeWidth="2.2" opacity="0.55" />
    {/* Handle */}
    <line
      x1="122"
      y1="122"
      x2="156"
      y2="156"
      strokeWidth="2.8"
      strokeLinecap="round"
      opacity="0.55"
    />
    {/* Small gem inside glass */}
    <polygon points="88,68 102,82 88,96 74,82" strokeWidth="1.4" opacity="0.4" />
    <line x1="74" y1="82" x2="88" y2="68" strokeWidth="1" opacity="0.3" />
    <line x1="88" y1="68" x2="102" y2="82" strokeWidth="1" opacity="0.3" />
    <line x1="74" y1="82" x2="88" y2="96" strokeWidth="1" opacity="0.3" />
    <line x1="102" y1="82" x2="88" y2="96" strokeWidth="1" opacity="0.3" />
    {/* Sparkles */}
    <line x1="44" y1="44" x2="44" y2="52" strokeWidth="1.2" opacity="0.3" />
    <line x1="40" y1="48" x2="48" y2="48" strokeWidth="1.2" opacity="0.3" />
    <line x1="156" y1="44" x2="156" y2="50" strokeWidth="1.2" opacity="0.25" />
    <line x1="153" y1="47" x2="159" y2="47" strokeWidth="1.2" opacity="0.25" />
  </Plate>
)

// ── Registry ──────────────────────────────────────────────────

export const illustrationMap: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  NecklaceA,
  NecklaceB,
  NecklaceC,
  NecklaceD,
  RingA,
  RingB,
  RingC,
  RingD,
  BraceletA,
  BraceletB,
  BraceletC,
  EarringA,
  EarringB,
  EarringC,
  SetA,
  SetB,
  SearchEmpty,
}

export const Illustration: FC<{ name: string; className?: string }> = ({ name, className }) => {
  const Comp = illustrationMap[name]
  if (!Comp) return null
  return <Comp className={className} />
}
