/* ============================================================
   Luxera — components-2.jsx
   ProductCard, ProductsSection, Feature, Split, Story, Newsletter, Footer
============================================================ */

// ============================================================
// ProductCard
// ============================================================
function ProductCard({ p, onAdd }) {
  const Main = window[p.illus];
  const Alt  = window[p.illusAlt];
  const cardRef = React.useRef(null);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = cardRef.current.querySelector('.product__media').getBoundingClientRect();
    onAdd(p, rect);
  };

  return (
    <a className="product" ref={cardRef} href="Luxera Product.html">
      <div className="product__media">
        {p.badge && (
          <span className={`product__badge product__badge--${p.badgeKind || 'new'}`}>{p.badge}</span>
        )}
        <button className="product__wish" aria-label="افزودن به علاقه‌مندی"><Icon name="heart" size={14} /></button>
        <div className="product__media-inner product__media-inner--main" style={{color:'var(--ink)'}}>
          <Main />
        </div>
        <div className="product__media-inner product__media-inner--alt" style={{color:'var(--ink-soft)'}}>
          <Alt />
        </div>
        <button className="product__quick" onClick={handleAdd}>
          <Icon name="plus" size={12} />
          افزودن به سبد
        </button>
      </div>
      <div className="product__info">
        <div>
          <div className="product__name">{p.fa}</div>
          <span className="product__name-en">{p.en}</span>
        </div>
        <div className="product__price">
          {formatToman(p.price)}
          {p.oldPrice && <span className="product__price-old">{formatToman(p.oldPrice)}</span>}
        </div>
        <div className="product__meta">
          {p.meta.map((m, i) => <span key={i}>{m}</span>)}
        </div>
      </div>
    </a>
  );
}

// ============================================================
// ProductsSection
// ============================================================
function ProductsSection({ onAdd }) {
  return (
    <section className="section" id="new">
      <div className="section__head">
        <div>
          <span className="section__kicker">ÉDITION PRINTEMPS · ۱۴۰۵</span>
          <h2 className="section__title">
            تازه‌ها <em>this season</em>
          </h2>
        </div>
        <a href="#all" className="btn--link">مشاهده‌ی همه ←</a>
      </div>
      <div className="products">
        {PRODUCTS.map(p => <ProductCard key={p.id} p={p} onAdd={onAdd} />)}
      </div>
    </section>
  );
}

