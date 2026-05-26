/* ============================================================
   Luxera — app.jsx (root)
============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "white",
  "density": "balanced",
  "hero": "default"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);

  // Apply tweak attrs to body
  React.useEffect(() => {
    document.body.dataset.palette = tweaks.palette;
    document.body.dataset.density = tweaks.density;
    document.body.dataset.hero = tweaks.hero;
  }, [tweaks]);

  // Page-load entrance is now CSS-only (animation: luxera-rise) — no JS needed.

  const addToCart = (p, fromRect) => {
    setCart((prev) => {
      const ex = prev.find((x) => x.id === p.id);
      if (ex) return prev.map((x) => x.id === p.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...p, qty: 1 }];
    });
    if (fromRect) flyToCart(p, fromRect);
  };
  const inc = (id) => setCart(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x));
  const dec = (id) => setCart(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, x.qty - 1) } : x));
  const remove = (id) => setCart(prev => prev.filter(x => x.id !== id));

  const totalQty = cart.reduce((s, it) => s + it.qty, 0);

  return (
    <React.Fragment>
      <AnnouncementBar />
      <Header cartCount={totalQty} onCartOpen={() => setCartOpen(true)} />
      <main>
        <Hero />
        <CategoriesSection />
        <ProductsSection onAdd={addToCart} />
        <Feature />
        <Split />
        <Story />
        <Newsletter />
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onInc={inc}
        onDec={dec}
        onRemove={remove}
      />
      <LuxeraTweaks tweaks={tweaks} setTweak={setTweak} />
    </React.Fragment>
  );
}

// ============================================================
// Tweaks panel
// ============================================================
// ============================================================
// PalettePicker — custom Tweak control
// ============================================================
const PALETTES = [
  { id: 'white', name: 'Jewel',     colors: ['#f7f2ea', '#5b2a4a', '#d97a2c'] },
  { id: 'jewel', name: 'Bazaar',    colors: ['#f4ece0', '#e6d4b8', '#5b2a4a'] },
  { id: 'ivory', name: 'Ivory',     colors: ['#f5f1ea', '#ece5d6', '#1a1a1a'] },
  { id: 'noir',  name: 'Noir & Or', colors: ['#0e0e10', '#232328', '#d8c8a4'] },
  { id: 'rose',  name: 'Persian',   colors: ['#f7efe8', '#ecd9c8', '#2c1810'] },
];

function PalettePicker({ value, onChange }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, padding:'4px 0'}}>
      {PALETTES.map((p) => {
        const on = p.id === value;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={on}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              border: on ? '1px solid var(--ink, #111)' : '1px solid #d6d2c8',
              background: on ? '#f1ede5' : 'transparent',
              fontSize: 11,
              letterSpacing: '0.06em',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all .2s',
              color: '#111',
            }}
          >
            <span style={{display:'flex', flexShrink:0}}>
              {p.colors.map((c, i) => (
                <span key={i} style={{
                  width: 14, height: 14,
                  background: c,
                  marginInlineStart: i === 0 ? 0 : -4,
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: '50%',
                }} />
              ))}
            </span>
            <span>{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}

function LuxeraTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Palette">
        <PalettePicker
          value={tweaks.palette}
          onChange={(v) => setTweak('palette', v)}
        />
      </TweakSection>
      <TweakSection title="Density">
        <TweakRadio
          label="Density"
          value={tweaks.density}
          onChange={(v) => setTweak('density', v)}
          options={[
            { value: 'editorial', label: 'Editorial' },
            { value: 'balanced',  label: 'Balanced' },
            { value: 'shoppy',    label: 'Shoppy' },
          ]}
        />
      </TweakSection>
      <TweakSection title="Hero">
        <TweakRadio
          label="Layout"
          value={tweaks.hero}
          onChange={(v) => setTweak('hero', v)}
          options={[
            { value: 'default', label: 'Stacked' },
            { value: 'split',   label: 'Split' },
            { value: 'full',    label: 'Full' },
          ]}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
