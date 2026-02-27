import React, { useState, useEffect, useRef } from "react";
import ProductCard from "../../components/ProductCard/ProductCard";
import Categories from "../../components/Categories/Categories";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./Home.module.css";
import { getCuratedProducts, getProducts } from "../../api/products.api";
import { getListedProducts } from "../../api/users.api";
import { mockProducts } from "../../data/mockProducts";
import formatPrice, { toPriceKzt } from "../../utils/formatPrice";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/Toast/Toast";

const normalizeText = (value) => (value || "").toString().trim().toLowerCase();

const HOME_CATEGORIES = [
  "Телефоны",
  "Ноутбуки",
  "Одежда",
  "Обувь",
  "Часы",
  "Сумки",
  "Аксессуары",
  "Электроника",
  "Дом и сад",
];

const PRICE_FILTER_MAX_KZT = 1_500_000;
const ITEMS_PER_PAGE = 20;

const Home = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceMax, setPriceMax] = useState(PRICE_FILTER_MAX_KZT);
  const [priceLimit, setPriceLimit] = useState(PRICE_FILTER_MAX_KZT);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("default");
  const heroRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        let data = [];
        try {
          data = await getCuratedProducts({ perCategory: 12 });
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
        data = [...data, ...listedApi, ...listed];

        if (!data.length) data = mockProducts;

        const seenImages = new Set();
        const allowedCategories = new Set(HOME_CATEGORIES);

        const validProducts = data.filter((p) => {
          const img = (p.image || "").toString();
          const isPlaceholder = /placeholder\.com|via\.placeholder\.com/i.test(img);
          if (!img.trim() || isPlaceholder) return false;
          if (seenImages.has(img)) return false;

          const category = (p.category || "").trim();
          if (!allowedCategories.has(category)) return false;

          seenImages.add(img);
          return true;
        });
        if (mounted) {
          setAllProducts(validProducts);
          const maxKzt = validProducts.reduce((acc, p) => Math.max(acc, toPriceKzt(p.price)), 0);
          const roundedMax = Math.max(1000, Math.ceil(maxKzt / 1000) * 1000);
          setPriceMax(PRICE_FILTER_MAX_KZT);
          setPriceLimit(Math.min(PRICE_FILTER_MAX_KZT, roundedMax));
        }
      } catch {
        if (mounted) {
          setAllProducts(mockProducts);
          setError("Ошибка загрузки. Показываются доступные товары.");
          const maxKzt = mockProducts.reduce((acc, p) => Math.max(acc, toPriceKzt(p.price)), 0);
          const roundedMax = Math.max(1000, Math.ceil(maxKzt / 1000) * 1000);
          setPriceMax(PRICE_FILTER_MAX_KZT);
          setPriceLimit(Math.min(PRICE_FILTER_MAX_KZT, roundedMax));
        }
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

  const getProductsByCategory = (category) => {
    return allProducts.filter((p) => {
      const pcat = (p.category || "").toLowerCase();
      return pcat.includes(category.toLowerCase()) || category.toLowerCase().includes(pcat);
    });
  };

  const baseProducts =
    selectedCategory && selectedCategory !== "All"
      ? getProductsByCategory(selectedCategory)
      : allProducts;

  const visibleProducts = (() => {
    let result = baseProducts.filter((p) => toPriceKzt(p.price) <= priceLimit);
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
  })();
  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = visibleProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const handleCategoryChange = (cat) => { setSelectedCategory(cat); setPage(1); };
  const handlePriceChange = (e) => { setPriceLimit(Math.min(priceMax, Number(e.target.value) || 0)); setPage(1); };
  const handleSortChange = (e) => { setSortBy(e.target.value); setPage(1); };

  return (
    <div className={`${styles.container} page-transition`}>
      {/* Кнопка уведомления удалена */}
      <div className={styles.hero} ref={heroRef}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Маркетплейс Казахстана</span>
          <h1 className={styles.heroTitle}><span className={styles.heroBrand}>Alu Satu</span></h1>
          <p className={styles.heroSubtitle}>Лучшие товары по доступным ценам — от электроники до моды</p>
          <div className={styles.heroCta}>
            <button className={styles.heroBtn} onClick={() => navigate("/catalog")}>Перейти в каталог</button>
            <button className={styles.heroBtnOutline} onClick={() => navigate("/sell")}>Начать продавать</button>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>10K+</span>
              <span className={styles.heroStatLabel}>Товаров</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>5K+</span>
              <span className={styles.heroStatLabel}>Покупателей</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>99%</span>
              <span className={styles.heroStatLabel}>Довольных</span>
            </div>
          </div>
        </div>
      </div>

      <Categories onFilter={handleCategoryChange} />

      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <div className={styles.priceFilterGroup}>
            <h3>Фильтр по цене</h3>
            <div className={styles.priceFilter}>
              <input
                type="range"
                min="0"
                max={priceMax}
                value={priceLimit}
                onChange={handlePriceChange}
                className={styles.slider}
              />
              <span className={styles.priceLabel}>{formatPrice(0)} — {formatPrice(priceLimit)}</span>
            </div>
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

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : (
        <>
          {paginatedProducts.length === 0 && <p className={styles.noProducts}>Товары не найдены</p>}
          <div className={styles.grid}>
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        </>
      )}
    </div>
  );
};

export default Home;
