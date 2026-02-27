import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Admin.module.css";
import formatPrice from "../../utils/formatPrice";
import AvatarPicker from "../../components/AvatarPicker/AvatarPicker";
import { useToast } from "../../components/Toast/Toast";
import { useAuth } from "../../store";
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

const ADMIN_CREDENTIALS = { username: "admin", password: "admin123" };
const Admin = () => {
  const { user: currentUser, avatarSrc, setAvatar } = useAuth();
  const isAdmin = currentUser?.isAdmin === true;
  const toast = useToast();
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const adminInitials = (currentUser?.username || "AD").slice(0, 2).toUpperCase();
  const handleAvatarSelect = (src) => {
    setAvatar(src);
    toast("Аватар обновлён", "success");
  };
  const [users, setUsers] = useState(() => ls("users"));
  const [products, setProducts] = useState(() => ls("listedProducts"));
  const [orders, setOrders] = useState(() => ls("orders"));
  const [tab, setTab] = useState("stats");
  const [search, setSearch] = useState("");
  const reload = useCallback(() => {
    setUsers(ls("users"));
    setProducts(ls("listedProducts"));
    setOrders(ls("orders"));
  }, []);

  useEffect(() => {
    window.addEventListener("storage", reload);
    window.addEventListener("myproducts:changed", reload);
    window.addEventListener("orders:changed", reload);
    return () => {
      window.removeEventListener("storage", reload);
      window.removeEventListener("myproducts:changed", reload);
      window.removeEventListener("orders:changed", reload);
    };
  }, [reload]);
  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.noAccess}>
          <h2>Доступ запрещён</h2>
          <p>Эта страница доступна только администраторам.</p>
          <p style={{ marginTop: "1rem", color: "#888", fontSize: "0.85rem" }}>
            Чтобы стать админом, войдите с логином <b>{ADMIN_CREDENTIALS.username}</b> и паролем <b>{ADMIN_CREDENTIALS.password}</b>,
            или создайте аккаунт с username «admin».
          </p>
          <p style={{ marginTop: "1rem" }}><Link to="/">Вернуться на главную</Link></p>
        </div>
      </div>
    );
  }
  const favCount = ls("favorites").length;
  const cartCount = ls("cart").reduce((s, i) => s + (i.quantity || 1), 0);
  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const totalItemsSold = orders.reduce((s, o) => s + (o.totalItems || 0), 0);
  const deleteUser = (id) => {
    if (!confirm("Удалить пользователя?")) return;
    const updated = users.filter((u) => u.id !== id);
    save("users", updated);
    setUsers(updated);
  };

  const toggleAdmin = (id) => {
    const updated = users.map((u) => u.id === id ? { ...u, isAdmin: !u.isAdmin } : u);
    save("users", updated);
    setUsers(updated);
  };
  const deleteProduct = (id) => {
    if (!confirm("Удалить товар?")) return;
    const updated = products.filter((p) => p.id !== id);
    save("listedProducts", updated);
    setProducts(updated);
    window.dispatchEvent(new Event("myproducts:changed"));
  };
  const deleteOrder = (id) => {
    if (!confirm("Удалить запись о заказе?")) return;
    const updated = orders.filter((o) => o.id !== id);
    save("orders", updated);
    setOrders(updated);
  };

  const clearOrders = () => {
    if (!confirm("Очистить всю историю закупок?")) return;
    save("orders", []);
    setOrders([]);
  };
  const q = search.toLowerCase();
  const filteredUsers = q
    ? users.filter((u) => (u.username || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q))
    : users;

  const filteredProducts = q
    ? products.filter((p) => (p.name || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q))
    : products;

  const filteredOrders = q
    ? orders.filter((o) =>
        (o.username || "").toLowerCase().includes(q) ||
        String(o.id).includes(q) ||
        (o.items || []).some((i) => (i.name || "").toLowerCase().includes(q))
      )
    : orders;
  const [expandedOrder, setExpandedOrder] = useState(null);

  const TABS = [
    { key: "stats", label: "Обзор" },
    { key: "accounts", label: "Учётные записи" },
    { key: "orders", label: "История закупок" },
    { key: "products", label: "Товары" },
  ];

  return (
    <div className={`${styles.container} page-transition`}>
      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={avatarSrc}
          initials={adminInitials}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.adminAvatarBtn} onClick={() => setShowAvatarPicker(true)} title="Сменить аватар">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className={styles.adminAvatarImg} />
            ) : (
              <span className={styles.adminAvatarFallback}>{adminInitials}</span>
            )}
          </button>
          <h1>Админ-панель</h1>
        </div>
        <Link to="/" className={styles.backLink}>← На главную</Link>
      </div>
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{users.length}</div>
          <div className={styles.statLabel}>Учётных записей</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{orders.length}</div>
          <div className={styles.statLabel}>Заказов</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalItemsSold}</div>
          <div className={styles.statLabel}>Товаров продано</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{formatPrice(totalRevenue)}</div>
          <div className={styles.statLabel}>Общая выручка</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{products.length}</div>
          <div className={styles.statLabel}>Размещено товаров</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{favCount}</div>
          <div className={styles.statLabel}>Избранных</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{cartCount}</div>
          <div className={styles.statLabel}>В корзине сейчас</div>
        </div>
      </div>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ""}`}
            onClick={() => { setTab(t.key); setSearch(""); setExpandedOrder(null); }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "stats" && (
        <div>
          <h3 className={styles.sectionTitle}>Последние заказы</h3>
          {orders.length === 0 ? (
            <p className={styles.emptyText}>Ещё нет заказов.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>№</th><th>Дата</th><th>Покупатель</th><th>Кол-во</th><th>Сумма</th></tr></thead>
                <tbody>
                  {orders.slice().reverse().slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{fmtDate(o.date)}</td>
                      <td>{o.username || "Гость"}</td>
                      <td>{o.totalItems || 0}</td>
                      <td>{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className={styles.sectionTitleSpaced}>Последние пользователи</h3>
          {users.length === 0 ? (
            <p className={styles.emptyText}>Нет зарегистрированных пользователей.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Роль</th></tr></thead>
                <tbody>
                  {users.slice(-5).reverse().map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.username || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td><span className={`${styles.badge} ${u.isAdmin ? styles.badgeAdmin : styles.badgeUser}`}>{u.isAdmin ? "admin" : "user"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === "accounts" && (
        <div>
          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по имени или email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredUsers.length === 0 ? (
            <p className={styles.emptyText}>Нет пользователей.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>Заказов</th>
                    <th>Потрачено</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const userOrders = orders.filter((o) => o.userId === u.id);
                    const userSpent = userOrders.reduce((s, o) => s + (o.total || 0), 0);
                    return (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username || "—"}</td>
                        <td>{u.email || "—"}</td>
                        <td><span className={`${styles.badge} ${u.isAdmin ? styles.badgeAdmin : styles.badgeUser}`}>{u.isAdmin ? "admin" : "user"}</span></td>
                        <td>{userOrders.length}</td>
                        <td>{formatPrice(userSpent)}</td>
                        <td>
                          <div className={styles.actionRow}>
                            <button className={styles.successBtn} onClick={() => toggleAdmin(u.id)}>{u.isAdmin ? "Снять admin" : "Дать admin"}</button>
                            <button className={styles.dangerBtn} onClick={() => deleteUser(u.id)}>Удалить</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === "orders" && (
        <div>
          <div className={styles.searchRow} style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по покупателю, №заказа, товару..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {orders.length > 0 && (
              <button className={styles.dangerBtn} onClick={clearOrders}>Очистить историю</button>
            )}
          </div>

          {filteredOrders.length === 0 ? (
            <p className={styles.emptyText}>Нет заказов.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>№ заказа</th>
                    <th>Дата</th>
                    <th>Покупатель</th>
                    <th>Товаров</th>
                    <th>Сумма</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice().reverse().map((o) => (
                    <React.Fragment key={o.id}>
                      <tr
                        className={expandedOrder === o.id ? styles.expandedRow : ""}
                        style={{ cursor: "pointer" }}
                        onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                      >
                        <td>{o.id}</td>
                        <td>{fmtDate(o.date)}</td>
                        <td>{o.username || "Гость"}</td>
                        <td>{o.totalItems || 0}</td>
                        <td>{formatPrice(o.total)}</td>
                        <td>
                          <div className={styles.actionRow}>
                            <button
                              className={styles.successBtn}
                              onClick={(e) => { e.stopPropagation(); setExpandedOrder(expandedOrder === o.id ? null : o.id); }}
                            >
                              {expandedOrder === o.id ? "Свернуть" : "Подробнее"}
                            </button>
                            <button className={styles.dangerBtn} onClick={(e) => { e.stopPropagation(); deleteOrder(o.id); }}>Удалить</button>
                          </div>
                        </td>
                      </tr>
                      {expandedOrder === o.id && (
                        <tr>
                          <td colSpan={6} className={styles.orderDetail}>
                            <div className={styles.orderItems}>
                              {(o.items || []).map((item, idx) => (
                                <div key={idx} className={styles.orderItem}>
                                  {item.image && <img src={item.image} alt="" className={styles.productImg} />}
                                  <div className={styles.orderItemInfo}>
                                    <strong>{item.name || "—"}</strong>
                                    <span>{item.quantity} × {formatPrice(item.price)}</span>
                                  </div>
                                  <div className={styles.orderItemTotal}>
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {tab === "products" && (
        <div>
          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по названию или категории..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredProducts.length === 0 ? (
            <p className={styles.emptyText}>Нет размещённых товаров.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th></th><th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th>Действия</th></tr></thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.image ? <img src={p.image} alt="" className={styles.productImg} /> : "—"}</td>
                      <td>{p.id}</td>
                      <td>{p.name || "—"}</td>
                      <td>{p.category || "—"}</td>
                      <td>{formatPrice(p.price)}</td>
                      <td>
                        <div className={styles.actionRow}>
                          <button className={styles.dangerBtn} onClick={() => deleteProduct(p.id)}>Удалить</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Admin;
