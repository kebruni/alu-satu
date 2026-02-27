import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { mockProducts } from "../../data/mockProducts";
import styles from "./Product.module.css";
import formatPrice from "../../utils/formatPrice";
import {
  addToCart as apiAddToCart,
  getListedProductById,
  getProductReviews,
  createProductReview,
  deleteProductReview,
} from "../../api/users.api";
import { useToast } from "../../components/Toast/Toast";
import { useAuth, useCart, useFavorites } from "../../store";

const getFallbackImage = (seed) => `https://source.unsplash.com/featured/900x900?product&sig=${encodeURIComponent(String(seed ?? "0"))}`;
const isNumericId = (value) => /^[0-9]+$/.test(String(value ?? "").trim());

const findListedProductById = (routeId) => {
  try {
    const raw = localStorage.getItem("listedProducts") || "[]";
    const listed = JSON.parse(raw);
    const rid = String(routeId);
    return (listed || []).find((p) => String(p?.id) === rid) || null;
  } catch {
    return null;
  }
};
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const StarRating = ({ rating, onRate, interactive = false, size = 20 }) => (
  <div className={styles.stars} style={{ fontSize: size }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`${styles.star} ${star <= rating ? styles.starFilled : ""}`}
        onClick={interactive ? () => onRate(star) : undefined}
        style={interactive ? { cursor: "pointer" } : undefined}
      >
        ★
      </span>
    ))}
  </div>
);

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [images, setImages] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imageTransition, setImageTransition] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);
  const toast = useToast();
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const checkFav = useCallback(() => {
    setIsFav(isFavorite(id));
  }, [id, isFavorite]);

  const toggleFav = () => {
    if (!user) {
      toast("Войдите в аккаунт, чтобы добавить в избранное", "error");
      return;
    }
    const added = toggleFavorite(product?.id ?? id);
    setIsFav(added);
    if (added) toast("Добавлено в избранное", "success");
    else toast("Удалено из избранного", "info");
  };
  const switchImage = (newIndex) => {
    if (newIndex === selectedImage || images.length <= 1) return;
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImage(newIndex);
      setTimeout(() => setImageTransition(false), 20);
    }, 200);
  };

  const prevImage = () => switchImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
  const nextImage = () => switchImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
  const handleMouseMove = (e) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };
  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url }); } catch {  }
    } else {
      try { await navigator.clipboard.writeText(url); toast("Ссылка скопирована!", "success"); } catch {  }
    }
  };
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const listed = findListedProductById(id);
        if (listed) {
          const listedImages = Array.isArray(listed.images) && listed.images.length
            ? listed.images
            : [listed.image].filter(Boolean);
          if (mounted) { setProduct(listed); setImages(listedImages); }
          return;
        }

        if (!isNumericId(id)) {
          try {
            const listedApi = await getListedProductById(id);
            const listedApiImages = Array.isArray(listedApi?.images) && listedApi.images.length
              ? listedApi.images
              : [listedApi?.image].filter(Boolean);
            if (mounted) {
              setProduct(listedApi);
              setImages(listedApiImages);
            }
            return;
          } catch {
            if (mounted) setProduct(null);
            return;
          }
        }

        const fromMock = mockProducts.find((x) => String(x.id) === String(id));
        if (fromMock) {
          if (mounted) { setProduct(fromMock); setImages([fromMock.image].filter(Boolean)); }
          return;
        }

        const res = await fetch(`https://dummyjson.com/products/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        const allImages = [
          ...(data.images || []),
          data.thumbnail,
        ].filter(Boolean);
        const p = {
          id: data.id,
          name: data.title || data.name,
          price: data.price ?? 0,
          image: allImages[0] || "",
          images: allImages,
          description: data.description || "",
          category: data.category || "",
          brand: data.brand || "",
          rating: data.rating || 0,
          stock: data.stock ?? null,
          tags: data.tags || [],
        };
        if (mounted) { setProduct(p); setImages(allImages); }
      } catch {
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);
  useEffect(() => {
    let mounted = true;
    const loadReviews = async () => {
      try {
        const items = await getProductReviews(id);
        if (mounted) setReviews(Array.isArray(items) ? items : []);
      } catch {
        if (mounted) setReviews([]);
      }
    };
    loadReviews();
    checkFav();
    const h = () => checkFav();
    window.addEventListener("favorites:changed", h);
    return () => {
      mounted = false;
      window.removeEventListener("favorites:changed", h);
    };
  }, [id, checkFav]);
  const submitReview = async () => {
    if (!reviewText.trim()) { toast("Напишите текст отзыва", "error"); return; }
    const author = reviewAuthor.trim() || user?.username || "Аноним";
    try {
      const review = await createProductReview(id, {
        author,
        rating: reviewRating,
        text: reviewText.trim(),
      });
      setReviews((prev) => [review, ...prev]);
      setReviewText("");
      setReviewRating(5);
      setReviewAuthor("");
      setShowReviewForm(false);
    } catch {
      toast("Failed to publish review", "error");
      return;
    }
    toast("Отзыв опубликован!", "success");
  };

  const deleteReview = async (rid) => {
    await deleteProductReview(id, rid);
    setReviews((prev) => prev.filter((r) => String(r.id) !== String(rid)));
    toast("Отзыв удалён", "info");
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product?.rating ? Number(product.rating).toFixed(1) : null;

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }); }
    catch { return "—"; }
  };
  if (loading) return (
    <div className={`${styles.productPage} page-transition`}>
      <div className={styles.skeleton}>
        <div className={styles.skeletonImg}>
          <div className={styles.skeletonPulse} />
        </div>
        <div className={styles.skeletonInfo}>
          <div className={styles.skeletonLine} style={{ width: "40%", height: "14px" }} />
          <div className={styles.skeletonLine} style={{ width: "75%", height: "28px" }} />
          <div className={styles.skeletonLine} style={{ width: "30%", height: "16px" }} />
          <div className={styles.skeletonLine} style={{ width: "45%", height: "32px" }} />
          <div className={styles.skeletonLine} style={{ width: "100%", height: "14px" }} />
          <div className={styles.skeletonLine} style={{ width: "90%", height: "14px" }} />
          <div className={styles.skeletonLine} style={{ width: "60%", height: "48px", marginTop: "auto" }} />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className={`${styles.productPage} page-transition`}>
      <div className={styles.notFound}>
        <div className={styles.notFoundIcon}>🔍</div>
        <h2>Товар не найден</h2>
        <p>Возможно, он был удалён или ссылка неверна.</p>
        <Link to="/catalog" className={styles.backBtn}>← Вернуться в каталог</Link>
      </div>
    </div>
  );

  return (
    <div className={`${styles.productPage} page-transition`}>
      <nav className={styles.breadcrumb}>
        <Link to="/">Главная</Link>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        <Link to="/catalog">Каталог</Link>
        {product.category && (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            <span className={styles.breadcrumbCurrent}>{product.category}</span>
          </>
        )}
      </nav>
      <div className={styles.topSection}>
        <div className={styles.gallery}>
          <div
            className={`${styles.mainImage} ${isZoomed ? styles.mainImageZoomed : ""}`}
            ref={imgRef}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={images[selectedImage] || product.image}
              alt={product.name}
              className={imageTransition ? styles.imageFadeOut : styles.imageFadeIn}
              style={isZoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
              onError={(e) => {
                const el = e.currentTarget;
                if (el.dataset.fallbackApplied) return;
                el.dataset.fallbackApplied = "1";
                el.src = getFallbackImage(product.id);
              }}
            />
            <button className={`${styles.favBtn} ${isFav ? styles.favActive : ""}`} onClick={toggleFav}>
              {isFav ? "♥" : "♡"}
            </button>
            {images.length > 1 && (
              <>
                <button className={`${styles.galleryArrow} ${styles.galleryArrowLeft}`} onClick={prevImage}>‹</button>
                <button className={`${styles.galleryArrow} ${styles.galleryArrowRight}`} onClick={nextImage}>›</button>
                <div className={styles.imageCounter}>{selectedImage + 1} / {images.length}</div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbs}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ""}`}
                  onClick={() => switchImage(i)}
                />
              ))}
            </div>
          )}
        </div>
        <div className={styles.info}>
          {product.brand && <span className={styles.brand}>{product.brand}</span>}
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.ratingRow}>
            {avgRating && (
              <>
                <StarRating rating={Math.round(Number(avgRating))} size={18} />
                <span className={styles.ratingValue}>{avgRating}</span>
              </>
            )}
            <span className={styles.reviewCount}>
              {reviews.length} {reviews.length === 1 ? "отзыв" : reviews.length < 5 ? "отзыва" : "отзывов"}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.stock != null && (
              <span className={`${styles.stock} ${product.stock > 0 ? styles.inStock : styles.outOfStock}`}>
                <span className={styles.stockDot} />
                {product.stock > 0 ? `В наличии (${product.stock})` : "Нет в наличии"}
              </span>
            )}
          </div>

          {product.description && <p className={styles.desc}>{product.description}</p>}

          {product.tags && product.tags.length > 0 && (
            <div className={styles.tags}>
              {product.tags.map((tag, i) => (
                <span key={i} className={styles.tag}>#{tag}</span>
              ))}
            </div>
          )}

          <div className={styles.divider} />
          <div className={styles.purchaseArea}>
            <div className={styles.quantityRow}>
              <span className={styles.quantityLabel}>Количество:</span>
              <div className={styles.quantitySelector}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >−</button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity((q) => product.stock != null ? Math.min(product.stock, q + 1) : q + 1)}
                  disabled={product.stock != null && quantity >= product.stock}
                >+</button>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.addBtn}
                onClick={async () => {
                  if (!user) {
                    toast("Войдите в аккаунт, чтобы добавить в корзину", "error");
                    return;
                  }
                  try {
                    addToCart(product, quantity);
                    try { if (token) { await apiAddToCart({ productId: product.id, name: product.name, price: product.price, image: product.image, quantity }); } } catch {  }
                    toast(`${product.name} добавлен в корзину!`, "success");
                    setQuantity(1);
                  } catch (err) { console.error("Failed to add to cart", err); }
                }}
              >
                Добавить в корзину
              </button>
              <button className={`${styles.favBtnLarge} ${isFav ? styles.favActive : ""}`} onClick={toggleFav}>
                {isFav ? "♥" : "♡"}
              </button>
              <button className={styles.shareBtn} onClick={handleShare} title="Поделиться">
                Поделиться
              </button>
            </div>
          </div>
          <div className={styles.trustBadges}>
            <div className={styles.trustBadge}>
              <span>Быстрая доставка</span>
            </div>
            <div className={styles.trustBadge}>
              <span>Безопасная оплата</span>
            </div>
            <div className={styles.trustBadge}>
              <span>14 дней на возврат</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.tabsSection}>
        <div className={styles.tabsHeader}>
          <button
            className={`${styles.tab} ${activeTab === "description" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("description")}
          >
            Описание
          </button>
          <button
            className={`${styles.tab} ${activeTab === "reviews" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            Отзывы{reviews.length > 0 && <span className={styles.tabBadge}>{reviews.length}</span>}
          </button>
        </div>
        {activeTab === "description" && (
          <div className={styles.tabContent}>
            {product.description ? (
              <div className={styles.descriptionFull}>
                <p>{product.description}</p>
                {product.brand && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Бренд</span>
                    <span className={styles.specValue}>{product.brand}</span>
                  </div>
                )}
                {product.category && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Категория</span>
                    <span className={styles.specValue}>{product.category}</span>
                  </div>
                )}
                {product.stock != null && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>На складе</span>
                    <span className={styles.specValue}>{product.stock} шт.</span>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Теги</span>
                    <span className={styles.specValue}>{product.tags.join(", ")}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.noContent}>Описание недоступно для данного товара.</p>
            )}
          </div>
        )}
        {activeTab === "reviews" && (
          <div className={styles.tabContent}>
            <div className={styles.reviewsHeader}>
              <h3>Отзывы покупателей</h3>
              <button
                className={styles.writeReviewBtn}
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? "Отмена" : "Написать отзыв"}
              </button>
            </div>
            {reviews.length > 0 && (
              <div className={styles.reviewsSummary}>
                <div className={styles.summaryBig}>
                  <span className={styles.summaryScore}>{avgRating}</span>
                  <StarRating rating={Math.round(Number(avgRating))} size={22} />
                  <span className={styles.summaryCount}>на основе {reviews.length} {reviews.length === 1 ? "отзыва" : "отзывов"}</span>
                </div>
                <div className={styles.summaryBars}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                    return (
                      <div key={star} className={styles.barRow}>
                        <span className={styles.barLabel}>{star} ★</span>
                        <div className={styles.barTrack}><div className={styles.barFill} style={{ width: `${pct}%` }} /></div>
                        <span className={styles.barCount}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {showReviewForm && (
              <div className={styles.reviewForm}>
                <div className={styles.formRow}>
                  <label>Ваше имя</label>
                  <input
                    type="text"
                    placeholder="Имя или никнейм"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    className={styles.reviewInput}
                  />
                </div>
                <div className={styles.formRow}>
                  <label>Оценка</label>
                  <StarRating rating={reviewRating} onRate={setReviewRating} interactive size={28} />
                </div>
                <div className={styles.formRow}>
                  <label>Отзыв</label>
                  <textarea
                    placeholder="Поделитесь впечатлениями о товаре..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className={styles.reviewTextarea}
                    rows={4}
                  />
                </div>
                <button className={styles.submitReviewBtn} onClick={submitReview}>
                  Опубликовать отзыв
                </button>
              </div>
            )}
            {reviews.length === 0 ? (
              <div className={styles.noReviews}>
                <p>Пока нет отзывов. Будьте первым!</p>
              </div>
            ) : (
              <div className={styles.reviewsList}>
                {reviews.map((r, idx) => (
                  <div key={r.id} className={styles.reviewCard} style={{ animationDelay: `${idx * 0.06}s` }}>
                    <div className={styles.reviewTop}>
                      <span className={styles.reviewAvatar}>{r.avatar || getInitials(r.author)}</span>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewAuthor}>{r.author}</span>
                        <span className={styles.reviewDate}>{fmtDate(r.date)}</span>
                      </div>
                      <StarRating rating={r.rating} size={14} />
                      <button className={styles.reviewDelete} onClick={() => deleteReview(r.id)} title="Удалить">✕</button>
                    </div>
                    <p className={styles.reviewText}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;