// ============================================================
// Feature (editorial story block)
// ============================================================
function Feature() {
  return (
    <section className="section" style={{paddingTop: 0}}>
      <div className="feature">
        <div className="feature__visual" style={{color:'var(--ink)'}}>
          <RingA />
          <div className="feature__visual-meta">
            <span>ATELIER ۱۴۰۲ — TEHRAN</span>
            <span>FIG. ۰۷</span>
          </div>
        </div>
        <div className="feature__body">
          <span className="section__kicker">ATELIER · کارگاه</span>
          <h3>
            دستِ صنعتگر،
            <br/>
            <em>quiet hands.</em>
          </h3>
          <p>
            هر قطعه‌ی لوکسرا در کارگاه تهران، با دستِ صنعتگرانی
            که سال‌ها در سنت ایرانی پرورش یافته‌اند، ساخته می‌شود.
            میناکاری، فیلیگری و قلم‌زنی، در کنار تکنیک‌های مدرن سوئیسی،
            قطعاتی می‌آفرینند که هم‌زمان ایرانی و جهانی‌اند.
          </p>
          <div className="feature__pillars">
            <div className="feature__pillar">
              <h4>۱۸K</h4>
              <p>طلای خالص با تأییدیه‌ی پلاک رسمی اتحادیه</p>
            </div>
            <div className="feature__pillar">
              <h4>۳۰ سال</h4>
              <p>گارانتی اصالت و خدمات پس از فروش</p>
            </div>
            <div className="feature__pillar">
              <h4>دست‌ساز</h4>
              <p>هر قطعه با امضای صنعتگر و شماره‌ی سریال</p>
            </div>
          </div>
          <button className="btn btn--ghost" style={{alignSelf: 'flex-start'}}>
            بازدید از کارگاه
            <span className="arr"><Icon name="arrow" size={14} /></span>
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Split (two-up callouts)
// ============================================================
function Split() {
  return (
    <section className="section" style={{paddingTop: 0}}>
      <div className="split">
        <a href="#bridal" className="split__card">
          <span className="split__card-meta">N°۰۸ — BRIDAL</span>
          <div className="split__card-svg" style={{color:'var(--ink)'}}>
            <RingB />
          </div>
          <div className="split__card-body">
            <h3>
              <em>Pour le mariage</em>
              عروس
            </h3>
            <span className="btn--link">کشف ←</span>
          </div>
        </a>
        <a href="#mens" className="split__card">
          <span className="split__card-meta" style={{color:'#b8a98a'}}>N°۰۹ — MEN</span>
          <div className="split__card-svg" style={{color:'#ece6da'}}>
            <BraceletC />
          </div>
          <div className="split__card-body">
            <h3 style={{color:'#ece6da'}}>
              <em style={{color:'#d8c8a4'}}>Homme</em>
              مردانه
            </h3>
            <span className="btn--link" style={{color:'#ece6da', borderColor:'#ece6da'}}>کشف ←</span>
          </div>
        </a>
      </div>
    </section>
  );
}

// ============================================================
// Story
// ============================================================
function Story() {
  return (
    <section className="story">
      <div className="story__col">
        <span className="story__col-num">۰۱ / گارانتی اصالت</span>
        <h4>هر قطعه، با پلاک رسمی و شماره‌ی منحصر به فرد همراه است.</h4>
        <p>
          گارانتی ۳۰ ساله‌ی لوکسرا شامل تعمیر، تنظیم سایز، آب‌کاری و
          نظافت تخصصی به‌صورت رایگان است.
        </p>
      </div>
      <div className="story__col">
        <span className="story__col-num">۰۲ / ارسال و بسته‌بندی</span>
        <h4>ارسال امن سراسری در جعبه‌ی هدیه‌ی چوب گردو.</h4>
        <p>
          سفارش‌های بالای ۲٫۰۰۰٫۰۰۰ تومان با ارسال رایگان و بیمه‌ی کامل
          محموله. تحویل در ۲۴ ساعت در تهران.
        </p>
      </div>
      <div className="story__col">
        <span className="story__col-num">۰۳ / اقساط بدون بهره</span>
        <h4>پرداخت تا ۶ ماه از طریق درگاه ایمن لوکسرا.</h4>
        <p>
          خرید جواهر بدون پیش‌پرداخت، بدون چک و بدون ضامن. تنها با
          کارت ملی و یک قرار حضوری.
        </p>
      </div>
    </section>
  );
}

// ============================================================
// Newsletter
// ============================================================
function Newsletter() {
  return (
    <section className="newsletter">
      <h3>
        از کالکشن‌های محدود و نامه‌های <em>atelier</em> مطلع شوید.
      </h3>
      <p>
        هر ماه، یک نامه‌ی کوتاه از کارگاه — درباره‌ی قطعاتِ تازه،
        داستان‌ها، و دعوت‌های خصوصی به نمایشگاه.
      </p>
      <form onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="نشانی ایمیل شما" />
        <button type="submit">عضویت</button>
      </form>
    </section>
  );
}

// ============================================================
// Footer
// ============================================================
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div>
          <h2 className="footer__brand">Luxera</h2>
          <div className="footer__brand-fa">لوکسرا</div>
          <p className="footer__addr">
            تهران، خیابان ولیعصر،<br/>
            بالاتر از پارک ساعی،<br/>
            پلاک ۲۴۸۰، طبقه‌ی همکف.<br/>
            <span style={{fontFamily:'var(--mono)', fontSize:11, letterSpacing:'0.08em'}}>+۹۸ ۲۱ ۸۸ ۰۰ ۰۰ ۰۰</span>
          </p>
        </div>
        <div className="footer__col">
          <h5>فروشگاه</h5>
          <ul>
            <li><a href="#">گردنبند</a></li>
            <li><a href="#">دستبند</a></li>
            <li><a href="#">انگشتر</a></li>
            <li><a href="#">گوشواره</a></li>
            <li><a href="#">ست‌های هدیه</a></li>
            <li><a href="#">عروس</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h5>خدمات</h5>
          <ul>
            <li><a href="#">پیگیری سفارش</a></li>
            <li><a href="#">تنظیم سایز</a></li>
            <li><a href="#">گارانتی اصالت</a></li>
            <li><a href="#">ارسال و بازگشت</a></li>
            <li><a href="#">اقساط بدون بهره</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h5>درباره</h5>
          <ul>
            <li><a href="#">داستان لوکسرا</a></li>
            <li><a href="#">کارگاه و صنعتگران</a></li>
            <li><a href="#">پایداری</a></li>
            <li><a href="#">مطبوعات</a></li>
            <li><a href="#">همکاری با ما</a></li>
          </ul>
        </div>
        <div className="footer__col">
          <h5>تماس</h5>
          <ul>
            <li><a href="#">تماس با ما</a></li>
            <li><a href="#">پشتیبانی واتس‌اپ</a></li>
            <li><a href="#">رزرو وقت حضوری</a></li>
            <li><a href="#">اینستاگرام</a></li>
            <li><a href="#">تلگرام</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© ۱۴۰۵ LUXERA · همه‌ی حقوق محفوظ است</span>
        <span>SAFFRON × NOIR · TEHRAN</span>
      </div>
    </footer>
  );
}

Object.assign(window, { ProductCard, ProductsSection, Feature, Split, Story, Newsletter, Footer });
