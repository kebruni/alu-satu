import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './Favorites.module.css'
import { mockProducts } from "../../data/mockProducts";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getProducts } from "../../api/products.api";
import { getListedProducts } from "../../api/users.api";
import { useFavorites } from "../../store";

const Favorites = () => {
  const navigate = useNavigate();
  const { favorites: favoriteIds } = useFavorites();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const ids = favoriteIds;

      let listedApi = [];
      try {
        listedApi = await getListedProducts();
      } catch {
        listedApi = [];
      }

      const listedRaw = localStorage.getItem("listedProducts") || "[]";
      const listed = JSON.parse(listedRaw);

      let remote = [];
      try {
        remote = await getProducts({ limit: 200 });
      } catch {
        remote = [];
      }

      const map = new Map();
      listedApi.forEach((p) => map.set(p.id, p));
      listed.forEach((p) => map.set(p.id, p));
      mockProducts.forEach((p) => map.set(p.id, p));
      remote.forEach((p) => map.set(p.id, p));

      const resolved = [];
      for (const id of ids) {
        let p = map.get(id);
        if (!p) {
          try {
            const res = await fetch(`https://dummyjson.com/products/${id}`);
            if (res.ok) {
              const data = await res.json();
              p = {
                id: data.id,
                name: data.title || data.name,
                price: data.price ?? 0,
                image: (data.images && data.images[0]) || data.thumbnail || "",
                description: data.description || "",
              };
              map.set(p.id, p);
            }
          } catch {
            p = null;
          }
        }
        if (p) resolved.push(p);
      }

      setFavorites(resolved);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [favoriteIds]);

  const validFavorites = favorites.filter(p => p.image && !/placeholder\.com/.test(p.image) && p.image.trim() !== "");

  return (
    <div className={`${styles.container} page-transition`}>
      <div className={styles.pageHeader}>
        <h1>Избранное</h1>
        {!loading && validFavorites.length > 0 && (
          <span className={styles.count}>{validFavorites.length} товар{validFavorites.length > 4 ? "ов" : validFavorites.length > 1 ? "а" : ""}</span>
        )}
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonText}>
                <div className={styles.skeletonLine} style={{ width: "80%" }} />
                <div className={styles.skeletonLine} style={{ width: "50%" }} />
                <div className={styles.skeletonLine} style={{ width: "30%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : validFavorites.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h2 className={styles.emptyTitle}>Нет избранных товаров</h2>
          <p className={styles.emptyText}>Нажмите на звёздочку на карточке товара, чтобы добавить его в избранное</p>
          <button className={styles.emptyBtn} onClick={() => navigate("/catalog")}>Перейти в каталог</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {validFavorites.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
