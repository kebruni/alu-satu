import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import searchIcon from "../../assets/icons/search.svg";
import cartIcon from "../../assets/icons/cart.svg";
import { loginUser, registerUser, logout as apiLogout } from "../../api/auth.api";
import { useAuth, useCart, useFavorites } from "../../store";

const Header = ({ theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const lastScroll = useRef(0);
  const [headerHidden, setHeaderHidden] = useState(false);
  const { user, avatarSrc, login, logout: authLogout } = useAuth();
  const { cartCount } = useCart();
  const { favCount } = useFavorites();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const st = window.scrollY;
      if (st > 80 && st > lastScroll.current) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }
      lastScroll.current = st;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogout = () => {
    apiLogout();
    authLogout();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className={`${styles.header} ${headerHidden ? styles.headerHidden : ""}`} ref={headerRef}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>Alu Satu</Link>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Поиск товаров"
            className={styles.searchInput}
            aria-label="Поиск товаров"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchButton} title="Поиск" aria-label="Поиск">
            <img src={searchIcon} alt="Поиск" className={styles.searchIcon} />
          </button>
        </form>

        <nav className={styles.navIcons}>
          <Link to="/sell" className={styles.sellBtn} title="Продать товар" aria-label="Продать товар">
            <span>Продать</span>
          </Link>
          <Link to="/favorites" className={styles.iconBtn} aria-label="Избранное" title="Избранное">
            <span className={styles.favIcon}>★</span>
            {favCount > 0 && <span className={styles.favBadge}>{favCount}</span>}
          </Link>
          <Link to="/cart" className={styles.iconBtn} aria-label="Корзина" title="Корзина">
            <img src={cartIcon} alt="Корзина" className={styles.cartImg} />
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </Link>
          {user ? (
            <div className={styles.userMenu}>
              <Link to={user.isAdmin ? "/admin" : "/profile"} className={styles.headerAvatar} title={user.isAdmin ? "Админ-панель" : "Профиль"} aria-label="Профиль">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className={styles.headerAvatarImg} />
                ) : (
                  <span className={styles.avatarInitials}>{(user.username || "?").slice(0, 2).toUpperCase()}</span>
                )}
              </Link>
              <Link to="/profile" className={styles.usernameLink} title="Профиль" aria-label="Профиль">
                <span className={styles.username}>{user.username || user.email}</span>
              </Link>
              <button onClick={handleLogout} className={styles.logoutBtn}>Выход</button>
              <button
                className={styles.themeToggleBtn}
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
                title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                type="button"
              >
                {theme === "dark" ? "🌞" : "🌙"}
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthMode("login");
                }}
                className={styles.authBtn}
                aria-label="Вход или регистрация"
                title="Вход"
              >
                Войти / Регистрация
              </button>
              <button
                className={styles.themeToggleBtn}
                onClick={onToggleTheme}
                aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
                title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
                type="button"
              >
                {theme === "dark" ? "🌞" : "🌙"}
              </button>
            </>
          )}
        </nav>

        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Меню"
        >
          <span />
          <span />
          <span />
        </button>

      {menuOpen && <div className={styles.drawerOverlay} onClick={closeMenu} />}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerContent}>
          <Link to="/sell" className={styles.drawerLink} onClick={closeMenu}>Продать</Link>
          <Link to="/favorites" className={styles.drawerLink} onClick={closeMenu}>
            Избранное {favCount > 0 && <span className={styles.drawerBadge}>{favCount}</span>}
          </Link>
          <Link to="/cart" className={styles.drawerLink} onClick={closeMenu}>
            Корзина {cartCount > 0 && <span className={styles.drawerBadge}>{cartCount}</span>}
          </Link>
          <Link to="/catalog" className={styles.drawerLink} onClick={closeMenu}>Каталог</Link>
          {user ? (
            <>
              <Link to={user.isAdmin ? "/admin" : "/profile"} className={styles.drawerLink} onClick={closeMenu}>
                {user.isAdmin ? "Админ-панель" : "Профиль"}
              </Link>
              <button onClick={() => { handleLogout(); closeMenu(); }} className={styles.drawerLogout}>Выход</button>
            </>
          ) : (
            <button onClick={() => { setShowAuthModal(true); setAuthMode("login"); closeMenu(); }} className={styles.drawerAuth}>
              Войти / Регистрация
            </button>
          )}
          <button type="button" className={styles.drawerThemeBtn} onClick={onToggleTheme}>
            {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          </button>
        </div>
      </div>
      </header>

      {showAuthModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setShowAuthModal(false)}>✕</button>
            <div className={styles.brand}>Alu Satu</div>
            {authMode === "login" ? (
              <LoginForm 
                onSuccess={(userData, tkn) => {
                  login(userData, tkn);
                  setShowAuthModal(false);
                  navigate("/profile");
                }} 
                onSwitchMode={() => setAuthMode("register")}
              />
            ) : (
              <RegisterForm 
                onSuccess={(userData, tkn) => {
                  login(userData, tkn);
                  setShowAuthModal(false);
                  navigate("/profile");
                }} 
                onSwitchMode={() => setAuthMode("login")}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

function LoginForm({ onSuccess, onSwitchMode }) {
  const [credential, setCredential] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credential || !password) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    setError("");

    try {

      const data = await loginUser({ credential, password });
      const u = data.user;
      const userData = { email: u.email, id: u._id, username: u.username, isAdmin: u.isAdmin };
      onSuccess(userData, data.token);
    } catch (apiErr) {
      const serverMsg = apiErr?.response?.data?.error;
      setError(serverMsg || "Ошибка входа. Проверьте backend и MongoDB");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className={styles.authForm}>
      <h2>Вход</h2>
      <input
        type="text"
        placeholder="Email или username"
        value={credential}
        onChange={(e) => setCredential(e.target.value)}
        className={styles.authInput}
        autoFocus
      />
      <div className={styles.passwordRow}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
        />
        <button
          type="button"
          className={styles.showPwdBtn}
          onClick={() => setShowPassword(s => !s)}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? "Скрыть" : "Показать"}
        </button>
      </div>
      {error && <p className={styles.authError}>{error}</p>}
      <button type="submit" className={styles.authSubmitBtn} disabled={loading}>{loading ? "Вход..." : "Войти"}</button>
      <p className={styles.authSwitch}>
        Нет аккаунта? <button type="button" onClick={onSwitchMode} className={styles.switchLink}>Зарегистрироваться</button>
      </p>
    </form>
  );
}

function RegisterForm({ onSuccess, onSwitchMode }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("Заполните все поля");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    setLoading(true);
    setError("");

    try {

      const data = await registerUser({ username, email, password });
      const u = data.user;
      const userData = { email: u.email, id: u._id, username: u.username, isAdmin: u.isAdmin };
      onSuccess(userData, data.token);
    } catch (apiErr) {
      const serverMsg = apiErr?.response?.data?.error;
      setError(serverMsg || "Ошибка регистрации. Проверьте backend и MongoDB");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className={styles.authForm}>
      <h2>Регистрация</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.authInput}
        autoFocus
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.authInput}
      />
      <div className={styles.passwordRow}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.authInput}
        />
        <button
          type="button"
          className={styles.showPwdBtn}
          onClick={() => setShowPassword(s => !s)}
          aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showPassword ? "Скрыть" : "Показать"}
        </button>
      </div>
      <div className={styles.passwordRow}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Подтвердите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.authInput}
        />
        <button
          type="button"
          className={styles.showPwdBtn}
          onClick={() => setShowConfirmPassword(s => !s)}
          aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
        >
          {showConfirmPassword ? "Скрыть" : "Показать"}
        </button>
      </div>
      {error && <p className={styles.authError}>{error}</p>}
      <button type="submit" className={styles.authSubmitBtn} disabled={loading}>{loading ? "Регистрация..." : "Зарегистрироваться"}</button>
      <p className={styles.authSwitch}>
        Уже есть аккаунт? <button type="button" onClick={onSwitchMode} className={styles.switchLink}>Войти</button>
      </p>
    </form>
  );
}

export default Header;

