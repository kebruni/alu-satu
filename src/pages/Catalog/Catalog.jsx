import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { mockProducts } from "../../data/mockProducts";
import ProductCard from "../../components/ProductCard/ProductCard";
import Categories from "../../components/Categories/Categories";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./Catalog.module.css";
import { getCuratedProducts, getProducts } from "../../api/products.api";
import { getListedProducts } from "../../api/users.api";
import formatPrice, { toPriceKzt } from "../../utils/formatPrice";

const isPlaceholderImage = (url) => /placeholder\.com|via\.placeholder\.com/i.test((url || "").toString());

const normalizeCategoryValue = (value) => (value || "").toString().trim().toLowerCase();
const matchesCategory = (productCategory, selectedCategory) => {
  const p = normalizeCategoryValue(productCategory);
  const s = normalizeCategoryValue(selectedCategory);
  if (!s || s === "all") return true;
  if (!p) return false;
  if (p === s) return true;
  return p.includes(s) || s.includes(p);
};

const PRICE_FILTER_MAX_KZT = 1_500_000;
const ITEMS_PER_PAGE = 20;

const normalizeText = (value) => (value || "").toString().trim().toLowerCase();
const matchesSearch = (product, search) => {
  const q = normalizeText(search);
  if (!q) return true;
  const name = normalizeText(product?.name);
  const desc = normalizeText(product?.description);
  const cat = normalizeText(product?.category);
  return name.includes(q) || desc.includes(q) || cat.includes(q);
};

const Catalog = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const search = query.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceMax, setPriceMax] = useState(PRICE_FILTER_MAX_KZT);
  const [priceLimit, setPriceLimit] = useState(PRICE_FILTER_MAX_KZT);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");

  const visibleProducts = useMemo(() => {
    let result = products.slice();
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((p) => matchesCategory(p.category, selectedCategory));
    }
    result = result.filter((p) => toPriceKzt(p.price) <= priceLimit);

    if (search) {
      result.sort((a, b) => {
        const am = matchesSearch(a, search) ? 0 : 1;
        const bm = matchesSearch(b, search) ? 0 : 1;
        if (am !== bm) return am - bm;
        const an = normalizeText(a?.name);
        const bn = normalizeText(b?.name);
        return an.localeCompare(bn, "ru");
      });
    }

    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => toPriceKzt(a.price) - toPriceKzt(b.price));
        break;
      case "price-desc":
        result.sort((a, b) => toPriceKzt(b.price) - toPriceKzt(a.price));
        break;
      case "name-asc":
        result.sort((a, b) => normalizeText(a?.name).localeCompare(normalizeText(b?.name), "ru"));
        break;
      case "name-desc":
        result.sort((a, b) => normalizeText(b?.name).localeCompare(normalizeText(a?.name), "ru"));
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, priceLimit, search, sortBy]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        let data = [];
        try {
          data = await getCuratedProducts({ perCategory: 20 });
          if (!data.length) data = await getProducts({ limit: 200 });
        } catch {
          data = [];
        }
        let listedApi = [];
        try {
          listedApi = await getListedProducts();
        } catch {
          listedApi = [];
        }

        const listedRaw = localStorage.getItem("listedProducts") || "[]";
        const listed = JSON.parse(listedRaw);

        let raw = [...(data || []), ...(listedApi || []), ...(listed || [])];
        if (!raw.length) raw = mockProducts;
        const seenImages = new Set();
        const valid = raw.filter((p) => {
          if (!p) return false;
          const img = (p.image || "").toString();
          if (!img.trim() || isPlaceholderImage(img)) return false;
          if (seenImages.has(img)) return false;

          const category = (p.category || "").toString().trim();
          if (!category) return false;

          seenImages.add(img);
          return true;
        });

        const maxKzt = valid.reduce((acc, p) => Math.max(acc, toPriceKzt(p.price)), 0);
        const roundedMax = Math.max(1000, Math.ceil(maxKzt / 1000) * 1000);
        if (!mounted) return;
        setProducts(valid);
        setPriceMax(PRICE_FILTER_MAX_KZT);
        setPriceLimit(Math.min(PRICE_FILTER_MAX_KZT, roundedMax));
      } catch (e) {
        if (!mounted) return;
        console.warn("Catalog load failed, falling back to mockProducts", e);

        const seenImages = new Set();
        const valid = (mockProducts || []).filter((p) => {
          if (!p) return false;
          const img = (p.image || "").toString();
          if (!img.trim() || isPlaceholderImage(img)) return false;
          if (seenImages.has(img)) return false;
          const category = (p.category || "").toString().trim();
          if (!category) return false;
          seenImages.add(img);
          return true;
        });

        setProducts(valid);
        setError(e.message || "Failed to load products");
        const maxKzt = valid.reduce((acc, p) => Math.max(acc, toPriceKzt(p.price)), 0);
        const roundedMax = Math.max(1000, Math.ceil(maxKzt / 1000) * 1000);
        setPriceMax(PRICE_FILTER_MAX_KZT);
        setPriceLimit(Math.min(PRICE_FILTER_MAX_KZT, roundedMax));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const handleProducts = () => load();
    window.addEventListener("myproducts:changed", handleProducts);

    return () => {
      mounted = false;
      window.removeEventListener("myproducts:changed", handleProducts);
    };
  }, []);
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = visibleProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const handleCategoryChange = (cat) => { setSelectedCategory(cat); setPage(1); };
  const handlePriceChange = (e) => { setPriceLimit(Math.min(priceMax, Number(e.target.value) || 0)); setPage(1); };
  const handleSortChange = (e) => { setSortBy(e.target.value); setPage(1); };
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className={`${styles.container} page-transition`}>
      <h1>Каталог</h1>

      <Categories onFilter={handleCategoryChange} />

      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <div className={styles.priceFilter}>
            <h3>Фильтр по цене</h3>
            <input
              type="range"
              min="0"
              max={priceMax}
              value={priceLimit}
              onChange={handlePriceChange}
              className={styles.slider}
            />
            <span>{formatPrice(0)} - {formatPrice(priceLimit)}</span>
          </div>
          <div className={styles.sortFilter}>
            <h3>Сортировка</h3>
            <select value={sortBy} onChange={handleSortChange} className={styles.sortSelect}>
              <option value="default">По умолчанию</option>
              <option value="price-asc">Сначала дешёвые</option>
              <option value="price-desc">Сначала дорогие</option>
              <option value="name-asc">По названию А-Я</option>
              <option value="name-desc">По названию Я-А</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonText}>
                <div className={styles.skeletonLine} style={{ width: "80%" }} />
                <div className={styles.skeletonLine} style={{ width: "55%" }} />
                <div className={styles.skeletonLine} style={{ width: "30%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {error && <p className={styles.error}>Ошибка: {error}</p>}
          {visibleProducts.length === 0 ? (
            <p className={styles.noProducts}>Нет товаров, соответствующих фильтрам</p>
          ) : (
            <>
              <div className={styles.grid}>
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination page={safePage} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Catalog;
