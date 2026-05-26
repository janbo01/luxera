/* ============================================================
   Luxera — product page components
============================================================ */

// ============================================================
// Stars (with half-star support via clip)
// ============================================================
function Stars({ value = 5, size = 14 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.4 && value - full < 0.85;
  const total = 5;
  return (
    <span className="stars" aria-label={`${value} از ۵`}>
      {Array.from({ length: total }).map((_, i) => {
        const isFull = i < full;
        const isHalf = !isFull && i === full && half;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none">
            <defs>
              <linearGradient id={`sg-${i}-${size}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 3 L14.5 9 L21 9.5 L16 13.5 L17.5 20 L12 16.5 L6.5 20 L8 13.5 L3 9.5 L9.5 9 Z"
              fill={isFull ? 'currentColor' : isHalf ? `url(#sg-${i}-${size})` : 'none'}
              stroke="currentColor" strokeWidth="1" strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}

// ============================================================
// Gallery
// ============================================================
function Gallery({ active, onSelect }) {
  return (
    <div className="gallery">
      <div className="gallery__thumbs">
        {PRODUCT_GALLERY.map((g, i) => {
          const Comp = window[g.illus];
          return (
            <button key={i}
              className={`gallery__thumb gallery__thumb--${g.tone} ${i === active ? 'is-active' : ''}`}
              onClick={() => onSelect(i)}>
              <Comp />
            </button>
          );
        })}
      </div>
      <div className="gallery__main">
        {PRODUCT_GALLERY.map((g, i) => {
          const Comp = window[g.illus];
          return (
            <div key={i} className={`gallery__view gallery__view--${g.tone} ${i === active ? 'is-active' : ''}`}>
              <Comp />
            </div>
          );
        })}
        <button className="gallery__zoom" aria-label="بزرگ‌نمایی"><Icon name="plus" size={14} /></button>
        <span className="gallery__index">
          {toFa(String(active + 1).padStart(2, '0'))} / {toFa(String(PRODUCT_GALLERY.length).padStart(2, '0'))}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Info Panel
// ============================================================
function InfoPanel({ onAdd }) {
  const [color, setColor] = React.useState('gold');
  const [size, setSize] = React.useState('45');
  const [qty, setQty] = React.useState(1);
  const p = PRODUCT_DETAIL;

  const handleAdd = (e) => {
    const rect = document.querySelector('.gallery__main').getBoundingClientRect();
    for (let i = 0; i < qty; i++) onAdd(p, rect);
  };

  return (
    <aside className="info">
      <div className="info__cat">{p.cat} · کالکشن مهتاب</div>
      <h1 className="info__name">{p.fa}</h1>
      <span className="info__name-en">{p.en}</span>

      <div className="info__rating">
        <Stars value={p.rating} size={14} />
        <span style={{fontFamily:'var(--mono)', color:'var(--ink)'}}>{toFa(p.rating.toFixed(1))}</span>
        <span>·</span>
        <a href="#reviews" style={{color:'var(--muted)', borderBottom:'1px solid var(--rule)'}}>
          {toFa(p.reviewCount)} نظر
        </a>
      </div>

      <div className="info__price-row">
        <span className="info__price">{formatToman(p.price)}</span>
        {p.oldPrice && <span className="info__price-old">{formatToman(p.oldPrice)}</span>}
        <div className="info__installment">
          یا <strong>{formatToman(Math.round(p.price / 6))}</strong><br/>
          ماهیانه با اقساط ۶ ماهه
        </div>
      </div>

      <div className="info__group">
        <div className="info__group-label">
          <span>رنگ</span>
          <strong>{COLOR_OPTIONS.find(c => c.id === color)?.fa}</strong>
        </div>
        <div className="swatches">
          {COLOR_OPTIONS.map(c => (
            <button key={c.id}
              className={`swatch swatch--${c.swatch} ${c.id === color ? 'is-active' : ''}`}
              onClick={() => setColor(c.id)}
              aria-label={c.fa} />
          ))}
        </div>
      </div>

      <div className="info__group">
        <div className="info__group-label">
          <span>طول زنجیر</span>
          <a href="#" style={{color:'var(--accent)', fontFamily:'var(--persian)', textTransform:'none', letterSpacing:0, fontSize:12, borderBottom:'1px solid var(--accent)'}}>
            راهنمای سایز ←
          </a>
        </div>
        <div className="sizes">
          {SIZE_OPTIONS.map(s => (
            <button key={s.id}
              className={`size ${s.id === size ? 'is-active' : ''} ${s.disabled ? 'is-disabled' : ''}`}
              disabled={s.disabled}
              onClick={() => !s.disabled && setSize(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="qty-row">
        <div className="qty-stepper">
          <button onClick={() => setQty(Math.max(1, qty - 1))}><Icon name="minus" size={12} /></button>
          <span>{toFa(qty)}</span>
          <button onClick={() => setQty(qty + 1)}><Icon name="plus" size={12} /></button>
        </div>
        <button className="add-btn" onClick={handleAdd}>افزودن به سبد — {formatToman(p.price * qty)}</button>
      </div>
      <button className="wish-btn">
        <Icon name="heart" size={14} />
        افزودن به علاقه‌مندی‌ها
      </button>

      <div className="info__perks">
        <div className="perk">
          <span className="perk__icon"><Icon name="spark" size={20} /></span>
          <div><strong>گارانتی اصالت ۳۰ ساله</strong>پلاک رسمی اتحادیه + شماره سریال</div>
        </div>
        <div className="perk">
          <span className="perk__icon"><Icon name="bag" size={20} /></span>
          <div><strong>ارسال رایگان در ۲۴ ساعت</strong>تهران؛ ۲–۴ روز سراسر ایران</div>
        </div>
        <div className="perk">
          <span className="perk__icon"><Icon name="globe" size={20} /></span>
          <div><strong>بازگشت ۱۴ روزه</strong>بدون پرسش، با بسته‌بندی اصلی</div>
        </div>
      </div>
    </aside>
  );
}

// ============================================================
// Tabs
// ============================================================
function Tabs() {
  const [tab, setTab] = React.useState('desc');
  const p = PRODUCT_DETAIL;
  return (
    <section className="tabs">
      <div className="tabs__head">
        <button className={`tabs__btn ${tab==='desc'?'is-active':''}`}     onClick={() => setTab('desc')}>توضیحات</button>
        <button className={`tabs__btn ${tab==='specs'?'is-active':''}`}    onClick={() => setTab('specs')}>مشخصات</button>
        <button className={`tabs__btn ${tab==='care'?'is-active':''}`}     onClick={() => setTab('care')}>نگهداری</button>
        <button className={`tabs__btn ${tab==='shipping'?'is-active':''}`} onClick={() => setTab('shipping')}>ارسال و بازگشت</button>
      </div>
      {tab === 'desc' && (
        <div className="tabs__panel">
          <div>
            <h3>درباره‌ی این قطعه</h3>
            {p.description.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <div className="tabs__panel-aside">
            <h3 style={{fontSize:14, fontFamily:'var(--mono)', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginBottom:20}}>ویژگی‌های اصلی</h3>
            <ul style={{listStyle:'none', padding:0, margin:0}}>
              {p.highlights.map((h, i) => (
                <li key={i} style={{display:'flex', gap:12, padding:'12px 0', borderTop:'1px solid var(--rule-soft)', fontSize:14, color:'var(--ink)', fontFamily:'var(--persian)'}}>
                  <span style={{color:'var(--accent)'}}>—</span>{h}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {tab === 'specs' && (
        <div className="tabs__panel">
          <div className="tabs__panel-aside" style={{gridColumn:'1 / -1', maxWidth:680}}>
            <dl>
              {p.specs.map(([k, v], i) => (
                <React.Fragment key={i}>
                  <dt>{k}</dt><dd>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>
        </div>
      )}
      {tab === 'care' && (
        <div className="tabs__panel">
          <div>
            <h3>مراقبت از طلای ۱۸</h3>
            <p>برای حفظ درخشش این قطعه، آن را با پارچه‌ی نرم پنبه‌ای یا میکروفایبر تمیز کنید. از تماس با عطر، اسپری مو، کرم دست، و آب کلردار استخر خودداری کنید — این مواد می‌توانند رنگ سطح را در درازمدت کدر کنند.</p>
            <p>هنگام عدم استفاده، گردنبند را در جعبه‌ی هدیه‌ی همراه قرار دهید تا از خراش و گره‌خوردگی زنجیر جلوگیری شود. هر سال یک بار، شعب لوکسرا خدمات تمیزی تخصصی و آب‌کاری مجدد را به‌صورت رایگان ارائه می‌دهند.</p>
          </div>
          <div className="tabs__panel-aside">
            <h3 style={{fontSize:14, fontFamily:'var(--mono)', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginBottom:20}}>یادآوری</h3>
            <ul style={{listStyle:'none', padding:0, margin:0, fontSize:13, color:'var(--ink-soft)', lineHeight:1.95, fontFamily:'var(--persian)'}}>
              <li>در حمام و استخر استفاده نکنید</li>
              <li>قبل از عطر بزنید</li>
              <li>هر ۶ ماه یک بار تمیزی تخصصی</li>
              <li>در جعبه‌ی پارچه‌ای جدا نگهداری کنید</li>
            </ul>
          </div>
        </div>
      )}
      {tab === 'shipping' && (
        <div className="tabs__panel">
          <div>
            <h3>ارسال و بازگشت</h3>
            <p>سفارش‌های شهر تهران در همان روز یا روز بعد توسط پیک ویژه‌ی لوکسرا تحویل داده می‌شود. سراسر ایران با پست پیشتاز در ۲ تا ۴ روز کاری. تمام محموله‌ها بیمه‌ی کامل دارند و با امضای دریافت‌کننده تحویل می‌شوند.</p>
            <p>اگر قطعه برایتان مناسب نبود، تا ۱۴ روز پس از دریافت می‌توانید آن را با بسته‌بندی اصلی و پلاک سالم بازگردانید. هزینه‌ی بازگشت بر عهده‌ی لوکسرا است.</p>
          </div>
          <div className="tabs__panel-aside">
            <h3 style={{fontSize:14, fontFamily:'var(--mono)', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--muted)', marginBottom:20}}>زمان‌بندی</h3>
            <dl>
              <dt>تهران (پیک ویژه)</dt><dd>۲۴ ساعت</dd>
              <dt>کلان‌شهرها</dt><dd>۲ روز کاری</dd>
              <dt>سراسر کشور</dt><dd>۲ تا ۴ روز</dd>
              <dt>هزینه ارسال</dt><dd>رایگان</dd>
              <dt>پنجره بازگشت</dt><dd>۱۴ روز</dd>
            </dl>
          </div>
        </div>
      )}
    </section>
  );
}

// ============================================================
// Reviews
// ============================================================
function Reviews() {
  const [filter, setFilter] = React.useState('همه');
  const filters = ['همه', 'تأیید‌شده', 'با تصویر', 'پنج ستاره', 'انتقادی'];
  const total = REVIEW_BREAKDOWN.reduce((s, r) => s + r.count, 0);
  return (
    <section className="reviews" id="reviews">
      <div className="reviews__inner">
        <div className="reviews__head">
          <div>
            <h2 className="reviews__title">
              تجربه‌ی مشتریان
              <em>What our clients say.</em>
            </h2>
            <div className="reviews__big-rating">
              <strong>{toFa('4.8')}</strong>
              <div>
                <Stars value={4.8} size={16} />
                <div style={{marginTop:4, color:'var(--muted)', fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.1em'}}>
                  بر اساس {toFa(total)} نظر
                </div>
              </div>
            </div>
          </div>
          <div className="reviews__breakdown">
            {REVIEW_BREAKDOWN.map(r => (
              <div key={r.stars} className="breakdown-row">
                <span>{toFa(r.stars)}★</span>
                <div className="bar"><i style={{width: r.pct + '%'}} /></div>
                <span style={{textAlign:'left'}}>{toFa(r.count)}</span>
              </div>
            ))}
          </div>
          <div className="reviews__cta">
            <p>تجربه‌ی خود را با خریداران آینده در میان بگذارید. هر نظر تأیید‌شده با کد منحصر به مشتریِ خریدار همراه است.</p>
            <button className="btn">
              نوشتن نظر
              <span className="arr"><Icon name="arrow" size={14} /></span>
            </button>
          </div>
        </div>

        <div className="reviews__filters">
          <strong>فیلتر</strong>
          {filters.map(f => (
            <button key={f}
              className={`chip ${f === filter ? 'is-active' : ''}`}
              onClick={() => setFilter(f)}>{f}</button>
          ))}
          <span style={{marginRight:'auto', fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)', letterSpacing:'0.1em'}}>
            مرتب: تازه‌ترین ▾
          </span>
        </div>

        <div className="reviews__list">
          {REVIEWS.map((r, i) => (
            <article key={i} className="review">
              <div className="review__head">
                <div className={`review__avatar review__avatar--${r.avatar}`}>
                  {r.name.charAt(0)}
                </div>
                <div className="review__meta">
                  <div className="review__name">
                    {r.name}
                    {r.verified && <span className="review__verified" style={{marginRight:8}}>✓ خریدار تأیید‌شده</span>}
                  </div>
                  <span className="review__date">{r.date}</span>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              <h4 className="review__title">{r.title}</h4>
              <p className="review__body">{r.body}</p>
              <div className="review__attrs">
                {Object.entries(r.attrs).map(([k, v]) => (
                  <span key={k}>{k}: <strong>{v}</strong></span>
                ))}
              </div>
              <div className="review__helpful">
                <button>👍 مفید بود ({toFa(r.helpful)})</button>
                <button>پاسخ ({toFa(r.replies)})</button>
              </div>
            </article>
          ))}
        </div>

        <div className="reviews__more">
          <button className="btn btn--ghost">نمایش {toFa(180)} نظر دیگر</button>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Related
// ============================================================
function Related({ onAdd }) {
  return (
    <section className="related">
      <div className="related__head">
        <div>
          <span className="section__kicker">VOUS AIMEREZ AUSSI</span>
          <h2 className="section__title">شاید <em>دوست داشته باشید</em></h2>
        </div>
        <a href="Luxera Home.html" className="btn--link">بازگشت به فروشگاه ←</a>
      </div>
      <div className="products">
        {PRODUCTS.slice(1, 5).map(p => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
      </div>
    </section>
  );
}

Object.assign(window, { Stars, Gallery, InfoPanel, Tabs, Reviews, Related });
