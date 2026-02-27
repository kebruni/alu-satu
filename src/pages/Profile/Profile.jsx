import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Profile.module.css";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useToast } from "../../components/Toast/Toast";
import AvatarPicker from "../../components/AvatarPicker/AvatarPicker";
import { mockProducts } from "../../data/mockProducts";
import { getProducts } from "../../api/products.api";
import formatPrice from "../../utils/formatPrice";
import { updateProfile as apiUpdateProfile, getMyOrders, getMyListedProducts, deleteListedProduct } from "../../api/users.api";
import { logout as apiLogout } from "../../api/auth.api";
import { useAuth } from "../../store";

const FAVORITES_KEY = "favorites";

const ls = (key, fallback = "[]") => {
  try { return JSON.parse(localStorage.getItem(key) || fallback); }
  catch { return JSON.parse(fallback); }
};
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const fmtDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return "—"; }
};

const Profile = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, token, avatarSrc, logout: authLogout, updateProfile: storeUpdateProfile, setAvatar } = useAuth();
  const [tab, setTab] = useState("info");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: "", email: "", phone: "" });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const handleAvatarSelect = (src) => {
    setAvatar(src);
    toast("Аватар обновлён", "success");
  };
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);
  const [orders, setOrders] = useState(() => ls("orders"));
  const [myProducts, setMyProducts] = useState(() => ls("listedProducts"));
  const reload = useCallback(async () => {
    let loadedOrders = [];

    if (token) {

      try {
        const apiOrders = await getMyOrders();
        loadedOrders = apiOrders.map(o => ({
          id: o._id || o.id,
          date: o.createdAt || o.date,
          userId: o.userId,
          username: o.username,
          items: (o.items || []).map(i => ({ id: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image })),
          total: o.total,
          totalItems: o.totalItems,
          status: o.status,
          _fromApi: true,
        }));
      } catch {

        loadedOrders = ls("orders");
      }

      try {
        const apiProducts = await getMyListedProducts();
        setMyProducts(apiProducts);
      } catch {
        setMyProducts(ls("listedProducts"));
      }
    } else {
      loadedOrders = ls("orders");
      setMyProducts(ls("listedProducts"));
    }

    const localOrders = ls("orders");
    const idSet = new Set(loadedOrders.map(o => String(o.id)));
    for (const lo of localOrders) {
      const lid = String(lo.id);
      if (!idSet.has(lid)) {
        loadedOrders.push(lo);
        idSet.add(lid);
      }
    }

    setOrders(loadedOrders);
  }, []);

  useEffect(() => {
    reload()
    window.addEventListener("storage", reload);
    window.addEventListener("orders:changed", reload);
    window.addEventListener("myproducts:changed", reload);
    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener("orders:changed", reload);
      window.removeEventListener("myproducts:changed", reload);
    };
  }, [reload, token]);
  const loadFavorites = async () => {
    setFavoritesLoading(true);
    try {
      const ids = ls(FAVORITES_KEY);
      const listed = ls("listedProducts");
      let remote = [];
      try { remote = await getProducts({ limit: 200 }); } catch { remote = []; }

      const map = new Map();
      (listed || []).forEach((p) => map.set(p.id, p));
      (mockProducts || []).forEach((p) => map.set(p.id, p));
      (remote || []).forEach((p) => map.set(p.id, p));

      const resolved = [];
      for (const id of Array.isArray(ids) ? ids : []) {
        const p = map.get(id);
        if (p) resolved.push(p);
      }
      setFavoriteProducts(resolved);
    } catch { setFavoriteProducts([]); }
    finally { setFavoritesLoading(false); }
  };

  useEffect(() => {
    loadFavorites();
    const h = () => loadFavorites();
    window.addEventListener("favorites:changed", h);
    window.addEventListener("myproducts:changed", h);
    return () => {
      window.removeEventListener("favorites:changed", h);
      window.removeEventListener("myproducts:changed", h);
    };
  }, []);
  const startEdit = () => {
    setEditForm({ username: user?.username || "", email: user?.email || "", phone: user?.phone || "" });
    setEditing(true);
  };

  const saveEdit = async () => {
    const updated = { ...user, username: editForm.username.trim(), email: editForm.email.trim(), phone: editForm.phone.trim() };

    try {
      if (token) {
        const apiUser = await apiUpdateProfile({ username: updated.username, email: updated.email, phone: updated.phone });
        updated.username = apiUser.username;
        updated.email = apiUser.email;
        updated.phone = apiUser.phone;
      }
    } catch (err) {
      console.warn("API profile update failed, saving locally", err);
    }

    storeUpdateProfile(updated);

    const users = ls("users");
    const idx = users.findIndex((u) => u.id === updated.id);
    if (idx >= 0) { users[idx] = { ...users[idx], ...updated }; save("users", users); }

    setEditing(false);
    toast("Профиль обновлён", "success");
  };
  const handleLogout = () => {
    apiLogout();
    authLogout();
    toast("Вы вышли из аккаунта", "info");
    navigate("/");
  };
  const deleteListing = async (id) => {

    try {
      if (token) await deleteListedProduct(id);
    } catch {  }

    const updated = myProducts.filter((p) => p.id !== id);
    save("listedProducts", updated);
    setMyProducts(updated);
    window.dispatchEvent(new Event("myproducts:changed"));
    toast("Объявление удалено", "success");
  };
  const userOrders = user
    ? orders.filter((o) => {
        if (o._fromApi) return true
        if (!o.userId) return true
        const oid = String(o.userId);
        const uid = String(user.id || user._id || "");
        return oid === uid;
      })
    : [];
  const totalSpent = userOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalBought = userOrders.reduce((s, o) => s + (o.totalItems || 0), 0);
  const initials = (user?.username || "?").slice(0, 2).toUpperCase();

  const TABS = [
    { key: "info", label: "Профиль" },
    { key: "orders", label: `Мои заказы (${userOrders.length})` },
    { key: "listings", label: `Мои объявления (${myProducts.length})` },
    { key: "favorites", label: `Избранное (${favoriteProducts.length})` },
  ];
  if (!user) {
    return (
      <div className={`${styles.container} page-transition`}>
        <h1>Личный кабинет</h1>
        <div className={styles.card}>
          <p className={styles.muted}>Вы не вошли в аккаунт.</p>
          <p className={styles.muted}>Нажмите "Sign up / Log in" в шапке, чтобы войти или зарегистрироваться.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} page-transition`}>
      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={avatarSrc}
          initials={initials}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
      <div className={styles.profileHeader}>
        <button className={styles.avatarBtn} onClick={() => setShowAvatarPicker(true)} title="Сменить аватар">
          {avatarSrc ? (
            <img src={avatarSrc} alt="avatar" className={styles.avatarImg} />
          ) : (
            <div className={styles.avatar}>{initials}</div>
          )}
          <span className={styles.avatarEdit}>Изменить</span>
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.username}>{user.username || "Пользователь"}</h1>
          <p className={styles.email}>{user.email || ""}</p>
          {user.isAdmin && <span className={styles.adminBadge}>admin</span>}
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
      </div>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <div className={styles.statValue}>{userOrders.length}</div>
          <div className={styles.statLabel}>Заказов</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{totalBought}</div>
          <div className={styles.statLabel}>Куплено товаров</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{formatPrice(totalSpent)}</div>
          <div className={styles.statLabel}>Потрачено</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{favoriteProducts.length}</div>
          <div className={styles.statLabel}>В избранном</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statValue}>{myProducts.length}</div>
          <div className={styles.statLabel}>Объявлений</div>
        </div>
      </div>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "info" && (
        <div className={styles.card}>
          {!editing ? (
            <>
              <div className={styles.infoGrid}>
                <div>
                  <div className={styles.label}>Username</div>
                  <div className={styles.value}>{user.username || "—"}</div>
                </div>
                <div>
                  <div className={styles.label}>Email</div>
                  <div className={styles.value}>{user.email || "—"}</div>
                </div>
                <div>
                  <div className={styles.label}>Телефон</div>
                  <div className={styles.value}>{user.phone || "Не указан"}</div>
                </div>
                <div>
                  <div className={styles.label}>Роль</div>
                  <div className={styles.value}>{user.isAdmin ? "Администратор" : "Пользователь"}</div>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={startEdit}>Редактировать профиль</button>
                <Link to="/sell" className={styles.actionBtnOutline}>Разместить объявление</Link>
                {user.isAdmin && <Link to="/admin" className={styles.actionBtnOutline}>Админ-панель</Link>}
              </div>
            </>
          ) : (
            <>
              <div className={styles.editForm}>
                <div className={styles.field}>
                  <label className={styles.label}>Username</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Телефон</label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="+7 (___) ___-__-__"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={saveEdit}>Сохранить</button>
                <button className={styles.actionBtnOutline} onClick={() => setEditing(false)}>Отмена</button>
              </div>
            </>
          )}
        </div>
      )}
      {tab === "orders" && (
        <div>
          {userOrders.length === 0 ? (
            <div className={styles.emptyState}>
              <p>У вас пока нет заказов.</p>
              <Link to="/catalog" className={styles.actionBtn}>Перейти в каталог</Link>
            </div>
          ) : (
            <div className={styles.ordersList}>
              {userOrders.slice().reverse().map((o) => (
                <div key={o.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderId}>Заказ #{o.id}</span>
                    <span className={styles.orderDate}>{fmtDate(o.date)}</span>
                  </div>
                  <div className={styles.orderItems}>
                    {(o.items || []).map((item, idx) => (
                      <div key={idx} className={styles.orderItem}>
                        {item.image && <img src={item.image} alt="" className={styles.orderImg} />}
                        <div className={styles.orderItemInfo}>
                          <span className={styles.orderItemName}>{item.name}</span>
                          <span className={styles.orderItemQty}>{item.quantity} × {formatPrice(item.price)}</span>
                        </div>
                        <div className={styles.orderItemTotal}>{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.orderFooter}>
                    <span>Товаров: {o.totalItems || 0}</span>
                    <span className={styles.orderTotal}>Итого: {formatPrice(o.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === "listings" && (
        <div>
          {myProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Вы ещё не размещали объявления.</p>
              <Link to="/sell" className={styles.actionBtn}>Разместить товар</Link>
            </div>
          ) : (
            <div className={styles.listingsGrid}>
              {myProducts.map((p) => (
                <div key={p.id} className={styles.listingCard}>
                  {p.image && <img src={p.image} alt="" className={styles.listingImg} />}
                  <div className={styles.listingInfo}>
                    <strong>{p.name}</strong>
                    <span className={styles.listingPrice}>{formatPrice(p.price)}</span>
                    <span className={styles.listingCat}>{p.category || "—"}</span>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => deleteListing(p.id)}>Удалить</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === "favorites" && (
        <div>
          <div className={styles.sectionHeader}>
            <h2>Избранное</h2>
            <Link to="/favorites" className={styles.link}>Открыть все →</Link>
          </div>

          {favoritesLoading ? (
            <p className={styles.muted}>Загрузка...</p>
          ) : favoriteProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Пока нет избранных товаров.</p>
              <Link to="/catalog" className={styles.actionBtn}>Перейти в каталог</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {favoriteProducts
                .filter((p) => p?.image && !/placeholder\.com|via\.placeholder\.com/i.test(p.image) && String(p.image).trim() !== "")
                .slice(0, 8)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
