/* ============================================================
   Luxera — Product page root
============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "white",
  "density": "balanced"
}/*EDITMODE-END*/;

function ProductApp() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [cart, setCart] = React.useState([]);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [galleryIdx, setGalleryIdx] = React.useState(0);

  React.useEffect(() => {
    document.body.dataset.palette = tweaks.palette;
    document.body.dataset.density = tweaks.density;
  }, [tweaks]);

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
      <nav className="crumb">
        <a href="Luxera Home.html">خانه</a><span>/</span>
        <a href="Luxera Home.html#necklaces">گردنبند</a><span>/</span>
        <a href="#" style={{color:'var(--ink)'}}>{PRODUCT_DETAIL.fa}</a>
      </nav>
      <main>
        <section className="pdp">
          <Gallery active={galleryIdx} onSelect={setGalleryIdx} />
          <InfoPanel onAdd={addToCart} />
        </section>
        <Tabs />
        <Reviews />
        <Related onAdd={addToCart} />
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onInc={inc} onDec={dec} onRemove={remove}
      />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ProductApp />);
