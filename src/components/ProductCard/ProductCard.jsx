import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";
import formatPrice from "../../utils/formatPrice";
import { useToast } from "../Toast/Toast";
import { useAuth, useCart, useFavorites } from "../../store";

const getCategoryFallbackImage = (category, seed) => {
  const c = (category || "").toLowerCase();
  const sig = encodeURIComponent(String(seed ?? "0"));

  if (c.includes("телефон")) return `https://source.unsplash.com/featured/800x800?phone&sig=${sig}`;
  if (c.includes("ноут")) return `https://source.unsplash.com/featured/800x800?laptop&sig=${sig}`;
  if (c.includes("электрон")) return `https://source.unsplash.com/featured/800x800?electronics&sig=${sig}`;
  if (c.includes("одеж")) return `https://source.unsplash.com/featured/800x800?clothing&sig=${sig}`;
  if (c.includes("обув")) return `https://source.unsplash.com/featured/800x800?shoes&sig=${sig}`;
  if (c.includes("час")) return `https://source.unsplash.com/featured/800x800?watch&sig=${sig}`;
  if (c.includes("сум")) return `https://source.unsplash.com/featured/800x800?bag&sig=${sig}`;
  if (c.includes("аксесс")) return `https://source.unsplash.com/featured/800x800?accessories&sig=${sig}`;
  if (c.includes("дом") || c.includes("сад")) return `https://source.unsplash.com/featured/800x800?home&sig=${sig}`;

  return `https://source.unsplash.com/featured/800x800?product&sig=${sig}`;
};

const ProductCard = ({ product }) => {
  const toast = useToast();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isBannedImage =
    typeof product?.image === "string" &&
    (product.image.includes("/sparkle.png") || /placeholder\.com/.test(product.image));

  const productIdKey = String(product?.id);

  const [isHidden, setIsHidden] = useState(() => !product?.image || isBannedImage);
  const [isFav, setIsFav] = useState(() => isFavorite(product?.id));

  const [imgSrc, setImgSrc] = useState(() => (isBannedImage ? "" : product.image));
  const [, setImgAttempt] = useState(0);

  const handleToggleFavorite = () => {
    if (!user) {
      toast("Войдите в аккаунт, чтобы добавить в избранное", "error");
      return;
    }
    const added = toggleFavorite(product.id);
    setIsFav(added);
    if (added) {
      toast("Добавлено в избранное", "success");
    } else {
      toast("Удалено из избранного", "info");
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast("Войдите в аккаунт, чтобы добавить в корзину", "error");
      return;
    }
    addToCart(product, 1);
    toast(`${product.name} добавлен в корзину!`, "success");
  };

  const handleImageError = () => {
    const apiImages = Array.isArray(product?.images) ? product.images : [];
    const fallbacks = [
      ...apiImages.filter((u) => typeof u === "string" && u.trim() && u.trim() !== imgSrc),
      getCategoryFallbackImage(product.category, `${product.id}-1`),
      getCategoryFallbackImage(product.category, `${product.id}-2`),
    ];

    setImgAttempt((attempt) => {
      if (attempt >= fallbacks.length) {
        setIsHidden(true);
        return attempt;
      }
      setImgSrc(fallbacks[attempt]);
      return attempt + 1;
    });
  };

  if (isHidden) return null;

  const discountPercent = product.discountPercentage ? Math.round(product.discountPercentage) : 0;
  const isNew = product.id && (typeof product.id === "number" ? product.id % 7 === 0 : false);

  return (
    <div className={`${styles.card} card-reveal`}>
      <div className={styles.imageWrap}>
        <div className={styles.badges}>
          {discountPercent > 0 && (
            <span className={styles.badgeSale}>-{discountPercent}%</span>
          )}
          {isNew && <span className={styles.badgeNew}>New</span>}
        </div>

        <img
          src={imgSrc}
          alt={product.name}
          className={styles.image}
          loading="lazy"
          onError={handleImageError}
        />
        <div className={styles.overlay}>
          <button
            type="button"
            aria-pressed={isFav}
            className={`${styles.overlayFav} ${isFav ? styles.overlayFavActive : ""}`}
            onClick={handleToggleFavorite}
            title="Избранное"
          >
            {isFav ? "★" : "☆"}
          </button>

          <Link to={`/product/${product.id}`} className={styles.overlayView} title="Посмотреть">
            Просмотреть
          </Link>

          <button
            type="button"
            className={styles.overlayCart}
            onClick={handleAddToCart}
            title="В корзину"
          >
            В корзину
          </button>
        </div>
      </div>

      <div className={styles.details}>
        <h3 className={styles.name}>{product.name}</h3>
        {product.description && (
          <p className={styles.preview}>
            {product.description.slice(0, 80)}
            {product.description.length > 80 ? "…" : ""}
          </p>
        )}
        <p className={styles.price}>{formatPrice(product.price)}</p>
      </div>

      <div className={styles.actionsTop}>
        <button
          type="button"
          aria-pressed={isFav}
          className={`${styles.favBtn} ${isFav ? styles.favActive : ""}`}
          onClick={handleToggleFavorite}
          title="Добавить в избранное"
        >
          {isFav ? "★" : "☆"}
        </button>

        <button
          type="button"
          className={styles.cartBtn}
          onClick={handleAddToCart}
          aria-label="Добавить в корзину"
          title="Добавить в корзину"
        >
          В корзину
        </button>
      </div>

      <div className={styles.actionsBottom}>
        <Link to={`/product/${product.id}`} className={styles.viewBtn} title="Посмотреть" aria-label="Посмотреть">
          Просмотреть
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
